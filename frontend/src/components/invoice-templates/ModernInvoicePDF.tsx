import React, { useEffect, useState } from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Font,
    Image,
    usePDF

} from '@react-pdf/renderer';
import { formatCurrency } from '@/lib/formatCurrency';
import Poppins from '../../../public/fonts/Poppins-Regular.ttf';
import { Download } from 'lucide-react';

Font.register({ family: 'Poppins', src: Poppins });

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
    }[];
    subtotal: number;
    gstAmount: number;
    gstRate: number;
    total: number;
    template: "modern" | "minimal" | "classic";
    packaging?: number;
    transportationAndOthers?: number;
};

const styles = StyleSheet.create({
    page: {
        padding: 32,
        paddingTop: 64,
        paddingBottom: 101,
        fontSize: 12,
        fontFamily: 'Poppins',
        backgroundColor: '#fff',
        color: '#000',
    },
    section: {
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
        borderBottomWidth: 2,
        borderBottomColor: '#e0e0e0',
        paddingBottom: 14,
        backgroundColor: '#f5f7fa',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    companyName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1a237e',
        letterSpacing: 0.5,
    },
    companyAddress: {
        fontSize: 11,
        color: '#555',
        marginTop: 4,
        maxWidth: 200,
    },
    invoiceInfoWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    qrCodeBox: {
        width: 64,
        height: 64,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    qrCodeText: {
        fontSize: 8,
        color: '#aaa',
        textAlign: 'center',
    },
    invoiceInfo: {
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    invoiceNumber: {
        fontSize: 11,
        color: '#555',
        marginTop: 2,
    },
    billToSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        gap: 16,
    },
    billTo: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 18,
        flex: 1,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        minHeight: 90,
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
    },
    companyInfo: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 18,
        flex: 1,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        minHeight: 90,
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
    },
    cardTitle: {
        fontWeight: 'bold',
        marginBottom: 6,
        fontSize: 13,
        color: '#1a237e',
        letterSpacing: 0.2,
    },
    cardField: {
        fontSize: 12,
        color: '#222',
        marginBottom: 2,
        fontWeight: 500,
    },
    cardSubField: {
        fontSize: 11,
        color: '#555',
        marginBottom: 2,
    },
    table: {
        width: '100%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        marginBottom: 20,
        flexDirection: 'column',
        borderRadius: 8,
        overflow: 'hidden',
    },
    tableRow: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    tableRowAlt: {
        flexDirection: 'row',
        backgroundColor: '#f7f9fb',
        alignItems: 'center',
    },
    tableHeader: {
        backgroundColor: '#e0e0e0',
        fontWeight: 'bold',
        alignItems: 'center',
        fontSize: 12,
        color: '#1a237e',
        fontFamily: 'Poppins',
        textTransform: 'uppercase',
    },
    tableCell: {
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRightWidth: 1,
        borderRightColor: '#d1d5db',
        borderBottomWidth: 1,
        borderBottomColor: '#d1d5db',
        fontSize: 11,
        fontFamily: 'Poppins',
        color: '#222',
    },
    itemCell: {
        flex: 2,
    },
    hsnCell: {
        flex: 1.2,
    },
    qtyCell: {
        flex: 1,
        textAlign: 'center',
    },
    priceCell: {
        flex: 1.3,
        textAlign: 'right',
    },
    totalCell: {
        flex: 1.5,
        textAlign: 'right',
    },
    lastTableCell: {
        borderRightWidth: 0,
    },
    summary: {
        alignItems: 'flex-end',
        marginTop: 16,
        backgroundColor: '#f5f7fa',
        borderRadius: 8,
        padding: 14,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 12,
        marginBottom: 4,
    },
    summaryLabel: {
        color: '#555',
    },
    summaryValue: {
        color: '#222',
        fontWeight: 'bold',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
        borderTopWidth: 2,
        borderTopColor: '#b0b0b0',
        paddingTop: 8,
        color: '#1a237e',
    },
});

