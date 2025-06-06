import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Font,
    usePDF,
    Image
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
        phoneNumber?: string;
    };
    customerShipTo: {
        name: string;
        address: string;
        gstNumber?: string;
        panNumber?: string;
        phoneNumber?: string;
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
}

const styles = StyleSheet.create({
    page: {
        fontFamily: 'Poppins',
        fontSize: 10,
        paddingTop: 20,
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 60,
        color: '#333',
    },
    header: {
        flexDirection: 'row',
        borderWidth: 2,
        borderColor: '#000',
        marginBottom: 10,
    },
    headerLeft: {
        flex: 1,
        padding: 8,
        borderRightWidth: 1,
        borderRightColor: '#000',
    },
    headerRight: {
        width: 150,
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f8ff',
    },
    companyName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2E5C8A',
        marginBottom: 4,
        textAlign: 'center',
    },
    tagline: {
        fontSize: 10,
        color: '#fff',
        backgroundColor: '#2E5C8A',
        padding: 4,
        textAlign: 'center',
        marginBottom: 4,
    },
    address: {
        fontSize: 9,
        lineHeight: 1.3,
        textAlign: 'center',
    },
    gstinSection: {
        flexDirection: 'row',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#000',
    },
    gstinLeft: {
        flex: 1,
        padding: 6,
        borderRightWidth: 1,
        borderRightColor: '#000',
    },
    gstinRight: {
        flex: 2,
        padding: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    invoiceTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    originalText: {
        fontSize: 10,
        textAlign: 'right',
        marginTop: 2,
    },
    customerSection: {
        flexDirection: 'row',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#000',
    },
    customerLeft: {
        flex: 1,
        padding: 8,
        borderRightWidth: 1,
        borderRightColor: '#000',
    },
    customerRight: {
        flex: 1,
        padding: 8,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 4,
        textAlign: 'center',
        backgroundColor: '#f0f0f0',
        padding: 2,
    },
    table: {
        borderWidth: 1,
        borderColor: '#000',
        marginBottom: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
    },
    tableHeaderCell: {
        padding: 4,
        fontSize: 9,
        fontWeight: 'bold',
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#000',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
    },
    tableCell: {
        padding: 4,
        fontSize: 9,
        borderRightWidth: 1,
        borderRightColor: '#000',
        textAlign: 'center',
    },
    totalSection: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 10,
    },
    totalTable: {
        width: 200,
        borderWidth: 1,
        borderColor: '#000',
    },
    totalRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
    },
    totalLabel: {
        flex: 1,
        padding: 4,
        fontSize: 9,
        borderRightWidth: 1,
        borderRightColor: '#000',
    },
    totalValue: {
        width: 80,
        padding: 4,
        fontSize: 9,
        textAlign: 'right',
    },
    amountInWords: {
        borderWidth: 1,
        borderColor: '#000',
        padding: 8,
        marginBottom: 10,
    },
    bankDetails: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#000',
        marginBottom: 10,
    },
    bankLeft: {
        flex: 1,
        padding: 8,
        borderRightWidth: 1,
        borderRightColor: '#000',
    },
    bankRight: {
        flex: 1,
        padding: 8,
    },
    termsSection: {
        borderWidth: 1,
        borderColor: '#000',
        padding: 8,
        marginBottom: 10,
    },
    signatureSection: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#000',
        height: 80,
    },
    signatureLeft: {
        flex: 1,
        padding: 8,
        borderRightWidth: 1,
        borderRightColor: '#000',
    },
    signatureRight: {
        width: 150,
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        textAlign: 'center',
        fontSize: 8,
        color: '#666',
    },
});

// Helper function to convert number to words (simplified version)
const numberToWords = (num: number): string => {
    const ones = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];
    const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
    const teens = ['TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];

    if (num === 0) return 'ZERO';

    let result = '';

    if (num >= 100000) {
        const lakhs = Math.floor(num / 100000);
        result += ones[lakhs] + ' LAKH ';
        num %= 100000;
    }

    if (num >= 1000) {
        const thousands = Math.floor(num / 1000);
        if (thousands >= 10 && thousands < 20) {
            result += teens[thousands - 10] + ' THOUSAND ';
        } else {
            if (thousands >= 20) {
                result += tens[Math.floor(thousands / 10)] + ' ';
            }
            if (thousands % 10 > 0) {
                result += ones[thousands % 10] + ' ';
            }
            result += 'THOUSAND ';
        }
        num %= 1000;
    }

    if (num >= 100) {
        result += ones[Math.floor(num / 100)] + ' HUNDRED ';
        num %= 100;
    }

    if (num >= 20) {
        result += tens[Math.floor(num / 10)] + ' ';
        if (num % 10 > 0) {
            result += ones[num % 10] + ' ';
        }
    } else if (num >= 10) {
        result += teens[num - 10] + ' ';
    } else if (num > 0) {
        result += ones[num] + ' ';
    }

    return result.trim();
};

