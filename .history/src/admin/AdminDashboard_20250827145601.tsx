import SuperAdminHeader from '../Superadmin/Dashboard/components/SuperAdminHeader';
import AdminSidebar from './Dashboard/components/AdminSidebar';
import SuperAdminStudents from '../common/Students/SuperAdminStudents';
import SuperAdminTeachers from '../common/Teachers/SuperAdminTeachers';
import TimetablePage from '../common/timetable/TimetablePage';
import StudentRegistrationForm from '../common/Students/StudentRegistrationForm/StudentRegistrationForm'
import TeacherRegistrationForm from '../common/Teachers/RegistrationForm/TeacherRegistrationForm';
import AdminStudentCalendar from '../common/StudentsSchedule/AdminStudentCalendar';
import HolidayPage from '../common/Schedule/HolidayPage';
import ToDoContent from '../common/ToDo/ToDoContent';
import { collection, query, orderBy, limit, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import CeoMessagesAll from '../common/ceoMessage/CeoMessagesAll';
import HookStatusPage from '../pages/HookStatusPage';
import TestUserDataFetch from "../TEST/TestUserDataFetch";
import TestAdminDataFetch from "../TEST/testpage";
import React, { useState, useEffect } from 'react';
import { useAuth } from "../contexts/AuthContext"
import useDynamicTitle from "../contexts/hooks/useDynamicTitle";
import StudentChatManager from '../guardian/Dashboard/components/StudentChatManager';

// ログのデータ型を定義
interface Log {
  id: string;
  timestamp: any; // Firebaseのタイムスタンプ型
  content: string;
  editor: string;
}

// メニューの選択肢を定義
type MenuType =
  | 'welcome'
  | 'todo'
  | 'students'
  | 'teachers'
  | 'timetable'
  | 'holiday-page'
  | 'student-timetable'
  | 'notification'
  | 'tasks'
  | 'authTest'
  | 'userTest'
  | 'chat';

const AdminDashboard = () => {
  const [selectedContent, setSelectedContent] = useState<MenuType>('welcome');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [showStudentForm, setShowStudentForm] = useState<boolean>(false);
  const [showTeacherForm, setShowTeacherForm] = useState<boolean>(false);
  const [logs, setLogs] = useState<Log[]>([]);
  const { userData } = useAuth() // 本番では AuthContext などから取得
  const role = userData?.role;
  const [classroomName, setClassroomName] = useState('');
  const classroomCode = userData?.classroomCode;

  useEffect(() => {
    const fetchClassroomName = async () => {
      if (!classroomCode) return;

      const docRef = doc(db, 'classrooms', classroomCode);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as { name?: string };
        setClassroomName(data.name ?? '');
      } else {
        setClassroomName('教室名なし');
      }
    };

    fetchClassroomName();
  }, [classroomCode]);
  // タイトル用 hook を呼ぶ
  useDynamicTitle({ role, classroomName });

  const handleMenuSelect = (menu: string) => {
    const validMenus: MenuType[] = [
      'welcome',
      'todo',
      'students',
      'teachers',
      'timetable',
      'holiday-page',
      'student-timetable',
      'notification',
      'tasks',
      'authTest',
      'userTest',
      'chat',
    ];

    if (validMenus.includes(menu as MenuType)) {
      setSelectedContent(menu as MenuType);
    } else {
      console.warn('無効なメニュー選択:', menu);
    }
    setShowStudentForm(false);
    setShowTeacherForm(false);
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
      const data: Log[] = snapshot.docs.map((doc) => {
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

    switch (selectedContent) {
      case 'todo':
        return <ToDoContent logs={logs} />;
      case 'welcome':
        return <ToDoContent logs={logs} />; // welcomeでtodo表示したいなら
      case 'timetable':
        return <TimetablePage />;
      case 'holiday-page':
        return <HolidayPage />;
      case 'student-timetable':
        return <AdminStudentCalendar />;
      case 'notification':
        return <CeoMessagesAll />;
      case 'tasks':
        return <HookStatusPage />;
      case 'authTest':
        return <TestUserDataFetch />;
      case 'userTest':
        return <TestAdminDataFetch />;
      case 'chat':
        return <StudentChatManager />;
      default:
        return <ToDoContent logs={logs} />;
    }
  };

  return (
    <div className="w-full h-full">
      {renderContent()}
    </div>
  );
}

export default AdminDashboard;