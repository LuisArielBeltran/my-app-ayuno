export const dynamic = 'force-dynamic'; // Evita cualquier caché estática

export default function DebugPage() {
  // Variables que Vercel inyecta automáticamente en cada compilación
  const commitSha = process.env.VERCEL_GIT_COMMIT_SHA || 'No disponible (entorno local)';
  const branch = process.env.VERCEL_GIT_COMMIT_REF || 'Desconocida';
  const buildTime = new Date().toISOString();

  return (
    <main style={{ padding: '40px', fontFamily: 'monospace', backgroundColor: '#0f172a', color: '#38bdf8', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '24px', color: '#f8fafc', marginBottom: '20px' }}>🔍 Diagnóstico en Vivo de Vercel</h1>
      
      <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', lineHeight: '1.6' }}>
        <p><strong>📌 Rama activa en Vercel:</strong> {branch}</p>
        <p><strong>🔑 Hash del Commit en ejecución:</strong> {commitSha}</p>
        <p><strong>⏱️ Momento de carga del servidor:</strong> {buildTime}</p>
      </div>

      <div style={{ marginTop: '20px', color: '#94a3b8', fontSize: '14px' }}>
        <p><strong>¿Cómo interpretamos esto?</strong></p>
        <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
          <li>Compara el <strong>Hash del Commit</strong> con el último commit que hiciste en GitHub.</li>
          <li>Si coinciden, <strong>Vercel SÍ tiene tu código nuevo</strong>, pero el problema es que la ruta principal (<code style={{color: '#f43f5e'}}>/</code>) sigue apuntando al archivo viejo o hay una redirección fallida.</li>
          <li>Si no coinciden o da error, Vercel está leyendo una rama o un repositorio completamente diferente al que estás editando.</li>
        </ul>
      </div>
    </main>
  );
}
