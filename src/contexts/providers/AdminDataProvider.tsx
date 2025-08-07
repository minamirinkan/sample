import React, { createContext, useContext, useMemo } from "react";
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
    const customers = useCustomers(undefined, classroomCode ?? undefined);
    const periodLabels = usePeriodLabelsByClassroomCode(classroomCode ?? undefined);
    const currentYear = new Date().getFullYear().toString();
    const { closures } = useSchoolClosures(currentYear, classroomCode ?? undefined);
    const { schedules } = useDailySchedules();

    const filteredSchedules = useMemo(() => {
        return schedules.filter((s) => s.id.startsWith(`${classroomCode}_`));
    }, [schedules, classroomCode]);

    return (
        <AdminDataContext.Provider
            value={{
                students,
                customers,
                periodLabels,
                closures,
                dailySchedules: filteredSchedules,
            }}
        >
            {children}
        </AdminDataContext.Provider>
    );
};

export const useAdminData = () => useContext(AdminDataContext);
