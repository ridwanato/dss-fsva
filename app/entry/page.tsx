import UploadPanel from '@/components/UploadPanel';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function EntryPage() {
  return (
    <div className="flex-1 bg-transparent py-12 pt-28 h-full overflow-y-auto relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        
        {/* The 3 Cards Panel */}
        <UploadPanel />


      </div>
    </div>
  );
}
