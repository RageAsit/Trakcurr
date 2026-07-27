import { useForm } from 'react-hook-form';
import { FiCheckCircle, FiLayers } from 'react-icons/fi';
import Header from '../components/Header';
import { formatDate } from '../utils/formatters';

export default function HomePage() {
  const { register } = useForm();
  const currentDate = formatDate(new Date(), 'MMMM dd, yyyy');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Header />
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-xl">
        <div className="flex items-center gap-3 text-indigo-400 mb-4">
          <FiLayers className="text-3xl" />
          <h1 className="text-2xl font-bold text-white">Application Architecture Ready</h1>
        </div>
        <p className="text-slate-400 mb-6">
          Modern React 19 Vite application configured with Tailwind CSS, React Router DOM, Zustand, React Hook Form, date-fns, and React Icons.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 flex items-center gap-3">
            <FiCheckCircle className="text-emerald-400 text-xl flex-shrink-0" />
            <div>
              <div className="font-semibold text-slate-200">Dependencies</div>
              <div className="text-sm text-slate-400">All required libraries configured</div>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 flex items-center gap-3">
            <FiCheckCircle className="text-emerald-400 text-xl flex-shrink-0" />
            <div>
              <div className="font-semibold text-slate-200">Date Formatting</div>
              <div className="text-sm text-slate-400">{currentDate}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
