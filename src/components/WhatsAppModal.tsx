'use client';

import React, { useState, useEffect } from 'react';
import { Registration } from '@/lib/supabase';
import { 
  X, MessageCircle, Send, Copy, Check, User, Phone, 
  AlertCircle, CheckCircle2, ShieldAlert 
} from 'lucide-react';
import { 
  WhatsAppMessageType, 
  generateWhatsAppMessage, 
  sendWhatsAppMessage, 
  formatWhatsAppPhone 
} from '@/lib/whatsappUtils';

interface WhatsAppModalProps {
  student: Registration | null;
  onClose: () => void;
  defaultType?: WhatsAppMessageType;
  defaultReason?: string;
}

export default function WhatsAppModal({
  student,
  onClose,
  defaultType = 'pending',
  defaultReason
}: WhatsAppModalProps) {
  if (!student) return null;

  // Determine initial template based on student status
  const initialType: WhatsAppMessageType = 
    defaultType ? defaultType :
    student.payment_status === 'approved' ? 'approved' :
    student.payment_status === 'rejected' ? 'rejected' : 'pending';

  const [messageType, setMessageType] = useState<WhatsAppMessageType>(initialType);
  const [recipientPhoneType, setRecipientPhoneType] = useState<'student' | 'parent'>('student');
  const [messageText, setMessageText] = useState('');
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);

  // Generate template whenever type changes
  useEffect(() => {
    const text = generateWhatsAppMessage(messageType, student, defaultReason);
    setMessageText(text);
  }, [messageType, student, defaultReason]);

  const targetPhone = recipientPhoneType === 'student' ? student.student_phone : student.parent_phone;
  const cleanPhone = formatWhatsAppPhone(targetPhone);

  const handleSend = () => {
    setSending(true);
    try {
      const ok = sendWhatsAppMessage(targetPhone, messageText);
      if (ok) {
        setTimeout(() => {
          setSending(false);
          onClose();
        }, 600);
      } else {
        setSending(false);
      }
    } catch {
      setSending(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl relative border border-slate-100 max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-4 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-[#25D366]/15 text-[#25D366] flex items-center justify-center flex-shrink-0">
            {/* WhatsApp Brand SVG */}
            <svg className="w-6 h-6 fill-[#25D366]" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Send Official WhatsApp Notice
            </h3>
            <p className="text-xs text-slate-500">
              Superior College Accounts & Convocation Office
            </p>
          </div>
        </div>

        {/* Student & Recipient Selector Bar */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 mb-3 text-xs flex-shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div>
              <span className="font-bold text-slate-900 text-sm block">
                {student.full_name}
              </span>
              <span className="text-slate-500 font-mono text-[11px]">
                {student.roll_number} • {student.department}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Chalan No
              </span>
              <span className="font-mono font-bold text-slate-800">
                {student.chalan_no}
              </span>
            </div>
          </div>

          {/* Select Recipient Phone */}
          <div className="flex items-center gap-3 pt-2 border-t border-slate-200/60">
            <span className="text-[11px] font-bold text-slate-600">Send To:</span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="phoneType"
                checked={recipientPhoneType === 'student'}
                onChange={() => setRecipientPhoneType('student')}
                className="text-[#0C7E81] focus:ring-[#0C7E81]"
              />
              <span className="font-mono text-slate-800 font-medium">
                Student ({student.student_phone})
              </span>
            </label>

            {student.parent_phone && (
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="phoneType"
                  checked={recipientPhoneType === 'parent'}
                  onChange={() => setRecipientPhoneType('parent')}
                  className="text-[#0C7E81] focus:ring-[#0C7E81]"
                />
                <span className="font-mono text-slate-800 font-medium">
                  Parent ({student.parent_phone})
                </span>
              </label>
            )}
          </div>
        </div>

        {/* Template Selector Tabs */}
        <div className="flex items-center gap-1.5 mb-2.5 flex-shrink-0">
          <button
            type="button"
            onClick={() => setMessageType('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              messageType === 'pending'
                ? 'bg-[#0C7E81] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Fee Reminder</span>
          </button>

          <button
            type="button"
            onClick={() => setMessageType('rejected')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              messageType === 'rejected'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Proof Rejected</span>
          </button>

          <button
            type="button"
            onClick={() => setMessageType('approved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              messageType === 'approved'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approved & Pass</span>
          </button>
        </div>

        {/* Message Preview & Editable Textarea */}
        <div className="relative flex-1 min-h-[160px] mb-3">
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            rows={10}
            className="w-full h-full p-3 text-xs font-mono rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#25D366] text-slate-800 leading-relaxed bg-slate-50/50 resize-none"
            placeholder="Official message text..."
          />
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 flex-shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Text</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSend}
              disabled={sending || !cleanPhone}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#25D366] hover:bg-[#1EBE5D] rounded-xl transition shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              <span>Send via WhatsApp Web</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
