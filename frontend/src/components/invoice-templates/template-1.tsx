// import React, { useRef } from "react";
// import { jsPDF } from "jspdf";
// import html2canvas from "html2canvas-pro";
// import { Download } from "lucide-react";

// interface InvoiceItem {
//   id: string;
//   name: string;
//   quantity: number;
//   price: number;
//   category: string;
// }

// interface InvoiceData {
//   customerName: string;
//   customerEmail: string;
//   customerAddress: string;
//   invoiceNumber: string;
//   invoiceDate: string;
//   items: InvoiceItem[];
//   companyDetails: {
//     name: string;
//     address: string;
//     cityState: string;
//     phone: string;
//     email: string;
//   };
// }

// interface InvoiceTemplateProps {
//   invoiceData: InvoiceData;
// }

// const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ invoiceData }) => {
//   const invoiceRef = useRef(null);

//   // Calculate Totals
//   const calculateSubtotal = () => {
//     return invoiceData.items.reduce(
//       (sum, item) => sum + item.price * item.quantity,
//       0
//     );
//   };

//   const calculateTax = () => {
//     const taxRate = 0.08; // 8% tax rate
//     return calculateSubtotal() * taxRate;
//   };

//   const calculateTotal = () => {
//     return calculateSubtotal() + calculateTax();
//   };

//   // PDF Download Function
//   const downloadPDF = async () => {
//     const input = invoiceRef.current;
//     if (!input) {
//       console.error("Invoice reference is null");
//       return;
//     }

//     try {
//       const canvas = await html2canvas(input, {
//         scale: 2,
//         useCORS: true,
//       });
//       const imgData = canvas.toDataURL("image/png");
//       const pdf = new jsPDF("p", "mm", "a4", true);
//       const imgProps = pdf.getImageProperties(imgData);
//       const pdfWidth = pdf.internal.pageSize.getWidth();
//       const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
//       const pageHeight = pdf.internal.pageSize.getHeight();

//       // Add the image to the PDF with proper pagination
//       let heightLeft = pdfHeight;
//       let position = 0;
//       let page = 1;

//       // First page
//       pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
//       heightLeft -= pageHeight;

//       // Add additional pages as needed
//       while (heightLeft > 0) {
//         position = -pageHeight * page;
//         pdf.addPage();
//         pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
//         heightLeft -= pageHeight;
//         page++;
//       }

//       pdf.save("Invoice.pdf");
//     } catch (error) {
//       console.error("PDF generation error:", error);
//       alert("Failed to generate PDF. Please try again.");
//     }
//   };

//   return (
//     <div className="bg-white p-8 max-w-4xl mx-auto">
//       {/* Action Buttons */}
//       <div className="flex justify-end space-x-4 mb-6">


//         <button
//           onClick={downloadPDF}
//           className="flex items-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
//         >
//           <Download className="mr-2" size={16} /> Download PDF
//         </button>
//       </div>

//       {/* Invoice Container */}
//       <div
//         ref={invoiceRef}
//         className="border border-gray-300 p-8 relative w-[210mm] h-[297mm] mx-auto flex flex-col"
//       >
//         {/* Header Section */}
//         <div className="flex justify-between items-start mb-8">
//           {/* Company Logo & Details */}
//           <div>
//             <h1 className="text-2xl font-bold mb-4">
//               {invoiceData.companyDetails.name}
//             </h1>
//             <div className="text-sm text-gray-700">
//               <p>{invoiceData.companyDetails.address}</p>
//               <p>{invoiceData.companyDetails.cityState}</p>
//               <p>Phone: {invoiceData.companyDetails.phone}</p>
//               <p>Email: {invoiceData.companyDetails.email}</p>
//             </div>
//           </div>

//           {/* Invoice Details */}
//           <div className="text-right">
//             <h1 className="text-3xl font-bold text-gray-800 mb-4">INVOICE</h1>
//             <div className="text-sm text-gray-600">
//               <p>
//                 <strong>Invoice Number:</strong> {invoiceData.invoiceNumber}
//               </p>
//               <p>
//                 <strong>Invoice Date:</strong> {invoiceData.invoiceDate}
//               </p>
//               <p>
//                 <strong>Due Date:</strong>{" "}
//                 {new Date(
//                   new Date(invoiceData.invoiceDate).setDate(
//                     new Date(invoiceData.invoiceDate).getDate() + 30
//                   )
//                 ).toLocaleDateString()}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Bill To Section */}
//         <div className="mb-8 border-t border-b border-gray-200 py-4">
//           <h2 className="text-lg font-semibold mb-2">Bill To:</h2>
//           <div className="text-sm text-gray-700">
//             <p>{invoiceData.customerName}</p>
//             <p>{invoiceData.customerAddress}</p>
//             <p>Email: {invoiceData.customerEmail}</p>
//           </div>
//         </div>

