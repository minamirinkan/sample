// 不要になった部分は削除済み
import SuperAdminHeader from '../components/SuperAdminHeader.js';
import SuperAdminSidebar from '../components/SuperAdminSidebar.js';
import SuperAdminStudents from '../components/SuperAdminStudents.js';
import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../firebase.js";
import SuperAdminTeachers from '../components/SuperAdminTeachers.js';
import TimetablePage from './TimetablePage.jsx';
import SchoolAccountAdmin from '../components/AdminRegistrationForm/SchoolAccountAdmin.jsx';
import StudentRegistrationForm from '../components/StudentRegistrationForm/StudentRegistrationForm.jsx';
import TeacherRegistrationForm from '../components/TeacherRegistrationForm/TeacherRegistrationForm.jsx';
import TuitionRegistrationForm from '../components/TuitionRegistrationTabs.jsx';
import TeacherFeeRegistration from '../components/AdminRegistrationForm/TeacherFeeRegistration.jsx';
import HolidayPage from './HolidayPage.tsx';
import ToDoContent from '../components/ToDoContent/ToDoContent.tsx';
import CeoMessagesAll from '../components/CeoMessagesAll.tsx';


const SuperAdminDashboard = () => {
    const [selectedContent, setSelectedContent] = useState('welcome');
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
            case 'holiday-page':
                return <HolidayPage />;
            case 'students':
                return <SuperAdminStudents onAddNewStudent={() => setSelectedContent('studentRegistration')} />;
            case 'teachers':
                return <SuperAdminTeachers onAddNewTeacher={() => setSelectedContent('teacherRegistration')} />;
            case 'timetable':
                return <TimetablePage />;
            case 'admin':
                return <SchoolAccountAdmin />;
            case 'tuition':
                return <TuitionRegistrationForm />;
            case 'TeacherFee':
                return <TeacherFeeRegistration onRegistered={() => setSelectedContent('TeacherFee')} />;
            case 'studentRegistration':
                return <StudentRegistrationForm onCancel={() => setSelectedContent('students')} />;
            case 'teacherRegistration':
                return <TeacherRegistrationForm onCancel={() => setSelectedContent('teachers')} />;
            case 'todo':
                return <ToDoContent logs={logs} />;
            case 'notification':
                return <CeoMessagesAll />;
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
                    <SuperAdminSidebar onSelectMenu={setSelectedContent} />
                </aside>
                <main className="flex-1 p-4 overflow-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
