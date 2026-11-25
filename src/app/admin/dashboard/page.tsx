'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, Registration } from '@/lib/supabase';
import { RefreshCw, LogOut, Loader2 } from 'lucide-react';
import { sanitizeText } from '@/lib/sanitize';

// Modular Child Components
import ExportToolbar from '@/components/ExportToolbar';
import WhatsAppModal from '@/components/WhatsAppModal';
import DashboardStats from '@/components/admin/DashboardStats';
import DashboardFilterBar from '@/components/admin/DashboardFilterBar';
import RegistrationsTable from '@/components/admin/RegistrationsTable';
import ProofModal from '@/components/admin/ProofModal';
import RejectModal from '@/components/admin/RejectModal';
import PassModal from '@/components/admin/PassModal';
import ApproveConfirmModal from '@/components/admin/ApproveConfirmModal';

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

export default function AdminDashboard() {
  const router = useRouter();

  // Data & Auth States
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Filter & Search States
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modal States
  const [selectedStudent, setSelectedStudent] = useState<Registration | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [studentToApprove, setStudentToApprove] = useState<Registration | null>(null);
  const [passStudent, setPassStudent] = useState<Registration | null>(null);
  const [whatsAppStudent, setWhatsAppStudent] = useState<Registration | null>(null);
  const [whatsAppDefaultReason, setWhatsAppDefaultReason] = useState<string | undefined>(undefined);

  // Fetch all registrations from database
  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session) {
        router.replace('/admin/login');
        return;
      }

      setIsAuthenticated(true);

      const { data, error } = await supabase
        .from('convocation_registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Database fetch warning:', error);
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

  // Reset to page 1 whenever search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus, filterDepartment]);

  // Action: Approve Student Payment
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
      alert('Error updating status: ' + (err?.message || 'Unknown error'));
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Reject Student Payment Proof
  const handleReject = async () => {
    if (!selectedStudent) return;
    const cleanReason = sanitizeText(rejectReason, 200);
    if (!cleanReason) {
      alert('Please provide a valid reason for rejection.');
      return;
    }

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('convocation_registrations')
        .update({
          payment_status: 'rejected',
          rejection_reason: cleanReason
        })
        .eq('id', selectedStudent.id);

      if (error) throw error;
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedStudent(null);
      fetchRegistrations();
    } catch (err: any) {
      alert('Error: ' + (err?.message || 'Unknown error'));
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Sign Out
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.push('/admin/login');
    } finally {
      setLoggingOut(false);
    }
  };

  // Available unique departments list
  const availableDepartments = Array.from(
    new Set([
      ...DEPARTMENTS,
      ...registrations.map(r => r.department).filter(Boolean)
    ])
  );

  // Statistics calculation
  const totalStudents = registrations.length;
  const approvedCount = registrations.filter(r => r.payment_status === 'approved').length;
  const pendingApprovalCount = registrations.filter(r => r.payment_status === 'pending_approval').length;
  const pendingPaymentCount = registrations.filter(r => r.payment_status === 'pending_payment').length;
  const totalRevenue = approvedCount * 6000;

  // Filtered List
  const filtered = registrations.filter(r => {
    const matchesStatus = filterStatus === 'all' || r.payment_status === filterStatus;
    const matchesDepartment = filterDepartment === 'all' || r.department === filterDepartment;
    const matchesSearch = 
      r.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.roll_number?.toLowerCase().includes(search.toLowerCase()) ||
      r.chalan_no?.toLowerCase().includes(search.toLowerCase()) ||
      r.transaction_id?.toLowerCase().includes(search.toLowerCase()) ||
      r.department?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesDepartment && matchesSearch;
  });

  // Selection logic for export
  const isAllFilteredSelected = filtered.length > 0 && filtered.every(item => selectedIds.includes(item.id));

  const handleSelectAllFiltered = () => {
    if (isAllFilteredSelected) {
      setSelectedIds(prev => prev.filter(id => !filtered.some(f => f.id === id)));
    } else {
      const merged = new Set([...selectedIds, ...filtered.map(f => f.id)]);
      setSelectedIds(Array.from(merged));
    }
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const handleToggleRow = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectPage = (pageItems: Registration[]) => {
    const pageItemIds = pageItems.map(p => p.id);
    const isPageAllSelected = pageItems.length > 0 && pageItems.every(p => selectedIds.includes(p.id));

    if (isPageAllSelected) {
      setSelectedIds(prev => prev.filter(id => !pageItemIds.includes(id)));
    } else {
      const merged = new Set([...selectedIds, ...pageItemIds]);
      setSelectedIds(Array.from(merged));
    }
  };

  const selectedStudents = registrations.filter(r => selectedIds.includes(r.id));
  const hasActiveFilters = filterDepartment !== 'all' || filterStatus !== 'all' || !!search;

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
      {/* Top Header Bar */}
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
          {/* Refresh List Button */}
          <button
            onClick={fetchRegistrations}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-[#0C7E81] hover:text-[#0C7E81] transition shadow-xs disabled:opacity-50 cursor-pointer"
            title="Refresh registrations list"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#0C7E81] ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Refreshing...' : 'Refresh List'}</span>
          </button>

          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-white border border-red-200 hover:bg-red-50 transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            {loggingOut ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <LogOut className="w-3.5 h-3.5" />
            )}
            <span>{loggingOut ? 'Signing Out...' : 'Sign Out'}</span>
          </button>
        </div>
      </div>

      {/* KPI Counters Grid Component */}
      <DashboardStats
        totalStudents={totalStudents}
        pendingApprovalCount={pendingApprovalCount}
        approvedCount={approvedCount}
        totalRevenue={totalRevenue}
      />

      {/* Filter and Search Bar Component */}
      <DashboardFilterBar
        search={search}
        onSearchChange={setSearch}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        filterDepartment={filterDepartment}
        onFilterDepartmentChange={setFilterDepartment}
        availableDepartments={availableDepartments}
        onReset={() => {
          setFilterDepartment('all');
          setFilterStatus('all');
          setSearch('');
        }}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Export Toolbar Component */}
      <ExportToolbar
        selectedStudents={selectedStudents}
        allFilteredStudents={filtered}
        filterDepartment={filterDepartment}
        onSelectAllFiltered={handleSelectAllFiltered}
        onClearSelection={handleClearSelection}
        isAllFilteredSelected={isAllFilteredSelected}
      />

      {/* Registrations Data Table Component */}
      <RegistrationsTable
        registrations={filtered}
        selectedIds={selectedIds}
        currentPage={currentPage}
        pageSize={20}
        onPageChange={setCurrentPage}
        onToggleRow={handleToggleRow}
        onToggleSelectPage={handleToggleSelectPage}
        onViewProof={(student) => setSelectedStudent(student)}
        onGeneratePass={(student) => setPassStudent(student)}
        onApproveClick={(student) => setStudentToApprove(student)}
        onRejectClick={(student) => {
          setSelectedStudent(student);
          setShowRejectModal(true);
        }}
        onWhatsAppClick={(student) => {
          setWhatsAppStudent(student);
          setWhatsAppDefaultReason(student.rejection_reason || undefined);
        }}
      />

      {/* Proof Screenshot Viewer Modal Component */}
      <ProofModal
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
        onApprove={(student) => setStudentToApprove(student)}
        onReject={() => setShowRejectModal(true)}
        actionLoading={actionLoading}
      />

      {/* Rejection Reason Modal Component */}
      <RejectModal
        isOpen={showRejectModal && !!selectedStudent}
        reason={rejectReason}
        onReasonChange={setRejectReason}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleReject}
        actionLoading={actionLoading}
      />

      {/* Official Entry Pass Card Modal Component */}
      <PassModal
        student={passStudent}
        onClose={() => setPassStudent(null)}
      />

      {/* Approval Confirmation Modal Component */}
      <ApproveConfirmModal
        student={studentToApprove}
        onClose={() => setStudentToApprove(null)}
        onConfirm={handleApprove}
        actionLoading={actionLoading}
      />

      {/* Official WhatsApp Notice Modal Component */}
      <WhatsAppModal
        student={whatsAppStudent}
        defaultReason={whatsAppDefaultReason}
        onClose={() => {
          setWhatsAppStudent(null);
          setWhatsAppDefaultReason(undefined);
        }}
      />
    </div>
  );
}
