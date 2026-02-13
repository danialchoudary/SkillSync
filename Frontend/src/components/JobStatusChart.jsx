import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';

const JobStatusChart = ({ data }) => {
  return (
    <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)] shadow-[var(--shadow-sm)]">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
          <PieIcon size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-tight">Job Status</h3>
          <p className="text-[11px] font-medium text-[var(--color-text-tertiary)]">Current distribution</p>
        </div>
      </div>

      <div className="h-64 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              animationBegin={0}
              animationDuration={1000}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(8px)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-md)',
                padding: '8px 12px',
              }}
              itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              cursor={{ fill: 'transparent' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3 mt-6 pt-6 border-t border-[var(--color-border)]">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between group">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full ring-2 ring-white" style={{ backgroundColor: item.color }}></div>
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">{item.name}</span>
            </div>
            <span className="text-sm font-bold text-[var(--color-text-primary)]">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobStatusChart;