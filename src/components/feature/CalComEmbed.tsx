interface CalComEmbedProps {
  calUrl?: string;
}

export default function CalComEmbed({ calUrl }: CalComEmbedProps) {
  if (!calUrl) {
    return (
      <div className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0B1221] p-6 text-center">
        <p className="text-base font-semibold text-gray-900 dark:text-white mb-2">Cal.com booking is not configured</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          To show available lesson slots from your Cal.com calendar, set <code className="rounded bg-gray-100 px-1 py-0.5">VITE_CAL_COM_URL</code> to your Cal.com booking page URL in your app environment.
        </p>
      </div>
    );
  }

  const src = calUrl.includes("?") ? `${calUrl}&embed=1` : `${calUrl}?embed=1`;

  return (
    <div className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0B1221] overflow-hidden">
      <div className="bg-gray-50 dark:bg-[#111827] px-5 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Book with Cal.com</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">See your live availability and select an available time slot.</p>
      </div>
      <div className="w-full h-[720px]">
        <iframe
          className="w-full h-full"
          src={src}
          title="Cal.com booking widget"
          frameBorder="0"
          loading="lazy"
          allow="clipboard-write; camera; microphone; autoplay; encrypted-media"
        />
      </div>
    </div>
  );
}
