'use client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { PRIORITY_LABELS } from '@/lib/fsva/constants';

const mockPieData = [
  { name: 'Prioritas 1', value: 2 },
  { name: 'Prioritas 2', value: 5 },
  { name: 'Prioritas 3', value: 12 },
  { name: 'Prioritas 4', value: 18 },
  { name: 'Prioritas 5', value: 8 },
  { name: 'Prioritas 6', value: 3 },
];

export default function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="font-bold text-gray-700 mb-4">Distribusi Prioritas FSVA</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={mockPieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {mockPieData.map((entry, index) => {
                  const prio = index + 1 as keyof typeof PRIORITY_LABELS;
                  return <Cell key={`cell-${index}`} fill={PRIORITY_LABELS[prio].fill} />;
                })}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="font-bold text-gray-700 mb-4">Faktor Berpengaruh P1-P3</h3>
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
          {/* Mock Bar Chart */}
          (Area ini akan menampilkan grafik indikator dengan bobot pengaruh terbesar terhadap kerentanan)
        </div>
      </div>
    </div>
  );
}
