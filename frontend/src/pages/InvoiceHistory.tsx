"use client";

import React, { useEffect, useState, useMemo, useCallback, useTransition, Suspense } from "react";
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
  Search,
  Trash2,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import ModernInvoiceTemplate from "@/components/invoice-templates/template-Modern";
import PremiumMinimalInvoice from "@/components/invoice-templates/template-minimal";
import { formatCurrency } from "@/lib/formatCurrency";
import { format, parseISO } from "date-fns";
import InvoiceClassic from "@/components/invoice-templates/template-classic";
import QRCode from 'qrcode';

// React Query hooks
import {
  useInvoices,
  useDeleteInvoice,
  type Invoice
} from "@/hooks/useApi";

// Lazy load PDF components only when needed
const ModernInvoicePDFWrapper = React.lazy(() => import("@/components/invoice-templates/ModernInvoicePDF"));
const MinimalInvoicePDFWrapper = React.lazy(() => import("@/components/invoice-templates/MinimalInvoicePDF"));
const ClassicInvoicePDFWrapper = React.lazy(() => import("@/components/invoice-templates/ClassicInviocePDF"));

// PDF Download Button - Automated single-click download
const PDFDownloadButton = React.memo(({ invoice }: { invoice: Invoice }) => {
  const [shouldLoadPDF, setShouldLoadPDF] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadTriggered, setDownloadTriggered] = useState(false);

  const handleClick = useCallback(() => {
    if (!shouldLoadPDF) {
      setIsLoading(true);
      setShouldLoadPDF(true);
    }
  }, [shouldLoadPDF]);

  // Auto-trigger download when PDF component is loaded
  useEffect(() => {
    if (shouldLoadPDF && isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        // Automatically trigger download after a short delay to ensure PDF is ready
        setTimeout(() => {
          setDownloadTriggered(true);
        }, 200);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [shouldLoadPDF, isLoading]);

  return (
    <div className="flex items-center justify-center w-12">
      {shouldLoadPDF && !isLoading ? (
        <Suspense fallback={
          <Button variant="ghost" size="icon" disabled title="Loading PDF...">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
            <span className="sr-only">Loading PDF</span>
          </Button>
        }>
          {invoice.template === "modern" && (
            <ModernInvoicePDFWrapper
              invoiceData={invoice}
              qrCode={invoice.qrCode}
              autoDownload={downloadTriggered}
            />
          )}
          {invoice.template === "minimal" && (
            <MinimalInvoicePDFWrapper
              invoiceData={invoice}
              qrCode={invoice.qrCode}
              autoDownload={downloadTriggered}
            />
          )}
          {invoice.template === "classic" && (
            <ClassicInvoicePDFWrapper
              invoiceData={invoice}
              qrCode={invoice.qrCode}
              autoDownload={downloadTriggered}
            />
          )}
        </Suspense>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClick}
          disabled={isLoading}
          title="Download PDF"
        >
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          <span className="sr-only">Download PDF</span>
        </Button>
      )}
    </div>
  );
});

PDFDownloadButton.displayName = 'PDFDownloadButton';

