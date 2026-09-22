'use client';
import { useState, useEffect } from 'react';

export default function LearningCenter() {
  const [articles, setArticles] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch('/api/learn');
        const data = await res.json();
        if (data.articles) {
          setArticles(data.articles);
        }
      } catch (err) {
        console.error('Error cargando artículos:', err);
      }
    };
    fetchArticles();
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-sm mx-auto mb-6">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-800">📚 Academia del Ayuno</h2>
        <p className="text-xs text-gray-500">Aprende a dominar tu metabolismo</p>
      </div>

      <div className="space-y-4">
        {articles.map((article) => {
          const isExpanded = expandedId === article.id;
          return (
            <div key={article.id} className="border border-gray-100 rounded-xl overflow-hidden bg-gray-50/50">
              <div 
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors flex justify-between items-start"
                onClick={() => setExpandedId(isExpanded ? null : article.id)}
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    {article.category}
                  </span>
                  <h3 className="text-sm font-bold text-gray-800 mt-2">{article.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{article.summary}</p>
                  <div className="text-[10px] text-gray-400 mt-2">
                    ⏱️ {article.read_time} min de lectura
                  </div>
                </div>
                <span className="text-gray-400 text-xs mt-1">{isExpanded ? '▲' : '▼'}</span>
              </div>

              {isExpanded && (
                <div className="p-4 pt-0 border-t border-gray-100 text-xs text-gray-700 leading-relaxed bg-white animate-fade-in">
                  {article.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
