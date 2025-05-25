import React, { useRef, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { formatCurrency } from '@/lib/formatCurrency';
import QRCode from "react-qr-code"
import { Printer, QrCode } from 'lucide-react';
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
  const { customerBillTo, customerShipTo, invoiceNumber, invoiceDate, items, companyDetails } = invoiceData;
  const contentRef = useRef<HTMLDivElement>(null);
  const url = window.location.href;
  const [loading, setLoading] = useState(false);



  console.log(invoiceData)
  const handlePrint = useReactToPrint({
    contentRef: contentRef,
    documentTitle: `Invoice ${invoiceNumber}`,


  });
  const getPageMargins = () => {
    return `@page { margin: ${0.79} ${0.79} ${0.79} ${0.79} !important; }`;
  };

  console.log(items.map((item) => item.hsnCode))

  return (
    <div id="modern-invoice" className="w-[794px] min-h-[1123px] mx-auto flex flex-col items-center">
      {/* Header Bar */}
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
     
      {/* Main Content Card */}
      <div ref={contentRef} id="printable-content" className={`w-[794px] min-h-[1123px] bg-white rounded-b-lg my-5  px-8 pb-8 flex flex-col gap-8 ${getPageMargins()}`}>
        <div className="w-full rounded-t-lg bg-white border-b border-gray-300 px-0 py-6 flex flex-row justify-between items-center">
          <div className="flex flex-col items-start">
            <img src={"/logo.png"} alt="logo" className="w-24 h-24  rounded-[1000px]  overflow-hidden " />
            <h1 className="text-2xl font-bold text-gray-900 tracking-wide">{companyDetails.name}</h1>
            <p className="text-gray-700 text-sm">{companyDetails.phone}</p>
            <p className="text-gray-700 text-sm">{companyDetails.email}</p>
            <span className="text-gray-600 text-sm mt-1 text-left  max-w-[400px]">{companyDetails.address}, {companyDetails.cityState}</span>
          </div>
          <div className="flex flex-col items-end">
            <QRCode value={`${import.meta.env.VITE_FRONTEND_URL}/invoice/${invoiceData.id}`} size={64} />
            {/* <span className="text-lg font-semibold text-gray-900 tracking-widest">INVOICE</span> */}
            <span className="text-gray-600 text-xs mt-1">Invoice #: {invoiceNumber}</span>
            <span className="text-gray-600 text-xs">Date: {invoiceDate}</span>
          </div>
        </div>
        {/* Bill To & Company Details */}
        <div className="flex  justify-between gap-8">
          <div className="bg-gray-50 grid grid-cols-2 grid-rows-1 gap-4 rounded-lg p-4 flex-1 min-w-[220px] border border-gray-200">
           {
            customerBillTo.name && customerBillTo.address && (
                <div className=''>
                  <h3 className="text-base font-semibold text-gray-800 mb-2 ">Bill To :</h3>
                  <p className="font-medium text-gray-900">{customerBillTo.name}</p>
                  <p className="text-gray-700 text-sm">{customerBillTo.address}</p>
                  {/* <p className="text-gray-700 text-sm">{customerBillTo.email}</p> */}
                  {customerBillTo.gstNumber && (
                    <p className="text-gray-700 text-sm">GSTIN: {customerBillTo.gstNumber}</p>
                  )}
                  {customerBillTo.panNumber && (
                    <p className="text-gray-700 text-sm">PAN: {customerBillTo.panNumber}</p>
                  )}
                </div>
            )
           }
            {/* <div className='h-[1px] bg-gray-700 w-full'></div> */}
            {
              customerShipTo.name && customerShipTo.address && (
                  <div className=''>
                  <h3 className="text-base font-semibold text-gray-800 mb-2">Ship To :</h3>
                  <p className="font-medium text-gray-900">{customerShipTo.name}</p>
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
          {/* <div className="bg-gray-50 rounded-lg p-4 flex-1 min-w-[220px] border border-gray-200">
            <h3 className="text-base font-semibold text-gray-800 mb-2">Company Info</h3>

          </div> */}
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






