import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Font,
    Image
} from '@react-pdf/renderer';
import { formatCurrency } from '@/lib/formatCurrency';
import Poppins from '../../../public/fonts/Poppins-Regular.ttf';

Font.register({ family: 'Poppins', src: Poppins });

interface InvoiceData {
    id: string;
    invoiceNumber: string;
    createdAt: string;
    invoiceDate: string;
    customer: {
        name: string;
        email: string;
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
        fontSize: 12,
        fontFamily: 'Poppins',
        backgroundColor: '#fff',
        color: '#000',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#222',
        paddingBottom: 12,
        marginBottom: 18,
    },
    companyName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111',
    },
    companyAddress: {
        fontSize: 11,
        color: '#333',
        marginTop: 2,
        maxWidth: 220,
    },
    qrCodeBox: {
        width: 64,
        height: 64,
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
        fontSize: 11,
        color: '#222',
        marginTop: 2,
    },
    billToSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 18,
        gap: 12,
    },
    billTo: {
        backgroundColor: '#fff',
        borderRadius: 0,
        padding: 12,
        flex: 1,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#bbb',
        minHeight: 80,
    },
    companyInfo: {
        backgroundColor: '#fff',
        borderRadius: 0,
        padding: 12,
        flex: 1,
        borderWidth: 1,
        borderColor: '#bbb',
        minHeight: 80,
    },
    cardTitle: {
        fontWeight: 'bold',
        marginBottom: 4,
        fontSize: 12,
        color: '#111',
    },
    cardField: {
        fontSize: 11,
        color: '#111',
        marginBottom: 2,
    },
    cardSubField: {
        fontSize: 10,
        color: '#444',
        marginBottom: 2,
    },
    table: {
        width: '100%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#222',
        marginBottom: 18,
        flexDirection: 'column',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f3f3f3',
        borderBottomWidth: 1,
        borderBottomColor: '#222',
    },
    tableHeaderCell: {
        fontWeight: 'bold',
        fontSize: 12,
        color: '#111',
        padding: 8,
        borderRightWidth: 1,
        borderRightColor: '#222',
    },
    tableRow: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    tableRowAlt: {
        flexDirection: 'row',
        backgroundColor: '#f7f7f7',
        alignItems: 'center',
    },
    tableCell: {
        padding: 8,
        borderRightWidth: 1,
        borderRightColor: '#bbb',
        borderBottomWidth: 1,
        borderBottomColor: '#bbb',
        fontSize: 11,
        color: '#111',
    },
    lastTableCell: {
        borderRightWidth: 0,
    },
    summary: {
        alignItems: 'flex-end',
        marginTop: 12,
        backgroundColor: '#fff',
        borderRadius: 0,
        padding: 12,
        borderWidth: 1,
        borderColor: '#bbb',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 12,
        marginBottom: 2,
    },
    summaryLabel: {
        color: '#222',
    },
    summaryValue: {
        color: '#111',
        fontWeight: 'bold',
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
    },
});

const ClassicInvoicePDF: React.FC<{ invoiceData: InvoiceData, qrCode: string }> = ({ invoiceData, qrCode }) => {
    const { customer, invoiceNumber, invoiceDate, items, companyDetails } = invoiceData;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.companyName}>{companyDetails.name}</Text>
                        <Text style={styles.companyAddress}>{companyDetails.address}, {companyDetails.cityState}</Text>
                    </View>
                    <View style={styles.invoiceInfo}>
                        <View style={styles.qrCodeBox}>
                            {qrCode ? <Image src={qrCode} style={{ width: 56, height: 56 }} /> : <Text style={{ fontSize: 8, color: '#aaa' }}>QR CODE</Text>}
                        </View>
                        <Text style={styles.invoiceNumber}>Invoice #: {invoiceNumber}</Text>
                        <Text style={styles.invoiceNumber}>Date: {invoiceDate}</Text>
                    </View>
                </View>
                {/* Bill To & Company Info */}
                <View style={styles.billToSection}>
                    <View style={styles.billTo}>
                        <Text style={styles.cardTitle}>Bill To</Text>
                        <Text style={styles.cardField}>{customer.name}</Text>
                        {customer.address && <Text style={styles.cardSubField}>{customer.address}</Text>}
                        {customer.email && <Text style={styles.cardSubField}>{customer.email}</Text>}
                        {customer.gstNumber && <Text style={styles.cardSubField}>GSTIN: {customer.gstNumber}</Text>}
                        {customer.panNumber && <Text style={styles.cardSubField}>PAN: {customer.panNumber}</Text>}
                    </View>
                    <View style={styles.companyInfo}>
                        <Text style={styles.cardTitle}>Company Info</Text>
                        <Text style={styles.cardField}>{companyDetails.name}</Text>
                        {companyDetails.phone && <Text style={styles.cardSubField}>{companyDetails.phone}</Text>}
                        {companyDetails.email && <Text style={styles.cardSubField}>{companyDetails.email}</Text>}
                    </View>
                </View>
                {/* Items Table */}
                <View style={styles.table}>
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
                <View style={styles.summary}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal</Text>
                        <Text style={styles.summaryValue}>₹{formatCurrency(invoiceData.subtotal)}</Text>
                    </View>
                    {invoiceData.transportationAndOthers !== undefined && (
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Transportation & Others</Text>
                            <Text style={styles.summaryValue}>₹{formatCurrency(invoiceData.transportationAndOthers)}</Text>
                        </View>
                    )}
                    {invoiceData.packaging !== undefined && (
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Packaging</Text>
                            <Text style={styles.summaryValue}>₹{formatCurrency(invoiceData.packaging)}</Text>
                        </View>
                    )}
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>GST ({invoiceData.gstRate}%)</Text>
                        <Text style={styles.summaryValue}>₹{formatCurrency(invoiceData.gstAmount)}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text>Total</Text>
                        <Text>₹{formatCurrency(invoiceData.total)}</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export default ClassicInvoicePDF;
