'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, UserPlus, Search, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group min-w-0">
            <div className="relative w-10 h-10 sm:w-13 sm:h-13 flex-shrink-0">
              <Image 
                src="/superior-logo.png" 
                alt="Superior Group of Colleges Logo" 
                fill 
                className="object-contain"
                priority
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-black text-base sm:text-lg tracking-tight text-[#0C7E81]">
                  SUPERIOR
                </span>
                <span className="text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-md bg-[#0C7E81]/10 text-[#0C7E81]">
                  Wazirabad
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-500 font-medium truncate">
                Convocation Portal
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-3">
            <Link 
              href="/track"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold text-gray-700 hover:text-[#0C7E81] hover:bg-[#0C7E81]/5 transition"
            >
              <Search className="w-4 h-4 text-[#0C7E81]" />
              <span>Chalan Status</span>
            </Link>

            <Link 
              href="/admin/login"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold bg-[#0C7E81] text-white hover:bg-[#096366] transition shadow-xs"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Portal</span>
            </Link>
          </nav>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-1.5">
            <Link
              href="/admin/login"
              className="p-2 rounded-lg bg-[#0C7E81] text-white hover:bg-[#096366] transition"
              title="Super Admin"
            >
              <ShieldCheck className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:text-[#0C7E81] hover:bg-slate-100 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-4 space-y-2 shadow-lg animate-in slide-in-from-top-2">
          <Link
            href="/track"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-800 hover:bg-[#0C7E81]/10 hover:text-[#0C7E81] transition"
          >
            <Search className="w-4 h-4 text-[#0C7E81]" />
            <span>Track & Check Chalan Status</span>
          </Link>
          <Link
            href="/admin/login"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-bold bg-[#0C7E81] text-white transition"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Super Admin Portal</span>
          </Link>
        </div>
      )}
    </header>
  );
}
