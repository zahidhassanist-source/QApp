import React, { useState } from 'react';
import { useStore, Question } from '@/store/useStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Upload, Trash2, Plus, FileText, Image as ImageIcon, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function Admin() {
  const { user, questions, addQuestion, deleteQuestion } = useStore();
  const { users, unlocks, approveUnlock, rejectUnlock } = useAuthStore();
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<'questions' | 'payments'>('questions');
  const [newQ, setNewQ] = useState<Partial<Question>>({
    category: 'SSC',
    group: 'Science',
    year: new Date().getFullYear(),
    type: 'image',
    url: 'https://picsum.photos/seed/newq/800/1200',
  });

  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <ShieldAlert className="w-12 h-12 text-rose-500 mb-4" />
        <p>Access Denied. Admin only.</p>
      </div>
    );
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newQ.title && newQ.category && newQ.year && newQ.url && newQ.type) {
      addQuestion(newQ as Omit<Question, 'id' | 'createdAt'>);
      setIsAdding(false);
      setNewQ({
        category: 'SSC',
        group: 'Science',
        year: new Date().getFullYear(),
        type: 'image',
        url: 'https://picsum.photos/seed/newq/800/1200',
        subjectName: '',
        subjectCode: '',
      });
    }
  };

  const pendingUnlocks = unlocks.filter(u => u.paymentStatus === 'Pending');

  const handleApprovePayment = (unlockId: string) => {
    approveUnlock(unlockId);
  };

  const handleRejectPayment = (unlockId: string) => {
    rejectUnlock(unlockId);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Admin Dashboard</h2>
          <p className="text-sm text-slate-500">Manage questions and payments</p>
        </div>
        {activeTab === 'questions' && (
          <Button onClick={() => setIsAdding(!isAdding)} size="sm" className="gap-2">
            {isAdding ? 'Cancel' : <><Plus className="w-4 h-4" /> Add New</>}
          </Button>
        )}
      </div>

      <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
        <button
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'questions' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
          onClick={() => setActiveTab('questions')}
        >
          Questions
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${activeTab === 'payments' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
          onClick={() => setActiveTab('payments')}
        >
          Payments
          {pendingUnlocks.length > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {pendingUnlocks.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'questions' && (
        <>
          {isAdding && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8">
              <h3 className="text-lg font-semibold mb-4">Upload Question</h3>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    placeholder="e.g. SSC Physics 2024 Dhaka Board"
                    value={newQ.title || ''}
                    onChange={(e) => setNewQ({ ...newQ, title: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <select
                      className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-600"
                      value={newQ.category}
                      onChange={(e) => setNewQ({ ...newQ, category: e.target.value as 'SSC' | 'HSC' | 'NU' })}
                    >
                      <option value="SSC">SSC</option>
                      <option value="HSC">HSC</option>
                      <option value="NU">National University</option>
                      <option value="BCS">BCS Preliminary</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Year {newQ.category === 'BCS' && '(Optional)'}</label>
                    <Input
                      type="number"
                      min="2014"
                      max="2025"
                      value={newQ.year || ''}
                      onChange={(e) => setNewQ({ ...newQ, year: parseInt(e.target.value) })}
                      required={newQ.category !== 'BCS'}
                    />
                  </div>
                </div>

                {(newQ.category === 'SSC' || newQ.category === 'HSC') && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Board</label>
                    <select
                      className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-600"
                      value={newQ.boardName || ''}
                      onChange={(e) => setNewQ({ ...newQ, boardName: e.target.value })}
                    >
                      <option value="">Select Board (Optional)</option>
                      <option value="Dhaka Board">Dhaka Board</option>
                      <option value="Rajshahi Board">Rajshahi Board</option>
                      <option value="Comilla Board">Comilla Board</option>
                      <option value="Jessore Board">Jessore Board</option>
                      <option value="Chittagong Board">Chittagong Board</option>
                      <option value="Barisal Board">Barisal Board</option>
                      <option value="Sylhet Board">Sylhet Board</option>
                      <option value="Dinajpur Board">Dinajpur Board</option>
                      <option value="Mymensingh Board">Mymensingh Board</option>
                      <option value="Madrasah Education Board">Madrasah Education Board</option>
                      <option value="Technical Education Board">Technical Education Board</option>
                    </select>
                  </div>
                )}

                {newQ.category === 'NU' ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Program Type</label>
                      <select
                        className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-600"
                        value={newQ.group || 'Professionals'}
                        onChange={(e) => setNewQ({ ...newQ, group: e.target.value })}
                      >
                        <option value="Professionals">Professionals</option>
                        <option value="Honours">Honours</option>
                        <option value="Degree">Degree</option>
                        <option value="Masters">Masters</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Department</label>
                        <Input
                          placeholder="e.g. CSE"
                          value={newQ.department || ''}
                          onChange={(e) => setNewQ({ ...newQ, department: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Semester</label>
                        <select
                          className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-600"
                          value={newQ.semester || ''}
                          onChange={(e) => setNewQ({ ...newQ, semester: e.target.value })}
                        >
                          <option value="">Select Semester</option>
                          <option value="Semester 1">Semester 1</option>
                          <option value="Semester 2">Semester 2</option>
                          <option value="Semester 3">Semester 3</option>
                          <option value="Semester 4">Semester 4</option>
                          <option value="Semester 5">Semester 5</option>
                          <option value="Semester 6">Semester 6</option>
                          <option value="Semester 7">Semester 7</option>
                          <option value="Semester 8">Semester 8</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ) : newQ.category === 'BCS' ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">BCS Batch Number</label>
                    <Input
                      type="number"
                      min="1"
                      max="50"
                      placeholder="e.g. 44"
                      value={newQ.bcsNumber || ''}
                      onChange={(e) => setNewQ({ ...newQ, bcsNumber: parseInt(e.target.value), group: 'Preliminary' })}
                      required
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Group</label>
                    <select
                      className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-600"
                      value={newQ.group || 'Science'}
                      onChange={(e) => setNewQ({ ...newQ, group: e.target.value as 'Science' | 'Commerce' | 'Arts' })}
                    >
                      <option value="Science">Science</option>
                      <option value="Commerce">Commerce</option>
                      <option value="Arts">Arts</option>
                      <option value="Model Test">Model Test</option>
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subject Name</label>
                    <Input
                      placeholder="e.g. Geography"
                      value={newQ.subjectName || ''}
                      onChange={(e) => setNewQ({ ...newQ, subjectName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subject Code</label>
                    <Input
                      placeholder="e.g. 110"
                      value={newQ.subjectCode || ''}
                      onChange={(e) => setNewQ({ ...newQ, subjectCode: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <select
                      className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-600"
                      value={newQ.type}
                      onChange={(e) => setNewQ({ ...newQ, type: e.target.value as 'image' | 'pdf' })}
                    >
                      <option value="image">Image</option>
                      <option value="pdf">PDF</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">File URL</label>
                    <Input
                      placeholder="https://..."
                      value={newQ.url || ''}
                      onChange={(e) => setNewQ({ ...newQ, url: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full mt-4">Upload Question</Button>
              </form>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Uploaded Questions</h3>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="divide-y divide-slate-100">
                {questions.map((q) => (
                  <div key={q.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${q.type === 'pdf' ? 'bg-rose-50 text-rose-500' : 'bg-sky-50 text-sky-500'}`}>
                        {q.type === 'pdf' ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900 line-clamp-1">{q.title}</h4>
                        <p className="text-xs text-slate-500">
                          {q.category} • {q.group || q.department} • {q.year} • {format(new Date(q.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteQuestion(q.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                {questions.length === 0 && (
                  <div className="p-8 text-center text-slate-500">No questions uploaded yet.</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'payments' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Pending Payments</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="divide-y divide-slate-100">
              {pendingUnlocks.map((u) => {
                const requestingUser = users.find(usr => usr.id === u.userId);
                return (
                  <div key={u.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                    <div>
                      <h4 className="font-medium text-slate-900">{requestingUser?.accountName || 'Unknown User'}</h4>
                      <p className="text-sm text-slate-500">{requestingUser?.email} • {requestingUser?.phone}</p>
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md">
                          {u.examType} - {u.groupOrProgram}
                        </span>
                        <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md">
                          {u.paymentMethod}
                        </span>
                        <span className="text-sm font-mono text-slate-700">
                          Txn ID: {u.transactionId}
                        </span>
                        {u.senderNumber && (
                          <span className="text-sm font-mono text-slate-500">
                            Sender: {u.senderNumber}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        onClick={() => handleApprovePayment(u.id)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1"
                        size="sm"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve
                      </Button>
                      <Button 
                        onClick={() => handleRejectPayment(u.id)}
                        variant="outline"
                        className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 gap-1"
                        size="sm"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </Button>
                    </div>
                  </div>
                );
              })}
              {pendingUnlocks.length === 0 && (
                <div className="p-8 text-center text-slate-500">No pending payments.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
