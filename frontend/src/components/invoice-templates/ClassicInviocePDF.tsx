import React from 'react';
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
// import TimesNewRoman from '../../../public/fonts/Times-New-Roman.ttf';

Font.register({ family: 'Poppins', src: Poppins });
// Font.register({ family: 'TimesNewRoman', src: TimesNewRoman });

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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 0.5,
        borderBottomColor: '#999',
        paddingBottom: 12,
        marginBottom: 8,
    },
    companyName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111',
        fontFamily: 'Poppins',
    },
    companyAddress: {
        fontSize: 11,
        color: '#333',
        marginTop: 2,
        maxWidth: 220,
        fontFamily: 'Poppins',
    },
    qrCodeBox: {
        width: 66,
        height: 66,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#bbb',
        alignItems: 'center',
        justifyContent: 'center',
    },
    invoiceInfo: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    invoiceNumber: {
        fontSize: 12,
        color: '#222',
        marginTop: 2,
        fontWeight: 'bold',
        fontFamily: 'Poppins',
    },
    billToSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 18,
        gap: 12,
    },
    billTo: {
        backgroundColor: '#fff',
        padding: 12,
        flex: 1,
        marginRight: 8,
        // borderWidth: 1,
        borderColor: '#222',
        minHeight: 80,
        // borderRadius: 0,
    },
    companyInfo: {
        backgroundColor: '#fff',
        padding: 12,
        flex: 1,
        // borderWidth: 1,
        borderColor: '#222',
        minHeight: 80,
        // borderRadius: 0,
    },
    cardTitle: {
        fontWeight: 'bold',
        marginBottom: 4,
        fontSize: 13,
        color: '#111',
        fontFamily: 'Poppins',
    },
    cardField: {
        fontSize: 11,
        color: '#111',
        marginBottom: 2,
        fontFamily: 'Poppins',
    },
    cardSubField: {
        fontSize: 10,
        color: '#444',
        marginBottom: 2,
    },
    table: {
        width: '100%',
        borderStyle: 'solid',
        borderWidth: 0.5,
        borderColor: '#bbb',
        marginBottom: 18,
        flexDirection: 'column',
        borderRadius: 4,
        overflow: 'hidden',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        borderBottomWidth: 1,
        borderBottomColor: '#bbb',
    },
    tableHeaderCell: {
        fontWeight: 'bold',
        fontSize: 12,
        color: '#222',
        paddingVertical: 10,
        paddingHorizontal: 8,
        fontFamily: 'Poppins',
        // No right border for header
    },
    tableRow: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    tableRowAlt: {
        flexDirection: 'row',
        backgroundColor: '#fafbfc',
        alignItems: 'center',
    },
    tableCell: {
        paddingVertical: 8,
        paddingHorizontal: 8,
        fontSize: 11,
        color: '#111',
        fontFamily: 'Poppins',
        borderBottomWidth: 0.25,
        borderBottomColor: '#eee',
        // No right border for cleaner look
    },
    lastTableCell: {
        // No right border
    },
    summary: {
        alignItems: 'flex-end',
        marginTop: 12,
        backgroundColor: '#fff',
        // borderRadius: 0,
        padding: 12,
        borderWidth: 0.5,
        borderColor: '#222',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 12,
        marginBottom: 2,
        fontFamily: 'Poppins',
    },
    summaryLabel: {
        color: '#222',
        fontFamily: 'Poppins',
    },
    summaryValue: {
        color: '#111',
        fontWeight: 'bold',
        fontFamily: 'Poppins',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 15,
        fontWeight: 'bold',
        marginTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#222',
        paddingTop: 6,
        color: '#111',
        fontFamily: 'Poppins',
    },
});

