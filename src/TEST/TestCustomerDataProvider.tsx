import React, { createContext, useContext, useMemo } from "react";
import { useAuth } from "./TestAuthContext";
import { useStudents } from "../contexts/hooks/useStudents";
import { useDailySchedules } from "../contexts/hooks/useDailySchedules";
import { useCustomers } from "../contexts/hooks/useCustomers";
import { useClassroom } from "../contexts/hooks/useClassroom";


const CustomerDataContext = createContext<any>(null);

export const CustomerDataProvider = ({ children }: { children: React.ReactNode }) => {
    const { userData } = useAuth();
    const uid = userData?.uid ?? "";
    const { customers, loading, error } = useCustomers(uid, undefined);
    const students = useStudents(undefined, uid ?? undefined);
    const classroomCode = userData?.classroomCode ?? "";
    const classroom = useClassroom(classroomCode ?? undefined);
    const { schedules } = useDailySchedules();
    const studentIds = customers.flatMap(c => c.studentIds || []);

    const filteredSchedules = useMemo(() => {
        return schedules.filter((schedule) =>
            schedule.rows?.some((row) =>
                Object.values(row.periods).some((period) =>
                    period?.some((p) => studentIds.includes(p.studentId))
                )
            )
        );
    }, [schedules, studentIds]);

    return (
        <CustomerDataContext.Provider
            value={{
                userData,
                customers,
                loading,
                error,
                classroomCode,
                classroom,
                students,
                dailySchedules: filteredSchedules,
            }}
        >
            {children}
        </CustomerDataContext.Provider>
    );
};

export const useCustomerData = () => {
    const context = useContext(CustomerDataContext);
    if (!context) {
        throw new Error("useCustomerData must be used within a CustomerDataProvider");
    }
    return context;
};
