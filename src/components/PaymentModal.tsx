import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { useStore } from '@/store/useStore';

interface PaymentModalProps {
  examType: string;
  boardName?: string;
  groupOrProgram: string;
  onClose: () => void;
}

export default function PaymentModal({ examType, boardName, groupOrProgram, onClose }: PaymentModalProps) {
  const { user } = useStore();
  const { submitPayment } = useAuthStore();
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad'>('bKash');
  const [transactionId, setTransactionId] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  
  const paymentNumber = '01757798062';
  const amount = '50 BDT';

  const handlePaymentSubmit = () => {
    if (!user) return;
    if (!transactionId.trim()) {
      alert('Please enter a valid Transaction ID.');
      return;
    }
    submitPayment(user.id, examType, boardName, groupOrProgram, paymentMethod, transactionId, senderNumber);
    alert('Payment submitted for verification. Admin will review it shortly.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Unlock Full Access</h3>
        <p className="text-slate-600 mb-6">
          Get permanent access to all years and subjects for <span className="font-semibold text-indigo-600">{examType} {boardName ? `${boardName} ` : ''}{groupOrProgram}</span> for just {amount}.
        </p>
        
        <div className="space-y-4 mb-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-sm font-medium text-slate-500 mb-1">Send Money ({amount}) to:</p>
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg text-slate-900">{paymentNumber}</span>
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md font-medium">bKash / Nagad</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Payment Method</label>
            <select 
              className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as 'bKash' | 'Nagad')}
            >
              <option value="bKash">bKash</option>
              <option value="Nagad">Nagad</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Transaction ID <span className="text-rose-500">*</span></label>
            <input 
              type="text" 
              placeholder="e.g. 8N7A6B5C4D" 
              className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Sender Number (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g. 017XXXXXXXX" 
              className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={senderNumber}
              onChange={(e) => setSenderNumber(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handlePaymentSubmit}>Submit for Verification</Button>
        </div>
      </div>
    </div>
  );
}
