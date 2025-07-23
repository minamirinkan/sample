import React, { createContext, useContext } from "react";
import { useAdmins } from "../hooks/useAdmins";
import { useClassrooms } from "../hooks/useClassrooms";
import { useCustomers } from "../hooks/useCustomers";
import { useDailySchedules } from "../hooks/useDailySchedules";
import { usePeriodLabelsByClassroomCode } from "../hooks/usePeriodLabelsBySchool";
import { useSchoolClosures } from "../hooks/useSchoolClosures";
import { useStudents } from "../hooks/useStudents";
import { useSuperadmins } from "../hooks/useSuperadmins";

const SuperAdminDataContext = createContext<any>(null);

export const SuperAdminDataProvider = ({ children }: { children: React.ReactNode }) => {
    const admins = useAdmins();
    const classrooms = useClassrooms();
    const customers = useCustomers();
    const dailySchedules = useDailySchedules();
    const periodLabels = usePeriodLabelsByClassroomCode();
    const currentYear = new Date().getFullYear().toString();
    const { closures } = useSchoolClosures(currentYear);
    const students = useStudents();
    const superadmins = useSuperadmins();

    return (
        <SuperAdminDataContext.Provider
            value={{
                admins,
                classrooms,
                customers,
                dailySchedules,
                periodLabels,
                closures,
                students,
                superadmins,
            }}
        >
            {children}
        </SuperAdminDataContext.Provider>
    );
};

export const useSuperAdminData = () => useContext(SuperAdminDataContext);
