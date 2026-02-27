import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { ArrowLeft, Folder } from 'lucide-react';

export default function Category() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const questions = useStore((state) => state.questions);

  const categoryQuestions = questions.filter((q) => q.category === id);

  // Group by group or department
  const groups = Array.from(new Set(categoryQuestions.map((q) => q.group || q.department))).filter(Boolean);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm border border-slate-100 hover:bg-slate-50">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <h2 className="text-2xl font-bold text-slate-900">{id} Questions</h2>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          No questions available for this category yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {groups.map((group) => (
            <Link
              key={group}
              to={`/category/${id}/${group}`}
              className="bg-white rounded-2xl p-4 flex flex-col items-center gap-3 shadow-sm border border-slate-100 hover:shadow-md transition-shadow active:scale-[0.98]"
            >
              <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Folder className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-slate-900 text-center">{group}</h4>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
