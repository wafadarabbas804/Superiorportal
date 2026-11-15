'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import ChalanView from '@/components/ChalanView';
import { GraduationCap, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

const DEPARTMENTS = [
  'BS Computer Science (BSCS)',
  'BS Information Technology (BSIT)',
  'BS Software Engineering (BSSE)',
  'Bachelor of Business Administration (BBA)',
  'BS English',
  'BS Mathematics',
  'FSc Pre-Medical',
  'FSc Pre-Engineering',
  'ICS (Computer Science)',
  'I.Com (Commerce)',
  'Other / Postgraduate'
];

export default function RegistrationForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    rollNumber: '',
    studentPhone: '',
    studentEmail: '',
    parentPhone: '',
    department: DEPARTMENTS[0],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredStudent, setRegisteredStudent] = useState<any | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const generateChalanNo = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    const year = new Date().getFullYear();
    return `SCW-${year}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.fullName.trim() || !formData.rollNumber.trim() || !formData.studentPhone.trim()) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    try {
      const { data: existing } = await supabase
        .from('convocation_registrations')
        .select('*')
        .eq('roll_number', formData.rollNumber.trim().toUpperCase())
        .maybeSingle();

      if (existing) {
        setRegisteredStudent(existing);
        setLoading(false);
        return;
      }

      const chalanNo = generateChalanNo();

      const newRecord = {
        chalan_no: chalanNo,
        full_name: formData.fullName.trim(),
        roll_number: formData.rollNumber.trim().toUpperCase(),
        student_phone: formData.studentPhone.trim(),
        student_email: formData.studentEmail.trim().toLowerCase(),
        parent_phone: formData.parentPhone.trim(),
        department: formData.department,
        amount: Number(process.env.NEXT_PUBLIC_CHALAN_AMOUNT) || 6000,
        payment_status: 'pending_payment',
      };

      const { data, error: insertErr } = await supabase
        .from('convocation_registrations')
        .insert([newRecord])
        .select()
        .single();

      if (insertErr) {
        throw insertErr;
      }

      setRegisteredStudent(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while submitting registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (registeredStudent) {
    return <ChalanView student={registeredStudent} />;
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
      {/* College Banner Header - Subtle Frosted Glass Badge */}
      <div className="text-center mb-6">
        <div className="inline-block bg-white/30 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl border border-white/50">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0C7E81] tracking-tight">
            Superior College Wazirabad
          </h1>
          <div className="mt-1 flex items-center justify-center gap-2">
            <span className="h-px w-6 bg-[#0C7E81]/40"></span>
            <p className="text-xs sm:text-sm text-slate-900 font-extrabold uppercase tracking-wider">
              Annual Convocation 2026 Registration
            </p>
            <span className="h-px w-6 bg-[#0C7E81]/40"></span>
          </div>
        </div>
      </div>

      {/* Main Registration Card - Ultra Glassmorphism */}
      <div className="bg-white/55 backdrop-blur-md rounded-2xl border border-white/60 shadow-2xl p-4 sm:p-8 md:p-10">
        <div className="border-b border-slate-100 pb-4 mb-5 sm:mb-6">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Student Registration Form</h2>
          <p className="text-[11px] sm:text-xs text-slate-500">Please enter accurate and verified details.</p>
        </div>

        {error && (
          <div className="mb-5 p-3 sm:p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {/* Student Name */}
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Muhammad Ali"
                className="w-full px-3.5 py-2 sm:py-2.5 rounded-lg border border-slate-300/80 bg-white/40 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#0C7E81] text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-500 transition"
              />
            </div>

            {/* Roll Number */}
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                College Roll Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="rollNumber"
                required
                value={formData.rollNumber}
                onChange={handleChange}
                placeholder="e.g. BSCS-22-105"
                className="w-full px-3.5 py-2 sm:py-2.5 rounded-lg border border-slate-300/80 bg-white/40 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#0C7E81] text-xs sm:text-sm font-mono font-medium text-slate-900 placeholder:text-slate-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {/* Student Phone */}
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Student Phone / WhatsApp <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="studentPhone"
                required
                value={formData.studentPhone}
                onChange={handleChange}
                placeholder="03001234567"
                className="w-full px-3.5 py-2 sm:py-2.5 rounded-lg border border-slate-300/80 bg-white/40 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#0C7E81] text-xs sm:text-sm font-mono font-medium text-slate-900 placeholder:text-slate-500 transition"
              />
            </div>

            {/* Parent Phone */}
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Parent / Guardian Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="parentPhone"
                required
                value={formData.parentPhone}
                onChange={handleChange}
                placeholder="03009876543"
                className="w-full px-3.5 py-2 sm:py-2.5 rounded-lg border border-slate-300/80 bg-white/40 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#0C7E81] text-xs sm:text-sm font-mono font-medium text-slate-900 placeholder:text-slate-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {/* Student Email */}
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Student Gmail / Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="studentEmail"
                required
                value={formData.studentEmail}
                onChange={handleChange}
                placeholder="student@gmail.com"
                className="w-full px-3.5 py-2 sm:py-2.5 rounded-lg border border-slate-300/80 bg-white/40 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#0C7E81] text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-500 transition"
              />
            </div>

            {/* Degree / Department */}
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Department / Program <span className="text-red-500">*</span>
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3.5 py-2 sm:py-2.5 rounded-lg border border-slate-300/80 bg-white/40 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#0C7E81] text-xs sm:text-sm font-medium text-slate-900 transition"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 sm:px-6 bg-[#0C7E81] hover:bg-[#096366] text-white font-bold rounded-xl transition shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer text-xs sm:text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                <span>Processing & Generating Chalan...</span>
              </>
            ) : (
              <>
                <span>Register & Generate Chalan Form</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
