'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ReportContent() {
  const searchParams = useSearchParams();
  const userEmail = searchParams.get('email') || 'usuario@ayuno.com';

  const [weightHistory, setWeightHistory] = useState<any[]>([]);
  const [targetWeight, setTargetWeight] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const weightRes = await fetch(`/api/weight?email=${encodeURIComponent(userEmail)}`);
        const weightData = await weightRes.json();
        if (weightData.success) {
          setWeightHistory(weightData.weights);
          setTargetWeight(weightData.target_weight);
        }
      } catch (err) {
        console.error('Error al cargar datos para el reporte:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [userEmail]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Generando reporte médico...</div>;
  }

  const initialWeight = weightHistory.length > 0 ? weightHistory[0].weight_kg : 'N/A';
  const currentWeight = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight_kg : 'N/A';

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-lg my-10 space-y-6 print:shadow-none print:m-0 print:p-0">
      
      {/* Cabecera del Reporte (Oculta al imprimir si se desea, o limpia para PDF) */}
      <div className="flex justify-between items-border border-b pb-6 border-gray-200">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Mi Ayuno • Informe Clínico</h1>
          <p className="text-xs text-gray-500 mt-1">Resumen de Evolución Metabólica y Antropométrica</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">Verificado ✓</span>
          <p className="text-[10px] text-gray-400 mt-1">Fecha: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Datos del Paciente / Usuario */}
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500 block text-xs">Paciente / Usuario:</span>
          <span className="font-bold text-gray-800">{userEmail}</span>
        </div>
        <div>
          <span className="text-gray-500 block text-xs">Meta Objetivo:</span>
          <span className="font-bold text-indigo-600">{targetWeight ? `${targetWeight} kg` : 'No definida'}</span>
        </div>
      </div>

      {/* Resumen de Métricas */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
          <span className="text-xs text-purple-600 block uppercase font-bold">Peso Inicial</span>
          <span className="text-xl font-black text-purple-900">{initialWeight} kg</span>
        </div>
        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
          <span className="text-xs text-indigo-600 block uppercase font-bold">Peso Actual</span>
          <span className="text-xl font-black text-indigo-900">{currentWeight} kg</span>
        </div>
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
          <span className="text-xs text-emerald-600 block uppercase font-bold">Total Registros</span>
          <span className="text-xl font-black text-emerald-900">{weightHistory.length}</span>
        </div>
      </div>

      {/* Tabla de Historial de Pesos */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Historial de Registros Antropométricos</h3>
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-xs text-gray-600 uppercase">
                <th className="p-3">Fecha</th>
                <th className="p-3">Peso Registrado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {weightHistory.map((w: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="p-3 text-gray-600">{new Date(w.log_date).toLocaleDateString()}</td>
                  <td className="p-3 font-bold text-gray-900">{w.weight_kg} kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Botón de Impresión / Guardar como PDF */}
      <div className="pt-4 flex gap-4 print:hidden">
        <button 
          onClick={handlePrint}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all text-center"
        >
          🖨️ Imprimir / Guardar como PDF
        </button>
      </div>

      <div className="text-center pt-4 border-t border-gray-100 print:mt-10">
        <p className="text-[10px] text-gray-400">Generado automáticamente por Mi Ayuno SaaS • Herramienta de apoyo clínico y nutricional.</p>
      </div>

    </div>
  );
}

export default function ReportPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <Suspense fallback={<div className="text-center py-20 text-gray-500">Cargando reporte...</div>}>
        <ReportContent />
      </Suspense>
    </div>
  );
}
