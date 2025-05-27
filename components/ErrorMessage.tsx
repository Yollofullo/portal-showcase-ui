import React from 'react'; // Add React import for JSX

export default function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="bg-red-100 text-red-800 p-4 rounded">
      <p>{message}</p>
    </div>
  );
}
