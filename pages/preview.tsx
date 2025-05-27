import InventoryQRCode from "../components/InventoryQRCode";
import WarehousePlaceholderMap from "../components/WarehousePlaceholderMap";
import OptimizedAssetImage from "../components/OptimizedAssetImage";
import InvoiceDownload from "../components/InvoiceDownload";

export default function Preview() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 space-y-12">
      <h1 className="text-3xl font-bold text-center text-gray-800">🔍 Portal Feature Preview</h1>

      <section>
        <InventoryQRCode id="INV-1001" />
      </section>

      <section>
        <WarehousePlaceholderMap />
      </section>

      <section>
        <OptimizedAssetImage />
      </section>

      <section>
        <InvoiceDownload />
      </section>
    </div>
  );
}