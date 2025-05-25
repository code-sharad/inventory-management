import React, { useRef, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { formatCurrency } from '@/lib/formatCurrency';
import QRCode from 'react-qr-code';
import { toast } from 'sonner';
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
    cityState: string;
    phone: string;
    email: string;
  };
  items: {
    id: string;
    productId: string;
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

const PremiumMinimalInvoice: React.FC<{ invoiceData: InvoiceData }> = ({ invoiceData }) => {
  const { customerBillTo, customerShipTo, invoiceNumber, invoiceDate, items, companyDetails } = invoiceData;

  const url = window.location.href;

  const gstRate = 0.18; // 18% GST
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gstAmount = subtotal * gstRate;
  const total = subtotal + gstAmount;

  const contentRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const handlePrint = useReactToPrint({
    contentRef: contentRef,
    documentTitle: `Invoice ${invoiceNumber}`,
  });

  // PDF Download (A4, scale=2)
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

  console.log(url)


  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-neutral-900 flex flex-col items-center py-8 px-2 font-sans">
      {/* Download Button */}
      {
        !url.includes('billing') ? '' : (
          <div className=" my-4 border-gray-200 flex w-full justify-start ml-6 rounded-b-lg gap-2">
           
            <button
              onClick={handlePrint}
              className="px-7 py-3 bg-blue-700 text-white font-bold rounded shadow hover:bg-blue-900 transition-colors text-lg border border-blue-700"
              disabled={loading}
            >
              Print
            </button>
          </div>)
      }
     
      <div className="w-[210mm] min-h-[297mm] bg-white rounded-lg shadow border border-gray-200 flex flex-col mx-auto print:w-[210mm] print:min-h-[297mm]">
        <div ref={contentRef} className="flex-1 flex flex-col px-10 py-8 gap-8">
          {/* Header */}
          <div className="border-b border-gray-200 pb-6 mb-2 flex justify-between sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className=''>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1 uppercase">{companyDetails.name}</h1>
              <div className="text-sm text-gray-500 space-y-0.5">
                <p>{companyDetails.address}</p>
                <p>{companyDetails.cityState}</p>
                <p>Phone: {companyDetails.phone}</p>
                <p>Email: {companyDetails.email}</p>
              </div>
            </div>
            <div className="text-right">

              <div className="text-xs text-gray-700 space-y-0.5 flex flex-col items-end justify-center gap-3">
                <QRCode value={`${import.meta.env.VITE_FRONTEND_URL}/invoice/${invoiceData.id}`} size={64} />
                <div>
                  <p>Invoice #: <span className="font-semibold">{invoiceNumber}</span></p>
                  <p>Date: <span className="font-semibold">{invoiceDate}</span></p>
                  <p className="text-gray-600 font-bold">Due: {new Date(new Date(invoiceDate).setDate(new Date(invoiceDate).getDate() + 30)).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bill To only */}
          <div className="flex flex-col sm:flex-row justify-between gap-8">
            <div className="bg-gray-50 border grid grid-cols-2 border-gray-200 rounded-lg p-6 flex-1 min-w-[220px]">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2 uppercase tracking-wide text-left">Bill To</h3>
                <p className="font-semibold text-gray-900">{customerBillTo.name}</p>
                <p className="text-gray-700 text-sm">{customerBillTo.address}</p>
                {/* <p className="text-gray-700 text-sm">{customerBillTo.email}</p> */}
                {customerBillTo.gstNumber && (
                  <p className="text-gray-700 text-sm">GSTIN: {customerBillTo.gstNumber}</p>
                )}
                {customerBillTo.panNumber && (
                  <p className="text-gray-700 text-sm">PAN: {customerBillTo.panNumber}</p>
                )}
              </div>
              {
                customerShipTo.name && customerShipTo.address && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2 uppercase tracking-wide text-left">Ship To</h3>
                    <p className="font-semibold text-gray-900">{customerShipTo.name}</p>
                    <p className="text-gray-700 text-sm">{customerShipTo.address}</p>
                    {/* <p className="text-gray-700 text-sm">{customerBillTo.email}</p> */}
                    {customerShipTo.gstNumber && (
                      <p className="text-gray-700 text-sm">GSTIN: {customerShipTo.gstNumber}</p>
                    )}
                    {customerShipTo.panNumber && (
                      <p className="text-gray-700 text-sm">PAN: {customerShipTo.panNumber}</p>
                    )}
                  </div>
                )
              }
            </div>
          </div>

          {/* Items Table + Summary */}
          <div className="flex-1 flex flex-col">
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
              <Table className='min-w-full'>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="p-4 text-gray-800 font-bold uppercase tracking-wider">Item</TableHead>
                    <TableHead className="p-4 text-gray-800 font-bold uppercase tracking-wider">HSN Code</TableHead>
                    <TableHead className="p-4 text-gray-800 font-bold uppercase tracking-wider">Qty</TableHead>
                    <TableHead className="p-4 text-gray-800 font-bold uppercase tracking-wider">Price</TableHead>
                    <TableHead className="p-4 text-gray-800 font-bold uppercase tracking-wider">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length > 0 ? (
                    items.map((item, index) => (
                      <TableRow key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <TableCell className="p-4 font-semibold text-gray-900">{item.name}</TableCell>

                        <TableCell className="p-4 text-gray-900">{item.hsnCode || '-'}</TableCell>
                        <TableCell className="p-4 text-gray-900">{item.quantity}</TableCell>
                        <TableCell className="p-4 text-gray-900">₹{formatCurrency(item.price)}</TableCell>
                        <TableCell className="p-4 text-gray-900 font-bold">₹{formatCurrency(item.price * item.quantity)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={5} className="text-center py-4 text-gray-400">No items</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {/* Financial Summary at bottom right */}
            <div className="flex-1 flex flex-col justify-end">
              <div className="flex justify-end mt-8">
                <div className="w-full sm:w-80 bg-gray-50 border border-gray-200 rounded-lg p-7 shadow flex flex-col gap-2 ">
                  <div className="flex justify-between text-gray-700 text-base font-semibold">
                    <span>Subtotal</span>
                    <span>₹{formatCurrency(subtotal)}</span>
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
                  <div className="flex justify-between text-gray-700 text-base font-semibold">
                    <span>GST (18%)</span>
                    <span>₹{formatCurrency(gstAmount)}</span>
                  </div>
                  <div className="flex justify-between text-gray-900 text-2xl font-extrabold mt-2 border-t border-gray-200 pt-3">
                    <span>Total</span>
                    <span>₹{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default PremiumMinimalInvoice;