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
    template: "modern" | "minimal" | "classic" | "professional";
    packaging?: number;
    transportationAndOthers?: number;
    challanNo?: string;
    challanDate?: string;
    poNo?: string;
    eWayNo?: string;
};

const styles = StyleSheet.create({
    page: {
        padding: 32,
        paddingTop: 64,
        paddingBottom: 101,
        fontSize: 12,
        fontFamily: 'Poppins',
        backgroundColor: '#fff',
        color: '#222',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // borderBottomWidth: 1,
        // borderBottomColor: '#e5e7eb',
        paddingBottom: 10,
        marginBottom: 12,
    },
    companyName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#222',
        fontFamily: 'Poppins',
    },
    companyAddress: {
        fontSize: 11,
        color: '#555',
        marginTop: 2,
        maxWidth: 220,
        fontFamily: 'Poppins',
    },
    qrCodeBox: {
        width: 66,
        height: 66,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
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
        marginBottom: 16,
        gap: 12,
    },
    billTo: {
        backgroundColor: '#fafbfc',
        padding: 12,
        flex: 1,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        minHeight: 70,
        borderRadius: 6,
    },
    companyInfo: {
        backgroundColor: '#fafbfc',
        padding: 12,
        flex: 1,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        minHeight: 70,
        borderRadius: 6,
    },
    cardTitle: {
        fontWeight: 'bold',
        marginBottom: 4,
        fontSize: 13,
        color: '#222',
        fontFamily: 'Poppins',
    },
    cardField: {
        fontSize: 11,
        color: '#222',
        marginBottom: 2,
        fontFamily: 'Poppins',
    },
    table: {
        width: '100%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        marginBottom: 16,
        flexDirection: 'column',
        borderRadius: 6,
        overflow: 'hidden',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f5f7fa',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    tableHeaderCell: {
        fontWeight: 'bold',
        fontSize: 12,
        color: '#222',
        padding: 8,
        fontFamily: 'Poppins',
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
        padding: 8,
        fontSize: 12,
        color: '#222',
        fontFamily: 'Poppins',
    },
    lastTableCell: {
    },
    summary: {
        alignItems: 'flex-end',
        marginTop: 10,
        backgroundColor: '#fafbfc',
        borderRadius: 6,
        padding: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
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
        color: '#222',
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
        borderTopColor: '#e5e7eb',
        paddingTop: 6,
        color: '#222',
        fontFamily: 'Poppins',
    },
});

