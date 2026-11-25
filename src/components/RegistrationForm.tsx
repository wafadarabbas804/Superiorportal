'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import ChalanView from '@/components/ChalanView';
import { GraduationCap, ArrowRight, Loader2, AlertCircle, Search, ChevronDown, Check } from 'lucide-react';
import { 
  validateAndSanitizeName, 
  validateAndSanitizeRollNumber, 
  validateAndSanitizePhone, 
  validateAndSanitizeEmail, 
  validateDepartment 
} from '@/lib/sanitize';

const DEPARTMENTS = [
  'BS Computer Science (BSCS)',
  'BS Information Technology (BSIT)',
  'BS Software Engineering (BSSE)',
  'Bachelor of Business Administration (BBA)',
  'BS English',
  'BS Mathematics',
  'BS Physics',
  'Bachelor of Science in Zoology',
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

  const [deptSearch, setDeptSearch] = useState('');
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const deptDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (deptDropdownRef.current && !deptDropdownRef.current.contains(event.target as Node)) {
        setIsDeptOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto focus search input when dropdown opens
  useEffect(() => {
    if (isDeptOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isDeptOpen]);

  const filteredDepartments = DEPARTMENTS.filter(dept =>
    dept.toLowerCase().includes(deptSearch.toLowerCase())
  );

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

    // 1. Strict security sanitization & validation
    const nameCheck = validateAndSanitizeName(formData.fullName);
    if (!nameCheck.valid) {
      setError(nameCheck.error || 'Invalid name');
      setLoading(false);
      return;
    }

    const rollCheck = validateAndSanitizeRollNumber(formData.rollNumber);
    if (!rollCheck.valid) {
      setError(rollCheck.error || 'Invalid roll number');
      setLoading(false);
      return;
    }

    const phoneCheck = validateAndSanitizePhone(formData.studentPhone, 'Student Phone');
    if (!phoneCheck.valid) {
      setError(phoneCheck.error || 'Invalid student phone');
      setLoading(false);
      return;
    }

    const parentPhoneCheck = validateAndSanitizePhone(formData.parentPhone, 'Parent Phone');
    if (!parentPhoneCheck.valid) {
      setError(parentPhoneCheck.error || 'Invalid parent phone');
      setLoading(false);
      return;
    }

    const emailCheck = validateAndSanitizeEmail(formData.studentEmail);
    if (!emailCheck.valid) {
      setError(emailCheck.error || 'Invalid email');
      setLoading(false);
      return;
    }

    const deptCheck = validateDepartment(formData.department, DEPARTMENTS);
    if (!deptCheck.valid) {
      setError(deptCheck.error || 'Invalid department');
      setLoading(false);
      return;
    }

    try {
      const { data: existing } = await supabase
        .from('convocation_registrations')
        .select('*')
        .eq('roll_number', rollCheck.value)
        .maybeSingle();

      if (existing) {
        setRegisteredStudent(existing);
        setLoading(false);
        return;
      }

      const chalanNo = generateChalanNo();

      const newRecord = {
        chalan_no: chalanNo,
        full_name: nameCheck.value,
        roll_number: rollCheck.value,
        student_phone: phoneCheck.value,
        student_email: emailCheck.value,
        parent_phone: parentPhoneCheck.value,
        department: deptCheck.value,
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

      {/* Main Registration Card - High Transparency so image shows through clearly */}
      <div className="bg-white/35 backdrop-blur-sm rounded-2xl border border-white/50 shadow-2xl p-4 sm:p-8 md:p-10">
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
              <label className="block text-[11px] sm:text-xs font-black text-slate-900 uppercase tracking-wider mb-1.5">
                Full Name <span className="text-red-500 font-black">*</span>
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
              <label className="block text-[11px] sm:text-xs font-black text-slate-900 uppercase tracking-wider mb-1.5">
                College Roll Number <span className="text-red-500 font-black">*</span>
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
              <label className="block text-[11px] sm:text-xs font-black text-slate-900 uppercase tracking-wider mb-1.5">
                Student Phone / WhatsApp <span className="text-red-500 font-black">*</span>
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
              <label className="block text-[11px] sm:text-xs font-black text-slate-900 uppercase tracking-wider mb-1.5">
                Parent / Guardian Phone <span className="text-red-500 font-black">*</span>
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
              <label className="block text-[11px] sm:text-xs font-black text-slate-900 uppercase tracking-wider mb-1.5">
                Student Gmail / Email <span className="text-red-500 font-black">*</span>
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

            {/* Degree / Department - Searchable Combobox */}
            <div className="relative" ref={deptDropdownRef}>
              <label className="block text-[11px] sm:text-xs font-black text-slate-900 uppercase tracking-wider mb-1.5">
                Department / Program <span className="text-red-500 font-black">*</span>
              </label>

              {/* Trigger Button */}
              <button
                type="button"
                onClick={() => {
                  setIsDeptOpen(!isDeptOpen);
                  setDeptSearch('');
                }}
                className="w-full px-3.5 py-2 sm:py-2.5 rounded-lg border border-slate-300/80 bg-white/40 focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#0C7E81] text-xs sm:text-sm font-medium text-slate-900 flex items-center justify-between text-left transition cursor-pointer"
              >
                <span className="truncate pr-2">{formData.department || 'Select Department'}</span>
                <ChevronDown className={`w-4 h-4 text-slate-500 flex-shrink-0 transition-transform duration-200 ${isDeptOpen ? 'rotate-180 text-[#0C7E81]' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isDeptOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95 duration-150">
                  {/* Search Input Box */}
                  <div className="relative mb-2">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={deptSearch}
                      onChange={(e) => setDeptSearch(e.target.value)}
                      placeholder="Type to search department..."
                      className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0C7E81] text-slate-800 placeholder:text-slate-400 font-medium"
                    />
                  </div>

                  {/* Department Options List */}
                  <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                    {filteredDepartments.length === 0 ? (
                      <div className="py-4 text-center text-xs text-slate-400">
                        No department found matching &quot;{deptSearch}&quot;
                      </div>
                    ) : (
                      filteredDepartments.map((dept) => {
                        const isSelected = formData.department === dept;
                        return (
                          <button
                            key={dept}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, department: dept }));
                              setIsDeptOpen(false);
                              setDeptSearch('');
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                              isSelected
                                ? 'bg-[#0C7E81] text-white font-bold shadow-xs'
                                : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span className="truncate">{dept}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0 ml-2" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
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
