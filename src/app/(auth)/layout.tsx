// Layout partagé pour les pages d'authentification (connexion, inscription)
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "var(--bg)" }}
    >
      {/* Ambient glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(240,168,50,0.06) 0%, transparent 70%)",
        }}
      />
      <div className="w-full max-w-md relative z-10">
        {children}
      </div>
    </div>
  );
}