const ProfessionalInvoicePDF: React.FC<{ invoiceData: InvoiceData, qrCode: string }> = ({ invoiceData, qrCode }) => {
    const { customerBillTo, invoiceNumber, invoiceDate, items, companyDetails } = invoiceData;

    // Use a consistent page size for all pages
    const PAGE_SIZE = 14;
    const paginatedItems: Array<Array<typeof items[0]>> = [];
    for (let i = 0; i < items.length; i += PAGE_SIZE) {
        paginatedItems.push(items.slice(i, i + PAGE_SIZE));
    }

    const totalInWords = numberToWords(Math.floor(invoiceData.total)) + ' RUPEES ONLY';

    const renderItemsTable = (pageItems: typeof items, isFirstPage: boolean = false, isLastPage: boolean = false) => (
        <View style={styles.table}>
            <View style={styles.tableHeader} wrap={false}>
                <Text style={[styles.tableHeaderCell, { width: 30 }]}>Sr. No.</Text>
                <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Name of Product / Service</Text>
                <Text style={[styles.tableHeaderCell, { width: 60 }]}>HSN / SAC</Text>
                <Text style={[styles.tableHeaderCell, { width: 50 }]}>Qty</Text>
                <Text style={[styles.tableHeaderCell, { width: 60 }]}>Rate</Text>
                <Text style={[styles.tableHeaderCell, { width: 80 }]}>Taxable Value</Text>
                <Text style={[styles.tableHeaderCell, { width: 40 }]}>IGST %</Text>
                <Text style={[styles.tableHeaderCell, { width: 60 }]}>Amount</Text>
                <Text style={[styles.tableHeaderCell, { width: 60, borderRightWidth: 0 }]}>Total</Text>
            </View>

            {pageItems.map((item, index) => (
                <View style={styles.tableRow} key={item.id} wrap={false}>
                    <Text style={[styles.tableCell, { width: 30 }]}>{index + 1}</Text>
                    <Text style={[styles.tableCell, { flex: 2, textAlign: 'left', paddingLeft: 4 }]}>{item.name}</Text>
                    <Text style={[styles.tableCell, { width: 60 }]}>{item.hsnCode || '-'}</Text>
                    <Text style={[styles.tableCell, { width: 50 }]}>{item.quantity}.00 PCS</Text>
                    <Text style={[styles.tableCell, { width: 60 }]}>{item.price.toFixed(2)}</Text>
                    <Text style={[styles.tableCell, { width: 80 }]}>{(item.price * item.quantity).toFixed(2)}</Text>
                    <Text style={[styles.tableCell, { width: 40 }]}>{invoiceData.gstRate.toFixed(1)}</Text>
                    <Text style={[styles.tableCell, { width: 60 }]}>{((item.price * item.quantity) * (invoiceData.gstRate / 100)).toFixed(2)}</Text>
                    <Text style={[styles.tableCell, { width: 60, borderRightWidth: 0 }]}>{((item.price * item.quantity) * (1 + invoiceData.gstRate / 100)).toFixed(2)}</Text>
                </View>
            ))}

            {/* Total row only on last page */}
            {isLastPage && (
                <View style={[styles.tableRow, { backgroundColor: '#f0f0f0' }]} wrap={false}>
                    <Text style={[styles.tableCell, { width: 30 }]}></Text>
                    <Text style={[styles.tableCell, { flex: 2, fontWeight: 'bold' }]}>Total</Text>
                    <Text style={[styles.tableCell, { width: 60 }]}></Text>
                    <Text style={[styles.tableCell, { width: 50, fontWeight: 'bold' }]}>{items.reduce((sum, item) => sum + item.quantity, 0)}.00</Text>
                    <Text style={[styles.tableCell, { width: 60 }]}></Text>
                    <Text style={[styles.tableCell, { width: 80, fontWeight: 'bold' }]}>{invoiceData.subtotal.toFixed(2)}</Text>
                    <Text style={[styles.tableCell, { width: 40 }]}></Text>
                    <Text style={[styles.tableCell, { width: 60, fontWeight: 'bold' }]}>{invoiceData.gstAmount.toFixed(2)}</Text>
                    <Text style={[styles.tableCell, { width: 60, borderRightWidth: 0, fontWeight: 'bold' }]}>{invoiceData.total.toFixed(2)}</Text>
                </View>
            )}
        </View>
    );

    const renderHeader = () => (

        <View style={{ flexDirection: 'row',  borderColor: '#000', marginBottom: 10 }} wrap={false}>
            {/* QR Code Left */}
            <View style={{ width: 80, padding: 8, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' }}>
                {/* Placeholder for QR code (React PDF does not support SVG QR out of the box) */}
                <Image src={qrCode} style={{ width: 80, height: 80 }} />
            </View>
            {/* Company Info Center */}
            <View style={{ flex: 1, padding: 8  }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#2E5C8A', textAlign: 'center', marginBottom: 4 }}>DYNAMIC ENTRPRISE</Text>
                {/* <Text style={{ fontSize: 10, color: '#fff', backgroundColor: '#2E5C8A', padding: 4, textAlign: 'center', marginBottom: 4 }}>Manufacturing & Supply of Precision Press Tool & Room Component</Text> */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ alignItems: 'flex-start' }}>
                        <Text style={{ fontSize: 9 }}>Tel : {companyDetails.phone}</Text>
                        {/* <Text style={{ fontSize: 9 }}>Web : {companyDetails.website}</Text> */}
                        <Text style={{ fontSize: 9 }}>Email : {companyDetails.email}</Text>
                    </View>
                    <Text style={{ fontSize: 9, textAlign: 'left', width: 120 }}>{companyDetails.address}</Text>
                </View>
            </View>
            {/* Logo Right */}
            <View style={{ width: 80, padding: 8,  alignItems: 'center', justifyContent: 'center' }}>
                <Image src="/logo.png" style={{ width: 80, height: 80 }} />
            </View>
        </View>
    );

    // New GSTIN/TAX INVOICE/ORIGINAL row
    const renderGSTINSection = () => (
        <View style={{ flexDirection: 'row', borderWidth: 1, borderColor: '#000', alignItems: 'center', height: 32 }}>
            {/* GSTIN */}
            <View style={{ flex: 1, paddingLeft: 8, borderRightWidth: 1, borderRightColor: '#000', height: '100%', justifyContent: 'center' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 12 }}>GSTIN : 24HDE7487RE5RT4</Text>
            </View>
            {/* TAX INVOICE + ORIGINAL FOR RECIPIENT */}
            <View style={{ flex: 1.8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: '100%', paddingHorizontal: 8 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 12, textAlign: 'center', flex: 1 }}>TAX INVOICE</Text>
                <Text style={{ fontSize: 10, textAlign: 'right', flex: 1 }}>ORIGINAL FOR RECIPIENT</Text>
            </View>
        </View>
    );

    // Only Bill To / Ship To / Invoice Details row
    const renderCustomerDetails = () => (
        <View style={{ flexDirection: 'row', borderWidth: 1, borderColor: '#000', borderTopWidth: 0, marginBottom: 10 }} wrap={false}>
            {/* Bill To */}
            <View style={{ flex: 1, borderRightWidth: 1, borderRightColor: '#000', padding: 0}}>
                    <Text style={{ fontWeight: 'bold', fontSize: 10, textAlign: 'center', borderBottomWidth: 1, borderBottomColor: '#000', marginBottom: 4, paddingBottom: 2 }}>Bill To</Text>
                <View style={{ padding: 8 }}>
                <Text style={{ fontSize: 9, marginBottom: 2 }}><Text style={{ fontWeight: 'bold' }}>M/S:</Text> {customerBillTo.name || '-'}</Text>
                <Text style={{ fontSize: 9, marginBottom: 2 }}><Text style={{ fontWeight: 'bold' }}>Address:</Text> {customerBillTo.address || '-'}</Text>
                <Text style={{ fontSize: 9, marginBottom: 2 }}><Text style={{ fontWeight: 'bold' }}>PHONE:</Text> {customerBillTo.phoneNumber || '-'}</Text>
                <Text style={{ fontSize: 9, marginBottom: 2 }}><Text style={{ fontWeight: 'bold' }}>GSTIN:</Text> {customerBillTo.gstNumber || '-'}</Text>
                </View>
            </View>
            {/* Ship To */}
            <View style={{ flex: 1.2, borderRightWidth: 1, borderRightColor: '#000', padding: 0 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 10, textAlign: 'center', borderBottomWidth: 1, borderBottomColor: '#000', marginBottom: 4, paddingBottom: 2 }}>Ship To</Text>
                <View style={{ padding: 8 }}>
                    <Text style={{ fontSize: 9, marginBottom: 2 }}><Text style={{ fontWeight: 'bold' }}>M/S:</Text> {invoiceData.customerShipTo.name || '-'}</Text>
                    <Text style={{ fontSize: 9, marginBottom: 2 }}><Text style={{ fontWeight: 'bold' }}>Address:</Text> {invoiceData.customerShipTo.address || '-'}</Text>
                    <Text style={{ fontSize: 9, marginBottom: 2 }}><Text style={{ fontWeight: 'bold' }}>PHONE:</Text> {invoiceData.customerShipTo.phoneNumber || '-'}</Text>
                    <Text style={{ fontSize: 9, marginBottom: 2 }}><Text style={{ fontWeight: 'bold' }}>GSTIN:</Text> {invoiceData.customerShipTo.gstNumber || '-'}</Text>
                </View>
            </View>
            {/* Invoice Details */}
            <View style={{ flex: 1, padding: 0 }}>
                    <View style={{ flex: 1, borderBottomWidth: 1, borderBottomColor: '#000', paddingBottom: 3 }}>
                        <Text style={{ fontSize: 10, fontWeight: 'bold',textAlign: 'center' }}>Invoice Details</Text>
                    </View>
                <View style={{ flexDirection: 'row', borderColor: '#000', borderTopWidth: 0, borderBottomColor: '#000', paddingBottom: 2, paddingTop: 2 }}>
                    {/* Left Column */}
                    <View style={{ flex: 1, borderRightWidth: 1, borderRightColor: '#000' }}>
                        <View style={{ borderBottomWidth: 1, borderColor: '#000', padding: 2 }}>
                            <Text style={{ fontSize: 8, fontWeight: 'bold' }}>Invoice No.</Text>
                            <Text style={{ fontSize: 8, }}>{invoiceNumber}</Text>
                        </View>
                        <View style={{ borderBottomWidth: 1, borderColor: '#000', padding: 2 }}>
                            <Text style={{ fontSize: 8, fontWeight: 'bold' }}>Challan No.</Text>
                            <Text style={{ fontSize: 8 }}>{invoiceData.challanNo || '-'}</Text>
                        </View>
                        <View style={{ borderBottomWidth: 1, borderColor: '#000', padding: 2 }}>
                            <Text style={{ fontSize: 8, fontWeight: 'bold' }}>DELIVERY DATE</Text>
                            <Text style={{ fontSize: 8 }}>{invoiceDate}</Text>
                        </View>
                        <View style={{ borderBottomWidth: 0, borderColor: '#000', padding: 2 }}>
                            <Text style={{ fontSize: 8, fontWeight: 'bold' }}>P.O. No.</Text>
                            <Text style={{ fontSize: 8 }}>{invoiceData.poNo || '-'}</Text>
                        </View>
                    </View>
                    {/* Right Column */}
                    <View style={{ flex: 1 }}>
                        <View style={{ borderBottomWidth: 1, borderColor: '#000', padding: 2 }}>
                            <Text style={{ fontSize: 8, fontWeight: 'bold' }}>Invoice Date</Text>
                            <Text style={{ fontSize: 8 }}>{invoiceDate}</Text>
                        </View>
                        <View style={{ borderBottomWidth: 1, borderColor: '#000', padding: 2 }}>
                            <Text style={{ fontSize: 8, fontWeight: 'bold' }}>Challan Date</Text>
                            <Text style={{ fontSize: 8 }}>{invoiceData.challanDate || '-'}</Text>
                        </View>
                        <View style={{ borderBottomWidth: 1, borderColor: '#000', padding: 2 }}>
                            <Text style={{ fontSize: 8, fontWeight: 'bold' }}>Reverse Charge</Text>
                            <Text style={{ fontSize: 8 }}>No</Text>
                        </View>
                        <View style={{ borderBottomWidth: 0, padding: 2 }}>
                            <Text style={{ fontSize: 8, fontWeight: 'bold' }}>E-Way No.</Text>
                            <Text style={{ fontSize: 8 }}>{invoiceData.eWayNo || '-'}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );

    const renderFooterContent = (isLastPage: boolean = false) => (
        <>
            {isLastPage && (
                <>
                    {/* <View style={styles.amountInWords}>
                        <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 2 }}>Total in words</Text>
                        <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{totalInWords}</Text>
                    </View> */}

                    <View wrap={false}>
                        <View style={styles.bankDetails}>
                            <View style={styles.bankLeft}>
                                <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 4 }}>Bank Details</Text>
                                <Text style={{ fontSize: 9, marginBottom: 2 }}>Bank Name: State Bank of India</Text>
                                <Text style={{ fontSize: 9, marginBottom: 2 }}>Branch Name: RAF CAMP</Text>
                                <Text style={{ fontSize: 9, marginBottom: 2 }}>Bank Account Number: 200000004512</Text>
                                <Text style={{ fontSize: 9 }}>Bank Branch IFSC: SBIN0000488</Text>
                            </View>
                            <View style={styles.bankRight}>
                                <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 4 }}>Taxable Amount: 1,154.00</Text>
                                <Text style={{ fontSize: 9, marginBottom: 2 }}>Add : IGST: 103.86</Text>
                                <Text style={{ fontSize: 9, marginBottom: 2 }}>Total Tax: 103.86</Text>
                                <Text style={{ fontSize: 10, fontWeight: 'bold' }}>Total Amount After Tax: ₹ 1,258.00</Text>
                                <Text style={{ fontSize: 8, marginTop: 4 }}>(E & O.E.)</Text>
                                <Text style={{ fontSize: 9, marginTop: 4 }}>GST Payable on Reverse Charge: N.A.</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.termsSection} wrap={false}>
                        <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 4 }}>Terms and Conditions</Text>
                        <Text style={{ fontSize: 9, marginBottom: 2 }}>1. Subject to Ahmedabad Jurisdiction.</Text>
                        <Text style={{ fontSize: 9, marginBottom: 2 }}>2. Our responsibility ceases as soon as the goods leave our premises.</Text>
                        <Text style={{ fontSize: 9, marginBottom: 2 }}>3. Goods once sold will not be taken back.</Text>
                        <Text style={{ fontSize: 9 }}>4. Delivery ex-premises.</Text>
                    </View>

                    {/* <View style={styles.signatureSection} wrap={false}>
                        <View style={styles.signatureLeft}>
                            <Text style={{ fontSize: 9, marginBottom: 4 }}>Certified that the particulars given above are true and correct.</Text>
                        </View>
                        <View style={styles.signatureRight}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 10 }}>For Gujarat Freight Tools</Text>
                            <Text style={{ fontSize: 8, color: '#666' }}>This is computer generated</Text>
                            <Text style={{ fontSize: 8, color: '#666' }}>invoice no signature required.</Text>
                            <Text style={{ fontSize: 9, fontWeight: 'bold', marginTop: 10 }}>Authorised Signatory</Text>
                        </View>
                    </View> */}
                </>
            )}
        </>
    );

    return (
        <Document>
            {paginatedItems.map((pageItems, pageIndex) => (
                <Page size="A4" style={styles.page} key={pageIndex}>
                    {pageIndex === 0 && renderHeader()}
                    {pageIndex === 0 && renderGSTINSection()}
                    {pageIndex === 0 && renderCustomerDetails()}
                    {renderItemsTable(pageItems, pageIndex === 0, pageIndex === paginatedItems.length - 1)}
                    {pageIndex === paginatedItems.length - 1 && renderFooterContent(true)}
                    <Text style={styles.footer} fixed>
                        Invoice No: {invoiceNumber} | Invoice Date: {invoiceDate} | Page {pageIndex + 1} of {paginatedItems.length}
                    </Text>
                </Page>
            ))}
        </Document>
    );
};

