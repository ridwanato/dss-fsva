import DashboardCharts from '@/components/DashboardCharts';

export default function DashboardPage() {
  return (
    <div className="flex-1 bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-6 mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Dashboard Analisis</h1>
        <p className="text-gray-500">Ringkasan status ketahanan dan kerentanan pangan.</p>
      </div>
      
      <div className="max-w-6xl mx-auto">
        <DashboardCharts />
      </div>
    </div>
  );
}
