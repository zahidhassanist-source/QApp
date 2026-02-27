import { Link } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Bookmark, FileText, Image as ImageIcon } from 'lucide-react';

export default function Bookmarks() {
  const { questions, bookmarks, toggleBookmark } = useStore();

  const bookmarkedQuestions = questions.filter((q) => bookmarks.includes(q.id));

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
          <Bookmark className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Bookmarks</h2>
          <p className="text-sm text-slate-500">Your saved questions</p>
        </div>
      </div>

      {bookmarkedQuestions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 space-y-4">
          <Bookmark className="w-16 h-16 text-slate-200" />
          <p>No bookmarks yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {bookmarkedQuestions.map((q) => (
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
                    {q.category} • {q.year} • {q.type.toUpperCase()}
                  </p>
                </div>
              </Link>
              <button
                onClick={() => toggleBookmark(q.id)}
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <Bookmark className="w-5 h-5 fill-indigo-600" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
