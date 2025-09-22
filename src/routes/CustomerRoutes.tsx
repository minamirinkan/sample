// routes/adminRoutes.tsx
import { Route } from "react-router-dom";
import TimetableCustomerPage from "../guardian/timetable/TimetableCustomerPage";
import RoleBasedDebugPage from "../pages/HookStatusPage";
import TestUserDataFetch from "../TEST/TestUserDataFetch";
import AdminDataTestPage from "../TEST/testpage";
import StudentChatManager from "../guardian/Dashboard/components/StudentChatManager";

export const customerRoutes = (
    <>
        <Route path="dashboard" element={<TimetableCustomerPage />} />
        <Route path="timetable" element={<TimetableCustomerPage />} />
        <Route path="tasks" element={<RoleBasedDebugPage />} />
        <Route path="authTest" element={<TestUserDataFetch />} />
        <Route path="userTest" element={<AdminDataTestPage/>} />
        <Route path="chat" element={<StudentChatManager />} />
    </>
);
