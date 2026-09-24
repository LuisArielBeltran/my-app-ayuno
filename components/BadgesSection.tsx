'use client';
import { useState, useEffect } from 'react';

export default function BadgesSection({ email }: { email: string }) {
  const [badges, setBadges] = useState<any[]>([]);

  useEffect(() => {
    if (!email) return;
    fetch(`/api/badges?email=${encodeURIComponent(email)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setBadges(data.badges);
      })
      .catch((err) => console.error('Error cargando medallas:', err));
  }, [email]);

  return (
    <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">Logros & Gamificación</span>
          <h3 className="text-xl font-bold text-gray-900">Tus Medallas y Trofeos</h3>
        </div>
        <span className="text-2xl">🏆</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {badges.map((badge) => {
          const isUnlocked = !!badge.unlocked_at;
          return (
            <div 
              key={badge.badge_code} 
              className={`p-4 rounded-xl border flex flex-col items-center text-center transition-all ${
                isUnlocked 
                  ? 'bg-white border-amber-300 shadow-sm' 
                  : 'bg-gray-100/60 border-gray-200 opacity-50 grayscale'
              }`}
            >
              <span className="text-3xl mb-2">{badge.icon}</span>
              <h4 className="font-bold text-xs text-gray-900 mb-1">{badge.title}</h4>
              <p className="text-[10px] text-gray-500 leading-tight">{badge.description}</p>
              {isUnlocked ? (
                <span className="mt-2 text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  ¡Desbloqueado! ✓
                </span>
              ) : (
                <span className="mt-2 text-[9px] bg-gray-200 text-gray-600 font-medium px-2 py-0.5 rounded-full">
                  Bloqueado 🔒
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
