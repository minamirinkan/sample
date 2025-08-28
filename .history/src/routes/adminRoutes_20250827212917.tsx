// routes/adminRoutes.tsx
import { Route } from "react-router-dom";
import AdminProfile from '../common/pages/adminProfile'
import ToDoContent from "../common/ToDo/ToDoContent";
import TimetablePage from '../common/timetable/TimetablePage';
import SuperAdminStudents from '../common/Students/SuperAdminStudents';
import SuperAdminTeachers from '../common/Teachers/SuperAdminTeachers';
import HolidayPage from '../common/Schedule/HolidayPage';
import CeoMessagesAll from '../common/ceoMessage/CeoMessagesAll';
import HookStatusPage from '../pages/HookStatusPage';
import TestUserDataFetch from "../TEST/TestUserDataFetch";
import TestAdminDataFetch from "../TEST/testpage";
import AdminStudentCalendar from '../common/StudentsSchedule/AdminStudentCalendar';
import StudentChatManager from '../guardian/Dashboard/components/StudentChatManager';

export const adminRoutes = (
    <>
        <Route path="dashboard" element={<ToDoContent />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="todo" element={<ToDoContent />} />
        <Route path="welcome" element={<ToDoContent />} />
        <Route path="timetable" element={<TimetablePage />} />
        <Route path="holiday-page" element={<HolidayPage />} />
        <Route path="student-timetable" element={<AdminStudentCalendar />} />
        <Route path="notification" element={<CeoMessagesAll />} />
        <Route path="tasks" element={<HookStatusPage />} />
        <Route path="authTest" element={<TestUserDataFetch />} />
        <Route path="userTest" element={<TestAdminDataFetch />} />
        <Route path="chat" element={<StudentChatManager />} />
        <Route path="students" element={<SuperAdminStudents />} />
        <Route path="teachers" element={<SuperAdminTeachers />} />
    </>
);