export default ProfessionalInvoicePDF;

export const ProfessionalInvoiceDownloadButton: React.FC<{ invoiceData: InvoiceData, qrCode: string }> = ({ invoiceData, qrCode }) => {
    const [instance, updateInstance] = usePDF({
        document: <ProfessionalInvoicePDF invoiceData={invoiceData} qrCode={qrCode} />
    });

    const handleDownload = () => {
        if (instance.blob) {
            const url = URL.createObjectURL(instance.blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `gujarat-freight-invoice-${invoiceData.invoiceNumber}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
        } else {
            // updateInstance();
        }
    };

    return (
        <button
            onClick={handleDownload}
            disabled={instance.loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
            <Download size={16} />
            {instance.loading ? 'Generating...' : 'Download PDF'}
        </button>
    );
};

// Wrapper component similar to ClassicInvoicePDFWrapper
export const ProfessionalInvoicePDFWrapper: React.FC<{ invoiceData: InvoiceData | null, qrCode: string, autoDownload?: boolean }> = ({ invoiceData, qrCode, autoDownload }) => {
    if (!invoiceData) return null;
    const [instance, updateInstance] = usePDF({ document: <ProfessionalInvoicePDF invoiceData={invoiceData} qrCode={qrCode} /> });

    React.useEffect(() => {
        if (autoDownload && instance.url) {
            window.open(instance.url, '_blank');
        }
    }, [autoDownload, instance.url]);

    return <button className='hover:cursor-pointer' onClick={() => instance.url && window.open(instance.url, '_blank')}><Download className="h-4 w-4" /></button>;
}; 