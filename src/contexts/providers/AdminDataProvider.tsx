import React, { createContext, useContext } from "react";
import { useAuth } from "../AuthContext";
import { useStudents } from "../hooks/useStudents";
import { useCustomers } from "../hooks/useCustomers";
import { usePeriodLabelsByClassroomCode } from "../hooks/usePeriodLabelsBySchool";
import { useSchoolClosures } from "../hooks/useSchoolClosures";
import { useDailySchedules } from "../hooks/useDailySchedules";

const AdminDataContext = createContext<any>(null);

export const AdminDataProvider = ({ children }: { children: React.ReactNode }) => {
    const { classroomCode } = useAuth();
    const students = useStudents(classroomCode ?? undefined);
    const customers = useCustomers(classroomCode ?? undefined);
    const periodLabels = usePeriodLabelsByClassroomCode(classroomCode ?? undefined);
    const currentYear = new Date().getFullYear().toString();
    const { closures } = useSchoolClosures(currentYear, classroomCode ?? undefined);
    const dailySchedules = useDailySchedules(classroomCode ?? undefined);

    return (
        <AdminDataContext.Provider
            value={{
                students,
                customers,
                periodLabels,
                closures,
                dailySchedules
            }}
        >
            {children}
        </AdminDataContext.Provider>
    );
};

export const useAdminData = () => useContext(AdminDataContext);
