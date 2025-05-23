import React, { useRef, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import QRCode from 'react-qr-code';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/formatCurrency';
import { useReactToPrint } from 'react-to-print';
import { Button } from '../ui/button';
import { Printer } from 'lucide-react';

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  invoiceDate: string;
  customerBillTo: {
    name: string;
    address: string;
    gstNumber?: string;
    panNumber?: string;
  };
  customerShipTo: {
    name: string;
    address: string;
    gstNumber?: string;
    panNumber?: string;
  };
  companyDetails: {
    name: string;
    address: string;
    phone: string;
    email: string;
    cityState: string;
  };
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    category: string;
    hsnCode?: string;
  }[];
  subtotal: number;
  gstAmount: number;
  gstRate: number;
  total: number;
  template: "modern" | "minimal" | "classic";
  packaging?: number;
  transportationAndOthers?: number;
};

const InvoiceClassic: React.FC<{ invoiceData: InvoiceData }> = ({ invoiceData }) => {
  const { customerBillTo, customerShipTo, invoiceNumber, invoiceDate, items, companyDetails } = invoiceData;
  const gstRate = 0.18; // 18% GST
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gstAmount = subtotal * gstRate;
  const total = subtotal + gstAmount;
  const contentRef = useRef<HTMLDivElement>(null);
  const url = window.location.href;
  const [loading, setLoading] = useState(false);

  const handleDownloadPDF = async () => {
    setLoading(true);
    try {
      if (contentRef.current) {
        await html2canvas(contentRef.current, { scale: 2 }).then((canvas) => {
          const imgWidth = 210; // A4 width in mm
          const pageHeight = 297; // A4 height in mm
          const margin = 10; // 10mm margin
          const usableWidth = imgWidth - 2 * margin;
          const usablePageHeight = pageHeight - 2 * margin;
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
          });

          const imgData = canvas.toDataURL('image/png');
          const imgProps = {
            width: canvas.width,
            height: canvas.height,
          };
          const pdfHeight = (imgProps.height * usableWidth) / imgProps.width;

          if (pdfHeight <= usablePageHeight) {
            // Single page
            pdf.addImage(imgData, 'PNG', margin, margin, usableWidth, pdfHeight);
          } else {
            // Multi-page
            let position = 0;
            let remainingHeight = imgProps.height;
            while (remainingHeight > 0) {
              const sliceHeight = Math.min(canvas.height - position, (usablePageHeight * canvas.width) / usableWidth);
              if (sliceHeight <= 0 || canvas.width <= 0) break; // Prevents extra blank page and corrupt PNG

              const pageCanvas = document.createElement('canvas');
              pageCanvas.width = canvas.width;
              pageCanvas.height = sliceHeight;

              const ctx = pageCanvas.getContext('2d');
              if (ctx) {
                ctx.fillStyle = "#fff";
                ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
                ctx.drawImage(
                  canvas,
                  0,
                  position,
                  canvas.width,
                  sliceHeight,
                  0,
                  0,
                  canvas.width,
                  sliceHeight
                );
              }

              // Only add the page if the canvas is not empty and image data is valid
              if (pageCanvas.width > 0 && pageCanvas.height > 0) {
                const pageImgData = pageCanvas.toDataURL('image/png');
                if (
                  pageImgData &&
                  pageImgData.startsWith('data:image/png;base64,') &&
                  pageImgData.length > 'data:image/png;base64,'.length
                ) {
                  if (position > 0) pdf.addPage();
                  pdf.addImage(pageImgData, 'PNG', margin, margin, usableWidth, (sliceHeight * usableWidth) / canvas.width);
                }
              }

              position += sliceHeight;
              remainingHeight -= sliceHeight;
            }
          }

          pdf.save(`invoice_${invoiceNumber}.pdf`);
        });
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: contentRef,
    documentTitle: `Invoice ${invoiceNumber}`,
  });

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-neutral-900 flex flex-col items-center py-8 px-2 font-sans">
      {/* Download Button */}
      {/* {
        !url.includes('billing') ? '' : (
          <div className="my-4 border-gray-200 flex w-full justify-start ml-6 rounded-b-lg gap-2">
            <button
              onClick={handleDownloadPDF}
              className="px-7 py-3 bg-gray-800 text-white font-bold rounded shadow hover:bg-black transition-colors text-lg border border-gray-700"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  Downloading...
                </span>
              ) : (
                'Download PDF'
              )}
            </button>
            <button
              onClick={handlePrint}
              className="px-7 py-3 bg-blue-700 text-white font-bold rounded shadow hover:bg-blue-900 transition-colors text-lg border border-blue-700"
              disabled={loading}
            >
              Print
            </button>
          </div>)
      } */}
      <div className='flex justify-start absolute top-7 left-54 '>
        <Button onClick={handlePrint} className='bg-gray-900 text-white' variant={'outline'}>
          <Printer className='w-4 h-4' />
          Print
        </Button>
      </div>
      <div ref={contentRef}
        className="w-[210mm] min-h-[297mm] bg-white rounded-lg shadow flex flex-col mx-auto print:w-[210mm] print:min-h-[297mm]"
      >
        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-bold text-xl">
              <span>{companyDetails.name[0]}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-wide">{companyDetails.name}</h1>
              <p className="text-sm text-gray-500">{companyDetails.phone}</p>
              <p className="text-sm text-gray-500">{companyDetails.email}</p>
              <p className="text-sm text-gray-500 max-w-[400px]">{companyDetails.address} {companyDetails.cityState}</p>
            </div>
          </div>

          <div className='flex flex-col items-end'>
            <QRCode value={`${import.meta.env.VITE_FRONTEND_URL}/invoice/${invoiceData.id}`} size={64} />
            <div className="text-right">
              <p className="text-gray-700"><span className="font-medium">Invoice #:</span> {invoiceNumber}</p>
              <p className="text-gray-700"><span className="font-medium">Date:</span> {invoiceDate}</p>
            </div>
          </div>
        </div>

        {/* Invoice Info */}
        <div className="px-8 py-6 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row md:justify-between md:items-center">
          <div className="mb-4 md:mb-0 grid grid-cols-2 gap-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Bill To:</h3>
              <p className="text-gray-700"><span className="font-medium">Name:</span> {customerBillTo.name}</p>
              <p className="text-gray-700"><span className="font-medium">Address:</span> {customerBillTo.address}</p>
              {customerBillTo.gstNumber && (
                <p className="text-gray-700"><span className="font-medium">GST Number:</span> {customerBillTo.gstNumber}</p>
              )}
              {customerBillTo.panNumber && (
                <p className="text-gray-700"><span className="font-medium">PAN Number:</span> {customerBillTo.panNumber}</p>
              )}
            </div>
            {
              customerShipTo.name && customerShipTo.address && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Ship To:</h3>
                  <p className="text-gray-700"><span className="font-medium">Name:</span> {customerShipTo.name}</p>
                  <p className="text-gray-700"><span className="font-medium">Address:</span> {customerShipTo.address}</p>
                  {customerShipTo.gstNumber && (
                    <p className="text-gray-700"><span className="font-medium">GST Number:</span> {customerShipTo.gstNumber}</p>
                  )}
                  {customerShipTo.panNumber && (
                    <p className="text-gray-700"><span className="font-medium">PAN Number:</span> {customerShipTo.panNumber}</p>
                  )}
                </div>
              )
            }
          </div>

        </div>

        {/* Table Section */}
        <div className="px-8 py-6 bg-white">
          <Table className="border border-gray-200 rounded-lg overflow-hidden">
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="p-2 text-gray-700 font-semibold border-b border-gray-200">Item</TableHead>
                <TableHead className="p-2 text-gray-700 font-semibold border-b border-gray-200">HSN Code</TableHead>
                <TableHead className="p-2 text-gray-700 font-semibold border-b border-gray-200">Qty</TableHead>
                <TableHead className="p-2 text-gray-700 font-semibold border-b border-gray-200">Price</TableHead>
                <TableHead className="p-2 text-gray-700 font-semibold border-b border-gray-200">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index} className={index % 2 === 0 ? "bg-white text-black" : "bg-gray-50 text-black"}>
                  <TableCell className="p-2 font-medium text-gray-900 border-b border-gray-100">{item.name}</TableCell>

                  <TableCell className="p-2 border-b border-gray-100">{item.hsnCode || '-'}</TableCell>
                  <TableCell className="p-2 border-b border-gray-100">{item.quantity}</TableCell>
                  <TableCell className="p-2 border-b border-gray-100">₹{item.price.toFixed(2)}</TableCell>
                  <TableCell className="p-2 border-b border-gray-100">₹{(item.price * item.quantity).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Totals Section */}
          <div className="flex flex-col items-end mt-8">
            <div className="w-full bg-white rounded-lg p-6 border border-gray-200 flex flex-col gap-2 max-w-xs">
              <div className="flex justify-between text-gray-700 text-base">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {invoiceData.transportationAndOthers !== undefined && (
                <div className="flex justify-between text-gray-700 text-base">
                  <span>Transportation & Others</span>
                  <span>₹{formatCurrency(invoiceData.transportationAndOthers)}</span>
                </div>
              )}
              {invoiceData.packaging !== undefined && (
                <div className="flex justify-between text-gray-700 text-base">
                  <span>Packaging</span>
                  <span>₹{formatCurrency(invoiceData.packaging)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-700 text-base">
                <span>GST (18%)</span>
                <span>₹{gstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-900 text-lg font-bold mt-2 border-t pt-2">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end justify-center px-8 pb-6">
        </div>
      </div>


    </div>
  );
};

export default InvoiceClassic;