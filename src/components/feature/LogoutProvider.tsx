import React, { createContext, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

interface LogoutContextType {
  confirmLogout: () => void;
  isLoggingOut: boolean;
}

const LogoutContext = createContext<LogoutContextType | undefined>(undefined);

export const useLogout = () => {
  const context = useContext(LogoutContext);
  if (!context) throw new Error('useLogout must be used within a LogoutProvider');
  return context;
};

export const LogoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const fontNav = "'Chiron GoRound TC', Candara, 'Nunito', 'Segoe UI', sans-serif";

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setShowConfirm(false);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await supabase.auth.signOut();
    // Clear admin secret if exists
    sessionStorage.removeItem('adminSecret');
    setIsLoggingOut(false);
    navigate('/');
  };

  return (
    <LogoutContext.Provider value={{ confirmLogout: () => setShowConfirm(true), isLoggingOut }}>
      {children}
      
      {/* GLOBAL LOGOUT CONFIRMATION MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xl">
          <div className="relative w-full max-w-sm bg-[#1E0D38] rounded-[2.5rem] border border-white/10 p-10 shadow-[0_40px_100px_rgba(0,0,0,0.5)] text-center">
            <div className="w-24 h-24 mx-auto mb-6">
              <img 
                src="/logout-icon.jpg" 
                alt="Logout Warning"
                className="w-full h-full object-contain"
              />
            </div>
            <h3 className="text-2xl font-extrabold text-[#E8E0F5] mb-3 tracking-tight" style={{ fontFamily: fontNav }}>
              {t("admin_logout_confirm_title")}
            </h3>
            <p className="text-[#C4A8E8]/80 text-sm mb-10 leading-relaxed font-medium" style={{ fontFamily: fontNav }}>
              {t("admin_logout_confirm_desc")}
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleLogout}
                className="w-full px-6 py-4 rounded-2xl bg-coral text-white font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-coral/20"
                style={{ fontFamily: fontNav }}
              >
                {t("admin_logout_confirm_btn")}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="w-full px-6 py-4 rounded-2xl bg-white/5 text-[#C4A8E8] border border-white/10 font-bold text-sm hover:bg-white/10 transition-all"
                style={{ fontFamily: fontNav }}
              >
                {t("admin_logout_cancel_btn")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL LOGGING OUT SCREEN */}
      {isLoggingOut && (
        <div className="fixed inset-0 z-[20001] bg-black/70 backdrop-blur-3xl flex items-center justify-center p-4">
          <div className="w-full max-w-sm text-center">
            <div className="mb-10 relative inline-block">
              <div className="w-28 h-28 rounded-[2.5rem] bg-white dark:bg-[#1E0D38] shadow-2xl flex items-center justify-center mx-auto relative z-10 animate-bounce border border-white/10">
                <i className="ri-logout-circle-r-line text-coral text-6xl"></i>
              </div>
            </div>
            
            <h2 className="text-3xl font-extrabold text-white mb-3 tracking-tight" style={{ fontFamily: fontNav }}>
              {t("admin_logout_message")}
            </h2>
            <p className="text-[#C4A8E8] text-base font-medium mb-10 opacity-90" style={{ fontFamily: fontNav }}>
              {t("admin_logout_redirect")}
            </p>

            <div className="flex justify-center gap-3">
              <div className="w-3 h-3 bg-coral rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-3 h-3 bg-coral rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-3 h-3 bg-coral rounded-full animate-bounce"></div>
            </div>
          </div>
        </div>
      )}
    </LogoutContext.Provider>
  );
};
