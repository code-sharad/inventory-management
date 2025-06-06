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
  template: "modern" | "minimal" | "classic" | "professional";
  packaging?: number;
  transportationAndOthers?: number;
  challanNo?: string;
  challanDate?: string;
  poNo?: string;
  eWayNo?: string;
};

const InvoiceClassic: React.FC<{ invoiceData: InvoiceData }> = ({ invoiceData }) => {
  const { customerBillTo, customerShipTo, invoiceNumber, invoiceDate, items, companyDetails } = invoiceData;
  const contentRef = useRef<HTMLDivElement>(null);
  const url = window.location.href;
  const [loading, setLoading] = useState(false);

  // Split items based on pagination rules
  const firstPageItems = items.slice(0, 7);
  const remainingItems = items.slice(7);
  const additionalPages: Array<Array<typeof items[0]>> = [];

  // Split remaining items into pages of 14 each
  for (let i = 0; i < remainingItems.length; i += 14) {
    additionalPages.push(remainingItems.slice(i, i + 14));
  }

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

          pdf.save(`classic_invoice_${invoiceNumber}.pdf`);
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
    documentTitle: `Classic-Invoice-${invoiceNumber}`,
  });

  const renderItemsTable = (pageItems: typeof items, pageNumber: number) => (
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
          {pageItems.map((item, index) => (
            <TableRow key={index} className={index % 2 === 0 ? "bg-white text-black" : "bg-gray-50 text-black"}>
              <TableCell className="p-2 font-medium text-gray-900 border-b border-gray-100 text-xs">{item.name}</TableCell>
              <TableCell className="p-2 border-b border-gray-100 text-xs">{item.hsnCode || '-'}</TableCell>
              <TableCell className="p-2 border-b border-gray-100 text-xs">{item.quantity}</TableCell>
              <TableCell className="p-2 border-b border-gray-100 text-xs">₹{item.price.toFixed(2)}</TableCell>
              <TableCell className="p-2 border-b border-gray-100 text-xs">₹{(item.price * item.quantity).toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const renderFooterContent = () => (
    <>
      {/* Totals Section */}
      <div className="flex justify-end px-8 mt-8">
        <div className="w-full bg-white rounded-lg p-6 border border-gray-200 flex flex-col gap-2 max-w-xs">
          <div className="flex justify-between text-gray-700 text-base">
            <span>Subtotal</span>
            <span>₹{invoiceData.subtotal.toFixed(2)}</span>
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
            <span>₹{invoiceData.gstAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-900 text-lg font-bold mt-2 border-t pt-2">
            <span>Total</span>
            <span>₹{invoiceData.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </>
  );

  const renderCustomerDetails = ({ invoiceData }: { invoiceData: InvoiceData }) => (
    <div className="border mx-12 text-black border-gray-200 rounded-lg mb-6 flex bg-white overflow-hidden">
      {/* Bill To */}
      <div className="flex-1 border-r border-gray-200 p-0">
        <div className="font-bold text-center border-b border-gray-200 py-1 mb-2 text-sm">Bill To</div>
        <div className="text-xs px-4 py-2 space-y-1">
          <div><span className="font-bold">M/S:</span> {invoiceData.customerBillTo.name}</div>
          <div><span className="font-bold">Address:</span> {invoiceData.customerBillTo.address}</div>
          <div><span className="font-bold">PHONE:</span> -</div>
          <div><span className="font-bold">GSTIN:</span> {invoiceData.customerBillTo.gstNumber || '-'}</div>
        </div>
      </div>
      {/* Ship To */}
      <div className="flex-1 border-r border-gray-200 p-0">
        <div className="font-bold text-center border-b border-gray-200 py-1 mb-2 text-sm">Ship To</div>
        <div className="text-xs px-4 py-2 space-y-1">
          <div><span className="font-bold">M/S:</span> {invoiceData.customerShipTo.name}</div>
          <div><span className="font-bold">Address:</span> {invoiceData.customerShipTo.address}</div>
          <div><span className="font-bold">PHONE:</span> -</div>
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
    <div className="min-h-screen bg-[#fafafa] dark:bg-neutral-900 flex flex-col items-center py-8 px-2 font-sans">
      {/* Download Button */}
      {!url.includes('billing') ? '' : (
        <div className="my-4 border-gray-200 flex w-full justify-start ml-6 rounded-b-lg gap-2">
          <button
            onClick={handlePrint}
            className="px-7 py-3 bg-blue-700 text-white font-bold rounded shadow hover:bg-blue-900 transition-colors text-lg border border-blue-700"
            disabled={loading}
          >
            Print
          </button>
        </div>
      )}

      {/* Invoice Pages */}
      <div ref={contentRef} className="space-y-8">
        {/* First Page */}
        <div className="w-[210mm] min-h-[297mm] bg-white rounded-lg shadow flex flex-col mx-auto print:w-[210mm] print:min-h-[297mm]">
          {/* Header */}
          <div className="px-8 py-6 flex items-center justify-between  border-gray-200 bg-white">
            <div className="flex items-center space-x-4">
              <img src={"/logo.png"} alt="logo" className="w-24 h-24 rounded-[1000px] overflow-hidden" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-wide">{companyDetails.name}</h1>
                <p className="text-sm text-gray-500">{companyDetails.phone}</p>
                <p className="text-sm text-gray-500">{companyDetails.email}</p>
                <p className="text-sm text-gray-500 max-w-[400px]">{companyDetails.address} {companyDetails.cityState}</p>
              </div>
            </div>

            <div className='flex flex-col items-end'>
              <QRCode value={`${import.meta.env.VITE_FRONTEND_URL}/invoice/${invoiceData.id}`} size={64} />
            </div>
          </div>
         

          {/* Invoice Info */}
          {renderCustomerDetails({ invoiceData })}

          {/* Table Section */}
          {renderItemsTable(firstPageItems, 1)}
          {additionalPages.length === 0 && renderFooterContent()}

          {/* Page Footer */}
          <div className="text-center text-sm text-gray-500 mt-6 pt-4 border-t border-gray-200 px-8">
            Invoice No: {invoiceNumber} | Invoice Date: {invoiceDate} | Page 1 of {additionalPages.length + 1}
          </div>
        </div>

        {/* Additional Pages */}
        {additionalPages.map((pageItems, pageIndex) => (
          <div key={pageIndex} className="w-[210mm] min-h-[297mm] bg-white rounded-lg shadow flex flex-col mx-auto print:w-[210mm] print:min-h-[297mm]">
            {/* Header */}
            <div className="px-8 py-6 flex items-center justify-between border-b border-gray-200 bg-white">
              <div className="flex items-center space-x-4">
                <img src={"/logo.png"} alt="logo" className="w-24 h-24 rounded-[1000px] overflow-hidden" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-wide">{companyDetails.name}</h1>
                  <p className="text-sm text-gray-500">{companyDetails.phone}</p>
                  <p className="text-sm text-gray-500">{companyDetails.email}</p>
                  <p className="text-sm text-gray-500 max-w-[400px]">{companyDetails.address} {companyDetails.cityState}</p>
                </div>
              </div>

              <div className='flex flex-col items-end'>
                <QRCode value={`${import.meta.env.VITE_FRONTEND_URL}/invoice/${invoiceData.id}`} size={64} />
              </div>
            </div>
            {/* 6-column Invoice Info Table */}
            <div className="flex justify-center mb-6">
              <table className="min-w-fit border border-gray-200 rounded text-sm text-gray-800">
                <tbody>
                  <tr>
                    <td className="px-4 py-2 border border-gray-200 text-center">
                      <div className="font-semibold">Invoice No.:</div>
                      <div>{invoiceNumber}</div>
                    </td>
                    <td className="px-4 py-2 border border-gray-200 text-center">
                      <div className="font-semibold">Invoice Date:</div>
                      <div>{invoiceDate}</div>
                    </td>
                    <td className="px-4 py-2 border border-gray-200 text-center">
                      <div className="font-semibold">Challan No.:</div>
                      <div>{invoiceData.challanNo || '-'}</div>
                    </td>
                    <td className="px-4 py-2 border border-gray-200 text-center">
                      <div className="font-semibold">Challan Date:</div>
                      <div>{invoiceData.challanDate || '-'}</div>
                    </td>
                    <td className="px-4 py-2 border border-gray-200 text-center">
                      <div className="font-semibold">P.O. No.:</div>
                      <div>{invoiceData.poNo || '-'}</div>
                    </td>
                    <td className="px-4 py-2 border border-gray-200 text-center">
                      <div className="font-semibold">E-Way No.:</div>
                      <div>{invoiceData.eWayNo || '-'}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Table Section */}
            {renderItemsTable(pageItems, pageIndex + 2)}
            {pageIndex === additionalPages.length - 1 && renderFooterContent()}

            {/* Page Footer */}
            <div className="text-center text-sm text-gray-500 mt-6 pt-4 border-t border-gray-200 px-8">
              Invoice No: {invoiceNumber} | Invoice Date: {invoiceDate} | Page {pageIndex + 2} of {additionalPages.length + 1}
            </div>
          </div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex flex-col text-xs">
          <span><b>Invoice No.:</b> {invoiceNumber}</span>
          <span><b>Invoice Date:</b> {invoiceDate}</span>
          <span><b>Challan No.:</b> {invoiceData.challanNo || '-'}</span>
          <span><b>Challan Date:</b> {invoiceData.challanDate || '-'}</span>
          <span><b>P.O. No.:</b> {invoiceData.poNo || '-'}</span>
          <span><b>E-Way No.:</b> {invoiceData.eWayNo || '-'}</span>
        </div>
      </div>
    </div>
  );
};

export default InvoiceClassic;