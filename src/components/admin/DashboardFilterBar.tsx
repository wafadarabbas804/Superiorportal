'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, GraduationCap, ChevronDown, Check, X } from 'lucide-react';

interface DashboardFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  filterStatus: string;
  onFilterStatusChange: (val: string) => void;
  filterDepartment: string;
  onFilterDepartmentChange: (val: string) => void;
  availableDepartments: string[];
  onReset: () => void;
  hasActiveFilters: boolean;
}

export default function DashboardFilterBar({
  search,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  filterDepartment,
  onFilterDepartmentChange,
  availableDepartments,
  onReset,
  hasActiveFilters
}: DashboardFilterBarProps) {
  const [deptFilterSearch, setDeptFilterSearch] = useState('');
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const deptDropdownRef = useRef<HTMLDivElement>(null);
  const deptInputRef = useRef<HTMLInputElement>(null);

  // Close department dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (deptDropdownRef.current && !deptDropdownRef.current.contains(e.target as Node)) {
        setIsDeptDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto focus search input when department dropdown opens
  useEffect(() => {
    if (isDeptDropdownOpen && deptInputRef.current) {
      deptInputRef.current.focus();
    }
  }, [isDeptDropdownOpen]);

  const filteredDepartments = availableDepartments.filter(dept =>
    dept.toLowerCase().includes(deptFilterSearch.toLowerCase())
  );

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6 flex flex-wrap items-center justify-between gap-4">
      {/* Search Input Box */}
      <div className="flex items-center gap-2 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by Name, Roll No, Chalan or TID..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#0C7E81]"
          />
        </div>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Searchable Department Dropdown Filter */}
        <div className="relative" ref={deptDropdownRef}>
          <button
            type="button"
            onClick={() => {
              setIsDeptDropdownOpen(!isDeptDropdownOpen);
              setDeptFilterSearch('');
            }}
            className={`text-xs border rounded-lg px-3 py-1.5 bg-white text-slate-700 flex items-center gap-1.5 transition cursor-pointer hover:border-[#0C7E81] ${
              filterDepartment !== 'all'
                ? 'border-[#0C7E81] bg-[#0C7E81]/5 text-[#0C7E81] font-bold ring-1 ring-[#0C7E81]'
                : 'border-slate-300'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
            <span className="max-w-[160px] sm:max-w-[190px] truncate">
              {filterDepartment === 'all' ? 'All Departments' : filterDepartment}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isDeptDropdownOpen ? 'rotate-180 text-[#0C7E81]' : ''}`} />
          </button>

          {/* Department Dropdown Menu */}
          {isDeptDropdownOpen && (
            <div className="absolute right-0 sm:left-0 top-full mt-1.5 w-64 bg-white rounded-xl border border-slate-200 shadow-xl z-50 p-2 animate-in fade-in zoom-in-95 duration-150">
              {/* Search Box inside Dropdown */}
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={deptInputRef}
                  type="text"
                  value={deptFilterSearch}
                  onChange={(e) => setDeptFilterSearch(e.target.value)}
                  placeholder="Search department..."
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0C7E81] text-slate-800 placeholder:text-slate-400 font-medium"
                />
              </div>

              {/* Options List */}
              <div className="max-h-52 overflow-y-auto space-y-0.5 pr-0.5">
                <button
                  type="button"
                  onClick={() => {
                    onFilterDepartmentChange('all');
                    setIsDeptDropdownOpen(false);
                    setDeptFilterSearch('');
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition cursor-pointer ${
                    filterDepartment === 'all'
                      ? 'bg-[#0C7E81] text-white font-bold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>All Departments</span>
                  {filterDepartment === 'all' && <Check className="w-3.5 h-3.5" />}
                </button>

                {filteredDepartments.length === 0 ? (
                  <div className="py-3 text-center text-xs text-slate-400">
                    No matching department
                  </div>
                ) : (
                  filteredDepartments.map((dept) => {
                    const isSelected = filterDepartment === dept;
                    return (
                      <button
                        key={dept}
                        type="button"
                        onClick={() => {
                          onFilterDepartmentChange(dept);
                          setIsDeptDropdownOpen(false);
                          setDeptFilterSearch('');
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#0C7E81] text-white font-bold'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate pr-1">{dept}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>

              {filterDepartment !== 'all' && (
                <div className="mt-2 pt-1.5 border-t border-slate-100 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      onFilterDepartmentChange('all');
                      setIsDeptDropdownOpen(false);
                      setDeptFilterSearch('');
                    }}
                    className="text-[11px] text-red-600 hover:underline font-semibold cursor-pointer"
                  >
                    Clear Department Filter
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => onFilterStatusChange(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0C7E81] cursor-pointer"
          >
            <option value="all">All Registrations</option>
            <option value="pending_approval">Pending Approval (Screenshots)</option>
            <option value="approved">Approved</option>
            <option value="pending_payment">Pending Payment</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-xs text-slate-500 hover:text-red-600 transition flex items-center gap-1 font-medium cursor-pointer"
            title="Clear all filters"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
