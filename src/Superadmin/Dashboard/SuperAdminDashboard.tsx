// 不要になった部分は削除済み
import SuperAdminHeader from "./components/SuperAdminHeader.js";
import SuperAdminSidebar from "./components/SuperAdminSidebar.js";
import SuperAdminStudents from "../../common/Students/SuperAdminStudents";
import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase.js";
import SuperAdminTeachers from "../../common/Teachers/SuperAdminTeachers.js";
import TimetablePage from "../../common/timetable/TimetablePage";
import SchoolAccountAdmin from "../../Superadmin/SchoolAccountAdmin.jsx";
import StudentRegistrationForm from "../../common/Students/StudentRegistrationForm/StudentRegistrationForm";
import TeacherRegistrationForm from "../../common/Teachers/RegistrationForm/TeacherRegistrationForm.jsx";
import TuitionRegistrationForm from "../TuitionRegistrationTabs.jsx";
import TeacherFeeRegistration from "../TeacherFeeRegistration.jsx";
import HolidayPage from "../../common/Schedule/HolidayPage";
import ToDoContent from "../../common/ToDo/ToDoContent";
import CeoMessagesAll from "../../common/ceoMessage/CeoMessagesAll";
import HookStatusPage from "../../pages/HookStatusPage";
import TestUserDataFetch from "../../TEST/TestUserDataFetch";
import TestAdminDataFetch from "../../TEST/testpage";

const SuperAdminDashboard = () => {
  const [selectedContent, setSelectedContent] = useState("welcome");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "logs"),
      orderBy("timestamp", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setLogs(data);
    });

    return () => unsubscribe();
  }, []);

  const renderContent = () => {
    switch (selectedContent) {
      case "holiday-page":
        return <HolidayPage />;
      case "students":
        return (
          <SuperAdminStudents
            onAddNewStudent={() => setSelectedContent("studentRegistration")}
          />
        );
      case "teachers":
        return (
          <SuperAdminTeachers
            onAddNewTeacher={() => setSelectedContent("teacherRegistration")}
          />
        );
      case "timetable":
        return <TimetablePage />;
      case "admin":
        return <SchoolAccountAdmin />;
      case "tuition":
        return <TuitionRegistrationForm />;
      case "TeacherFee":
        return (
          <TeacherFeeRegistration
            onRegistered={() => setSelectedContent("TeacherFee")}
          />
        );
      case "studentRegistration":
        return (
          <StudentRegistrationForm
            onCancel={() => setSelectedContent("students")}
          />
        );
      case "teacherRegistration":
        return (
          <TeacherRegistrationForm
            onCancel={() => setSelectedContent("teachers")}
          />
        );
      case "todo":
        return <ToDoContent logs={logs} />;
      case "notification":
        return <CeoMessagesAll />;
      case "tasks":
        return <HookStatusPage />;
      case 'authTest':
        return <TestUserDataFetch />;
      case 'userTest':
        return <TestAdminDataFetch />;
      default:
        return <ToDoContent logs={logs} />;
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div
      className={`min-h-screen flex flex-col ${sidebarOpen ? "sidebar-open" : ""}`}
    >
      <header>
        <SuperAdminHeader onToggleSidebar={toggleSidebar} />
      </header>
      <div className="flex flex-1">
        <aside
          className={`w-64 border-r border-gray-300 ${sidebarOpen ? "block" : "hidden"}`}
        >
          <SuperAdminSidebar onSelectMenu={setSelectedContent} />
        </aside>
        <main className="flex-1 p-4 overflow-auto">{renderContent()}</main>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
