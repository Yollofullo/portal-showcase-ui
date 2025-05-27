export default function WarehousePlaceholderMap() {
  return (
    <div className="bg-white rounded-xl shadow p-5 w-full max-w-2xl mx-auto text-center">
      <h3 className="text-lg font-semibold mb-3">Warehouse Layout Preview</h3>
      <img
        src="/assets/warehouse_map_placeholder.png"
        alt="Warehouse Map"
        className="rounded-lg mx-auto border"
      />
      <p className="text-sm text-gray-500 mt-2">Live mapping coming soon via MapLibre integration.</p>
    </div>
  );
}