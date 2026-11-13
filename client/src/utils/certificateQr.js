import QRCode from "qrcode";

export const PRODUCTION_SITE_URL = "https://mahad-al-hind.netlify.app";

const normalize = (url) => String(url || "").trim().replace(/\/$/, "");

export const getSiteUrl = () => {
  const envUrl =
    (typeof import.meta !== "undefined" &&
      import.meta.env &&
      (import.meta.env.VITE_SITE_URL || "")) ||
    "";
  if (normalize(envUrl)) return normalize(envUrl);
  if (typeof window !== "undefined" && window.location?.origin) {
    return normalize(window.location.origin);
  }
  return PRODUCTION_SITE_URL;
};

export const buildCertificateVerifyUrl = (uid) => {
  const trimmed = String(uid ?? "").trim();
  if (!trimmed) return "";
  return `${getSiteUrl()}/certificate-checker?uid=${encodeURIComponent(trimmed)}`;
};

export const generateCertificateQrDataUrl = async (uid) => {
  const url = buildCertificateVerifyUrl(uid);
  if (!url) {
    throw new Error("Certificate UID is required to generate a QR code.");
  }

  return QRCode.toDataURL(url, {
    width: 1024,
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#064e3b", light: "#ffffff" },
  });
};

export const downloadCertificateQr = async (uid) => {
  const trimmed = String(uid ?? "").trim();
  const dataUrl = await generateCertificateQrDataUrl(trimmed);

  const link = document.createElement("a");
  link.download = `certificate-qr-${trimmed}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  link.remove();

  return dataUrl;
};
