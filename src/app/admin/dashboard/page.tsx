'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase, Registration } from '@/lib/supabase';
import { 
  Users, CheckCircle2, Clock, XCircle, Search, Filter, 
  ExternalLink, LogOut, Check, X, Eye, FileSpreadsheet, RefreshCw
} from 'lucide-react';

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

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
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
    if (!confirm('Kya aap is student ki payment approve karna chahte hain?')) return;
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
    } catch (err: any) {
      alert('Error updating status: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedStudent) return;
    if (!rejectReason.trim()) {
      alert('Baraye mehrbani rejection ki waja likhein.');
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12">
            <Image src="/superior-logo.png" alt="Logo" fill className="object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              SUPER ADMIN CONVOCATION DASHBOARD
            </h1>
            <p className="text-xs text-slate-500">
              Superior College Wazirabad • Convocation 2026 Management
            </p>
          </div>
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
                        {item.payment_status !== 'approved' && (
                          <button
                            onClick={() => handleApprove(item.id)}
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
                onClick={() => handleApprove(selectedStudent.id)}
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
    </div>
  );
}
