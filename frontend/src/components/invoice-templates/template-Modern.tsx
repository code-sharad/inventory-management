import React, { useRef, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { formatCurrency } from '@/lib/formatCurrency';
import QRCode from "react-qr-code"
import { Printer, QrCode, Download } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

import { toast } from 'sonner';
import { Button } from '../ui/button';

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
    phoneNumber?: string;
  };
  customerShipTo: {
    name: string;
    address: string;
    gstNumber?: string;
    panNumber?: string;
    phoneNumber?: string;
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
  template: "modern" | "minimal" | "classic" | "professional";
  packaging?: number;
  transportationAndOthers?: number;
  challanNo?: string;
  challanDate?: string;
  poNo?: string;
  eWayNo?: string;
};


const ModernInvoiceTemplate: React.FC<{ invoiceData: InvoiceData }> = ({ invoiceData }) => {
  const { customerBillTo, customerShipTo, invoiceNumber, invoiceDate, items, companyDetails } = invoiceData;
  const [loading, setLoading] = useState(false);
  const url = window.location.href;
  const contentRef = useRef<HTMLDivElement>(null);

  // Split items based on pagination rules
  const firstPageItems = items.slice(0, 7);
  const remainingItems = items.slice(7);
  const additionalPages: Array<Array<typeof items[0]>> = [];

  // Split remaining items into pages of 14 each
  for (let i = 0; i < remainingItems.length; i += 14) {
    additionalPages.push(remainingItems.slice(i, i + 14));
  }

  const getPageMargins = () => {
    const screenHeight = window.innerHeight;
    const isLargeScreen = screenHeight > 800;
    return isLargeScreen ? '2.5rem' : '1.5rem';
  };

  const handleDownloadPDF = async () => {
    setLoading(true);
    try {
      if (contentRef.current) {
        const margin = 10; // 10mm margin
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        // Define usable area (A4 minus margins)
        const usableWidth = 210 - 2 * margin; // A4 width minus margins
        const usableHeight = 297 - 2 * margin; // A4 height minus margins

        await html2canvas(contentRef.current, { scale: 2 }).then((canvas) => {
          const imgData = canvas.toDataURL('image/png');
          const imgProps = pdf.getImageProperties(imgData);
          const pdfHeight = (imgProps.height * usableWidth) / imgProps.width;

          let position = 0;

          // Check if content fits on one page
          if (pdfHeight <= usableHeight) {
            // Single page
            pdf.addImage(imgData, 'PNG', margin, margin, usableWidth, pdfHeight);
          } else {
            // Multi-page
            let remainingHeight = imgProps.height;

            while (remainingHeight > 0) {
              const sliceHeight = Math.min((usableHeight * imgProps.width) / usableWidth, remainingHeight);

              const pageCanvas = document.createElement('canvas');
              pageCanvas.width = imgProps.width;
              pageCanvas.height = sliceHeight;

              const ctx = pageCanvas.getContext('2d');
              if (ctx) {
                ctx.fillStyle = "#fff";
                ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
                ctx.drawImage(
                  canvas,
                  0,
                  position,
                  imgProps.width,
                  sliceHeight,
                  0,
                  0,
                  imgProps.width,
                  sliceHeight
                );
              }

              const pageImgData = pageCanvas.toDataURL('image/png');
              if (position > 0) pdf.addPage();
              pdf.addImage(pageImgData, 'PNG', margin, margin, usableWidth, (sliceHeight * usableWidth) / imgProps.width);

              position += sliceHeight;
              remainingHeight -= sliceHeight;
            }
          }

          pdf.save(`modern_invoice_${invoiceNumber}.pdf`);
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
    documentTitle: `Modern-Invoice-${invoiceNumber}`,
  });

  const renderItemsTable = (pageItems: typeof items, pageNumber: number) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <Table className="w-full">
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
            <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-700 tracking-wide">
              Product
            </TableHead>
            <TableHead className="px-4 py-4 text-left text-sm font-semibold text-gray-700 tracking-wide">
              HSN
            </TableHead>
            <TableHead className="px-4 py-4 text-center text-sm font-semibold text-gray-700 tracking-wide">
              Qty
            </TableHead>
            <TableHead className="px-4 py-4 text-right text-sm font-semibold text-gray-700 tracking-wide">
              Rate
            </TableHead>
            <TableHead className="px-6 py-4 text-right text-sm font-semibold text-gray-700 tracking-wide">
              Amount
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageItems.map((item, index) => (
            <TableRow
              key={item.id}
              className={`${index % 2 === 0
                ? "bg-white hover:bg-gray-50"
                : "bg-gray-50 hover:bg-gray-100"
                } border-b border-gray-100 transition-colors duration-200`}
            >
              <TableCell className="px-6 py-4 text-gray-900 font-medium text-xs leading-relaxed">
                {item.name}
              </TableCell>
              <TableCell className="px-4 py-4 text-gray-600 text-xs">
                {item.hsnCode || '-'}
              </TableCell>
              <TableCell className="px-4 py-4 text-center text-gray-700 font-medium text-xs">
                {item.quantity}
              </TableCell>
              <TableCell className="px-4 py-4 text-right text-gray-700 font-medium text-xs">
                ₹{formatCurrency(item.price)}
              </TableCell>
              <TableCell className="px-6 py-4 text-right text-gray-900 font-semibold text-xs">
                ₹{formatCurrency(item.price * item.quantity)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const renderFooterContent = () => (
    <>
      {/* Financial Summary */}
      <div className="flex justify-end mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 min-w-80">
          <div className="space-y-3">
            <div className="flex justify-between text-gray-600">
              <span className="text-sm">Subtotal</span>
              <span className="font-medium">₹{formatCurrency(invoiceData.subtotal)}</span>
            </div>
            {invoiceData.transportationAndOthers !== undefined && (
              <div className="flex justify-between text-gray-600">
                <span className="text-sm">Transportation & Others</span>
                <span className="font-medium">₹{formatCurrency(invoiceData.transportationAndOthers)}</span>
              </div>
            )}
            {invoiceData.packaging !== undefined && (
              <div className="flex justify-between text-gray-600">
                <span className="text-sm">Packaging</span>
                <span className="font-medium">₹{formatCurrency(invoiceData.packaging)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span className="text-sm">GST ({invoiceData.gstRate}%)</span>
              <span className="font-medium">₹{formatCurrency(invoiceData.gstAmount)}</span>
            </div>
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between text-gray-900 font-bold text-lg">
                <span>Total</span>
                <span>₹{formatCurrency(invoiceData.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderCustomerDetails = ({ invoiceData }: { invoiceData: InvoiceData }) => (
    <div className="border text-black border-gray-200 rounded-lg mb-6 flex bg-white overflow-hidden">
      {/* Bill To */}
      <div className="flex-1 border-r border-gray-200 p-0">
        <div className="font-bold text-center border-b border-gray-200 py-1 mb-2 text-sm">Bill To</div>
        <div className="text-xs px-4 py-2 space-y-1">
          <div><span className="font-bold">M/S:</span> {invoiceData.customerBillTo.name}</div>
          <div><span className="font-bold">Address:</span> {invoiceData.customerBillTo.address}</div>
          <div><span className="font-bold">PHONE:</span> {invoiceData.customerBillTo.phoneNumber || '-'}</div>
          <div><span className="font-bold">GSTIN:</span> {invoiceData.customerBillTo.gstNumber || '-'}</div>
        </div>
      </div>
      {/* Ship To */}
      <div className="flex-1 border-r border-gray-200 p-0">
        <div className="font-bold text-center border-b border-gray-200 py-1 mb-2 text-sm">Ship To</div>
        <div className="text-xs px-4 py-2 space-y-1">
          <div><span className="font-bold">M/S:</span> {invoiceData.customerShipTo.name}</div>
          <div><span className="font-bold">Address:</span> {invoiceData.customerShipTo.address}</div>
          <div><span className="font-bold">PHONE:</span> {invoiceData.customerShipTo.phoneNumber || '-'}</div>
          <div><span className="font-bold">GSTIN:</span> {invoiceData.customerShipTo.gstNumber || '-'}</div>
        </div>
      </div>
      {/* Invoice Details */}
      <div className="flex-1 p-0 text-black">
        <div className="font-bold text-center border-b border-gray-200 py-1 mb-2 text-sm">Invoice Details</div>
        <div className="flex flex-row text-xs">
          {/* Left Column */}
          <div className="flex-1 border-r border-gray-200">
            <div className="border-b border-gray-200 p-1"><span className="font-bold">Invoice No.</span> <span>{invoiceData.invoiceNumber}</span></div>
            <div className="border-b border-gray-200 p-1"><span className="font-bold">Challan No.</span> <span>{invoiceData.challanNo || '-'}</span></div>
            <div className="border-b border-gray-200 p-1"><span className="font-bold">DELIVERY DATE</span> <span>{invoiceData.invoiceDate}</span></div>
            <div className="p-1"><span className="font-bold">P.O. No.</span> <span>{invoiceData.poNo || '-'}</span></div>
          </div>
          {/* Right Column */}
          <div className="flex-1">
            <div className="border-b border-gray-200 p-1"><span className="font-bold">Invoice Date</span> <span>{invoiceData.invoiceDate}</span></div>
            <div className="border-b border-gray-200 p-1"><span className="font-bold">Challan Date</span> <span>{invoiceData.challanDate || '-'}</span></div>
            <div className="border-b border-gray-200 p-1"><span className="font-bold">Reverse Charge</span> <span>No</span></div>
            <div className="p-1"><span className="font-bold">E-Way No.</span> <span>{invoiceData.eWayNo || '-'}</span></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      {/* Action Buttons */}
      {!url.includes('billing') ? '' : (
        <div className="max-w-4xl mx-auto mb-6 flex gap-4">
          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-white border border-gray-300 text-gray-800 font-medium rounded shadow-sm hover:bg-gray-50 transition-all duration-150"
            disabled={loading}
          >
            <Printer className="inline-block w-4 h-4 mr-2" />
            Print Invoice
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-5 py-2 bg-blue-600 text-white font-medium rounded shadow-sm hover:bg-blue-700 transition-all duration-150"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="inline-block w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Generating...
              </>
            ) : (
              <>
                <Download className="inline-block w-4 h-4 mr-2" />
                Download PDF
              </>
            )}
          </button>
        </div>
      )}

      {/* Invoice Pages */}
      <div ref={contentRef} className="space-y-8">
        {/* First Page */}
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-white px-8 py-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center border border-gray-200">
                  <img src={"/logo.png"} alt="logo" className="w-16 h-16 rounded" />
                </div>
                <div>
                  <h1 className="text-xl font-bold mb-1 text-gray-900">{companyDetails.name}</h1>
                  <p className="text-gray-700 text-sm">{companyDetails.phone}</p>
                  <p className="text-gray-700 text-sm">{companyDetails.email}</p>
                  <p className="text-gray-700 text-sm max-w-md">{companyDetails.address}, {companyDetails.cityState}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-gray-100 p-3 rounded mb-2 inline-block border border-gray-200">
                  <QRCode value={`${import.meta.env.VITE_FRONTEND_URL}/invoice/${invoiceData.id}`} size={96} />
                </div>
              </div>
            </div>
           
          </div>

          {/* Content */}
          <div className="p-8" style={{ paddingTop: getPageMargins(), paddingBottom: getPageMargins() }}>
            {/* Bill To & Ship To */}
            {renderCustomerDetails({ invoiceData })}

            {/* Items Table */}
            {renderItemsTable(firstPageItems, 1)}
            {additionalPages.length === 0 && renderFooterContent()}
          </div>

          {/* Page Footer */}
          <div className="bg-gray-50 px-8 py-3 border-t border-gray-200">
            <div className="flex justify-between items-center text-xs text-gray-600">
              <span>Invoice No: {invoiceNumber}</span>
              <span>Invoice Date: {invoiceDate}</span>
              <span>Page 1 of {additionalPages.length + 1}</span>
            </div>
          </div>
        </div>

        {/* Additional Pages */}
        {additionalPages.map((pageItems, pageIndex) => (
          <div key={pageIndex} className="max-w-4xl mx-auto bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-white px-8 py-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center border border-gray-200">
                    <img src={"/logo.png"} alt="logo" className="w-16 h-16 rounded" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold mb-1 text-gray-900">{companyDetails.name}</h1>
                    <p className="text-gray-700 text-sm">{companyDetails.phone}</p>
                    <p className="text-gray-700 text-sm">{companyDetails.email}</p>
                    <p className="text-gray-700 text-sm max-w-md">{companyDetails.address}, {companyDetails.cityState}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-gray-100 p-3 rounded mb-2 inline-block border border-gray-200">
                    <QRCode value={`${import.meta.env.VITE_FRONTEND_URL}/invoice/${invoiceData.id}`} size={96} />
                  </div>
                  <p className="text-gray-700 text-xs"><span className="font-medium">Invoice #:</span> {invoiceNumber}</p>
                  <p className="text-gray-700 text-xs"><span className="font-medium">Date:</span> {invoiceDate}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8" style={{ paddingTop: getPageMargins(), paddingBottom: getPageMargins() }}>
              {/* Items Table */}
              {renderItemsTable(pageItems, pageIndex + 2)}
              {pageIndex === additionalPages.length - 1 && renderFooterContent()}
            </div>

            {/* Page Footer */}
            <div className="bg-gray-50 px-8 py-3 border-t border-gray-200">
              <div className="flex justify-between items-center text-xs text-gray-600">
                <span>Invoice No: {invoiceNumber}</span>
                <span>Invoice Date: {invoiceDate}</span>
                <span>Page {pageIndex + 2} of {additionalPages.length + 1}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModernInvoiceTemplate;






