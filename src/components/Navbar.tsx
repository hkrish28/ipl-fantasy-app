import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md px-4 py-3">
      <div className="flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-red-600">
          IPL Fantasy
        </Link>

        <button
          className="md:hidden text-gray-700"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          ☰
        </button>

        <div className="hidden md:flex space-x-4">
          <NavLinks />
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="flex flex-col mt-2 md:hidden space-y-2">
          <NavLinks />
        </div>
      )}
    </nav>
  );
}

function NavLinks() {
  return (
    <>
      <Link href="/dashboard" className="text-sm hover:underline">
        Dashboard
      </Link>
      <Link href="/join" className="text-sm hover:underline">
        Join
      </Link>
      <Link href="/create" className="text-sm hover:underline">
        Create
      </Link>
    </>
  );
}
