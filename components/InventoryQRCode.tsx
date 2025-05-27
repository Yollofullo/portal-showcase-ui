import { useState } from "react";
import QRCode from "qrcode.react";
import { sanitizeQRData } from "../utils/sanitize";

export default function InventoryQRCode({ id }: { id: string }) {
  const [scanResult, setScanResult] = useState("");

  const handleScan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeQRData(e.target.value);
    setScanResult(sanitized || "");
    if (!sanitized) alert("Invalid QR code scanned.");
  };

  return (
    <div className="bg-white rounded-xl shadow p-5 w-full max-w-md mx-auto text-center">
      <h3 className="text-lg font-semibold mb-3">Inventory QR Code</h3>
      <QRCode value={id} size={128} className="mx-auto mb-4" />
      <input
        className="border rounded w-full px-4 py-2 text-sm"
        placeholder="Enter or scan result..."
        value={scanResult}
        onChange={handleScan}
      />
    </div>
  );
}