// routes/adminRoutes.tsx
import { Route } from "react-router-dom";
import TimetableTeacherPage from "../teacher/Timetable/TimetableTeacherPage";
import AttendancePage from "../teacher/Attendance/AttendancePage";

export const teacherRoutes = (
    <>
        <Route path="dashboard" element={<TimetableTeacherPage />} />
        <Route path="timetable" element={<TimetableTeacherPage />} />
        <Route path="attendance" element={<AttendancePage />} />
    </>
);
