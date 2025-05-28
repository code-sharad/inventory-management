import QRCode from "qrcode";

async function generateQRCode(invoiceId) {
  const url = await QRCode.toDataURL(
    `https://invoice.degroop.com/invoice/${invoiceId}`,
    { width: 64 }
  );
  return url;
}

generateQRCode('6836c31ca68de9644f606a92').then((res) => {
    console.log(res)
})
