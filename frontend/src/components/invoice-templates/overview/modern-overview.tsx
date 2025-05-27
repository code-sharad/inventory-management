// Professional Monochrome (Black & White) Invoice Overview Template
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { formatCurrency } from '@/lib/formatCurrency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import axiosInstance from '@/api';

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
                const response = await axiosInstance.get(`/invoice/${id}`);

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
                <CardHeader className="bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-t-lg p-8 shadow-lg">
                    <CardTitle className="text-white flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-md overflow-hidden">
                                <img src='/public/logo.png' alt="Company Logo" className="w-16 h-16 object-contain" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold tracking-wide">{invoice.companyDetails.name}</span>
                                <span className="text-gray-200 text-sm mt-1 max-w-md">{invoice.companyDetails.address}, {invoice.companyDetails.cityState}</span>
                            </div>
                        </div>
                        <div className='flex flex-col items-end'>
                            <div className="text-gray-200 uppercase tracking-wide text-xs mb-2">Invoice Details</div>
                            <div className="text-xl font-semibold">#{invoice.invoiceNumber}</div>
                            <div className="text-gray-200 text-sm mt-1">Issued: {invoice.invoiceDate}</div>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col gap-6">
                    <div className="flex justify-between space-x-8">
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-gray-500 mb-2">Bill To</h3>
                            <p className="text-gray-800">{invoice.customerBillTo.name}</p>
                            <p className="text-sm text-gray-600">{invoice.customerBillTo.address}</p>
                            {invoice.customerBillTo.gstNumber && <p className="text-sm text-gray-600">GSTIN: {invoice.customerBillTo.gstNumber}</p>}
                            {invoice.customerBillTo.panNumber && <p className="text-sm text-gray-600">PAN: {invoice.customerBillTo.panNumber}</p>}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-gray-500 mb-2">Ship To</h3>
                            <p className="text-gray-800">{invoice.customerShipTo.name}</p>
                            <p className="text-sm text-gray-600">{invoice.customerShipTo.address}</p>
                            {invoice.customerShipTo.gstNumber && <p className="text-sm text-gray-600">GSTIN: {invoice.customerShipTo.gstNumber}</p>}
                            {invoice.customerShipTo.panNumber && <p className="text-sm text-gray-600">PAN: {invoice.customerShipTo.panNumber}</p>}
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
                            <div className="flex justify-between w-full max-w-xs text-gray-700 text-base">
                                <span>Transportation & Others</span>
                                <span>₹{formatCurrency(invoice.transportationAndOthers)}</span>
                            </div>
                        )}
                        {invoice.packaging !== undefined && (
                            <div className="flex justify-between w-full max-w-xs text-gray-700 text-base">
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
