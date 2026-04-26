import { useState } from "react";

interface AdminLoginProps {
  onLogin: (secret: string) => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) {
      setError("Veuillez saisir le mot de passe administrateur");
      return;
    }
    onLogin(input.trim());
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-coral flex items-center justify-center mx-auto mb-4">
            <i className="ri-shield-keyhole-line text-white text-2xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "Candara, 'Nunito', sans-serif" }}>
            Tableau de bord
          </h1>
          <p className="text-gray-500 text-sm mt-1">Chiu Gor French</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Mot de passe administrateur
            </label>
            <input
              type="password"
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(""); }}
              placeholder="Saisir le mot de passe"
              className="w-full p-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral"
              autoFocus
            />
            {error && (
              <p className="text-xs text-coral mt-1.5 flex items-center gap-1">
                <i className="ri-error-warning-line"></i>{error}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-coral text-white font-medium text-sm hover:bg-coral/90 transition-all cursor-pointer whitespace-nowrap"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}