import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { ArrowLeft, Calendar, FileText, Image as ImageIcon, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function YearList() {
  const { id, group } = useParams<{ id: string; group: string }>();
  const navigate = useNavigate();
  const { questions, bookmarks, toggleBookmark } = useStore();

  const filteredQuestions = questions.filter(
    (q) => q.category === id && (q.group === group || q.department === group)
  );

  const years = Array.from(new Set(filteredQuestions.map((q) => q.year))).sort((a, b) => b - a);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm border border-slate-100 hover:bg-slate-50">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{group}</h2>
          <p className="text-sm text-slate-500">{id} Previous Questions</p>
        </div>
      </div>

      {years.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          No questions available for this group yet.
        </div>
      ) : (
        <div className="space-y-8">
          {years.map((year) => (
            <div key={year} className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">{year}</h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {filteredQuestions
                  .filter((q) => q.year === year)
                  .map((q) => (
                    <div
                      key={q.id}
                      className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                    >
                      <Link to={`/viewer/${q.id}`} className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                          {q.type === 'pdf' ? (
                            <FileText className="w-5 h-5 text-rose-500" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-sky-500" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 line-clamp-1">{q.title}</h4>
                          <p className="text-xs text-slate-500">
                            {q.semester ? `${q.semester} Semester • ` : ''}
                            {q.type.toUpperCase()}
                          </p>
                        </div>
                      </Link>
                      <button
                        onClick={() => toggleBookmark(q.id)}
                        className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        <Bookmark className={`w-5 h-5 ${bookmarks.includes(q.id) ? 'fill-indigo-600 text-indigo-600' : ''}`} />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
