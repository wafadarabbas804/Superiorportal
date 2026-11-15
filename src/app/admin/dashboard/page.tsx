'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase, Registration } from '@/lib/supabase';
import { 
  Users, CheckCircle2, Clock, XCircle, Search, Filter, 
  ExternalLink, LogOut, Check, X, Eye, FileSpreadsheet, RefreshCw,
  Award, Printer, Download, Loader2
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function AdminDashboard() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Registration | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [studentToApprove, setStudentToApprove] = useState<Registration | null>(null);
  const [passStudent, setPassStudent] = useState<Registration | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleDownloadPdf = async () => {
    if (!passStudent) return;

    setDownloadingPdf(true);
    try {
      // Direct clean vector PDF via jsPDF without html2canvas parsing issues
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a5'
      });

      // Background card
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(8, 8, 132, 194, 4, 4, 'F');
      doc.setDrawColor(12, 126, 129); // #0C7E81
      doc.setLineWidth(0.8);
      doc.roundedRect(8, 8, 132, 194, 4, 4, 'S');

      // Header Banner
      doc.setFillColor(12, 126, 129);
      doc.roundedRect(12, 12, 124, 28, 3, 3, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('SUPERIOR COLLEGE WAZIRABAD', 74, 23, { align: 'center' });
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('CONVOCATION 2026 • OFFICIAL ENTRY PASS', 74, 30, { align: 'center' });

      // Status Badge
      doc.setFillColor(220, 252, 231); // emerald-100
      doc.roundedRect(49, 34, 50, 5, 1, 1, 'F');
      doc.setTextColor(22, 101, 52); // emerald-800
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text('VERIFIED & ADMITTED', 74, 37.8, { align: 'center' });

      // Student Details Container
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(12, 45, 124, 60, 2, 2, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.roundedRect(12, 45, 124, 60, 2, 2, 'S');

      // Student Info Text
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('STUDENT NAME:', 18, 55);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(passStudent.full_name.toUpperCase(), 18, 61);

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('ROLL NUMBER:', 80, 55);
      doc.setTextColor(12, 126, 129);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(passStudent.roll_number, 80, 61);

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('DEPARTMENT:', 18, 75);
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(passStudent.department, 18, 81);

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('CHALAN REFERENCE:', 80, 75);
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(passStudent.chalan_no, 80, 81);

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('CONTACT PHONE:', 18, 93);
      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text(passStudent.student_phone, 18, 98);

      // Fee Paid Notice Box
      doc.setFillColor(236, 253, 245);
      doc.setDrawColor(167, 243, 208);
      doc.roundedRect(12, 112, 124, 22, 2, 2, 'FD');
      doc.setTextColor(6, 95, 70);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('FEE STATUS: PKR 6,000/- PAID & VERIFIED', 74, 121, { align: 'center' });
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(4, 120, 87);
      doc.text('Includes Gown Allocation, Degree Folder & Convocation Refreshment Pass', 74, 128, { align: 'center' });

      // Event Rules
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.text('Instructions for Entry:', 14, 142);
      doc.text('1. Please bring this printed pass along with your Original Student ID Card.', 14, 147);
      doc.text('2. Entry will be strictly subject to QR / verification verification at reception gate.', 14, 151);
      doc.text('3. Gown distribution counter requires this pass stamped.', 14, 155);

      // Signatures
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.4);
      doc.line(20, 182, 55, 182);
      doc.line(90, 182, 128, 182);

      doc.setTextColor(148, 163, 184);
      doc.setFontSize(7.5);
      doc.text('Student Signature', 37.5, 186, { align: 'center' });
      doc.text('Controller of Convocation', 109, 186, { align: 'center' });

      // Download PDF
      doc.save(`Convocation_Pass_${passStudent.roll_number}.pdf`);
    } catch (err: any) {
      console.error(err);
      alert('Error generating PDF: ' + err.message);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      // 1. Check if admin session exists
      const { data: authData } = await supabase.auth.getSession();
      const localAdmin = typeof window !== 'undefined' ? sessionStorage.getItem('superior_admin_logged_in') : null;

      if (!authData.session && !localAdmin) {
        // Not logged in -> kick to login page immediately
        router.replace('/admin/login');
        return;
      }

      setIsAuthenticated(true);

      const { data, error } = await supabase
        .from('convocation_registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Database fetch warning (using demo data if table empty):', error);
      } else if (data) {
        setRegistrations(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('convocation_registrations')
        .update({
          payment_status: 'approved',
          approved_at: new Date().toISOString(),
          rejection_reason: null
        })
        .eq('id', id);

      if (error) throw error;
      fetchRegistrations();
      setSelectedStudent(null);
      setStudentToApprove(null);
    } catch (err: any) {
      alert('Error updating status: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedStudent) return;
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('convocation_registrations')
        .update({
          payment_status: 'rejected',
          rejection_reason: rejectReason.trim()
        })
        .eq('id', selectedStudent.id);

      if (error) throw error;
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedStudent(null);
      fetchRegistrations();
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem('superior_admin_logged_in');
    router.push('/admin/login');
  };

  // Stats calculation
  const totalStudents = registrations.length;
  const approvedCount = registrations.filter(r => r.payment_status === 'approved').length;
  const pendingApprovalCount = registrations.filter(r => r.payment_status === 'pending_approval').length;
  const pendingPaymentCount = registrations.filter(r => r.payment_status === 'pending_payment').length;
  const totalRevenue = approvedCount * 6000;

  // Filtered List
  const filtered = registrations.filter(r => {
    const matchesStatus = filterStatus === 'all' || r.payment_status === filterStatus;
    const matchesSearch = 
      r.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.roll_number?.toLowerCase().includes(search.toLowerCase()) ||
      r.chalan_no?.toLowerCase().includes(search.toLowerCase()) ||
      r.transaction_id?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (!isAuthenticated && loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#0C7E81] mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">Verifying Admin Session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            SUPER ADMIN CONVOCATION DASHBOARD
          </h1>
          <p className="text-xs text-slate-500">
            Superior College Wazirabad • Convocation 2026 Management
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchRegistrations}
            className="p-2 text-slate-600 hover:text-[#0C7E81] hover:bg-slate-100 rounded-lg transition"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* KPI Counters Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Registered</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{totalStudents}</div>
          <span className="text-[10px] text-slate-400">Total Convocation Applicants</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700">Needs Approval</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-700">{pendingApprovalCount}</div>
          <span className="text-[10px] text-amber-600 font-medium">Screenshots Submitted</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700">Approved / Paid</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-700">{approvedCount}</div>
          <span className="text-[10px] text-emerald-600 font-medium">Verified Registrations</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#0C7E81]/30 bg-[#0C7E81]/5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#0C7E81]">Total Revenue</span>
            <span className="text-xs font-bold text-[#0C7E81]">PKR</span>
          </div>
          <div className="mt-2 text-2xl font-black text-[#0C7E81]">
            Rs. {totalRevenue.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500">From Verified Payments</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Name, Roll No, Chalan or TID..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#0C7E81]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0C7E81]"
          >
            <option value="all">All Registrations</option>
            <option value="pending_approval">Pending Approval (Screenshots)</option>
            <option value="approved">Approved</option>
            <option value="pending_payment">Pending Payment</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Student & Roll No</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Chalan & TID</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Proof</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Koi registration record nahi mila.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{item.full_name}</div>
                      <div className="text-[11px] font-mono text-[#0C7E81]">{item.roll_number}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 truncate max-w-[150px]">
                      {item.department}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      <div>{item.student_phone}</div>
                      <div className="text-slate-400 text-[10px]">P: {item.parent_phone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-slate-700">{item.chalan_no}</div>
                      {item.transaction_id && (
                        <div className="text-[10px] text-slate-400 font-mono">TID: {item.transaction_id}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {item.payment_status === 'approved' && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          Approved
                        </span>
                      )}
                      {item.payment_status === 'pending_approval' && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] animate-pulse">
                          Pending Approval
                        </span>
                      )}
                      {item.payment_status === 'pending_payment' && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium text-[10px]">
                          Pending Payment
                        </span>
                      )}
                      {item.payment_status === 'rejected' && (
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium text-[10px]">
                          Rejected
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {item.screenshot_url ? (
                        <button
                          onClick={() => setSelectedStudent(item)}
                          className="flex items-center gap-1 text-[#0C7E81] font-semibold hover:underline cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Proof</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[10px]">No screenshot</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.payment_status === 'approved' && (
                          <button
                            onClick={() => setPassStudent(item)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#0C7E81] text-white hover:bg-[#096366] transition cursor-pointer flex items-center gap-1 font-semibold text-[11px]"
                            title="Generate Entry Pass"
                          >
                            <Award className="w-3.5 h-3.5" />
                            <span>Generate Pass</span>
                          </button>
                        )}

                        {item.payment_status !== 'approved' && (
                          <button
                            onClick={() => setStudentToApprove(item)}
                            className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer"
                            title="Approve Payment"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {item.payment_status !== 'rejected' && (
                          <button
                            onClick={() => {
                              setSelectedStudent(item);
                              setShowRejectModal(true);
                            }}
                            className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition cursor-pointer"
                            title="Reject"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Screenshot & Verification Modal */}
      {selectedStudent && !showRejectModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative animate-in fade-in">
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-base text-slate-900 mb-1">
              Payment Verification Details
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Student: <strong>{selectedStudent.full_name}</strong> ({selectedStudent.roll_number})
            </p>

            <div className="space-y-3 text-xs mb-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between">
                <span>Chalan Number:</span>
                <strong className="font-mono">{selectedStudent.chalan_no}</strong>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between">
                <span>Transaction ID (TID):</span>
                <strong className="font-mono text-[#0C7E81] text-sm">
                  {selectedStudent.transaction_id || 'Not Provided'}
                </strong>
              </div>
            </div>

            {selectedStudent.screenshot_url ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden mb-4 bg-slate-900 text-center">
                <img
                  src={selectedStudent.screenshot_url}
                  alt="Payment Proof"
                  className="max-h-72 mx-auto object-contain"
                />
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl mb-4">
                No screenshot uploaded.
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowRejectModal(true);
                }}
                className="px-4 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg cursor-pointer"
              >
                Reject Proof
              </button>
              <button
                onClick={() => setStudentToApprove(selectedStudent)}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-bold text-white bg-[#0C7E81] hover:bg-[#096366] rounded-lg cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Approve & Mark Paid</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {showRejectModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative">
            <h3 className="font-bold text-base text-red-700 mb-1">
              Reject Payment Proof
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Student ko rejection ka message aur reason show hoga.
            </p>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Invalid Transaction ID, or blurry screenshot. Please send Rs. 6000 and re-upload clear proof."
              className="w-full p-3 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Professional Approval Confirmation Modal */}
      {passStudent && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setPassStudent(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 no-print cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Print & Action Buttons */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 no-print">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Official Entry Card</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf}
                  className="px-3.5 py-1.5 bg-[#0C7E81] text-white text-xs font-bold rounded-lg hover:bg-[#096366] transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {downloadingPdf ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>{downloadingPdf ? 'Saving...' : 'Download PDF'}</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            {/* Printable Pass Card */}
            <div id="printable-pass-card" className="border-2 border-[#0C7E81] rounded-2xl p-6 bg-gradient-to-b from-[#0C7E81]/5 via-white to-[#0C7E81]/10 relative overflow-hidden">
              <div className="flex items-center gap-3.5 border-b border-slate-200 pb-3 mb-4">
                <div className="relative w-14 h-14 flex-shrink-0">
                  <Image src="/superior-logo.png" alt="Logo" fill className="object-contain" priority />
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-sm uppercase text-[#0C7E81]">
                    Superior College Wazirabad
                  </h3>
                  <p className="text-[11px] font-bold text-slate-700 tracking-wide uppercase">
                    Annual Convocation 2026 • Official Entry Pass
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[9px] uppercase tracking-wider">
                    ✓ Verified & Admitted
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs mb-4 bg-white/90 p-3 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Student Name</span>
                  <span className="font-bold text-slate-900 text-sm">{passStudent.full_name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Roll Number</span>
                  <span className="font-mono font-black text-[#0C7E81] text-sm">{passStudent.roll_number}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Department</span>
                  <span className="font-medium text-slate-700 truncate block">{passStudent.department}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Chalan Reference</span>
                  <span className="font-mono text-slate-800 font-bold">{passStudent.chalan_no}</span>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center mb-4">
                <p className="text-xs font-bold text-emerald-800">
                  Fee Status: PKR 6,000/- PAID & VERIFIED
                </p>
                <p className="text-[10px] text-emerald-600 mt-0.5">
                  Includes Gown Allocation, Degree Folder & Convocation Refreshment Pass
                </p>
              </div>

              <div className="pt-3 border-t border-dashed border-slate-300 flex justify-between items-end text-[10px] text-slate-400">
                <div className="text-center">
                  <div className="w-24 border-b border-slate-300 mb-1"></div>
                  <span>Student Sign</span>
                </div>
                <div className="text-center">
                  <div className="w-24 border-b border-slate-300 mb-1"></div>
                  <span>Controller of Convocation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Professional Approval Confirmation Modal */}
      {studentToApprove && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Confirm Payment Approval</h3>
                <p className="text-xs text-slate-500">Superior College Accounts Verification</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Are you sure you want to mark payment as verified for <strong className="text-slate-900">{studentToApprove.full_name}</strong> (Roll: <span className="font-mono text-[#0C7E81] font-bold">{studentToApprove.roll_number}</span>)?
            </p>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 mb-5 text-xs space-y-1 font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Chalan No:</span>
                <span className="font-bold text-slate-900">{studentToApprove.chalan_no}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Amount:</span>
                <span className="font-bold text-emerald-700">PKR 6,000/-</span>
              </div>
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setStudentToApprove(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApprove(studentToApprove.id)}
                disabled={actionLoading}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Confirm & Approve</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
