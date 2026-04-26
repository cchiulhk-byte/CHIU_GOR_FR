import { useTranslation } from 'react-i18next';

export default function WhatsAppButton() {
  const { i18n } = useTranslation();
  
  // WhatsApp number - you should replace this with your actual number
  const whatsappNumber = "85290000000"; // Example HK number
  const message = i18n.language === 'zh-HK' 
    ? "你好超哥，我想查詢法語課程。" 
    : "Bonjour, I'm interested in your French courses.";
  
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:scale-110 transition-transform duration-300 group"
      aria-label="WhatsApp"
    >
      <i className="ri-whatsapp-line text-3xl"></i>
      <span className="absolute right-16 bg-white text-gray-800 px-3 py-1 rounded-lg text-sm font-bold shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
        {i18n.language === 'zh-HK' ? '立即查詢' : 'Contact Me'}
      </span>
    </a>
  );
}
