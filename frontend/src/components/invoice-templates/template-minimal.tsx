import React, { useRef, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { formatCurrency } from '@/lib/formatCurrency';
import QRCode from 'react-qr-code';

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  invoiceDate: string;
  customer: {
    name: string;
    email: string;
    address: string;
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
  }[];
  subtotal: number;
  gstAmount: number;
  gstRate: number;
  total: number;
  template: "modern" | "minimal" | "classic";
};

const PremiumMinimalInvoice: React.FC<{ invoiceData: InvoiceData }> = ({ invoiceData }) => {
  const { customer, invoiceNumber, invoiceDate, items, companyDetails } = invoiceData;

  const url = window.location.href;

  const gstRate = 0.18; // 18% GST
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gstAmount = subtotal * gstRate;
  const total = subtotal + gstAmount;

  const contentRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

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
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center py-8 px-2 font-sans">
      <div className="w-[210mm] min-h-[297mm] bg-white rounded-lg shadow border border-gray-200 flex flex-col mx-auto print:w-[210mm] print:min-h-[297mm]">
        <div ref={contentRef} className="flex-1 flex flex-col px-10 py-8 gap-8">
          {/* Header */}
          <div className="border-b border-gray-200 pb-6 mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1 uppercase">{companyDetails.name}</h1>
              <div className="text-sm text-gray-500 space-y-0.5">
                <p>{companyDetails.address}</p>
                <p>{companyDetails.cityState}</p>
                <p>Phone: {companyDetails.phone}</p>
                <p>Email: {companyDetails.email}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 mb-1 tracking-widest">INVOICE</div>
              <div className="text-xs text-gray-700 space-y-0.5">
                <p>Invoice #: <span className="font-semibold">{invoiceNumber}</span></p>
                <p>Date: <span className="font-semibold">{invoiceDate}</span></p>
                <p className="text-gray-600 font-bold">Due: {new Date(new Date(invoiceDate).setDate(new Date(invoiceDate).getDate() + 30)).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Bill To only */}
          <div className="flex flex-col sm:flex-row justify-between gap-8">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex-1 min-w-[220px]">
              <h3 className="text-lg font-bold text-gray-800 mb-2 uppercase tracking-wide">Bill To</h3>
              <p className="font-semibold text-gray-900">{customer.name}</p>
              <p className="text-gray-700 text-sm">{customer.address}</p>
              <p className="text-gray-700 text-sm">{customer.email}</p>
            </div>
          </div>

          {/* Items Table + Summary */}
          <div className="flex-1 flex flex-col">
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
              <Table className='min-w-full'>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="p-4 text-gray-800 font-bold uppercase tracking-wider">Item</TableHead>
                    <TableHead className="p-4 text-gray-800 font-bold uppercase tracking-wider">Category</TableHead>
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
                        <TableCell className="p-4">
                          {/* @ts-ignore */}
                          <Badge className="bg-gray-200 text-gray-800 font-semibold border border-gray-300">{item.category?.name}</Badge>
                        </TableCell>
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
          <div className='flex flex-col items-end justify-center'>
            <QRCode value={`${import.meta.env.VITE_FRONTEND_URL}/invoice/${invoiceData.id}`} width={60} height={60} />
          </div>
        </div>

        {/* Download Button */}
        {
          url.includes('invoice') ? '' : (
            <div className="bg-gray-50 px-10 py-6 border-t border-gray-200 flex justify-end rounded-b-lg">
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
      </div>
    </div>
  );
};

export default PremiumMinimalInvoice;