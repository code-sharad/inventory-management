import QRCode from "qrcode";

async function generateQRCode(invoiceId) {
  const url = await QRCode.toDataURL(
    `https://invoice.degroop.com/invoice/${invoiceId}`,
    { width: 64 }
  );
  return url;
}

generateQRCode('6835a26534c7b65c11d73f35').then((res) => {
    console.log(res)
})
