'use client';
import { useState, useEffect } from 'react';

export default function CommunityCircles() {
  const [posts, setPosts] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/community');
      const data = await res.json();
      if (data.posts) setPosts(data.posts);
    } catch (err) {
      console.error('Error cargando comunidad:', err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePost = async () => {
    if (!newMessage.trim()) return;
    setIsSubmitting(true);
    
    const email = localStorage.getItem('user_email') || 'Anónimo';
    
    try {
      await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, protocol: '16/8', message: newMessage }),
      });
      setNewMessage('');
      fetchPosts(); // Recargar los mensajes
    } catch (err) {
      console.error('Error publicando:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatUsername = (email: string) => {
    if (email === 'Anónimo') return 'Usuario Anónimo';
    return email.split('@')[0];
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-sm mx-auto mb-6">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-800">🌍 Círculos de Ayuno</h2>
        <p className="text-xs text-gray-500">Motívate con la comunidad</p>
      </div>

      {/* Caja para publicar */}
      <div className="mb-6 relative">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Comparte tu logro de hoy o una receta..."
          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none resize-none h-20"
          maxLength={150}
        />
        <button
          onClick={handlePost}
          disabled={isSubmitting || !newMessage.trim()}
          className="absolute bottom-3 right-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-xs font-bold py-1.5 px-4 rounded-lg transition-colors"
        >
          {isSubmitting ? '...' : 'Publicar'}
        </button>
      </div>

      {/* Feed de mensajes */}
      <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
        {posts.length === 0 ? (
          <p className="text-center text-xs text-gray-400 py-4">Sé el primero en publicar algo.</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="border-b border-gray-100 pb-3 last:border-0">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-sm text-gray-800">@{formatUsername(post.email)}</span>
                <span className="text-[10px] font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                  {post.protocol}
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed break-words">{post.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
