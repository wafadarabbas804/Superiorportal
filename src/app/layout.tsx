import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import SecurityShield from "@/components/SecurityShield";
import "./globals.css";

export const metadata: Metadata = {
  title: "Convocation Registration 2026 - Superior College Wazirabad",
  description: "Official convocation registration and chalan portal for Superior College Wazirabad students.",
  icons: {
    icon: [
      { url: "/superior-logo.png", href: "/superior-logo.png" },
    ],
    shortcut: "/superior-logo.png",
    apple: "/superior-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        suppressHydrationWarning
        className="antialiased flex flex-col min-h-screen bg-slate-50 text-slate-900"
      >
        <SecurityShield />
        <div className="no-print">
          <Navbar />
        </div>
        <main className="flex-1">{children}</main>
        <footer className="no-print bg-[#0C7E81] text-white py-8 border-t border-[#096366]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/20 pb-6 text-center md:text-left">
              {/* College Logo & Info */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-16 h-16 bg-white rounded-full p-1.5 shadow-md flex-shrink-0">
                  <img
                    src="/superior-logo.png"
                    alt="Superior Group of Colleges Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-base font-extrabold tracking-wide uppercase text-white">
                    Superior College Wazirabad
                  </h3>
                  <p className="text-xs text-white mt-0.5">
                    Convocation Registration & Chalan Portal 2026
                  </p>
                  <p className="text-[11px] text-white/90 mt-0.5">
                    Excellence in Learning, Innovation & Character Building.
                  </p>
                </div>
              </div>

              {/* Contact Us */}
              <div className="text-center md:text-right">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-2">
                  Contact Us
                </h4>
                <div className="text-xs text-white space-y-1">
                  <p>📍 Near Hassan Abdullah CNG Bypass Wazirabad</p>
                  <p>📞 Phone: <span className="font-mono font-semibold">0314-7206680</span></p>
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div className="pt-4 text-center text-xs text-white flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>© 2026 Superior Group of Colleges Wazirabad Campus. All Rights Reserved.</p>
              <p className="text-[11px] text-white/90">For fee & registration queries, contact Accounts Office.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
