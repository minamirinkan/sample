import React, { useState } from 'react';
import TuitionFormContent from './TuitionFormContent';
import TeacherFeeRegistration from './AdminRegistrationForm/TeacherFeeRegistration';

const TuitionRegistrationTabs = () => {
  const [activeTab, setActiveTab] = useState('tuition'); // 'tuition' or 'teacher'

  return (
    <div className="p-6 space-y-6">
      {/* タブUI */}
      <div className="flex space-x-4 border-b border-gray-300">
        <button
          onClick={() => setActiveTab('tuition')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'tuition'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-blue-500'
          }`}
        >
          授業料
        </button>
        <button
          onClick={() => setActiveTab('teacher')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'teacher'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-blue-500'
          }`}
        >
          講師給与
        </button>
      </div>

      {/* 内容切り替え */}
      {activeTab === 'tuition' ? <TuitionFormContent /> : <TeacherFeeRegistration />}
    </div>
  );
};

export default TuitionRegistrationTabs;