const ClassicInvoicePDF: React.FC<{ invoiceData: InvoiceData, qrCode: string }> = ({ invoiceData, qrCode }) => {
    const { customerBillTo, customerShipTo, invoiceNumber, invoiceDate, items, companyDetails } = invoiceData;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <Image src={"/invoice-logo.png"} style={{ width: 64, height: 64 }} />
                        <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <Text style={styles.companyName}>{companyDetails.name}</Text>
                            {companyDetails.phone && <Text style={styles.companyAddress}>{companyDetails.phone}</Text>}
                            {companyDetails.email && <Text style={styles.companyAddress}>{companyDetails.email}</Text>}
                            <Text style={styles.companyAddress}>{companyDetails.address}, {companyDetails.cityState}</Text>
                        </View>
                    </View>
                    <View style={styles.invoiceInfo}>
                        <View style={styles.qrCodeBox}>
                            {qrCode ? <Image src={qrCode} style={{ width: 64, height: 64 }} /> : <Text style={{ fontSize: 8, color: '#aaa' }}>QR CODE</Text>}
                        </View>
                        <Text style={styles.invoiceNumber}>Invoice #: {invoiceNumber}</Text>
                        <Text style={styles.invoiceNumber}>Date: {invoiceDate}</Text>
                    </View>
                </View>
                {/* Wrap main content in a View with extra margin at the bottom to prevent footer overlap */}
                <View style={{ marginBottom: 72 }}>
                    {/* Bill To & Ship To */}
                    <View style={styles.billToSection}>
                        <View style={styles.billTo}>
                            <Text style={styles.cardTitle}>Bill To:</Text>
                            <Text style={styles.cardField}><Text style={{ fontWeight: 'bold' }}>Name:</Text> {customerBillTo.name}</Text>
                            {customerBillTo.address && <Text style={styles.cardField}><Text style={{ fontWeight: 'bold' }}>Address:</Text> {customerBillTo.address}</Text>}
                            {customerBillTo.gstNumber && <Text style={styles.cardField}><Text style={{ fontWeight: 'bold' }}>GST Number:</Text> {customerBillTo.gstNumber}</Text>}
                            {customerBillTo.panNumber && <Text style={styles.cardField}><Text style={{ fontWeight: 'bold' }}>PAN Number:</Text> {customerBillTo.panNumber}</Text>}
                        </View>
                        {(customerShipTo.name && customerShipTo.address) ? (
                            <View style={styles.companyInfo}>
                                <Text style={styles.cardTitle}>Ship To:</Text>
                                <Text style={styles.cardField}><Text style={{ fontWeight: 'bold' }}>Name:</Text> {customerShipTo.name}</Text>
                                {customerShipTo.address && <Text style={styles.cardField}><Text style={{ fontWeight: 'bold' }}>Address:</Text> {customerShipTo.address}</Text>}
                                {customerShipTo.gstNumber && <Text style={styles.cardField}><Text style={{ fontWeight: 'bold' }}>GST Number:</Text> {customerShipTo.gstNumber}</Text>}
                                {customerShipTo.panNumber && <Text style={styles.cardField}><Text style={{ fontWeight: 'bold' }}>PAN Number:</Text> {customerShipTo.panNumber}</Text>}
                            </View>
                        ) : ''}
                    </View>
                    {/* Items Table */}
                    <View style={[styles.table, { marginBottom: 32 }]} minPresenceAhead={25}>
                        {/* Table Header */}
                        <View style={styles.tableHeader} wrap={false}>
                            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Item</Text>
                            <Text style={[styles.tableHeaderCell, { flex: 1.2 }]}>HSN Code</Text>
                            <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>Quantity</Text>
                            <Text style={[styles.tableHeaderCell, { flex: 1.3, textAlign: 'right' }]}>Unit Price</Text>
                            <Text style={[styles.tableHeaderCell, { flex: 1.5, textAlign: 'right' }]}>Total</Text>
                        </View>
                        {/* Table Body */}
                        {items.map((item, idx) => (
                            <View
                                style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
                                key={item.id}
                                wrap={false}
                            >
                                <Text style={[styles.tableCell, { flex: 2 }]}>{item.name}</Text>
                                <Text style={[styles.tableCell, { flex: 1.2 }]}>{item.hsnCode ? item.hsnCode : '-'}</Text>
                                <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>{item.quantity}</Text>
                                <Text style={[styles.tableCell, { flex: 1.3, textAlign: 'right' }]}>₹{formatCurrency(item.price)}</Text>
                                <Text style={[styles.tableCell, { flex: 1.5, textAlign: 'right' }]}>₹{formatCurrency(item.price * item.quantity)}</Text>
                            </View>
                        ))}
                    </View>
                    {/* Financial Summary */}
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20, marginBottom: 20 }}>
                        <View style={{ width: '60%',  flexDirection: 'column', gap: 6 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', fontSize: 13, color: '#222' }}>
                                <Text>Subtotal</Text>
                                <Text>₹{formatCurrency(invoiceData.subtotal)}</Text>
                            </View>
                            {invoiceData.transportationAndOthers !== undefined && (
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', fontSize: 13, color: '#222' }}>
                                    <Text>Transportation & Others</Text>
                                    <Text>₹{formatCurrency(invoiceData.transportationAndOthers)}</Text>
                                </View>
                            )}
                            {invoiceData.packaging !== undefined && (
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', fontSize: 13, color: '#222' }}>
                                    <Text>Packaging</Text>
                                    <Text>₹{formatCurrency(invoiceData.packaging)}</Text>
                                </View>
                            )}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', fontSize: 13, color: '#222' }}>
                                <Text>GST ({invoiceData.gstRate}%)</Text>
                                <Text>₹{formatCurrency(invoiceData.gstAmount)}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', fontSize: 15, color: '#111', fontWeight: 'bold', marginTop: 8, borderTopWidth: 1, borderTopColor: '#bbb', paddingTop: 8 }}>
                                <Text>Total</Text>
                                <Text>₹{formatCurrency(invoiceData.total)}</Text>
                            </View>
                        </View>
                    </View>
                </View>
                {/* Bank Details and Terms & Conditions (now in normal flow) */}
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
                {/* Classic UI Footer with border, background, and spaced info */}
                <View
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 52,
                        backgroundColor: '#f3f3f3',
                        borderTopWidth: 1,
                        borderTopColor: '#bbb',
                        paddingHorizontal: 32,
                        paddingVertical: 8,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                    fixed
                >
                    <Text
                        style={{ fontSize: 10, color: '#222' }}
                        render={() => `Invoice No: ${invoiceNumber}`}
                    />
                    <Text
                        style={{ fontSize: 10, color: '#222' }}
                        render={() => `Invoice Date: ${invoiceDate}`}
                    />
                    <Text
                        style={{ fontSize: 10, color: '#222' }}
                        render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
                    />
                    <Text style={{ position: 'absolute', left: 32, bottom: 4, fontSize: 9, color: '#888', width: '100%', textAlign: 'center' }}>
                        This is an electronically generated document, no signature is required
                    </Text>
                </View>
            </Page>
        </Document>
    );
};

const ClassicInvoicePDFWrapper: React.FC<{ invoiceData: InvoiceData | null, qrCode: string, autoDownload?: boolean }> = ({ invoiceData, qrCode, autoDownload }) => {
    if (!invoiceData) return null;
    const [instance, updateInstance] = usePDF({ document: <ClassicInvoicePDF invoiceData={invoiceData} qrCode={qrCode} /> });

    React.useEffect(() => {
        if (autoDownload && instance.url) {
            window.open(instance.url, '_blank');
        }
    }, [autoDownload, instance.url]);

    return <button className='hover:cursor-pointer' onClick={() => instance.url && window.open(instance.url, '_blank')}><Download className="h-4 w-4" /></button>;
};

export default ClassicInvoicePDFWrapper;
