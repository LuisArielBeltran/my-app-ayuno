'use client';
import { useState, useEffect } from 'react';

export default function UserDashboard() {
  const [waterHistory, setWaterHistory] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchStats = async () => {
      const email = localStorage.getItem('user_email');
      if (!email) return;

      try {
        const res = await fetch(`/api/stats?email=${encodeURIComponent(email)}`);
        const data = await res.json();
        if (data.waterHistory) {
          setWaterHistory(data.waterHistory);
        }
      } catch (error) {
        console.error('Error cargando estadísticas:', error);
      }
    };
    fetchStats();
  }, [isOpen]);

  return (
    <div className="w-full max-w-sm mx-auto mb-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-blue-50 text-blue-600 font-bold py-3 px-4 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors flex justify-between items-center"
      >
        <span>📊 Ver mis estadísticas</span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-2 animate-fade-in-up">
          <h3 className="text-md font-bold text-gray-800 mb-4">Historial de Hidratación (7 días)</h3>
          
          {waterHistory.length === 0 ? (
            <p className="text-sm text-gray-500">Aún no hay datos suficientes para mostrar.</p>
          ) : (
            <div className="space-y-3">
              {waterHistory.map((log, index) => {
                const date = new Date(log.log_date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
                const percentage = Math.min((log.glasses / 8) * 100, 100);
                
                return (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-xs font-medium text-gray-500 w-12 text-right">{date}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-3 relative overflow-hidden">
                      <div 
                        className={`absolute top-0 left-0 h-full rounded-full ${log.glasses >= 8 ? 'bg-green-500' : 'bg-blue-500'}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-bold text-gray-700 w-8">{log.glasses}/8</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
