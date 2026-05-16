import UploadPanel from '@/components/UploadPanel';

export default function EntryPage() {
  return (
    <div className="flex-1 bg-gray-50 py-12 pt-24 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 mb-8 text-center">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Data Entry & Kalkulasi</h1>
        <p className="text-gray-500">Upload batas wilayah, input data indikator, dan hitung indeks komposit FSVA.</p>
      </div>
      <UploadPanel />
    </div>
  );
}
