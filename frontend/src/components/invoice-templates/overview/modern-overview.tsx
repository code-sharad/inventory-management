// Professional Monochrome (Black & White) Invoice Overview Template
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { formatCurrency } from '@/lib/formatCurrency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import axiosInstance from '@/api';
import { useUser } from '@/contexts/UserContext';
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
        hsnCode?: string;
    }[];
    subtotal: number;
    gstAmount: number;
    gstRate: number;
    total: number;
    template: 'modern' | 'minimal' | 'classic';
    transportationAndOthers?: number;
    packaging?: number;
}

const ModernOverview: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [invoice, setInvoice] = useState<InvoiceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInvoice = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axiosInstance.get(`/invoice-view/${id}`);

                if (response.status !== 200) throw new Error('Invoice not found');
                const data = response.data;
                setInvoice({ ...data, id: data._id });
            } catch (err: any) {
                setError(err.message || 'Failed to load invoice');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchInvoice();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <span className="text-lg text-gray-700 font-semibold">Loading invoice summary...</span>
            </div>
        );
    }

    if (error || !invoice) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <span className="text-lg text-red-700 font-semibold">{error || 'Invoice not found.'}</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-white py-8 px-2">
            <Card className="w-full max-w-4xl shadow-xl border border-gray-200 p-0 bg-white">
                <CardHeader className="bg-black rounded-t-lg p-6">
                    <CardTitle className="text-white text-2xl font-bold tracking-wide flex flex-col gap-1">
                        <span>{invoice.companyDetails.name}</span>
                        <span className="text-gray-300 text-sm font-normal">{invoice.companyDetails.address}, {invoice.companyDetails.cityState}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col gap-6">
                    <div className="flex flex-col sm:flex-row justify-between gap-6">
                        <div>
                            <div className="text-black font-semibold mb-1 uppercase tracking-wide text-xs">Bill To</div>
                            <div className="font-medium text-gray-900">{invoice.customer.name}</div>
                            <div className="text-gray-700 text-sm">{invoice.customer.address}</div>
                            <div className="text-gray-700 text-sm">{invoice.customer.email}</div>
                        </div>
                        <div>
                            <div className="text-black font-semibold mb-1 uppercase tracking-wide text-xs">Invoice Info</div>
                            <div className="text-gray-900 font-medium">Invoice #: {invoice.invoiceNumber}</div>
                            <div className="text-gray-700 text-sm">Date: {invoice.invoiceDate}</div>
                        </div>
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                        <Table className="min-w-full">
                            <TableHeader>
                                <TableRow className="bg-gray-100">
                                    <TableHead className="p-3 text-black font-semibold">Item</TableHead>
                                    <TableHead className="p-3 text-black font-semibold">HSN Code</TableHead>
                                    <TableHead className="p-3 text-black font-semibold">Qty</TableHead>
                                    <TableHead className="p-3 text-black font-semibold">Unit Price</TableHead>
                                    <TableHead className="p-3 text-black font-semibold">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoice.items.map((item) => (
                                    <TableRow key={item.id} className="hover:bg-gray-50">
                                        <TableCell className="p-3 font-medium text-gray-900">{item.name}</TableCell>
                                        <TableCell className="p-3 text-gray-800">{item.hsnCode || '-'}</TableCell>
                                        <TableCell className="p-3 text-gray-800">{item.quantity}</TableCell>
                                        <TableCell className="p-3 text-gray-800">₹{formatCurrency(item.price)}</TableCell>
                                        <TableCell className="p-3 text-gray-900 font-semibold">₹{formatCurrency(item.price * item.quantity)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="flex flex-col items-end gap-1 mt-2">
                        <div className="flex justify-between w-full max-w-xs text-gray-700 text-base">
                            <span>Subtotal</span>
                            <span>₹{formatCurrency(invoice.subtotal)}</span>
                        </div>
                        {invoice.transportationAndOthers !== undefined && (
                            <div className="flex justify-between text-gray-700 text-base">
                                <span>Transportation & Others</span>
                                <span>₹{formatCurrency(invoice.transportationAndOthers)}</span>
                            </div>
                        )}
                        {invoice.packaging !== undefined && (
                            <div className="flex justify-between text-gray-700 text-base">
                                <span>Packaging</span>
                                <span>₹{formatCurrency(invoice.packaging)}</span>
                            </div>
                        )}
                        <div className="flex justify-between w-full max-w-xs text-gray-700 text-base">
                            <span>GST ({invoice.gstRate}%)</span>
                            <span>₹{formatCurrency(invoice.gstAmount)}</span>
                        </div>
                        <div className="flex justify-between w-full max-w-xs text-blue-900 text-lg font-bold mt-2 border-t pt-2">
                            <span>Total</span>
                            <span>₹{formatCurrency(invoice.total)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ModernOverview;
