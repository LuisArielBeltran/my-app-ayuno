'use client';
import { useState, useRef, useEffect } from 'react';

export default function AICoachChat({ email }: { email: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: '¡Hola! Soy tu coach personal de "TIENES EL CONTROL". Estoy aquí 24/7 para resolver cualquier duda sobre tu dieta, tus porciones, el ayuno o si tienes una antojo repentino. ¿En qué te ayudo ahora? 💪' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userText = inputMessage;
    setInputMessage('');
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      // Simulamos o conectamos con tu endpoint de IA inteligente
      // Aquí puedes conectar tu API de IA existente (ej. /api/ai/chat o similar)
      const res = await fetch('/api/ai/analyze-food', { // O una ruta específica de chat si prefieres
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userText, email })
      });

      // Como alternativa robusta para el coach conversacional si aún no tienes el endpoint de chat de texto libre, 
      // respondemos con empatía experta basada en nutrición:
      setTimeout(() => {
        let assistantReply = "¡Entiendo perfecto! Recuerda mantener tu hidratación alta y seguir tu plan de objetivos. ¿Te gustaría que revisemos alguna de las recetas recomendadas para este momento?";
        
        const lower = userText.toLowerCase();
        if (lower.includes('hambre') || lower.includes('ansiedad') || lower.includes('comer')) {
          assistantReply = "Es completamente normal sentir un poco de ansiedad al principio. Prueba tomando un vaso grande de agua con unas gotas de limón o un té verde sin azúcar. ¡Tú tienes el control, no la comida! 💧";
        } else if (lower.includes('agua') || lower.includes('cuanto')) {
          assistantReply = "Te recomiendo apuntar a tus 8 vasos diarios. Si estás en movimiento o entrenando, ¡necesitas un poco más para mantener el metabolismo al 100%!";
        } else if (lower.includes('romper') || lower.includes('ayuno')) {
          assistantReply = "Si vas a romper tu ayuno, hazlo con proteínas limpias o grasas saludables (como huevos, palta o un caldo de huesos) para evitar picos de insulina bruscos.";
        }

        setMessages((prev) => [...prev, { role: 'assistant', text: assistantReply }]);
        setLoading(false);
      }, 1000);

    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: 'assistant', text: 'Ups, tuve un pequeño problema de conexión, pero estoy aquí contigo. Inténtalo de nuevo en un segundito.' }]);
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Botón flotante para abrir el chat */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white p-4 rounded-full shadow-2xl flex items-center gap-3 transition-all transform hover:scale-105 group"
        >
          <span className="text-2xl animate-bounce">🤖</span>
          <span className="font-bold text-sm tracking-wide pr-2 hidden md:inline">¿Hablamos con tu Coach?</span>
        </button>
      )}

      {/* Ventana de Chat Desplegable */}
      {isOpen && (
        <div className="bg-white w-[90vw] sm:w-[380px] h-[500px] rounded-3xl shadow-2xl border border-indigo-100 flex flex-col overflow-hidden animate-fade-in-up">
          
          {/* Header del Chat */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
                🧠
              </div>
              <div>
                <h4 className="font-bold text-sm">Coach TIENES EL CONTROL</h4>
                <span className="text-[10px] text-indigo-200 flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span> En línea 24/7
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white text-xl font-bold px-2 py-1"
            >
              ✕
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl border border-gray-100 text-xs text-gray-400 animate-pulse">
                  El coach está escribiendo...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input de Mensaje */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              placeholder="Pregúntale algo a tu coach..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 p-3 border border-gray-200 rounded-xl text-xs focus:border-indigo-600 outline-none bg-gray-50"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded-xl text-xs font-bold transition-all shadow-md disabled:opacity-50"
            >
              Enviar
            </button>
          </form>

        </div>
      )}
    </div>
  );
}
