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
  Eye,
  Search,
  Trash2,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import ModernInvoiceTemplate from "@/components/invoice-templates/template-Modern";
import PremiumMinimalInvoice from "@/components/invoice-templates/template-minimal";
import { formatCurrency } from "@/lib/formatCurrency";
import { format, parseISO } from "date-fns";
import axiosInstance from "@/api";
import { toast } from "sonner";
import InvoiceClassic from "@/components/invoice-templates/template-classic";
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
    hsnCode: string;
  }[];
  subtotal: number;
  gstAmount: number;
  gstRate: number;
  total: number;
  template: "modern" | "minimal" | "classic";
};

function normalize(str: string | undefined | null) {
  return (str ?? "")
    .toLowerCase()
    .normalize("NFD") // Remove accents/diacritics
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9]+/g, " ") // Replace non-alphanumerics with space
    .trim();
}

function tokenize(str: string | undefined | null) {
  return normalize(str).split(/\s+/).filter(Boolean);
}

function matchesSearchFields(fields: (string | undefined | null)[], query: string) {
  if (!query) return true;
  const queryTokens = tokenize(query);

  // For each field, tokenize and check if all query tokens are present in any field tokens
  return fields.some(field => {
    const fieldTokens = tokenize(field);
    // For each query token, check if it matches the start of any field token
    return queryTokens.every(qt =>
      fieldTokens.some(ft => ft.startsWith(qt))
    );
  });
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
  // @ts-ignore
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);



  useEffect(() => {
    // Fetch invoices from the server
    const fetchInvoices = async () => {
      try {
        const response = await axiosInstance.get(`/invoice`);

        if (response.status !== 200) {
          throw new Error("Failed to fetch invoices");
        }
        const data = response.data;
        const invoicesWithIds = data.map((invoice: any) => ({
          ...invoice,
          id: invoice._id
        }));
        const invoiceRemove_id = invoicesWithIds.filter((invoice: any) => delete invoice._id);

        const sortedInvoices = invoiceRemove_id.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setInvoices(sortedInvoices);
        console.log(sortedInvoices)
      } catch (error) {
        console.error("Error fetching invoices:", error);
      }
    };

    fetchInvoices();
  }, [])

  const filteredInvoices = invoices.filter(invoice =>
    matchesSearchFields(
      [
        invoice.invoiceNumber,
        invoice.customer.name,
        invoice.customer.email
      ],
      searchQuery
    )
  );
  console.log(filteredInvoices)



  // Pagination
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );



  // Preview invoice
  const previewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsPreviewOpen(true);
  };

  // Delete invoice
  const handleDeleteInvoice = async () => {
    if (!invoiceToDelete) return;
    try {
      const response = await axiosInstance.delete(`/invoice/${invoiceToDelete.id}`);
      if (response.status !== 200) {
        throw new Error("Failed to delete invoice");
      }
      setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceToDelete.id));

      setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceToDelete.id));
      setDeleteDialogOpen(false);
      setInvoiceToDelete(null);
      toast.success("Invoice deleted successfully");
    } catch (error) {
      toast.error("Error deleting invoice");
      setDeleteDialogOpen(false);
      setInvoiceToDelete(null);
    }
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

      <Card className="border-none shadow-none p-0">
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
                {paginatedInvoices.length > 0 ? (
                  paginatedInvoices.map((invoice, index) => (
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
                        ₹{formatCurrency(invoice.total)}
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
                            title="Delete Invoice"
                            onClick={() => {
                              setInvoiceToDelete(invoice);
                              setDeleteDialogOpen(true);
                              handleDeleteInvoice();
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Delete</span>
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
        <DialogContent
          className="w-full max-w-[95vw] sm:min-w-[600px] sm:max-w-[1000px] mt-4 sm:mt-20 max-h-[90vh] sm:max-h-[900px] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
            <DialogDescription>
              {selectedInvoice?.invoiceNumber} - {selectedInvoice?.customer.name}
            </DialogDescription>
          </DialogHeader>
          <div className="bg-white overflow-y-auto w-full max-w-full min-h-[60vh] sm:min-h-[400px] rounded-md shadow-sm">
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
            {selectedInvoice?.template === "classic" && (
              <InvoiceClassic
                invoiceData={selectedInvoice}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Invoice</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete invoice <b>{invoiceToDelete?.invoiceNumber}</b>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteInvoice}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}





