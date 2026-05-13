import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/design-system/atoms/Card";
import { Button } from "@/design-system/atoms/Button";
import { tokens } from "@/design-system/tokens";

interface AdminLoginProps {
  onLogin: (secret: string) => void;
  error?: string;
}

export default function AdminLogin({ onLogin, error }: AdminLoginProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) {
      setLocalError(t("admin_login_error_required"));
      return;
    }
    onLogin(input.trim());
  };

  return (
    <div className="min-h-screen bg-[#F7F4EF] dark:bg-[#0E0818] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-coral/10 rounded-full animate-pulse"></div>
            <img 
              src="https://static.readdy.ai/image/c3c070ed3a92273f043678549554b0d6/e3451f52961636b2aea237770c224254.png"
              alt="Admin Icon"
              className="w-full h-full object-contain relative z-10"
            />
          </div>
          <h1 className="text-3xl font-black text-[#1A1410] dark:text-[#E8E0F5] tracking-tight" style={{ fontFamily: tokens.typography.fontFamily }}>
            {t("admin_login_title")}
          </h1>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#7A7068] dark:text-[#B89FD8] mt-2">Accès Administrateur</p>
        </div>

        <Card className="p-8 !rounded-[2.5rem] border-[#D4C8BC]/40 dark:border-[#3B2060]/40">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-[#7A7068] dark:text-[#B89FD8] mb-2 ml-1">
                {t("admin_login_password")}
              </label>
              <input
                type="password"
                value={input}
                onChange={(e) => { setInput(e.target.value); setLocalError(""); }}
                placeholder={t("admin_login_placeholder")}
                className="w-full px-4 py-3.5 bg-[#F7F4EF] dark:bg-[#0E0818] border border-[#D4C8BC]/40 dark:border-[#3B2060]/40 rounded-2xl text-sm text-[#1A1410] dark:text-[#E8E0F5] focus:outline-none focus:border-coral transition-all"
                autoFocus
              />
              {(localError || error) && (
                <p className="text-xs text-coral mt-2 flex items-center gap-2 font-bold ml-1">
                  <i className="ri-error-warning-line"></i>{localError || error}
                </p>
              )}
            </div>
            <Button
              type="submit"
              variant="primary"
              className="w-full !py-4 shadow-xl shadow-coral/20"
            >
              {t("admin_login_button")}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}