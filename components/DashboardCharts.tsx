'use client';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { PRIORITY_LABELS, WEIGHTS } from '@/lib/fsva/constants';

interface DashboardChartsProps {
  data: any[];
}

export default function DashboardCharts({ data }: DashboardChartsProps) {
  // 1. Hitung Distribusi Prioritas (Pie Chart)
  const priorityCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  data.forEach(row => {
    if (row.prioritas) priorityCounts[row.prioritas]++;
  });

  const pieData = Object.keys(priorityCounts)
    .map(key => ({
      name: `Prioritas ${key}`,
      value: priorityCounts[Number(key)],
      key: Number(key)
    }))
    .filter(item => item.value > 0);

  // 2. Hitung Faktor Berpengaruh di Daerah Rentan (P1-P3)
  // Menjumlahkan bobot jika indikator individu berada di P1-P3
  const faktorMap = {
    'NCPR': { sum: 0, weight: WEIGHTS.ncpr, id: 'p_ncpr' },
    'Energi (AKE)': { sum: 0, weight: WEIGHTS.energy, id: 'p_energy' },
    'Protein': { sum: 0, weight: WEIGHTS.protein, id: 'p_protein' },
    'Cadangan': { sum: 0, weight: WEIGHTS.cadangan, id: 'p_cadangan' },
    'Kemiskinan': { sum: 0, weight: WEIGHTS.poverty, id: 'p_poverty' },
    'Harga (CV)': { sum: 0, weight: WEIGHTS.cv_harga, id: 'p_cv_harga' },
    'PoU': { sum: 0, weight: WEIGHTS.pou, id: 'p_pou' },
    'Lama Sekolah': { sum: 0, weight: WEIGHTS.sekolah, id: 'p_sekolah' },
    'Akses Air': { sum: 0, weight: WEIGHTS.air, id: 'p_air' },
    'Skor PPH': { sum: 0, weight: WEIGHTS.pph, id: 'p_pph' },
    'Stunting': { sum: 0, weight: WEIGHTS.stunting, id: 'p_stunting' },
  };

  data.forEach(row => {
    if (row.prioritas <= 3) { // Hanya daerah rentan
      Object.keys(faktorMap).forEach(key => {
        const k = key as keyof typeof faktorMap;
        const p_val = row[faktorMap[k].id];
        if (p_val <= 3) { // Jika indikator individu juga rentan
          faktorMap[k].sum += faktorMap[k].weight;
        }
      });
    }
  });

  const barData = Object.keys(faktorMap)
    .map(key => ({
      name: key,
      'Total Bobot': Math.round(faktorMap[key as keyof typeof faktorMap].sum * 10) / 10
    }))
    .filter(item => item['Total Bobot'] > 0)
    .sort((a, b) => b['Total Bobot'] - a['Total Bobot']);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="font-bold text-[#1E1B4B] mb-4">Distribusi Prioritas FSVA</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => {
                  const prio = entry.key as keyof typeof PRIORITY_LABELS;
                  return <Cell key={`cell-${index}`} fill={PRIORITY_LABELS[prio].fill} />;
                })}
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="font-bold text-[#1E1B4B] mb-4">Faktor Berpengaruh P1-P3 (Total Bobot)</h3>
        <div className="h-64">
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(109,94,245,0.1)" />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11, fill: '#64748b' }} stroke="#94a3b8" />
                <Tooltip cursor={{ fill: '#F5F3FF' }} contentStyle={{ borderRadius: '8px', border: '1px solid rgba(109,94,245,0.2)' }} />
                <Bar dataKey="Total Bobot" fill="#6D5EF5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">
              Tidak ada daerah rentan (P1-P3) atau data belum tersedia.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
