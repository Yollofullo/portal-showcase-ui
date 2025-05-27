export default function NavBar() {
  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
      <h1 className="text-2xl font-bold">🚀 Portal</h1>
      <ul className="flex gap-6">
        {["Admin", "Operator", "Client"].map((role) => (
          <li key={role}>
            <a
              href={`/dashboard/${role.toLowerCase()}`}
              className="hover:underline focus:ring focus:ring-blue-300 rounded"
            >
              {role}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}