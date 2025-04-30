"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileDown,
  Search,
} from "lucide-react";

import { format, parseISO } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ModernInvoiceTemplate from "@/components/invoice-templates/template-Modern";
import PremiumMinimalInvoice from "@/components/invoice-templates/template-minimal";

// Define invoice type
type Invoice = {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  invoiceDate: string;
  customer: {
    name: string;
    email: string;
    address: string;
  };
  companyDetails:{
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

interface InvoiceData {
  customer: {
    name: string;
    email: string;
    address: string;
  },
  subtotal: number;
  gstAmount: number;
  total: number;
  gstRate: number;
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



export default function BillingHistoryPage() {
  // @ts-ignore
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  // @ts-ignore
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  // @ts-ignore
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    // Fetch invoices from the server
    const fetchInvoices = async () => {
      try {
        const response = await fetch(`http://localhost:3000/invoice`);
        if (!response.ok) {
          throw new Error("Failed to fetch invoices");
        }
        const data = await response.json();
        setInvoices(data);
        console.log(data)
      } catch (error) {
        console.error("Error fetching invoices:", error);
      }
    };

    fetchInvoices();
  },[])

  const filteredInvoices = invoices.filter((invoice) => {
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      searchQuery === "" ||
      invoice.invoiceNumber.toLowerCase().includes(searchLower) ||
      invoice.customer.name.toLowerCase().includes(searchLower) ||
      invoice.customer.email.toLowerCase().includes(searchLower);

    // Date range filter

    return matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Generate PDF
  const generatePDF = (invoice: Invoice) => {
    // In a real application, this would generate a PDF using a library like jspdf or react-pdf
    alert(`Downloading invoice: ${invoice.invoiceNumber}`);
    // For a real implementation, you would use:
    // 1. Create a PDF document
    // 2. Add the invoice content based on the selected template
    // 3. Save or download the PDF
  };

  // Preview invoice
  const previewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsPreviewOpen(true);
  };

  // Get status badge color

  return (
    <div className="flex-1 p-4 pt-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-3xl font-serif font-bold tracking-tight">Billing History</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search invoices..."
              className="pl-8 w-full sm:w-[250px] md:w-[300px]"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page when search changes
              }}
            />
          </div>
        </div>
      </div>

      <Card className="border-none shadow-none">
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedInvoices.length > 1 ? (
                  paginatedInvoices.map((invoice,index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {invoice.invoiceNumber}
                      </TableCell>
                      <TableCell>
                        {format(parseISO(invoice.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {invoice.customer.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {invoice.customer.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₹{invoice.total}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => previewInvoice(invoice)}
                            title="Preview Invoice"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Preview</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => generatePDF(invoice)}
                            title="Download Invoice"
                          >
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Download</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No invoices found matching your filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        {totalPages > 1 && (
          <CardFooter className="flex items-center justify-between px-6 py-4">
            <div className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium">
                {Math.min(
                  (currentPage - 1) * itemsPerPage + 1,
                  filteredInvoices.length
                )}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, filteredInvoices.length)}
              </span>{" "}
              of <span className="font-medium">{filteredInvoices.length}</span>{" "}
              invoices
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous Page</span>
              </Button>
              <div className="text-sm font-medium">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next Page</span>
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Invoice Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="min-w-[1000px] mt-20 max-h-[900px] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
            <DialogDescription>
              {selectedInvoice?.invoiceNumber} - {selectedInvoice?.customer.name}
            </DialogDescription>
          </DialogHeader>
          <div className="bg-white  overflow-y-auto">
            {selectedInvoice?.template === "modern" && (
              <ModernInvoiceTemplate
                invoiceData={selectedInvoice}
              />
            )}
            {selectedInvoice?.template === "minimal" && (
              <PremiumMinimalInvoice
                invoiceData={selectedInvoice}
              />
            )}
            
            {/* {selectedInvoice?.template === "template2" && (
              <InvoiceTemplate2
                invoiceNumber={selectedInvoice.invoiceNumber}
                invoiceDate={selectedInvoice.date}
                customerName={selectedInvoice.customerName}
                customerEmail={selectedInvoice.customerEmail}
                customerAddress={selectedInvoice.customerAddress}
                items={selectedInvoice.items}
                subtotal={selectedInvoice.subtotal}
                tax={selectedInvoice.tax}
                total={selectedInvoice.total}
              />
            )}
            {selectedInvoice?.template === "template3" && (
              <InvoiceTemplate3
                invoiceNumber={selectedInvoice.invoiceNumber}
                invoiceDate={selectedInvoice.date}
                customerName={selectedInvoice.customerName}
                customerEmail={selectedInvoice.customerEmail}
                customerAddress={selectedInvoice.customerAddress}
                items={selectedInvoice.items}
                subtotal={selectedInvoice.subtotal}
                tax={selectedInvoice.tax}
                total={selectedInvoice.total}
              />
            )} */}
          </div>
          {/* <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Close
            </Button>
            <Button onClick={() => generatePDF(selectedInvoice!)}>
              <FileDown className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div> */}
        </DialogContent>
      </Dialog>
    </div>
  );
}