//         {/* Line Items Table */}
//         <div className="flex-grow overflow-auto">
//           <table className="w-full text-sm">
//             <thead>
//               <tr className="bg-gray-100">
//                 <th className="border p-2 text-left">Name</th>
//                 <th className="border p-2 text-right">Category</th>
//                 <th className="border p-2 text-right">Quantity</th>
//                 <th className="border p-2 text-right">Rate</th>
//                 <th className="border p-2 text-right">Total</th>
//               </tr>
//             </thead>
//             <tbody>
//               {invoiceData.items.map((item) => (
//                 <tr key={item.id}>
//                   <td className="border p-2">{item.name}</td>
//                   <td className="border p-2 text-right">{item.category}</td>
//                   <td className="border p-2 text-right">{item.quantity}</td>
//                   <td className="border p-2 text-right">
//                     ₹{item.price.toFixed(2)}
//                   </td>
//                   <td className="border p-2 text-right">
//                     ₹{(item.price * item.quantity).toFixed(2)}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Totals Section */}
//         <div className="mt-auto pt-8 border-t">
//           <div className="flex justify-end">
//             <div className="w-64">
//               <div className="flex justify-between border-b py-2">
//                 <span>Subtotal</span>
//                 <span>₹{calculateSubtotal().toFixed(2)}</span>
//               </div>
//               <div className="flex justify-between border-b py-2">
//                 <span>Tax (8%)</span>
//                 <span>₹{calculateTax().toFixed(2)}</span>
//               </div>
//               <div className="flex justify-between font-bold text-lg py-2">
//                 <span>Total</span>
//                 <span>₹{calculateTotal().toFixed(2)}</span>
//               </div>
//             </div>
//           </div>
//         </div>

       
//       </div>
//     </div>
//   );
// };

// export default InvoiceTemplate;














import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

  const handleDownloadPDF = () => {
    const input = document.getElementById('classic-invoice');
    if (input) {
      html2canvas(input).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const width = pdf.internal.pageSize.getWidth();
        const height = (canvas.height * width) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, width, height);
        pdf.save(`invoice_${invoiceNumber}.pdf`);
      });
    }
  };

  return (
    <div id="classic-invoice" className="p-6 bg-white shadow-md rounded-lg max-w-3xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">{companyDetails.name}</h1>
        <p className="text-gray-600">{companyDetails.address}</p>
        <p className="text-gray-600">{companyDetails.cityState}</p>
      </div>
      <div className="flex justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Bill To:</h3>
          <p><strong>Name:</strong> {customerName}</p>
          <p><strong>Email:</strong> {customerEmail}</p>
          <p><strong>Address:</strong> {customerAddress}</p>
        </div>
        <div>
          <p><strong>Invoice #:</strong> {invoiceNumber}</p>
          <p><strong>Date:</strong> {invoiceDate}</p>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="p-2">Item</TableHead>
            <TableHead className="p-2">Category</TableHead>
            <TableHead className="p-2">Qty</TableHead>
            <TableHead className="p-2">Price</TableHead>
            <TableHead className="p-2">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={index}>
              <TableCell className="p-2">{item.name}</TableCell>
              <TableCell className="p-2">
                <Badge className="bg-gray-100 text-gray-800">{item.category || "Uncategorized"}</Badge>
              </TableCell>
              <TableCell className="p-2">{item.quantity}</TableCell>
              <TableCell className="p-2">₹{item.price.toFixed(2)}</TableCell>
              <TableCell className="p-2">₹{(item.price * item.quantity).toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-6 text-right">
        <p className="text-md"><strong>Subtotal:</strong> ₹{subtotal.toFixed(2)}</p>
        <p className="text-md"><strong>GST (18%):</strong> ₹{gstAmount.toFixed(2)}</p>
        <p className="text-lg font-bold"><strong>Total:</strong> ₹{total.toFixed(2)}</p>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={handleDownloadPDF}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default InvoiceTemplate;