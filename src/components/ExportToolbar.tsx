'use client';

import React, { useState } from 'react';
import { Registration } from '@/lib/supabase';
import { FileSpreadsheet, FileText, CheckSquare, Square, Loader2, Download, CheckCircle2 } from 'lucide-react';
import { exportStudentsToExcel, exportStudentsToPdf } from '@/lib/exportUtils';

interface ExportToolbarProps {
  selectedStudents: Registration[];
  allFilteredStudents: Registration[];
  filterDepartment: string;
  onSelectAllFiltered: () => void;
  onClearSelection: () => void;
  isAllFilteredSelected: boolean;
}

export default function ExportToolbar({
  selectedStudents,
  allFilteredStudents,
  filterDepartment,
  onSelectAllFiltered,
  onClearSelection,
  isAllFilteredSelected
}: ExportToolbarProps) {
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  const selectedCount = selectedStudents.length;
  const filteredCount = allFilteredStudents.length;

  // If none selected, default target is all filtered students; if selected, target is selected students
  const targetStudents = selectedCount > 0 ? selectedStudents : allFilteredStudents;

  const handleExportExcel = async () => {
    if (targetStudents.length === 0) {
      alert('Export karne ke liye koi student mojood nahi hai.');
      return;
    }
    setExportingExcel(true);
    try {
      await new Promise(r => setTimeout(r, 200)); // smooth visual feedback
      exportStudentsToExcel(targetStudents, filterDepartment);
    } catch (err: any) {
      console.error(err);
      alert('Error exporting Excel: ' + (err?.message || 'Unknown error'));
    } finally {
      setExportingExcel(false);
    }
  };

  const handleExportPdf = async () => {
    if (targetStudents.length === 0) {
      alert('Export karne ke liye koi student mojood nahi hai.');
      return;
    }
    setExportingPdf(true);
    try {
      await new Promise(r => setTimeout(r, 200)); // smooth visual feedback
      exportStudentsToPdf(targetStudents, filterDepartment);
    } catch (err: any) {
      console.error(err);
      alert('Error exporting PDF: ' + (err?.message || 'Unknown error'));
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 mb-4 flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Left: Selection Controls & Status */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <button
          type="button"
          onClick={onSelectAllFiltered}
          disabled={filteredCount === 0}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
            isAllFilteredSelected
              ? 'bg-[#0C7E81] text-white shadow-xs'
              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-[#0C7E81]'
          }`}
        >
          {isAllFilteredSelected ? (
            <CheckSquare className="w-4 h-4 text-white" />
          ) : (
            <Square className="w-4 h-4 text-slate-400" />
          )}
          <span>{isAllFilteredSelected ? 'All Selected' : `Select All in View (${filteredCount})`}</span>
        </button>

        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{selectedCount} Selected</span>
            </span>

            <button
              type="button"
              onClick={onClearSelection}
              className="text-slate-500 hover:text-red-600 underline font-medium cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}

        {filterDepartment !== 'all' && (
          <span className="text-[11px] text-slate-500 font-medium border-l border-slate-300 pl-2.5">
            Dept Filter: <strong className="text-slate-800">{filterDepartment}</strong>
          </span>
        )}
      </div>

      {/* Right: Export Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Export to Excel */}
        <button
          type="button"
          onClick={handleExportExcel}
          disabled={exportingExcel || exportingPdf || targetStudents.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title="Export as Microsoft Excel Spreadsheet"
        >
          {exportingExcel ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <FileSpreadsheet className="w-3.5 h-3.5" />
          )}
          <span>
            {exportingExcel
              ? 'Generating Excel...'
              : `Export Excel (${targetStudents.length})`}
          </span>
        </button>

        {/* Export to PDF */}
        <button
          type="button"
          onClick={handleExportPdf}
          disabled={exportingPdf || exportingExcel || targetStudents.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0C7E81] hover:bg-[#096366] text-white font-bold transition shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title="Export as Official Landscape PDF Report"
        >
          {exportingPdf ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <FileText className="w-3.5 h-3.5" />
          )}
          <span>
            {exportingPdf
              ? 'Generating PDF...'
              : `Export PDF (${targetStudents.length})`}
          </span>
        </button>
      </div>
    </div>
  );
}
