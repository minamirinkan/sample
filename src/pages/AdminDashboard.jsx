import SuperAdminHeader from '../components/SuperAdminHeader';
import AdminSidebar from '../components/AdminSidebar';
import SuperAdminStudents from '../components/SuperAdminStudents';
import { useState, useEffect } from 'react';
import SuperAdminTeachers from '../components/SuperAdminTeachers';
import TimetablePage from './TimetablePage';
import StudentRegistrationForm from '../components/StudentRegistrationForm/StudentRegistrationForm'
import TeacherRegistrationForm from '../components/TeacherRegistrationForm/TeacherRegistrationForm';
import ScheduleCalendarPage from './ScheduleCalendarPage';
import AdminStudentCalendar from './AdminStudentCalendar';
import HolidayPage from './HolidayPage.tsx';
import ToDoContent from '../components/ToDoContent/ToDoContent.tsx';
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../firebase.js";

const AdminDashboard = () => {
  const [selectedContent, setSelectedContent] = useState('welcome');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [logs, setLogs] = useState([]);

  const handleMenuSelect = (menu) => {
    setSelectedContent(menu);
    setShowStudentForm(false); // 生徒フォームを閉じる
    setShowTeacherForm(false); // 講師フォームを閉じる
  };

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

  useEffect(() => {
    const q = query(
      collection(db, "logs"),
      orderBy("timestamp", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          timestamp: d.timestamp,
          content: d.content ?? "",
          editor: d.editor ?? "",
        };
      });
      setLogs(data);
    });

    return () => unsubscribe();
  }, []);

  const renderContent = () => {
    if (selectedContent === 'todo') {
      return <ToDoContent logs={logs} />;
    }
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
          onSubmitSuccess={handleTeacherFormSubmit}
          onCancel={() => {
            setShowTeacherForm(false);
            setSelectedContent('teachers');
          }}
        />
      ) : (
        <SuperAdminTeachers onAddNewTeacher={handleAddNewTeacher} />
      );
    }
    switch (selectedContent) {
      case 'timetable':
        return <TimetablePage />;
      case 'schedule-calendar':   // ここを追加
        return <ScheduleCalendarPage />;
      case 'holiday-page':   // ここを追加
        return <HolidayPage />;
      case 'student-timetable':
        return <AdminStudentCalendar />;
      case 'todo':
        return <ToDoContent logs={logs} />;
      default:
        return <ToDoContent logs={logs} />;
    }
  };
  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    <div className={`min-h-screen flex flex-col ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <header>
        <SuperAdminHeader onToggleSidebar={toggleSidebar} />
      </header>
      <div className="flex flex-1">
        <aside className={`w-64 border-r border-gray-300 ${sidebarOpen ? 'block' : 'hidden'}`}>
          <AdminSidebar onSelectMenu={handleMenuSelect} />
        </aside>
        <main className="flex-1 p-4 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