const MinimalInvoicePDF: React.FC<{ invoiceData: InvoiceData, qrCode: string }> = ({ invoiceData, qrCode }) => {
    const { customerBillTo, customerShipTo, invoiceNumber, invoiceDate, items, companyDetails } = invoiceData;

    // Split items based on pagination rules
    const firstPageItems = items.slice(0, 7);
    const remainingItems = items.slice(7);
    const additionalPages: Array<Array<typeof items[0]>> = [];

    // Split remaining items into pages of 14 each
    for (let i = 0; i < remainingItems.length; i += 14) {
        additionalPages.push(remainingItems.slice(i, i + 14));
    }

    const renderHeader = () => (
        <>
        <View style={styles.header}>
            <View>
                <Image src={"/invoice-logo.png"} style={{ width: 64, height: 64 }} />
                <Text style={styles.companyName}>{companyDetails.name}</Text>
                {companyDetails.phone && <Text style={styles.companyAddress}>{companyDetails.phone}</Text>}
                {companyDetails.email && <Text style={styles.companyAddress}>{companyDetails.email}</Text>}
                <Text style={styles.companyAddress}>{companyDetails.address}, {companyDetails.cityState}</Text>
            </View>
            <View style={styles.invoiceInfo}>
                <View style={styles.qrCodeBox}>
                    {qrCode ? <Image src={qrCode} style={{ width: 64, height: 64 }} /> : <Text style={{ fontSize: 8, color: '#aaa' }}>QR CODE</Text>}
                </View>
            </View>
        </View>
        </>
    );

    const renderCustomerDetails = () => (
        <View style={{ flexDirection: 'row', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, marginBottom: 16, backgroundColor: '#fff', overflow: 'hidden' }} wrap={false}>
            {/* Bill To */}
            <View style={{ flex: 1, borderRightWidth: 1, borderRightColor: '#e5e7eb', padding: 0 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 12, textAlign: 'center', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', marginBottom: 4, paddingBottom: 2 }}>Bill To</Text>
                <View style={{ padding: 8 }}>
                    <Text style={{ fontSize: 11, marginBottom: 2 }}><Text style={{ fontWeight: 'bold' }}>M/S:</Text> {customerBillTo.name || '-'}</Text>
                    <Text style={{ fontSize: 11, marginBottom: 2 }}><Text style={{ fontWeight: 'bold' }}>Address:</Text> {customerBillTo.address || '-'}</Text>
                    <Text style={{ fontSize: 11, marginBottom: 2 }}><Text style={{ fontWeight: 'bold' }}>PHONE:</Text> -</Text>
                    <Text style={{ fontSize: 11, marginBottom: 2 }}><Text style={{ fontWeight: 'bold' }}>GSTIN:</Text> {customerBillTo.gstNumber || '-'}</Text>
                </View>
            </View>
            {/* Ship To */}
            <View style={{ flex: 1.2, borderRightWidth: 1, borderRightColor: '#e5e7eb', padding: 0 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 12, textAlign: 'center', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', marginBottom: 4, paddingBottom: 2 }}>Ship To</Text>
                <View style={{ padding: 8 }}>
                    <Text style={{ fontSize: 11, marginBottom: 2 }}><Text style={{ fontWeight: 'bold' }}>M/S:</Text> {customerShipTo.name || '-'}</Text>
                    <Text style={{ fontSize: 11, marginBottom: 2 }}><Text style={{ fontWeight: 'bold' }}>Address:</Text> {customerShipTo.address || '-'}</Text>
                    <Text style={{ fontSize: 11, marginBottom: 2 }}><Text style={{ fontWeight: 'bold' }}>PHONE:</Text> -</Text>
                    <Text style={{ fontSize: 11, marginBottom: 2 }}><Text style={{ fontWeight: 'bold' }}>GSTIN:</Text> {customerShipTo.gstNumber || '-'}</Text>
                </View>
            </View>
            {/* Invoice Details */}
            <View style={{ flex: 1, padding: 0 }}>
                <View style={{ borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingBottom: 3 }}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', textAlign: 'center' }}>Invoice Details</Text>
                </View>
                <View style={{ flexDirection: 'row', borderTopWidth: 0, borderBottomColor: '#e5e7eb', paddingBottom: 2, paddingTop: 2 }}>
                    {/* Left Column */}
                    <View style={{ flex: 1, borderRightWidth: 1, borderRightColor: '#e5e7eb' }}>
                        <View style={{ borderBottomWidth: 1, borderColor: '#e5e7eb', padding: 2 }}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold' }}>Invoice No.</Text>
                            <Text style={{ fontSize: 10 }}>{invoiceNumber}</Text>
                        </View>
                        <View style={{ borderBottomWidth: 1, borderColor: '#e5e7eb', padding: 2 }}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold' }}>Challan No.</Text>
                            <Text style={{ fontSize: 10 }}>{invoiceData.challanNo || '-'}</Text>
                        </View>
                        <View style={{ borderBottomWidth: 1, borderColor: '#e5e7eb', padding: 2 }}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold' }}>DELIVERY DATE</Text>
                            <Text style={{ fontSize: 10 }}>{invoiceDate}</Text>
                        </View>
                        <View style={{ borderBottomWidth: 0, borderColor: '#e5e7eb', padding: 2 }}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold' }}>P.O. No.</Text>
                            <Text style={{ fontSize: 10 }}>{invoiceData.poNo || '-'}</Text>
                        </View>
                    </View>
                    {/* Right Column */}
                    <View style={{ flex: 1 }}>
                        <View style={{ borderBottomWidth: 1, borderColor: '#e5e7eb', padding: 2 }}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold' }}>Invoice Date</Text>
                            <Text style={{ fontSize: 10 }}>{invoiceDate}</Text>
                        </View>
                        <View style={{ borderBottomWidth: 1, borderColor: '#e5e7eb', padding: 2 }}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold' }}>Challan Date</Text>
                            <Text style={{ fontSize: 10 }}>{invoiceData.challanDate || '-'}</Text>
                        </View>
                        <View style={{ borderBottomWidth: 1, borderColor: '#e5e7eb', padding: 2 }}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold' }}>Reverse Charge</Text>
                            <Text style={{ fontSize: 10 }}>No</Text>
                        </View>
                        <View style={{ borderBottomWidth: 0, padding: 2 }}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold' }}>E-Way No.</Text>
                            <Text style={{ fontSize: 10 }}>{invoiceData.eWayNo || '-'}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );

    const renderItemsTable = (pageItems: typeof items) => (
        <View style={[styles.table, { marginBottom: 32 }]}>
            {/* Table Header */}
            <View style={styles.tableHeader} wrap={false}>
                <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Item</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1.2 }]}>HSN Code</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>Qty</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1.3, textAlign: 'right' }]}>Price</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1.5, textAlign: 'right' }]}>Total</Text>
            </View>
            {/* Table Body */}
            {pageItems.map((item, idx) => (
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
    );

    const renderFooterContent = (isLastPage: boolean = false) => (
        <>
            {isLastPage && (
                <>
                    {/* Financial Summary */}
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 40, marginTop: 20 }}>
                        <View style={{ width: '60%', flexDirection: 'column', gap: 6 }}>
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
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', fontSize: 15, color: '#222', fontWeight: 'bold', marginTop: 8, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 8 }}>
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
                </>
            )}
        </>
    );

    return (
        <Document>
            {/* First Page */}
            <Page size="A4" style={styles.page}>
                {renderHeader()}
                {renderCustomerDetails()}
                {renderItemsTable(firstPageItems)}
                {additionalPages.length === 0 && renderFooterContent(true)}

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

            {/* Additional Pages */}
            {additionalPages.map((pageItems, pageIndex) => (
                <Page size="A4" style={styles.page} key={pageIndex}>
                    {renderHeader()}
                    {renderCustomerDetails()}
                    {renderItemsTable(pageItems)}
                    {pageIndex === additionalPages.length - 1 && renderFooterContent(true)}

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
            ))}
        </Document>
    );
};

const MinimalInvoicePDFWrapper: React.FC<{ invoiceData: InvoiceData | null, qrCode: string, autoDownload?: boolean }> = ({ invoiceData, qrCode, autoDownload }) => {
    if (!invoiceData) return null;
    const [instance, updateInstance] = usePDF({ document: <MinimalInvoicePDF invoiceData={invoiceData} qrCode={qrCode} /> });

    React.useEffect(() => {
        if (autoDownload && instance.url) {
            window.open(instance.url, '_blank');
        }
    }, [autoDownload, instance.url]);

    return <button className='hover:cursor-pointer' onClick={() => instance.url && window.open(instance.url, '_blank')}><Download className="h-4 w-4" /></button>;
};

export default MinimalInvoicePDFWrapper;