// Search utilities
const normalizeText = (text: string | undefined | null): string => {
  return String(text ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .trim();
};

// Optimized search with pre-computed searchable text including date
const searchInvoices = (invoices: Invoice[], query: string): Invoice[] => {
  if (!query.trim()) return invoices;

  const normalizedQuery = normalizeText(query);
  const queryTerms = normalizedQuery.split(/\s+/).filter(Boolean);

  return invoices.filter(invoice => {
    // Direct field searches for better performance
    const searchableFields = [
      invoice.invoiceNumber,
      invoice.customerBillTo?.name,
      invoice.customerBillTo?.address,
      invoice.customerBillTo?.gstNumber,
      invoice.customerBillTo?.panNumber,
      invoice.customerShipTo?.name,
      invoice.customerShipTo?.address,
      invoice.customerShipTo?.gstNumber,
      invoice.customerShipTo?.panNumber,
      invoice.total?.toString(),
      // Add date in searchable format
      format(parseISO(invoice.createdAt), "MMM d, yyyy"),
      format(parseISO(invoice.createdAt), "yyyy-MM-dd"),
      format(parseISO(invoice.createdAt), "dd/MM/yyyy"),
    ].filter(Boolean);

    const searchableText = searchableFields
      .map(normalizeText)
      .join(" ");

    return queryTerms.every(term => searchableText.includes(term));
  });
};



// Memoized invoice row component for better performance
const InvoiceRow = React.memo(({ invoice, onPreview, onDelete }: {
  invoice: Invoice;
  onPreview: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
}) => (
  <TableRow>
    <TableCell className="font-medium">
      {invoice.invoiceNumber}
    </TableCell>
    <TableCell>
      {format(parseISO(invoice.createdAt), "MMM d, yyyy")}
    </TableCell>
    <TableCell>
      <div>
        <div className="font-medium">
          {invoice.customerBillTo.name}
        </div>
        <div className="text-sm text-muted-foreground">
          {/* {invoice.customerBillTo.address} */}
        </div>
      </div>
    </TableCell>
    <TableCell className="text-left font-medium">
      ₹{formatCurrency(invoice.total)}
    </TableCell>
    <TableCell>
      <div className="flex justify-center items-center gap-2 ">
        <PDFDownloadButton invoice={invoice} />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPreview(invoice)}
          title="Preview Invoice"
        >
          <Eye className="h-4 w-4" />
          <span className="sr-only">Preview</span>
        </Button>
      </div>
    </TableCell>
    <TableCell className="text-right">
      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          title="Delete Invoice"
          onClick={() => onDelete(invoice)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>
    </TableCell>
  </TableRow>
));

InvoiceRow.displayName = 'InvoiceRow';

export default function BillingHistoryPage() {
  // React Query hooks
  const { data: invoices = [], isLoading, error } = useInvoices();
  const deleteInvoiceMutation = useDeleteInvoice();

  // Transition hook for handling lazy component loading
  const [isPending, startTransition] = useTransition();

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState(""); // The actual search being applied
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [qrCodePreview, setQRCodePreview] = useState<string>('');

  const itemsPerPage = 10;

  // Optimized filtered invoices with better memoization
  const filteredInvoices = useMemo(() => {
    // Early return for empty search
    if (!activeSearchQuery.trim()) {
      return invoices;
    }

    // Use more efficient search
    return searchInvoices(invoices, activeSearchQuery);
  }, [invoices, activeSearchQuery]);

  // Optimized pagination with early bounds checking
  const { totalPages, paginatedInvoices } = useMemo(() => {
    const totalCount = filteredInvoices.length;
    const total = Math.ceil(totalCount / itemsPerPage);

    // Avoid unnecessary slicing if no results
    if (totalCount === 0) {
      return { totalPages: 0, paginatedInvoices: [] };
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalCount);
    const paginated = filteredInvoices.slice(startIndex, endIndex);

    return { totalPages: total, paginatedInvoices: paginated };
  }, [filteredInvoices, currentPage, itemsPerPage]);

  // Handle search execution
  const handleSearch = useCallback(() => {
    startTransition(() => {
      setActiveSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to first page when search changes
    });
  }, [searchQuery]);

  // Handle search input change
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  // Handle Enter key press in search input
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  // Clear search
  const handleClearSearch = useCallback(() => {
    startTransition(() => {
      setSearchQuery("");
      setActiveSearchQuery("");
      setCurrentPage(1);
    });
  }, []);

  // Auto-reset page if current page is out of bounds
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  // Preview invoice
  const previewInvoice = useCallback((invoice: Invoice) => {
    setSelectedInvoice(invoice);

    QRCode.toDataURL(`${import.meta.env.VITE_FRONTEND_URL}/invoice/${invoice.id}`, { width: 120 }, (err: any, url: string) => {
      setQRCodePreview(url);
      console.log(url)
    });
    setIsPreviewOpen(true);
  }, []);

  // Delete invoice handlers
  const handleDeleteClick = useCallback((invoice: Invoice) => {
    setInvoiceToDelete(invoice);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteInvoice = async () => {
    if (!invoiceToDelete) return;
    try {
      await deleteInvoiceMutation.mutateAsync(invoiceToDelete.id);
      setDeleteDialogOpen(false);
      setInvoiceToDelete(null);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  // Handle loading and error states
  if (isLoading) {
    return (
      <div className="flex-1 p-4 z-0 pt-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-serif font-bold tracking-tight">Billing History</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex gap-2">
              <div className="relative">
                <div className="h-10 w-[300px] bg-gray-200 animate-pulse rounded-md"></div>
              </div>
              <div className="h-10 w-20 bg-gray-200 animate-pulse rounded-md"></div>
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
                    <TableHead className="text-left">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    <TableHead className="text-right">Delete</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div></TableCell>
                      <TableCell><div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div></TableCell>
                      <TableCell><div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div></TableCell>
                      <TableCell><div className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div></TableCell>
                      <TableCell><div className="h-8 w-16 bg-gray-200 animate-pulse rounded ml-auto"></div></TableCell>
                      <TableCell><div className="h-8 w-8 bg-gray-200 animate-pulse rounded ml-auto"></div></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 pt-6 md:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-lg text-red-600 mb-4">Error loading invoice history</p>
            <p className="text-sm text-gray-600">
              {error?.message || "Unknown error occurred"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 z-0 pt-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-serif font-bold tracking-tight">Billing History</h2>
          {activeSearchQuery && (
            <p className="text-sm text-muted-foreground mt-1">
              Showing {filteredInvoices.length} result{filteredInvoices.length !== 1 ? 's' : ''} for "{activeSearchQuery}"
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by invoice #, customer, amount, date..."
                className="pl-8 w-full sm:w-[250px] md:w-[300px]"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <Button
              onClick={handleSearch}
              variant="default"
              size="default"
              className="whitespace-nowrap"
              disabled={isPending}
            >
              <Search className="h-4 w-4 mr-2" />
              {isPending ? "Searching..." : "Search"}
            </Button>
            {activeSearchQuery && (
              <Button
                onClick={handleClearSearch}
                variant="outline"
                size="default"
                className="whitespace-nowrap"
                disabled={isPending}
              >
                Clear
              </Button>
            )}
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
                  <TableHead className="text-left">Amount</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                  <TableHead className="text-right">Delete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedInvoices.length > 0 ? (
                  paginatedInvoices.map((invoice, index) => (
                    <InvoiceRow
                      key={invoice.id || index}
                      invoice={invoice}
                      onPreview={previewInvoice}
                      onDelete={handleDeleteClick}
                    />
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
                onClick={() => startTransition(() => setCurrentPage((prev) => Math.max(prev - 1, 1)))}
                disabled={currentPage === 1 || isPending}
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
                  startTransition(() => setCurrentPage((prev) => Math.min(prev + 1, totalPages)))
                }
                disabled={currentPage === totalPages || isPending}
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
          className="
            dialog-top-align
            z-[1000]
            w-full
            min-h-[30vh] sm:min-h-[400px]
            max-h-[80vh] sm:max-h-[900px]
            md:max-h-[700px]
            md:max-w-[700px]
            lg:max-h-[700px]
            lg:max-w-[900px]
            overflow-y-auto
            sm:min-w-[600px] sm:max-w-[1000px]
          "
        >
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
            <DialogDescription>
              {selectedInvoice?.invoiceNumber} - {selectedInvoice?.customerBillTo.name}
            </DialogDescription>
          </DialogHeader>
          <div className="dark:bg-neutral-900 overflow-y-auto w-full max-w-full min-h-[60vh] sm:min-h-[400px] rounded-md shadow-sm">
            {selectedInvoice?.template === "modern" &&
              <ModernInvoiceTemplate
                invoiceData={selectedInvoice}
              />

            }
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





