// components/UserProfile.tsx
'use client';

import { useState, useEffect } from 'react';

export default function UserProfile() {
  const [email, setEmail] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('user_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setIsSaved(true);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim().length > 0) {
      localStorage.setItem('user_email', email.trim());
      setIsSaved(true);
    }
  };

  const handleEdit = () => {
    setIsSaved(false);
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm mx-auto mb-6">
      {isSaved ? (
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-400 font-medium">Usuario activo</p>
            <p className="text-sm font-bold text-gray-700 truncate max-w-[200px]">{email}</p>
          </div>
          <button 
            onClick={handleEdit}
            className="text-xs text-green-600 hover:underline font-semibold"
          >
            Cambiar
          </button>
        </div>
      ) : (
        <form onSubmit={handleSave} className="flex gap-2">
          <input 
            type="email" 
            placeholder="Tu email para guardar datos..." 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full text-sm p-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <button 
            type="submit" 
            className="bg-green-500 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-green-600 transition-colors"
          >
            Guardar
          </button>
        </form>
      )}
    </div>
  );
}