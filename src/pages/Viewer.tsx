import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { useAuthStore } from '@/store/authStore';
import { ArrowLeft, Download, ShieldAlert, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '@/components/ui/Button';
import PaymentModal from '@/components/PaymentModal';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Use local worker to avoid CORS and network issues
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

export default function Viewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const question = useStore((state) => state.questions.find((q) => q.id === id));
  const { user } = useStore();
  const { unlocks } = useAuthStore();
  
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const CURRENT_YEAR = 2025;

  const canAccessYear = (year: number, isModelTest: boolean, examType: string, boardName: string | undefined, groupOrProgram: string) => {
    if (isModelTest) return true;
    if (user?.role === 'admin') return true;
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

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  useEffect(() => {
    // Simulate security measures
    const preventContextMenu = (e: MouseEvent) => e.preventDefault();
    const preventCopy = (e: ClipboardEvent) => e.preventDefault();
    
    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('copy', preventCopy);
    
    // Add a class to body to disable selection
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';

    return () => {
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('copy', preventCopy);
      document.body.style.userSelect = 'auto';
      document.body.style.webkitUserSelect = 'auto';
    };
  }, []);

  if (!question) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white">
        <p>Question not found.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-indigo-400 underline">Go back</button>
      </div>
    );
  }

  const isModelTest = question.group === 'Model Test';
  const groupOrProgram = question.category === 'NU' ? (question.department || question.group || 'Professionals') : (question.group || 'Science');
  const locked = !canAccessYear(question.year, isModelTest, question.category, question.boardName, groupOrProgram);

  if (locked) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white p-6 text-center">
        <Lock className="w-16 h-16 text-slate-500 mb-6" />
        <h2 className="text-2xl font-bold mb-2">Content Locked</h2>
        <p className="text-slate-400 mb-8 max-w-md">
          This question is from {question.year} and requires an active unlock for {question.category} {question.boardName ? `${question.boardName} ` : ''}{groupOrProgram}.
        </p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
          <Button onClick={() => setShowPaymentModal(true)}>Unlock Now</Button>
        </div>
        {showPaymentModal && (
          <PaymentModal 
            examType={question.category}
            boardName={question.boardName}
            groupOrProgram={groupOrProgram}
            onClose={() => setShowPaymentModal(false)} 
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black text-white">
      {/* Top Bar */}
      <div className="h-14 flex items-center justify-between px-4 bg-black/50 backdrop-blur-md absolute top-0 left-0 right-0 z-50">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="font-medium text-sm truncate max-w-[200px]">{question.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full border border-amber-400/20">
            <ShieldAlert className="w-3 h-3" /> Protected
          </div>
        </div>
      </div>

      {/* Viewer Area */}
      <div className="flex-1 overflow-hidden relative pt-14 flex items-center justify-center">
        {/* Watermark */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10 z-40">
          <div className="transform -rotate-45 text-4xl font-bold tracking-widest text-white whitespace-nowrap">
            QUESTION BD • DO NOT COPY
          </div>
        </div>

        {question.type === 'image' ? (
          <TransformWrapper
            initialScale={1}
            minScale={0.5}
            maxScale={4}
            centerOnInit
            wheel={{ step: 0.1 }}
          >
            <TransformComponent wrapperClass="w-full h-full" contentClass="w-full h-full flex items-center justify-center">
              <img
                src={question.url}
                alt={question.title}
                className="max-w-full max-h-full object-contain pointer-events-none"
                draggable={false}
              />
            </TransformComponent>
          </TransformWrapper>
        ) : (
          <div className="flex flex-col items-center justify-center p-4 w-full h-full overflow-y-auto">
            <Document
              file={question.url}
              onLoadSuccess={onDocumentLoadSuccess}
              className="flex flex-col items-center"
              loading={
                <div className="flex items-center justify-center p-8 text-slate-400">
                  Loading PDF...
                </div>
              }
              error={
                <div className="flex items-center justify-center p-8 text-rose-400">
                  Failed to load PDF file.
                </div>
              }
            >
              <Page 
                pageNumber={pageNumber} 
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="max-w-full shadow-xl"
                width={Math.min(window.innerWidth - 32, 800)}
              />
            </Document>
            
            {numPages && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 z-50">
                <button
                  disabled={pageNumber <= 1}
                  onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                  className="p-1 hover:bg-white/10 rounded-full disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <span className="text-sm font-medium text-white/90">
                  {pageNumber} / {numPages}
                </span>
                <button
                  disabled={pageNumber >= numPages}
                  onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages))}
                  className="p-1 hover:bg-white/10 rounded-full disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
