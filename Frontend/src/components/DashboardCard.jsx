import React from 'react';

const DashboardCard = ({ title, value, icon: Icon, color }) => {
  return (
    <div className={`bg-white shadow-md rounded-lg p-4 border-l-4 border-${color}-500`}>
      <div className="flex items-center">
        <div className={`p-3 rounded-full bg-${color}-100 text-${color}-500`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;