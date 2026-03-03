import './globals.css';
import Providers from './providers';
import Navbar from '@/components/Navbar';
import MonitoringInit from '@/components/MonitoringInit';
import WhatsAppSupportChat from '@/components/WhatsAppSupportChat';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0d0a06] text-[#f2e9dc]">
        <Providers>
          <MonitoringInit />
          <Navbar />
          {children}
          <WhatsAppSupportChat />

          <footer className="mt-12 border-t border-[#4a3a22] bg-[linear-gradient(180deg,_#171109_0%,_#0d0a06_100%)] py-12">
            <div className="mx-auto grid max-w-7xl gap-8 px-4 md:grid-cols-3">
              <div>
                <p
                  className="text-xl uppercase tracking-[0.22em] text-[#d6b57c]"
                  style={{ fontFamily: 'Didot, Garamond, "Times New Roman", serif' }}
                >
                  LadyB Lux Events
                </p>
                <p className="mt-3 max-w-xs text-sm text-[#cdbca3]">
                  Premium vendor discovery and elevated event execution.
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#a88d62]">
                  Navigation
                </p>
                <div className="mt-3 flex flex-col gap-2 text-sm text-[#e8dccb]">
                  <a href="/" className="transition hover:text-[#d6b57c]">
                    Home
                  </a>
                  <a href="/auth/register" className="transition hover:text-[#d6b57c]">
                    Get Started
                  </a>
                  <a href="/dashboard/customer" className="transition hover:text-[#d6b57c]">
                    Dashboard
                  </a>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#a88d62]">
                  Signature
                </p>
                <p className="mt-3 text-sm text-[#cdbca3]">
                  Crafted for modern weddings, private affairs, and executive
                  celebrations.
                </p>
              </div>
            </div>

            <div className="mx-auto mt-8 max-w-7xl px-4">
              <div className="h-px bg-[linear-gradient(90deg,rgba(180,143,79,0)_0%,rgba(214,181,124,0.7)_50%,rgba(180,143,79,0)_100%)]" />
              <p className="mt-5 text-center text-xs uppercase tracking-[0.12em] text-[#9f8961]">
                © 2026 LadyB Lux Events. All rights reserved.
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
