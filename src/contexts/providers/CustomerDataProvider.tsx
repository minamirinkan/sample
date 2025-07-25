import React, { createContext, useContext, useMemo } from "react";
import { useAuth } from "../AuthContext";
import { useStudents } from "../hooks/useStudents";
import { useDailySchedules } from "../hooks/useDailySchedules";
import { useCustomers } from "../hooks/useCustomers";

const CustomerDataContext = createContext<any>(null);

export const CustomerDataProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const uid = user?.uid ?? "";
    const { customers, loading, error } = useCustomers(uid, undefined);
    const students = useStudents(undefined, uid ?? undefined);
    const classroomCode = customers.length > 0 ? customers[0].classroomCode : undefined;
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
                customers,
                loading,
                error,
                classroomCode,
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
