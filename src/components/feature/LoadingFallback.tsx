import { useEffect, useState } from 'react';

export default function LoadingFallback() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Delay showing the loading state to avoid flickering on fast connections
    const timer = setTimeout(() => setShow(true), 300);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-[#F7F4EF] dark:bg-[#0E0818]">
      <div className="h-full bg-coral animate-shimmer" style={{ width: '40%', backgroundSize: '200% 100%' }}></div>
    </div>
  );
}
