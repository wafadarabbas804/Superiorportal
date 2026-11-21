'use client';

import React from 'react';
import { Users, Clock, CheckCircle2 } from 'lucide-react';

interface DashboardStatsProps {
  totalStudents: number;
  pendingApprovalCount: number;
  approvedCount: number;
  totalRevenue: number;
}

export default function DashboardStats({
  totalStudents,
  pendingApprovalCount,
  approvedCount,
  totalRevenue
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
      {/* Total Registered */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Total Registered</span>
          <Users className="w-4 h-4 text-slate-400" />
        </div>
        <div className="mt-2 text-2xl font-black text-slate-900">{totalStudents}</div>
        <span className="text-[10px] text-slate-400">Total Convocation Applicants</span>
      </div>

      {/* Needs Approval */}
      <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-700">Needs Approval</span>
          <Clock className="w-4 h-4 text-amber-500" />
        </div>
        <div className="mt-2 text-2xl font-black text-amber-700">{pendingApprovalCount}</div>
        <span className="text-[10px] text-amber-600 font-medium">Screenshots Submitted</span>
      </div>

      {/* Approved / Paid */}
      <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-700">Approved / Paid</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="mt-2 text-2xl font-black text-emerald-700">{approvedCount}</div>
        <span className="text-[10px] text-emerald-600 font-medium">Verified Registrations</span>
      </div>

      {/* Total Revenue */}
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
  );
}
