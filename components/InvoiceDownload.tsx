import { useSession } from "@supabase/auth-helpers-react";

export default function InvoiceDownload() {
  const session = useSession();

  return (
    <div className="bg-white rounded-xl shadow p-5 w-full max-w-md mx-auto text-center">
      <h3 className="text-lg font-semibold mb-3">Sample Invoice</h3>
      {!session ? (
        <p className="text-red-500">🔒 Please log in to download invoices.</p>
      ) : (
        <a
          href="/api/download-invoice"
          className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Download Invoice PDF
        </a>
      )}
    </div>
  );
}