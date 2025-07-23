import React, { createContext, useContext } from "react";
import { useAuth } from "../AuthContext";
import { useStudents } from "../hooks/useStudents";
import { useDailySchedules } from "../hooks/useDailySchedules";
import { useCustomers } from "../hooks/useCustomers";

const CustomerDataContext = createContext<any>(null);

export const CustomerDataProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const uid = user?.uid ?? "";
    const { customers, loading, error } = useCustomers(uid);
    const students = useStudents(undefined, uid ?? undefined);
    const classroomCode = customers.length > 0 ? customers[0].classroomCode : undefined;
    const studentIds = customers.length > 0 ? customers[0].studentIds ?? [] : [];
    const dailySchedules = useDailySchedules(classroomCode ?? undefined, studentIds);
    
    return (
        <CustomerDataContext.Provider
            value={{
                customers,
                loading,
                error,
                classroomCode,
                students,
                dailySchedules,
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