const ModernInvoicePDF: React.FC<{ invoiceData: InvoiceData | null, qrCode: string }> = ({ invoiceData, qrCode }) => {
    if (!invoiceData) return null;
    const { customerBillTo, customerShipTo, invoiceNumber, invoiceDate, items, companyDetails } = invoiceData;

    return (
        <Document>
            <Page size="A4" style={{ ...styles.page, flexDirection: 'column' }}>
                {/* Header */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 24, marginBottom: 16 }}>
                    <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1a237e' }}>{companyDetails.name}</Text>
                        {companyDetails.phone && <Text style={{ fontSize: 11, color: '#555' }}>{companyDetails.phone}</Text>}
                        {companyDetails.email && <Text style={{ fontSize: 11, color: '#555' }}>{companyDetails.email}</Text>}
                        <Text style={{ color: '#555', fontSize: 11, marginTop: 4, maxWidth: 200 }}>{companyDetails.address}, {companyDetails.cityState}</Text>
                    </View>
                    <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <View style={{ marginBottom: 4 }}>{qrCode ? <Image src={qrCode} style={{ width: 64, height: 64 }} /> : <Text style={{ fontSize: 8, color: '#aaa' }}>QR CODE</Text>}</View>
                        <Text style={{ color: '#555', fontSize: 11, marginTop: 2 }}>Invoice #: {invoiceNumber}</Text>
                        <Text style={{ color: '#555', fontSize: 11 }}>Date: {invoiceDate}</Text>
                    </View>
                </View>
                {/* Bill To & Company Info */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
                    <View style={{ backgroundColor: '#fff', borderRadius: 10, padding: 16, flex: 1, marginRight: 8, borderWidth: 1, borderColor: '#e5e7eb', minHeight: 90 }}>
                        <View style={{ flexDirection: 'row', gap: 16 }}>
                            <View style={{ flex: 1, borderRightWidth: 1, borderRightColor: '#e5e7eb', paddingRight: 16 }}>
                                <Text style={{ fontWeight: 'bold', fontSize: 13, color: '#1a237e', marginBottom: 6 }}>Bill To</Text>
                                <Text style={{ fontSize: 12, color: '#222', fontWeight: 500 }}>{customerBillTo.name}</Text>
                                {customerBillTo.address && <Text style={{ fontSize: 11, color: '#555' }}>{customerBillTo.address}</Text>}
                                {customerBillTo.gstNumber && <Text style={{ fontSize: 11, color: '#555' }}>GSTIN: {customerBillTo.gstNumber}</Text>}
                                {customerBillTo.panNumber && <Text style={{ fontSize: 11, color: '#555' }}>PAN: {customerBillTo.panNumber}</Text>}
                            </View>
                            {
                                (customerShipTo.name && customerShipTo.address) ? (
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontWeight: 'bold', fontSize: 13, color: '#1a237e', marginBottom: 6 }}>Ship To</Text>
                                        <Text style={{ fontSize: 12, color: '#222', fontWeight: 500 }}>{customerShipTo.name}</Text>
                                        {customerShipTo.address && <Text style={{ fontSize: 11, color: '#555' }}>{customerShipTo.address}</Text>}
                                        {customerShipTo.gstNumber && <Text style={{ fontSize: 11, color: '#555' }}>GSTIN: {customerShipTo.gstNumber}</Text>}
                                        {customerShipTo.panNumber && <Text style={{ fontSize: 11, color: '#555' }}>PAN: {customerShipTo.panNumber}</Text>}
                                    </View>
                                ) : ''
                            }
                        </View>
                    </View>
                    {/* <View style={{ backgroundColor: '#fff', borderRadius: 10, padding: 16, flex: 1, borderWidth: 1, borderColor: '#e5e7eb', minHeight: 90 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 13, color: '#1a237e', marginBottom: 6 }}>Company Info</Text>
                        <Text style={{ fontSize: 12, color: '#222', fontWeight: 500 }}>{companyDetails.name}</Text>
                        {companyDetails.phone && <Text style={{ fontSize: 11, color: '#555' }}>{companyDetails.phone}</Text>}
                        {companyDetails.email && <Text style={{ fontSize: 11, color: '#555' }}>{companyDetails.email}</Text>}
                    </View> */}
                </View>
                {/* Items Table */}
                <View style={{ borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff', marginBottom: 16, overflow: 'hidden' }}>
                    {/* Table Header */}
                    <View style={{ flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }} wrap={false}>
                        <Text style={{ flex: 2, fontWeight: 'bold', fontSize: 12, color: '#1a237e', padding: 10 }}>Item</Text>
                        <Text style={{ flex: 1.2, fontWeight: 'bold', fontSize: 12, color: '#1a237e', padding: 10 }}>HSN Code</Text>
                        <Text style={{ flex: 1, fontWeight: 'bold', fontSize: 12, color: '#1a237e', padding: 10, textAlign: 'right' }}>Quantity</Text>
                        <Text style={{ flex: 1.3, fontWeight: 'bold', fontSize: 12, color: '#1a237e', padding: 10, textAlign: 'right' }}>Unit Price</Text>
                        <Text style={{ flex: 1.5, fontWeight: 'bold', fontSize: 12, color: '#1a237e', padding: 10, textAlign: 'right' }}>Total</Text>
                    </View>
                    {/* Table Body */}
                    {items.map((item, idx) => (
                        <View
                            style={{ flexDirection: 'row', backgroundColor: idx % 2 === 0 ? '#fff' : '#f9fafb' }}
                            key={item.id}
                            wrap={false}
                        >
                            <Text style={{ flex: 2, fontSize: 11, color: '#222', padding: 10 }}>{item.name}</Text>
                            <Text style={{ flex: 1.2, fontSize: 11, color: '#222', padding: 10 }}>{item.hsnCode ? item.hsnCode : '-'}</Text>
                            <Text style={{ flex: 1, fontSize: 11, color: '#222', padding: 10, textAlign: 'right' }}>{item.quantity}</Text>
                            <Text style={{ flex: 1.3, fontSize: 11, color: '#222', padding: 10, textAlign: 'right' }}>₹{formatCurrency(item.price)}</Text>
                            <Text style={{ flex: 1.5, fontSize: 11, color: '#222', padding: 10, textAlign: 'right' }}>₹{formatCurrency(item.price * item.quantity)}</Text>
                        </View>
                    ))}
                </View>
                {/* Financial Summary */}
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                    <View style={{ width: '60%', backgroundColor: '#fff', borderRadius: 10, padding: 18, borderWidth: 1, borderColor: '#e5e7eb', flexDirection: 'column', gap: 6 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', fontSize: 13, color: '#555' }}>
                            <Text>Subtotal</Text>
                            <Text>₹{formatCurrency(invoiceData.subtotal)}</Text>
                        </View>
                        {invoiceData.transportationAndOthers !== undefined && (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', fontSize: 13, color: '#555' }}>
                                <Text>Transportation & Others</Text>
                                <Text>₹{formatCurrency(invoiceData.transportationAndOthers)}</Text>
                            </View>
                        )}
                        {invoiceData.packaging !== undefined && (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', fontSize: 13, color: '#555' }}>
                                <Text>Packaging</Text>
                                <Text>₹{formatCurrency(invoiceData.packaging)}</Text>
                            </View>
                        )}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', fontSize: 13, color: '#555' }}>
                            <Text>GST ({invoiceData.gstRate}%)</Text>
                            <Text>₹{formatCurrency(invoiceData.gstAmount)}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', fontSize: 15, color: '#1a237e', fontWeight: 'bold', marginTop: 8, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 8 }}>
                            <Text>Total</Text>
                            <Text>₹{formatCurrency(invoiceData.total)}</Text>
                        </View>
                    </View>
                </View>
                {/* Bank Details and Terms & Conditions */}
                <View style={{ padding: 10, marginBottom: 10, backgroundColor: '#fff' }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 12, marginBottom: 4 }}>Bank Details:</Text>
                    <Text style={{ fontSize: 11, marginBottom: 2 }}>Bank Name : ICICI</Text>
                    <Text style={{ fontSize: 11, marginBottom: 2 }}>Account Name : DYNAMIC ENTERPRISES</Text>
                    <Text style={{ fontSize: 11, marginBottom: 2 }}>Branch : Sinhgad  Road Branch</Text>
                    <Text style={{ fontSize: 11, marginBottom: 2 }}>A/C Type : Currrent</Text>
                    <Text style={{ fontSize: 11, marginBottom: 2 }}>A/C No : 180205500134</Text>
                    <Text style={{ fontSize: 11 }}>IFSC Code : ICIC0001802</Text>
                </View>
                <View style={{ padding: 10, backgroundColor: '#fff' }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 12, marginBottom: 4 }}>Terms and Conditions:</Text>
                    <Text style={{ fontSize: 11, marginBottom: 2 }}>- We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.</Text>
                    <Text style={{ fontSize: 11 }}>- Payment is due within 30 days of the invoice date.</Text>
                </View>
                {/* Modern UI Footer with border, background, and spaced info */}
                <View
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 36,
                        backgroundColor: '#f5f7fa',
                        borderTopWidth: 1,
                        borderTopColor: '#e0e0e0',
                        paddingHorizontal: 32,
                        paddingVertical: 8,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                    fixed
                >
                    <Text
                        style={{ fontSize: 10, color: '#555' }}
                        render={() => `Invoice No: ${invoiceNumber}`}
                    />
                    <Text
                        style={{ fontSize: 10, color: '#555' }}
                        render={() => `Invoice Date: ${invoiceDate}`}
                    />
                    <Text
                        style={{ fontSize: 10, color: '#555' }}
                        render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
                    />
                </View>
            </Page>
        </Document>
    );
};

const ModernInvoicePDFWrapper: React.FC<{ invoiceData: InvoiceData | null, qrCode: string, autoDownload?: boolean }> = ({ invoiceData, qrCode, autoDownload }) => {
    const [instance, updateInstance] = usePDF({ document: <ModernInvoicePDF invoiceData={invoiceData} qrCode={qrCode} /> });

    React.useEffect(() => {
        if (autoDownload && instance.url) {
            window.open(instance.url, '_blank');
        }
    }, [autoDownload, instance.url]);

    return <button className='hover:cursor-pointer' onClick={() => instance.url && window.open(instance.url, '_blank')}><Download className="h-4 w-4" /></button>;
};

export default ModernInvoicePDFWrapper; 