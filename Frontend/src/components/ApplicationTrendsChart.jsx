import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3 } from 'lucide-react';

const ApplicationTrendsChart = ({ data }) => {
  return (
    <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)] shadow-[var(--shadow-sm)]">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-bg)] flex items-center justify-center text-[var(--color-accent)]">
          <BarChart3 size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-tight">Application Trends</h3>
          <p className="text-[11px] font-medium text-[var(--color-text-tertiary)]">6-month overview</p>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.labels.map((label, index) => ({ label, value: data.data[index] }))}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-text-tertiary)', fontSize: 11, fontWeight: 500 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-text-tertiary)', fontSize: 11, fontWeight: 500 }}
            />
            <Tooltip
              cursor={{ fill: 'var(--color-surface-secondary)', opacity: 0.4 }}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(8px)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-md)',
                padding: '8px 12px',
              }}
              itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-accent)' }}
              labelStyle={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}
            />
            <Bar
              dataKey="value"
              fill="var(--color-accent)"
              radius={[6, 6, 0, 0]}
              barSize={32}
              animationDuration={1500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ApplicationTrendsChart;