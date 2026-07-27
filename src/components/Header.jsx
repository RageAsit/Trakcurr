import { FiDollarSign } from 'react-icons/fi';
import { APP_NAME } from '../data/constants';

export default function Header() {
  return (
    <header className="border border-slate-800 bg-slate-900/80 backdrop-blur rounded-xl px-6 py-4 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-3 text-indigo-400 font-bold text-xl">
        <div className="bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20">
          <FiDollarSign className="text-2xl text-indigo-400" />
        </div>
        <span>{APP_NAME}</span>
      </div>
    </header>
  );
}
