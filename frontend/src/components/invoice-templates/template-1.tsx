import React, { useRef, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

interface InvoiceData {
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  invoiceNumber: string;
  invoiceDate: string;
  items: { name: string; category: string; quantity: number; price: number }[];
  companyDetails: {
    name: string;
    address: string;
    cityState: string;
    phone: string;
    email: string;
  };
}

const InvoiceTemplate: React.FC<{ invoiceData: InvoiceData }> = ({ invoiceData }) => {
  const { customerName, customerEmail, customerAddress, invoiceNumber, invoiceDate, items, companyDetails } = invoiceData;
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
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-0 bg-gray-100 min-h-screen  flex flex-col items-center justify-center">
      <div ref={contentRef} className="bg-white shadow-2xl rounded-2xl max-w-2xl w-full overflow-hidden border-none">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-400 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Logo Placeholder */}
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-green-600 font-bold text-xl shadow-md">
              {/* You can replace this with an <img src=... /> for a real logo */}
              <span>{companyDetails.name[0]}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wide">{companyDetails.name}</h1>
              <p className="text-sm text-green-100">{companyDetails.cityState}</p>
            </div>
          </div>
          
        </div>

        {/* Invoice Info */}
        <div className="px-8 py-6 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row md:justify-between md:items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Bill To:</h3>
            <p className="text-gray-700"><span className="font-medium">Name:</span> {customerName}</p>
            <p className="text-gray-700"><span className="font-medium">Email:</span> {customerEmail}</p>
            <p className="text-gray-700"><span className="font-medium">Address:</span> {customerAddress}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-700"><span className="font-medium">Invoice #:</span> {invoiceNumber}</p>
            <p className="text-gray-700"><span className="font-medium">Date:</span> {invoiceDate}</p>
          </div>
        </div>

        {/* Table Section */}
        <div ref={contentRef} className="px-8 py-6 bg-white ">
          <Table className='border-none rounded-lg overflow-hidden'>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="p-2">Item</TableHead>
                <TableHead className="p-2">Category</TableHead>
                <TableHead className="p-2">Qty</TableHead>
                <TableHead className="p-2">Price</TableHead>
                <TableHead className="p-2">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                  <TableCell className="p-2 font-medium text-gray-800">{item.name}</TableCell>
                  <TableCell className="p-2">
                    <Badge className="bg-green-100 text-green-800">{item.category || "Uncategorized"}</Badge>
                  </TableCell>
                  <TableCell className="p-2">{item.quantity}</TableCell>
                  <TableCell className="p-2">₹{item.price.toFixed(2)}</TableCell>
                  <TableCell className="p-2">₹{(item.price * item.quantity).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Totals Section */}
          <div className="mt-8 flex flex-col items-end">
            <div className="w-full max-w-xs">
              <div className="flex justify-between py-2 text-gray-700 border-b">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 text-gray-700 border-b">
                <span>GST (18%)</span>
                <span>₹{gstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-3 text-xl font-bold text-green-700">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {
        url.includes('invoice') ? '' : (
          <div className="mt-8 mb-4 w-full max-w-4xl flex justify-end">
        <button
          onClick={handleDownloadPDF}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold rounded-lg shadow hover:from-blue-700 hover:to-blue-500 transition-colors text-lg disabled:opacity-60 disabled:cursor-not-allowed"
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

export default InvoiceTemplate;