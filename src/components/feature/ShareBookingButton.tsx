import { useState, useRef, useEffect } from "react";

interface ShareBookingButtonProps {
  courseId?: string;
  courseTitle?: string;
  variant?: "icon" | "full";
  className?: string;
}

export default function ShareBookingButton({
  courseId,
  courseTitle,
  variant = "full",
  className = "",
}: ShareBookingButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const baseUrl = window.location.origin;
  const shareUrl = courseId
    ? `${baseUrl}/booking?course=${courseId}`
    : `${baseUrl}/booking`;

  const shareText = courseTitle
    ? `Book a French lesson — ${courseTitle} with Chiu Gor French!`
    : "Book a French lesson with Chiu Gor French!";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowMenu(false);
      }, 2000);
    });
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setShowMenu(false);
  };

  const handleTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setShowMenu(false);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Chiu Gor French", text: shareText, url: shareUrl });
      } catch {
        // user cancelled
      }
      setShowMenu(false);
    }
  };

  const hasNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        onClick={() => setShowMenu((v) => !v)}
        className={`flex items-center gap-2 transition-all duration-200 cursor-pointer whitespace-nowrap
          ${variant === "full"
            ? "px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
            : "w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 justify-center"
          }`}
      >
        <i className="ri-share-line text-base"></i>
        {variant === "full" && <span>Share</span>}
      </button>

      {showMenu && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-fade-in">
          <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-400 font-medium">Share booking link</p>
          </div>

          {/* Copy link */}
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
              <i className={`text-sm ${copied ? "ri-check-line text-teal-500" : "ri-link text-gray-500"}`}></i>
            </div>
            <span>{copied ? "Copied!" : "Copy link"}</span>
          </button>

          {/* WhatsApp */}
          <button
            onClick={handleWhatsApp}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
              <i className="ri-whatsapp-line text-sm text-green-600"></i>
            </div>
            <span>WhatsApp</span>
          </button>

          {/* Telegram */}
          <button
            onClick={handleTelegram}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900/30">
              <i className="ri-telegram-line text-sm text-sky-500"></i>
            </div>
            <span>Telegram</span>
          </button>

          {/* Native share (mobile) */}
          {hasNativeShare && (
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer border-t border-gray-100 dark:border-gray-700"
            >
              <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                <i className="ri-share-box-line text-sm text-gray-500"></i>
              </div>
              <span>More options</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
