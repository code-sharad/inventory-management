import QRCode from "qrcode";


async function generateQRCode(invoiceId) {
  const url = await QRCode.toDataURL(
    `${process.env.VITE_FRONTEND_URL}/invoice/${invoiceId}`,
    { width: 64 }
  );
  return url;
}

export default generateQRCode;
