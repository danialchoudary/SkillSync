import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const JobStatusChart = ({ data }) => {
  return (
    <div className="bg-white shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6 text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 3v11.25M3.75 14.25v6M3.75 20.25h16.5M20.25 20.25v-6M20.25 14.25V3M20.25 3H3.75m16.5 0v6M3.75 9h16.5"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Job Status</h3>
          <p className="text-xs text-gray-500">Current distribution</p>
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
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3 mt-4 pt-4 border-t border-gray-100">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
              <span className="text-sm text-gray-600">{item.name}</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobStatusChart;