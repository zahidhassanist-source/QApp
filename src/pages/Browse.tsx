import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore, Question } from '@/store/useStore';
import { useAuthStore } from '@/store/authStore';
import { ArrowLeft, Folder, FileText, Lock, BookOpen, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import PaymentModal from '@/components/PaymentModal';

const STRUCTURE: any = {
  SSC: {
    Arts: { type: 'years-subjects' },
    Commerce: { type: 'years-subjects' },
    Science: { type: 'years-subjects' },
    'Model Test': { type: 'years-subjects' }
  },
  HSC: {
    Arts: { type: 'years-subjects' },
    Commerce: { type: 'years-subjects' },
    Science: { type: 'years-subjects' },
    'Model Test': { type: 'years-subjects' }
  },
  NU: {
    Professionals: {
      CSE: { type: 'years-semesters' },
      BBA: { type: 'years-semesters' },
      ECE: { type: 'years-semesters' }
    },
    Honours: { type: 'years-subjects' },
    Degree: { type: 'years-subjects' },
    Masters: { type: 'years-subjects' }
  },
  BCS: {
    Preliminary: { type: 'bcs-batches' }
  }
};

const CURRENT_YEAR = 2025;
const YEARS = Array.from({ length: 12 }, (_, i) => 2025 - i); // 2025 down to 2014
const SEMESTERS = Array.from({ length: 8 }, (_, i) => `Semester ${i + 1}`);
const BCS_BATCHES = Array.from({ length: 50 }, (_, i) => 50 - i); // 50 down to 1

const SSC_ARTS_SUBJECTS = [
  { name: 'Bangla 1st Paper', code: '101' },
  { name: 'Bangla 2nd Paper', code: '102' },
  { name: 'English 1st Paper', code: '107' },
  { name: 'English 2nd Paper', code: '108' },
  { name: 'Mathematics', code: '109' },
  { name: 'Geography', code: '110' },
  { name: 'Civic & Citizenship', code: '140' },
  { name: 'Economics', code: '141' },
  { name: 'General Science', code: '127' },
  { name: 'Information & Technology', code: '154' },
  { name: 'Islam & Moral Education', code: '111' },
  { name: 'History of Bangladesh', code: '153' },
  { name: 'Agriculture Studies', code: '134' },
  { name: 'Home Science', code: '151' },
  { name: 'Music', code: '149' },
];

const SSC_SCIENCE_SUBJECTS = [
  { name: 'Bangla 1st Paper', code: '101' },
  { name: 'Bangla 2nd Paper', code: '102' },
  { name: 'English 1st Paper', code: '107' },
  { name: 'English 2nd Paper', code: '108' },
  { name: 'Mathematics', code: '109' },
  { name: 'Physics', code: '136' },
  { name: 'Chemistry', code: '137' },
  { name: 'Biology', code: '138' },
  { name: 'Higher Mathematics', code: '126' },
  { name: 'Information & Technology', code: '154' },
];

const SSC_COMMERCE_SUBJECTS = [
  { name: 'Bangla 1st Paper', code: '101' },
  { name: 'Bangla 2nd Paper', code: '102' },
  { name: 'English 1st Paper', code: '107' },
  { name: 'English 2nd Paper', code: '108' },
  { name: 'Mathematics', code: '109' },
  { name: 'Accounting', code: '146' },
  { name: 'Finance & Banking', code: '152' },
  { name: 'Business Entrepreneurship', code: '143' },
  { name: 'Information & Technology', code: '154' },
  { name: 'Economics', code: '141' },
];

const HSC_SCIENCE_SUBJECTS = [
  { name: 'Bangla 1st Paper', code: '' },
  { name: 'Bangla 2nd Paper', code: '' },
  { name: 'English 1st Paper', code: '' },
  { name: 'English 2nd Paper', code: '' },
  { name: 'Information & Communication Technology (ICT)', code: '' },
  { name: 'Physics 1st Paper', code: '' },
  { name: 'Physics 2nd Paper', code: '' },
  { name: 'Chemistry 1st Paper', code: '' },
  { name: 'Chemistry 2nd Paper', code: '' },
  { name: 'Biology 1st Paper', code: '' },
  { name: 'Biology 2nd Paper', code: '' },
  { name: 'Higher Mathematics 1st Paper', code: '' },
  { name: 'Higher Mathematics 2nd Paper', code: '' },
];

const HSC_COMMERCE_SUBJECTS = [
  { name: 'Bangla 1st Paper', code: '' },
  { name: 'Bangla 2nd Paper', code: '' },
  { name: 'English 1st Paper', code: '' },
  { name: 'English 2nd Paper', code: '' },
  { name: 'Information & Communication Technology (ICT)', code: '' },
  { name: 'Accounting 1st Paper', code: '' },
  { name: 'Accounting 2nd Paper', code: '' },
  { name: 'Finance, Banking & Insurance 1st Paper', code: '' },
  { name: 'Finance, Banking & Insurance 2nd Paper', code: '' },
  { name: 'Business Organization & Management 1st Paper', code: '' },
  { name: 'Business Organization & Management 2nd Paper', code: '' },
  { name: 'Production Management & Marketing 1st Paper', code: '' },
  { name: 'Production Management & Marketing 2nd Paper', code: '' },
];

const HSC_ARTS_SUBJECTS = [
  { name: 'Bangla 1st Paper', code: '' },
  { name: 'Bangla 2nd Paper', code: '' },
  { name: 'English 1st Paper', code: '' },
  { name: 'English 2nd Paper', code: '' },
  { name: 'Information & Communication Technology (ICT)', code: '' },
  { name: 'History 1st Paper', code: '' },
  { name: 'History 2nd Paper', code: '' },
  { name: 'Civics 1st Paper', code: '' },
  { name: 'Civics 2nd Paper', code: '' },
  { name: 'Economics 1st Paper', code: '' },
  { name: 'Economics 2nd Paper', code: '' },
  { name: 'Islamic History & Culture 1st Paper', code: '' },
  { name: 'Islamic History & Culture 2nd Paper', code: '' },
  { name: 'Social Work 1st Paper', code: '' },
  { name: 'Social Work 2nd Paper', code: '' },
  { name: 'Geography 1st Paper', code: '' },
  { name: 'Geography 2nd Paper', code: '' },
];

const GENERIC_SUBJECTS = [
  { name: 'Bangla 1st Paper', code: '101' },
  { name: 'Bangla 2nd Paper', code: '102' },
  { name: 'English 1st Paper', code: '107' },
  { name: 'English 2nd Paper', code: '108' },
  { name: 'Mathematics', code: '109' },
];

const getSubjects = (category: string, group: string) => {
  if (category === 'SSC') {
    if (group === 'Arts') return SSC_ARTS_SUBJECTS;
    if (group === 'Science') return SSC_SCIENCE_SUBJECTS;
    if (group === 'Commerce') return SSC_COMMERCE_SUBJECTS;
  }
  if (category === 'HSC') {
    if (group === 'Arts') return HSC_ARTS_SUBJECTS;
    if (group === 'Science') return HSC_SCIENCE_SUBJECTS;
    if (group === 'Commerce') return HSC_COMMERCE_SUBJECTS;
  }
  return GENERIC_SUBJECTS;
};

export default function Browse() {
  const { category, subCategory, level3, level4, level5 } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, questions } = useStore();
  const { unlocks } = useAuthStore();
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedUnlock, setSelectedUnlock] = useState<{examType: string, groupOrProgram: string} | null>(null);

  const [filterExamType, setFilterExamType] = useState<string>('');
  const [filterYear, setFilterYear] = useState<string>('');
  const [filterGroup, setFilterGroup] = useState<string>('');

  const pathParts = location.pathname.split('/').filter(Boolean).slice(1).map(decodeURIComponent); // remove 'browse'
  
  const goBack = () => navigate(-1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim().toLowerCase().replace(/\s+/g, ' '));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchResults = useMemo(() => {
    if (!debouncedQuery && !filterExamType && !filterYear && !filterGroup) return [];
    
    const searchTerms = debouncedQuery.split(' ').filter(Boolean);
    const currentCategory = filterExamType || pathParts[0]; // SSC, HSC, NU
    
    let currentBoard: string | undefined;
    let currentGroupOrProgram: string | undefined;
    let currentDepartment: string | undefined;

    if (currentCategory === 'SSC' || currentCategory === 'HSC') {
      currentBoard = pathParts[1];
      currentGroupOrProgram = filterGroup || pathParts[2];
    } else {
      currentGroupOrProgram = filterGroup || pathParts[1];
      currentDepartment = pathParts[2];
    }
    
    return questions.filter(q => {
      // 1. Filter by Category
      if (currentCategory && q.category !== currentCategory) return false;
      
      // 2. Filter by Board/Group/Program/Department
      if (currentCategory === 'SSC' || currentCategory === 'HSC') {
        if (currentBoard && q.boardName !== currentBoard) return false;
        if (currentGroupOrProgram && q.group !== currentGroupOrProgram) return false;
      } else if (currentCategory === 'NU') {
        if (currentGroupOrProgram === 'Professionals') {
           if (!filterGroup && currentDepartment && q.department !== currentDepartment) return false;
           if (!q.department) return false;
        } else if (currentGroupOrProgram) {
           if (q.group !== currentGroupOrProgram) return false;
        }
      }
      
      // 3. Filter by Year
      if (filterYear && q.year.toString() !== filterYear) return false;

      // 4. Search Matching Rules
      if (searchTerms.length > 0) {
        const subjectName = q.subjectName?.toLowerCase() || '';
        const subjectCode = q.subjectCode?.toLowerCase() || '';
        const title = q.title?.toLowerCase() || '';
        const year = q.year?.toString() || '';
        
        const searchableText = `${subjectName} ${subjectCode} ${title} ${year}`;
        
        if (!searchTerms.every(term => searchableText.includes(term))) return false;
      }
      
      return true;
    }).slice(0, 20);
  }, [debouncedQuery, filterExamType, filterYear, filterGroup, questions, pathParts]);

  const getUnlockRequirements = () => {
    const examType = pathParts[0];
    if (examType === 'SSC' || examType === 'HSC') {
      const boardName = pathParts[1];
      const groupOrProgram = pathParts[2];
      return { examType, boardName, groupOrProgram };
    } else if (examType === 'BCS') {
      return { examType, boardName: undefined, groupOrProgram: 'Preliminary' };
    } else {
      let groupOrProgram = pathParts[1];
      if (examType === 'NU' && groupOrProgram === 'Professionals') {
        groupOrProgram = pathParts[2] || 'Professionals'; // CSE, BBA, ECE
      }
      return { examType, boardName: undefined, groupOrProgram };
    }
  };

  const canAccessYear = (year: number, isModelTest: boolean, qExamType?: string, qBoardName?: string, qGroupOrProgram?: string, bcsNumber?: number) => {
    if (isModelTest) return true;
    if (user?.role === 'admin') return true;
    
    const reqs = getUnlockRequirements();
    const examType = qExamType || reqs.examType;
    const boardName = qBoardName || reqs.boardName;
    const groupOrProgram = qGroupOrProgram || reqs.groupOrProgram;
    
    if (examType === 'BCS') {
      if (bcsNumber && bcsNumber >= 49) return true;
      return unlocks.some(u => 
        u.userId === user?.id && 
        u.examType === 'BCS' && 
        u.groupOrProgram === 'Preliminary' && 
        u.unlockStatus === true
      );
    }

    if (year === 2024 || year === 2025) return true; // 2024 and 2025 are free
    
    if (examType === 'SSC' || examType === 'HSC') {
      return unlocks.some(u => 
        u.userId === user?.id && 
        u.examType === examType && 
        u.boardName === boardName &&
        u.groupOrProgram === groupOrProgram && 
        u.unlockStatus === true
      );
    } else {
      return unlocks.some(u => 
        u.userId === user?.id && 
        u.examType === examType && 
        u.groupOrProgram === groupOrProgram && 
        u.unlockStatus === true
      );
    }
  };

  const handleYearClick = (e: React.MouseEvent, year: number, isModelTest: boolean, targetPath: string) => {
    if (!canAccessYear(year, isModelTest)) {
      e.preventDefault();
      const reqs = getUnlockRequirements();
      setSelectedUnlock({ examType: reqs.examType, boardName: reqs.boardName, groupOrProgram: reqs.groupOrProgram });
      setShowPaymentModal(true);
    } else {
      navigate(targetPath);
    }
  };

  const renderContent = () => {
    if (searchQuery || filterExamType || filterYear || filterGroup) {
      return (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 mb-4">
            <select 
              value={filterExamType} 
              onChange={e => setFilterExamType(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Exams</option>
              <option value="SSC">SSC</option>
              <option value="HSC">HSC</option>
              <option value="NU">NU</option>
            </select>
            <select 
              value={filterGroup} 
              onChange={e => setFilterGroup(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Groups</option>
              <option value="Science">Science</option>
              <option value="Arts">Arts</option>
              <option value="Commerce">Commerce</option>
              <option value="Professionals">Professionals</option>
              <option value="Honours">Honours</option>
              <option value="Degree">Degree</option>
              <option value="Masters">Masters</option>
            </select>
            <select 
              value={filterYear} 
              onChange={e => setFilterYear(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Years</option>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <h3 className="text-lg font-semibold text-slate-900 px-1">
            Search Results {debouncedQuery && `for "${debouncedQuery}"`}
          </h3>
          
          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {searchResults.map((q) => {
                const isModelTest = q.group === 'Model Test';
                const groupOrProgram = q.category === 'NU' ? (q.department || q.group || 'Professionals') : (q.group || 'Science');
                const locked = !canAccessYear(q.year, isModelTest, q.category, q.boardName, groupOrProgram);
                
                return (
                  <div
                    key={q.id}
                    onClick={(e) => {
                      if (locked) {
                        e.preventDefault();
                        setSelectedUnlock({ examType: q.category, boardName: q.boardName, groupOrProgram });
                        setShowPaymentModal(true);
                      } else {
                        navigate(`/viewer/${q.id}`);
                      }
                    }}
                    className={`rounded-2xl p-4 flex items-center gap-4 shadow-sm border transition-all cursor-pointer ${
                      locked ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100 hover:shadow-md active:scale-[0.98]'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      locked ? 'bg-slate-200 text-slate-500' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      {locked ? <Lock className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-semibold truncate ${locked ? 'text-slate-500' : 'text-slate-900'}`}>
                        {q.subjectName || q.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 mt-1">
                        {q.subjectCode && <span className="font-medium text-slate-700">Code: {q.subjectCode}</span>}
                        <span>•</span>
                        <span>{q.category}</span>
                        {q.group && (
                          <>
                            <span>•</span>
                            <span>{q.group}</span>
                          </>
                        )}
                        {q.department && (
                          <>
                            <span>•</span>
                            <span>{q.department}</span>
                          </>
                        )}
                        <span>•</span>
                        <span className="font-medium">{q.year}</span>
                        {q.semester && (
                          <>
                            <span>•</span>
                            <span>{q.semester}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {locked && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="shrink-0 text-xs py-1 h-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUnlock({ examType: q.category, groupOrProgram });
                          setShowPaymentModal(true);
                        }}
                      >
                        Unlock
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : debouncedQuery ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">No results found</h3>
              <p className="text-slate-500">Try adjusting your search terms or subject code.</p>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              Type to start searching...
            </div>
          )}
        </div>
      );
    }

    const cat = pathParts[0];
    const group = pathParts[1];
    const yearStr = pathParts[2];
    const subjectOrSemester = pathParts[3];

    // Level 1: Boards for SSC/HSC, Groups for NU
    if (pathParts.length === 1) {
      if (cat === 'SSC' || cat === 'HSC') {
        const boards = [
          'Dhaka Board', 'Rajshahi Board', 'Comilla Board', 'Jessore Board',
          'Chittagong Board', 'Barisal Board', 'Sylhet Board', 'Dinajpur Board',
          'Mymensingh Board', 'Madrasah Education Board', 'Technical Education Board'
        ];
        return (
          <div className="grid grid-cols-2 gap-4">
            {boards.map((b) => (
              <Link
                key={b}
                to={`${location.pathname}/${b}`}
                className="bg-white rounded-2xl p-4 flex flex-col items-center gap-3 shadow-sm border border-slate-100 hover:shadow-md transition-shadow active:scale-[0.98]"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Folder className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-slate-900 text-center">{b}</h4>
              </Link>
            ))}
          </div>
        );
      } else {
        const groups = Object.keys(STRUCTURE[cat] || {});
        return (
          <div className="grid grid-cols-2 gap-4">
            {groups.map((g) => (
              <Link
                key={g}
                to={`${location.pathname}/${g}`}
                className="bg-white rounded-2xl p-4 flex flex-col items-center gap-3 shadow-sm border border-slate-100 hover:shadow-md transition-shadow active:scale-[0.98]"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Folder className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-slate-900 text-center">{g}</h4>
              </Link>
            ))}
          </div>
        );
      }
    }

    // Level 2: Groups for SSC/HSC, Years/Depts for NU, Batches for BCS
    if (pathParts.length === 2) {
      if (cat === 'BCS' && group === 'Preliminary') {
        return (
          <div className="grid grid-cols-2 gap-4">
            {BCS_BATCHES.map((batch) => {
              const locked = !canAccessYear(0, false, 'BCS', undefined, 'Preliminary', batch);
              return (
                <a
                  key={batch}
                  href={`${location.pathname}/${batch}th BCS`}
                  onClick={(e) => {
                    if (locked) {
                      e.preventDefault();
                      setSelectedUnlock({ examType: 'BCS', groupOrProgram: 'Preliminary' });
                      setShowPaymentModal(true);
                    } else {
                      navigate(`${location.pathname}/${batch}th BCS`);
                    }
                  }}
                  className={`rounded-2xl p-4 flex flex-col items-center gap-3 shadow-sm border transition-all active:scale-[0.98] relative overflow-hidden ${
                    locked ? 'bg-slate-50 border-slate-200 hover:border-indigo-300 hover:shadow-md' : 'bg-white border-slate-100 hover:shadow-md'
                  }`}
                >
                  {locked && (
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-100/80 pointer-events-none" />
                  )}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 ${
                    locked ? 'bg-slate-200 text-slate-500' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {locked ? <Lock className="w-5 h-5" /> : <Folder className="w-6 h-6" />}
                  </div>
                  <h4 className={`font-semibold text-center z-10 ${locked ? 'text-slate-600' : 'text-slate-900'}`}>
                    {batch}th BCS
                  </h4>
                  {locked && (
                    <div className="absolute top-2 right-2">
                      <span className="flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                      </span>
                    </div>
                  )}
                </a>
              );
            })}
          </div>
        );
      }

      if (cat === 'SSC' || cat === 'HSC') {
        const groups = Object.keys(STRUCTURE[cat] || {});
        return (
          <div className="grid grid-cols-2 gap-4">
            {groups.map((g) => (
              <Link
                key={g}
                to={`${location.pathname}/${g}`}
                className="bg-white rounded-2xl p-4 flex flex-col items-center gap-3 shadow-sm border border-slate-100 hover:shadow-md transition-shadow active:scale-[0.98]"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Folder className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-slate-900 text-center">{g}</h4>
              </Link>
            ))}
          </div>
        );
      }
      
      if (cat === 'NU' && group === 'Professionals') {
        const depts = Object.keys(STRUCTURE.NU.Professionals);
        return (
          <div className="grid grid-cols-2 gap-4">
            {depts.map((d) => (
              <Link
                key={d}
                to={`${location.pathname}/${d}`}
                className="bg-white rounded-2xl p-4 flex flex-col items-center gap-3 shadow-sm border border-slate-100 hover:shadow-md transition-shadow active:scale-[0.98]"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Folder className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-slate-900 text-center">{d}</h4>
              </Link>
            ))}
          </div>
        );
      }

      const isModelTest = group === 'Model Test';
      return (
        <div className="grid grid-cols-2 gap-4">
          {YEARS.map((year) => {
            const locked = !canAccessYear(year, isModelTest);
            return (
              <a
                key={year}
                href={`${location.pathname}/${year}`}
                onClick={(e) => handleYearClick(e, year, isModelTest, `${location.pathname}/${year}`)}
                className={`rounded-2xl p-4 flex flex-col items-center gap-3 shadow-sm border transition-all active:scale-[0.98] relative overflow-hidden ${
                  locked ? 'bg-slate-50 border-slate-200 hover:border-indigo-300 hover:shadow-md' : 'bg-white border-slate-100 hover:shadow-md'
                }`}
              >
                {locked && (
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-100/80 pointer-events-none" />
                )}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 ${
                  locked ? 'bg-slate-200 text-slate-500' : 'bg-amber-50 text-amber-600'
                }`}>
                  {locked ? <Lock className="w-5 h-5" /> : <Folder className="w-6 h-6" />}
                </div>
                <h4 className={`font-semibold text-center z-10 ${locked ? 'text-slate-600' : 'text-slate-900'}`}>
                  {year}
                </h4>
                {locked && (
                  <div className="absolute top-2 right-2">
                    <span className="flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                  </div>
                )}
              </a>
            );
          })}
        </div>
      );
    }

    // Level 3: Years for SSC/HSC, Subjects/Semesters for NU, Subjects/Questions for BCS
    if (pathParts.length === 3) {
      if (cat === 'BCS' && group === 'Preliminary') {
        const bcsNumber = parseInt(pathParts[2]);
        if (!canAccessYear(0, false, 'BCS', undefined, 'Preliminary', bcsNumber)) {
          return (
            <div className="text-center py-12">
              <Lock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Content Locked</h3>
              <p className="text-slate-500 mb-6">Unlock all BCS batches to access this content.</p>
              <Button onClick={() => setShowPaymentModal(true)}>Unlock Now</Button>
            </div>
          );
        }

        const filteredQuestions = questions.filter(q => 
          q.category === 'BCS' && 
          q.group === 'Preliminary' && 
          q.bcsNumber === bcsNumber
        );

        const uniqueSubjects = Array.from(new Set(filteredQuestions.map(q => q.subjectName).filter(Boolean)));

        if (uniqueSubjects.length > 0) {
          return (
            <div className="grid grid-cols-1 gap-4">
              {uniqueSubjects.map((subjectName) => (
                <Link
                  key={subjectName}
                  to={`${location.pathname}/${encodeURIComponent(subjectName as string)}`}
                  className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 text-indigo-600">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{subjectName}</h4>
                  </div>
                </Link>
              ))}
            </div>
          );
        }

        if (filteredQuestions.length === 0) {
          return <div className="text-center py-12 text-slate-500">No questions found for this selection.</div>;
        }

        return (
          <div className="grid grid-cols-1 gap-4">
            {filteredQuestions.map((q) => (
              <Link
                key={q.id}
                to={`/viewer/${q.id}`}
                className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow active:scale-[0.98]"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 text-indigo-600">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 line-clamp-2">{q.title}</h4>
                  <p className="text-sm text-slate-500 mt-1">{q.bcsNumber}th BCS {q.year ? `• ${q.year}` : ''}</p>
                </div>
              </Link>
            ))}
          </div>
        );
      }

      if (cat === 'SSC' || cat === 'HSC') {
        const isModelTest = pathParts[2] === 'Model Test';
        return (
          <div className="grid grid-cols-2 gap-4">
            {YEARS.map((year) => {
              const locked = !canAccessYear(year, isModelTest);
              return (
                <a
                  key={year}
                  href={`${location.pathname}/${year}`}
                  onClick={(e) => handleYearClick(e, year, isModelTest, `${location.pathname}/${year}`)}
                  className={`rounded-2xl p-4 flex flex-col items-center gap-3 shadow-sm border transition-all active:scale-[0.98] relative overflow-hidden ${
                    locked ? 'bg-slate-50 border-slate-200 hover:border-indigo-300 hover:shadow-md' : 'bg-white border-slate-100 hover:shadow-md'
                  }`}
                >
                  {locked && (
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-100/80 pointer-events-none" />
                  )}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 ${
                    locked ? 'bg-slate-200 text-slate-500' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {locked ? <Lock className="w-5 h-5" /> : <Folder className="w-6 h-6" />}
                  </div>
                  <h4 className={`font-semibold text-center z-10 ${locked ? 'text-slate-600' : 'text-slate-900'}`}>
                    {year}
                  </h4>
                  {locked && (
                    <div className="absolute top-2 right-2">
                      <span className="flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                      </span>
                    </div>
                  )}
                </a>
              );
            })}
          </div>
        );
      }
      if (cat === 'NU' && group === 'Professionals') {
        return (
          <div className="grid grid-cols-2 gap-4">
            {SEMESTERS.map((sem) => (
              <Link
                key={sem}
                to={`${location.pathname}/${sem.replace(' ', '-')}`}
                className="bg-white rounded-2xl p-4 flex flex-col items-center gap-3 shadow-sm border border-slate-100 hover:shadow-md transition-shadow active:scale-[0.98]"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Folder className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-slate-900 text-center">{sem}</h4>
              </Link>
            ))}
          </div>
        );
      }

      const isModelTest = group === 'Model Test';
      const yearNum = Number(yearStr);
      if (!canAccessYear(yearNum, isModelTest)) {
        return (
          <div className="text-center py-12">
            <Lock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Content Locked</h3>
            <p className="text-slate-500 mb-6">Unlock all previous years to access this content.</p>
            <Button onClick={() => setShowPaymentModal(true)}>Unlock Now</Button>
          </div>
        );
      }

      const subjects = getSubjects(cat, group);
      return (
        <div className="grid grid-cols-1 gap-4">
          {subjects.map((sub) => (
            <Link
              key={sub.name}
              to={`${location.pathname}/${encodeURIComponent(sub.name)}`}
              className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow active:scale-[0.98]"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 text-indigo-600">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900">{sub.name}</h4>
                <p className="text-sm text-slate-500 mt-1">Code: {sub.code}</p>
              </div>
            </Link>
          ))}
        </div>
      );
    }

    // Level 4: Questions for Subject OR Semesters for NU Professionals OR Questions for BCS Subject
    if (pathParts.length === 4) {
      if (cat === 'BCS' && group === 'Preliminary') {
        const bcsNumber = parseInt(pathParts[2]);
        const subjectName = pathParts[3];

        if (!canAccessYear(0, false, 'BCS', undefined, 'Preliminary', bcsNumber)) {
          return (
            <div className="text-center py-12">
              <Lock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Content Locked</h3>
              <p className="text-slate-500 mb-6">Unlock all BCS batches to access this content.</p>
              <Button onClick={() => setShowPaymentModal(true)}>Unlock Now</Button>
            </div>
          );
        }

        const filteredQuestions = questions.filter(q => 
          q.category === 'BCS' && 
          q.group === 'Preliminary' && 
          q.bcsNumber === bcsNumber &&
          q.subjectName === subjectName
        );

        if (filteredQuestions.length === 0) {
          return <div className="text-center py-12 text-slate-500">No questions found for this selection.</div>;
        }

        return (
          <div className="grid grid-cols-1 gap-4">
            {filteredQuestions.map((q) => (
              <Link
                key={q.id}
                to={`/viewer/${q.id}`}
                className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow active:scale-[0.98]"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 text-indigo-600">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 line-clamp-2">{q.title}</h4>
                  <p className="text-sm text-slate-500 mt-1">{q.bcsNumber}th BCS {q.year ? `• ${q.year}` : ''}</p>
                </div>
              </Link>
            ))}
          </div>
        );
      }

      if (cat === 'SSC' || cat === 'HSC') {
        const board = pathParts[1];
        const group = pathParts[2];
        const yearNum = Number(pathParts[3]);
        const isModelTest = group === 'Model Test';
        
        if (!canAccessYear(yearNum, isModelTest)) {
          return (
            <div className="text-center py-12">
              <Lock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Content Locked</h3>
              <p className="text-slate-500 mb-6">Unlock all previous years to access this content.</p>
              <Button onClick={() => setShowPaymentModal(true)}>Unlock Now</Button>
            </div>
          );
        }

        const subjects = getSubjects(cat, group);
        return (
          <div className="grid grid-cols-1 gap-4">
            {subjects.map((sub) => (
              <Link
                key={sub.name}
                to={`${location.pathname}/${encodeURIComponent(sub.name)}`}
                className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow active:scale-[0.98]"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 text-indigo-600">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">{sub.name}</h4>
                  <p className="text-sm text-slate-500 mt-1">Code: {sub.code}</p>
                </div>
              </Link>
            ))}
          </div>
        );
      }

      if (cat === 'NU' && group === 'Professionals') {
        return (
          <div className="grid grid-cols-2 gap-4">
            {YEARS.map((year) => {
              const locked = !canAccessYear(year, false);
              return (
                <a
                  key={year}
                  href={`${location.pathname}/${year}`}
                  onClick={(e) => handleYearClick(e, year, false, `${location.pathname}/${year}`)}
                  className={`rounded-2xl p-4 flex flex-col items-center gap-3 shadow-sm border transition-all active:scale-[0.98] relative overflow-hidden ${
                    locked ? 'bg-slate-50 border-slate-200 hover:border-indigo-300 hover:shadow-md' : 'bg-white border-slate-100 hover:shadow-md'
                  }`}
                >
                  {locked && (
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-100/80 pointer-events-none" />
                  )}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 ${
                    locked ? 'bg-slate-200 text-slate-500' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {locked ? <Lock className="w-5 h-5" /> : <Folder className="w-6 h-6" />}
                  </div>
                  <h4 className={`font-semibold text-center z-10 ${locked ? 'text-slate-600' : 'text-slate-900'}`}>
                    {year}
                  </h4>
                  {locked && (
                    <div className="absolute top-2 right-2">
                      <span className="flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                      </span>
                    </div>
                  )}
                </a>
              );
            })}
          </div>
        );
      }

      const yearNum = Number(pathParts[2]);
      const subjectName = pathParts[3] || '';
      
      const filteredQuestions = questions.filter(q => 
        q.category === cat &&
        q.group === group &&
        q.year === yearNum &&
        (q.subjectName === subjectName || !q.subjectName) // fallback if no subjectName is set
      );

      if (filteredQuestions.length === 0) {
        return <div className="text-center py-12 text-slate-500">No questions found for this selection.</div>;
      }

      return (
        <div className="grid grid-cols-1 gap-4">
          {filteredQuestions.map((q) => (
            <Link
              key={q.id}
              to={`/viewer/${q.id}`}
              className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow active:scale-[0.98]"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 text-indigo-600">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 line-clamp-2">{q.title}</h4>
                <p className="text-sm text-slate-500 mt-1">{q.year} • {q.subjectName || subjectName}</p>
              </div>
            </Link>
          ))}
        </div>
      );
    }

    // Level 5: Questions for NU Professionals Semester or SSC/HSC Questions
    if (pathParts.length === 5) {
      if (cat === 'SSC' || cat === 'HSC') {
        const board = pathParts[1];
        const group = pathParts[2];
        const yearNum = Number(pathParts[3]);
        const subjectName = pathParts[4];
        
        const filteredQuestions = questions.filter(q => 
          q.category === cat &&
          q.boardName === board &&
          (q.group === group || group === 'Model Test') &&
          q.year === yearNum &&
          (q.subjectName === subjectName || !q.subjectName) // fallback if no subjectName is set
        );

        if (filteredQuestions.length === 0) {
          return <div className="text-center py-12 text-slate-500">No questions found for this selection.</div>;
        }

        return (
          <div className="grid grid-cols-1 gap-4">
            {filteredQuestions.map((q) => (
              <Link
                key={q.id}
                to={`/viewer/${q.id}`}
                className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow active:scale-[0.98]"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 text-indigo-600">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 line-clamp-2">{q.title}</h4>
                  <p className="text-sm text-slate-500 mt-1">{q.year} • {q.subjectName || subjectName}</p>
                </div>
              </Link>
            ))}
          </div>
        );
      }

      if (cat === 'NU' && group === 'Professionals') {
        const yearNum = Number(pathParts[4]);
        if (!canAccessYear(yearNum, false)) {
          return (
            <div className="text-center py-12">
              <Lock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Content Locked</h3>
              <p className="text-slate-500 mb-6">Unlock all previous years to access this content.</p>
              <Button onClick={() => setShowPaymentModal(true)}>Unlock Now</Button>
            </div>
          );
        }

        const department = pathParts[2];
        const semester = pathParts[3].replace('-', ' ');
        
        // Get unique subjects for this department, semester, and year from questions
        const filteredQuestions = questions.filter(q => 
          q.category === cat &&
          q.department === department &&
          q.semester === semester &&
          q.year === yearNum
        );

        const uniqueSubjects = Array.from(new Set(filteredQuestions.map(q => q.subjectName).filter(Boolean)));

        if (uniqueSubjects.length === 0) {
          return <div className="text-center py-12 text-slate-500">No subjects found for this selection.</div>;
        }

        return (
          <div className="grid grid-cols-1 gap-4">
            {uniqueSubjects.map((subjectName) => {
              const subjectCode = filteredQuestions.find(q => q.subjectName === subjectName)?.subjectCode;
              return (
                <Link
                  key={subjectName}
                  to={`${location.pathname}/${encodeURIComponent(subjectName as string)}`}
                  className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 text-indigo-600">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{subjectName}</h4>
                    {subjectCode && <p className="text-sm text-slate-500 mt-1">Code: {subjectCode}</p>}
                  </div>
                </Link>
              );
            })}
          </div>
        );
      }
    }

    // Level 6: Questions for NU Professionals
    if (pathParts.length === 6) {
      if (cat === 'NU' && group === 'Professionals') {
        const department = pathParts[2];
        const semester = pathParts[3].replace('-', ' ');
        const yearNum = Number(pathParts[4]);
        const subjectName = pathParts[5];

        const filteredQuestions = questions.filter(q => 
          q.category === cat &&
          q.department === department &&
          q.semester === semester &&
          q.year === yearNum &&
          q.subjectName === subjectName
        );

        if (filteredQuestions.length === 0) {
          return <div className="text-center py-12 text-slate-500">No questions found for this selection.</div>;
        }

        return (
          <div className="grid grid-cols-1 gap-4">
            {filteredQuestions.map((q) => (
              <Link
                key={q.id}
                to={`/viewer/${q.id}`}
                className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow active:scale-[0.98]"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 text-indigo-600">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 line-clamp-2">{q.title}</h4>
                  <p className="text-sm text-slate-500 mt-1">{q.year} • {q.semester}</p>
                </div>
              </Link>
            ))}
          </div>
        );
      }
    }

    return null;
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={goBack} className="p-2 bg-white rounded-full shadow-sm border border-slate-100 hover:bg-slate-50">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <h2 className="text-xl font-bold text-slate-900 truncate">
          {(pathParts[pathParts.length - 1] || 'Browse').replace('-', ' ')}
        </h2>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search Subject Name or Code"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-10 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
        />
        {searchQuery && (
          <button 
            onClick={() => {
              setSearchQuery('');
              setFilterExamType('');
              setFilterGroup('');
              setFilterYear('');
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>

      {renderContent()}

      {/* Payment Modal */}
      {showPaymentModal && selectedUnlock && (
        <PaymentModal 
          examType={selectedUnlock.examType}
          boardName={selectedUnlock.boardName}
          groupOrProgram={selectedUnlock.groupOrProgram}
          onClose={() => setShowPaymentModal(false)} 
        />
      )}
    </div>
  );
}
