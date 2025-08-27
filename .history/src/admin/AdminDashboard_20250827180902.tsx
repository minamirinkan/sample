import SuperAdminStudents from '../common/Students/SuperAdminStudents';
import SuperAdminTeachers from '../common/Teachers/SuperAdminTeachers';
import StudentRegistrationForm from '../common/Students/StudentRegistrationForm/StudentRegistrationForm'
import TeacherRegistrationForm from '../common/Teachers/RegistrationForm/TeacherRegistrationForm';
import React, { useState, useEffect } from 'react';

// メニューの選択肢を定義
type MenuType =
  | 'students'
  | 'teachers'

const AdminDashboard = () => {
  const [selectedContent, setSelectedContent] = useState<MenuType>('welcome');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [showStudentForm, setShowStudentForm] = useState<boolean>(false);
  const [showTeacherForm, setShowTeacherForm] = useState<boolean>(false);

  const handleAddNewStudent = () => {
    setShowStudentForm(true);
  };

  const handleAddNewTeacher = () => {
    setShowTeacherForm(true); // ←追加
  };

  const handleStudentFormSubmit = () => {
    setShowStudentForm(false);
    setSelectedContent('students'); // フォーム閉じて生徒一覧に戻る例
  };

  const handleTeacherFormSubmit = () => {
    setShowTeacherForm(false);
    setSelectedContent('teachers');
  };

  const renderContent = () => {
    if (selectedContent === 'students') {
      return showStudentForm ? (
        <StudentRegistrationForm
          onSubmitSuccess={handleStudentFormSubmit}
          onCancel={() => {
            setShowStudentForm(false);
            setSelectedContent('students');
          }}
        />
      ) : (
        <SuperAdminStudents onAddNewStudent={handleAddNewStudent} />
      );
    }
    if (selectedContent === 'teachers') {
      return showTeacherForm ? (
        <TeacherRegistrationForm
          onSubmitSuccess={handleTeacherFormSubmit} // ← ここはエラー無視
          onCancel={() => {
            setShowTeacherForm(false);
            setSelectedContent('teachers');
          }}
        />
      ) : (
        <SuperAdminTeachers onAddNewTeacher={handleAddNewTeacher} />
      );
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <main className="flex-1 p-4 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
}

export default AdminDashboard;