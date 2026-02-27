import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, School, Briefcase } from 'lucide-react';

export default function Home() {
  const categories = [
    { id: 'SSC', name: 'SSC', icon: <School className="w-8 h-8 text-indigo-600" />, desc: 'Secondary School Certificate' },
    { id: 'HSC', name: 'HSC', icon: <GraduationCap className="w-8 h-8 text-emerald-600" />, desc: 'Higher Secondary Certificate' },
    { id: 'NU', name: 'National University', icon: <BookOpen className="w-8 h-8 text-amber-600" />, desc: 'Honours & Masters' },
    { id: 'BCS/Preliminary', name: 'BCS Preliminary', icon: <Briefcase className="w-8 h-8 text-purple-600" />, desc: '1st to 50th BCS' },
  ];

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-200">
        <h2 className="text-2xl font-bold mb-2">Find Previous Questions</h2>
        <p className="text-indigo-100 text-sm">Select a category below to browse and search for questions.</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4 px-1">Categories</h3>
        <div className="grid grid-cols-1 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/browse/${cat.id}`}
              className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow active:scale-[0.98]"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0">
                {cat.icon}
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 text-lg">{cat.name}</h4>
                <p className="text-sm text-slate-500">{cat.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
