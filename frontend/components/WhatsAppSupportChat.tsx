'use client';

import { useMemo, useState } from 'react';

const DEFAULT_SUPPORT_PHONE = '2340000000000';
const DEFAULT_GREETING = 'Hello LadyB Lux Events support, I need help.';

export default function WhatsAppSupportChat() {
  const [open, setOpen] = useState(false);

  const phone = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP_NUMBER || DEFAULT_SUPPORT_PHONE;
  const greeting = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP_GREETING || DEFAULT_GREETING;

  const chatLink = useMemo(() => {
    const cleanPhone = phone.replace(/[^\d]/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(greeting)}`;
  }, [phone, greeting]);

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col items-end gap-3">
      {open && (
        <div className="w-[19rem] rounded-2xl border border-[#23673a] bg-[linear-gradient(165deg,_rgba(14,33,19,0.96),_rgba(7,20,12,0.98))] p-4 text-[#e9f8ee] shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
          <p className="text-xs uppercase tracking-[0.14em] text-[#8de1ad]">Support</p>
          <p className="mt-2 text-sm text-[#d7f1e1]">
            Need assistance? Chat with our team on WhatsApp now.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <a
              href={chatLink}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-[#25d366] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#062212] transition hover:bg-[#39df78]"
            >
              Start Chat
            </a>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-[#3f7b53] px-4 py-2 text-xs uppercase tracking-[0.12em] text-[#c9ead5] transition hover:border-[#62b882] hover:text-[#e8fff1]"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Open WhatsApp support chat"
        className="rounded-full border border-[#1f6e39] bg-[#25d366] px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#062212] shadow-[0_10px_28px_rgba(0,0,0,0.35)] transition hover:bg-[#39df78]"
      >
        WhatsApp Support
      </button>
    </div>
  );
}
