import React from 'react';
import Link from 'next/link';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-black">
      <nav className="bg-gray-200 p-4 flex gap-6 text-sm font-medium">
        <Link href="/dashboard" className="hover:underline">Dashboard</Link>
        <Link href="/join" className="hover:underline">Join</Link>
        <Link href="/create" className="hover:underline">Create</Link>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
}
