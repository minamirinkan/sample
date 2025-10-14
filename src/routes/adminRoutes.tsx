// routes/adminRoutes.tsx
import { Route, Navigate, useParams } from "react-router-dom";
import AdminProfile from '../common/pages/adminProfile'
import ToDoContent from "../common/ToDo/ToDoContent";
import TimetablePage from '../common/timetable/TimetablePage';
import SuperAdminStudents from '../common/Students/SuperAdminStudents';
import SuperAdminTeachers from '../common/Teachers/SuperAdminTeachers';
import HolidayPage from '../common/Schedule/HolidayPage';
import CeoMessagesAll from '../common/ceoMessage/CeoMessagesAll';
import HookStatusPage from '../pages/HookStatusPage';
// import AdminStudentCalendar from '../common/StudentsSchedule/AdminStudentCalendar';
import StudentChatManager from '../guardian/Dashboard/components/StudentChatManager';
import StudentRegistrationForm from "../common/Students/StudentRegistrationForm/StudentRegistrationForm";
import StudentDetail from "../common/Students/Detail/StudentDetail";
import TeacherRegistrationForm from "../common/Teachers/RegistrationForm/TeacherRegistrationForm";
import TeacherDetail from "../common/Teachers/Detail/TeacherDetail";
import SchoolScoreTable from "../common/ScoreTable/SchoolScoreTable";
import TuitionPage from "../admin/pages/TuitionPage";
import TeacherWorkFeesPage from "../admin/pages/TeacherWorkFeesPage";
import PayrollSheet from "../common/Teachers/components/PayrollSheet";
import TimetableDragDrop from "../common/sampleTimetable/TimetableFlat";
import BillingDetailsWrapper from "../common/Students/Detail/BillingDetailsWrapper";
import EnrollmentDetail from "../common/Students/Detail/EnrollmentDetail";

const RedirectToBasic: React.FC = () => {
    const { studentId } = useParams<{ studentId: string }>();
    if (!studentId) return null;
    return <Navigate to={`/admin/students/${studentId}/basic`} replace />;
};

export const adminRoutes = (
    <>
        <Route path="dashboard" element={<ToDoContent />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="todo" element={<ToDoContent />} />
        <Route path="welcome" element={<ToDoContent />} />
        <Route path="timetable" element={<TimetablePage />} />
        <Route path="holiday-page" element={<HolidayPage />} />
        <Route path="notification" element={<CeoMessagesAll />} />
        <Route path="tasks" element={<HookStatusPage />} />
        <Route path="schoolTest" element={<SchoolScoreTable />} />
        <Route path="chat" element={<StudentChatManager />} />
        <Route path="students" element={<SuperAdminStudents />} />
        <Route path="students/new" element={<StudentRegistrationForm />} />
        <Route path="students/:studentId" element={<RedirectToBasic />} />
        <Route path="students/:studentId/:section/:tab?" element={<StudentDetail />} />
        <Route path="students/:studentId/enrollment/:yearMonth" element={<EnrollmentDetail />} />
        <Route path="students/:studentId/enrollment/:yearMonth/edit" element={<EnrollmentDetail />} />
        <Route path="students/:studentId/bill/:month" element={<BillingDetailsWrapper />} />
        <Route path="students/:studentId/bill/:month/:edit" element={<BillingDetailsWrapper />} />
        <Route path="teachers" element={<SuperAdminTeachers />} />
        <Route path="teachers/new" element={<TeacherRegistrationForm />} />
        <Route path="teachers/:code" element={<TeacherDetail />} />
        <Route path="tuition/:classroomName" element={<TuitionPage />} />
        <Route path="work-fees/:location" element={<TeacherWorkFeesPage />} />
        <Route path="teacher-shifts" element={<PayrollSheet />} />
        <Route path="sample" element={<TimetableDragDrop />} />
    </>
);
