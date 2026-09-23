'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function Navbar() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  return (
    <nav className="bg-white border-b border-gray-100 py-4 px-6 flex justify-between items-center max-w-4xl mx-auto rounded-2xl my-4 shadow-sm">
      <Link href={email ? `/dashboard?email=${encodeURIComponent(email)}` : '/'} className="font-black text-xl text-indigo-600 flex items-center gap-2">
        🔥 AyunoApp
      </Link>
      <div className="flex items-center gap-4">
        {email ? (
          <>
            <span className="text-xs text-gray-500 hidden sm:inline">👤 {email}</span>
            <Link href={`/dashboard?email=${encodeURIComponent(email)}`} className="text-sm font-bold text-gray-700 hover:text-indigo-600">
              Panel
            </Link>
            <Link href="/" className="text-sm font-bold text-rose-600 hover:text-rose-700">
              Cerrar Sesión
            </Link>
          </>
        ) : (
          <>
            <Link href="/login" className="text-sm font-bold text-gray-700 hover:text-indigo-600">
              Iniciar Sesión
            </Link>
            <Link href="/register" className="text-sm font-bold bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-all shadow-md">
              Registrarse
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
