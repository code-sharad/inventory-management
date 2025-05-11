import React, { useRef, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { formatCurrency } from '@/lib/formatCurrency';
import QRCode from "react-qr-code"
import { QrCode } from 'lucide-react';
import { toast } from 'sonner';

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  invoiceDate: string;
  customer: {
    name: string;
    email: string;
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
    hsnCode: string;
    // category: string;
  }[];
  subtotal: number;
  gstAmount: number;
  gstRate: number;
  total: number;
  template: "modern" | "minimal" | "classic";
  packaging?: number;
  transportationAndOthers?: number;
};


const ModernInvoiceTemplate: React.FC<{ invoiceData: InvoiceData }> = ({ invoiceData }) => {
  const { customer, invoiceNumber, invoiceDate, items, companyDetails } = invoiceData;
  const contentRef = useRef<HTMLDivElement>(null);
  const url = window.location.href;
  const [loading, setLoading] = useState(false);
  console.log(invoiceData)
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
  console.log(items.map((item) => item.hsnCode))

  return (
    <div id="modern-invoice" className="w-[794px] min-h-[1123px] mx-auto flex flex-col items-center">
      {/* Header Bar */}
{/* Download Button */}
      {
        url.includes('invoice') ? '' : (
          <div className=" my-4 border-gray-200 flex w-full justify-end rounded-b-lg">
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
          </div>)
      }

      {/* Main Content Card */}
      <div ref={contentRef} className="w-[794px] min-h-[1123px] bg-white rounded-b-lg   px-8 pb-8 flex flex-col gap-8">
        <div className="w-full rounded-t-lg bg-white border-b border-gray-300 px-0 py-6 flex flex-row justify-between items-center">
          <div className="flex flex-col items-start">
            <h1 className="text-2xl font-bold text-gray-900 tracking-wide">{companyDetails.name}</h1>
            <span className="text-gray-600 text-sm mt-1">{companyDetails.address}, {companyDetails.cityState}</span>
          </div>
          <div className="flex flex-col items-end">
            <QRCode value={`${import.meta.env.VITE_FRONTEND_URL}/invoice/${invoiceData.id}`} size={64} />
            {/* <span className="text-lg font-semibold text-gray-900 tracking-widest">INVOICE</span> */}
            <span className="text-gray-600 text-xs mt-1">Invoice #: {invoiceNumber}</span>
            <span className="text-gray-600 text-xs">Date: {invoiceDate}</span>
          </div>
        </div>
        {/* Bill To & Company Details */}
        <div className="flex flex-row justify-between gap-8">
          <div className="bg-gray-50 rounded-lg p-4 flex-1 min-w-[220px] border border-gray-200">
            <h3 className="text-base font-semibold text-gray-800 mb-2">Bill To</h3>
            <p className="font-medium text-gray-900">{customer.name}</p>
            <p className="text-gray-700 text-sm">{customer.address}</p>
            <p className="text-gray-700 text-sm">{customer.email}</p>
            {customer.gstNumber && (
              <p className="text-gray-700 text-sm">GSTIN: {customer.gstNumber}</p>
            )}
            {customer.panNumber && (
              <p className="text-gray-700 text-sm">PAN: {customer.panNumber}</p>
            )}
          </div>
          <div className="bg-gray-50 rounded-lg p-4 flex-1 min-w-[220px] border border-gray-200">
            <h3 className="text-base font-semibold text-gray-800 mb-2">Company Info</h3>
            <p className="font-medium text-gray-900">{companyDetails.name}</p>
            <p className="text-gray-700 text-sm">{companyDetails.phone}</p>
            <p className="text-gray-700 text-sm">{companyDetails.email}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <Table className='min-w-full'>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="p-4 text-gray-900 font-semibold">Item</TableHead>
                <TableHead className="p-4 text-gray-900 font-semibold">HSN Code</TableHead>
                <TableHead className="p-4 text-gray-900 font-semibold">Quantity</TableHead>
                <TableHead className="p-4 text-gray-900 font-semibold">Unit Price</TableHead>
                <TableHead className="p-4 text-gray-900 font-semibold">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length > 0 && items.map((item, index) => (
                <TableRow key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <TableCell className="p-4 font-medium text-gray-900">{item.name}</TableCell>
                  <TableCell className="p-4">
                    {/* @ts-ignore */}
                    <Badge className="bg-gray-200 text-gray-800 font-semibold">{item.hsnCode}</Badge>
                  </TableCell>
                  <TableCell className="p-4 text-gray-800">{item.quantity}</TableCell>
                  <TableCell className="p-4 text-gray-800">₹{formatCurrency(item.price)}</TableCell>
                  <TableCell className="p-4 text-gray-900 font-semibold">₹{formatCurrency(item.price * item.quantity)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Financial Summary */}
        <div className="flex flex-col items-end">
          <div className="w-full bg-white rounded-lg p-6 border border-gray-200 flex flex-col gap-2">
            <div className="flex justify-between text-gray-700 text-base">
              <span>Subtotal</span>
              <span>₹{formatCurrency(invoiceData.subtotal)}</span>
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
              <span>GST ({invoiceData.gstRate}%)</span>
              <span>₹{formatCurrency(invoiceData.gstAmount)}</span>
            </div>
            <div className="flex justify-between text-gray-900 text-lg font-bold mt-2 border-t pt-2">
              <span>Total</span>
              <span>₹{formatCurrency(invoiceData.total)}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default ModernInvoiceTemplate;






