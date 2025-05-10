import React, { useRef, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import QRCode from 'react-qr-code';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/formatCurrency';

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  invoiceDate: string;
  customer: {
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
  const { customer, invoiceNumber, invoiceDate, items, companyDetails } = invoiceData;
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
          const pageCanvasHeight = (pageHeight * canvas.width) / imgWidth;
          const pageCount = Math.ceil(canvas.height / pageCanvasHeight);
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
          });

          for (let i = 0; i < pageCount; i++) {
            let thisPageHeight = Math.min(pageCanvasHeight, canvas.height - i * pageCanvasHeight);
            const pageCanvas = document.createElement('canvas');
            pageCanvas.width = canvas.width;
            if (i < pageCount - 1) {
              pageCanvas.height = pageCanvasHeight;
            } else {
              pageCanvas.height = thisPageHeight;
            }
            const ctx = pageCanvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = "#fff";
              ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
              ctx.drawImage(
                canvas,
                0,
                i * pageCanvasHeight,
                canvas.width,
                thisPageHeight,
                0,
                0,
                canvas.width,
                thisPageHeight
              );
            }
            const imgData = pageCanvas.toDataURL('image/png');
            if (i > 0) pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, (thisPageHeight * imgWidth) / canvas.width);
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

  return (
    <div className="p-0 bg-gray-50 dark:bg-neutral-900 min-h-screen flex flex-col items-center justify-center">
      <div ref={contentRef} className="bg-white shadow-md rounded-lg max-w-2xl w-full overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-bold text-xl">
              <span>{companyDetails.name[0]}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-wide">{companyDetails.name}</h1>
              <p className="text-sm text-gray-500">{companyDetails.address}</p>
            </div>
          </div>

          <QRCode value={`${import.meta.env.VITE_FRONTEND_URL}/invoice/${invoiceData.id}`} size={64} />
        </div>

        {/* Invoice Info */}
        <div className="px-8 py-6 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row md:justify-between md:items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Bill To:</h3>
            <p className="text-gray-700"><span className="font-medium">Name:</span> {customer.name}</p>
            <p className="text-gray-700"><span className="font-medium">Address:</span> {customer.address}</p>
            {customer.gstNumber && (
              <p className="text-gray-700"><span className="font-medium">GST Number:</span> {customer.gstNumber}</p>
            )}
            {customer.panNumber && (
              <p className="text-gray-700"><span className="font-medium">PAN Number:</span> {customer.panNumber}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-gray-700"><span className="font-medium">Invoice #:</span> {invoiceNumber}</p>
            <p className="text-gray-700"><span className="font-medium">Date:</span> {invoiceDate}</p>
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
          <div className="mt-8 flex flex-col items-end">
            <div className="w-full max-w-xs">
              <div className="flex justify-between py-2 text-gray-700 border-b border-gray-200">
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
              <div className="flex justify-between py-2 text-gray-700 border-b border-gray-200">
                <span>GST (18%)</span>
                <span>₹{gstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-3 text-xl font-bold text-gray-900">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end justify-center px-8 pb-6">
        </div>
      </div>
      {
        url.includes('invoice') ? '' : (
          <div className="mt-8 mb-4 w-full max-w-4xl flex justify-end">
            <button
              onClick={handleDownloadPDF}
              className="px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg shadow hover:bg-gray-900 transition-colors text-lg disabled:opacity-60 disabled:cursor-not-allowed"
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
          </div>
        )
      }
    </div>
  );
};

export default InvoiceClassic;