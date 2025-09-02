import React from "react";
import { useAuth } from "../AuthContext";
import { SuperAdminDataProvider } from "./SuperAdminDataProvider";
import { AdminDataProvider } from "./AdminDataProvider";
import { TeacherDataProvider } from "./TeacherDataProvider";
import { CustomerDataProvider } from "./CustomerDataProvider";
import { ClassroomSelectionProvider } from "../ClassroomSelectionContext";

const RoleBasedProvider = ({ children }: { children: React.ReactNode }) => {
    const { userData } = useAuth();

    if (!userData) {
        // null でも children を描画。ProtectedRoute が制御する
        return <>{children}</>;
    }

    switch (userData.role) {
        case "superadmin":
            return (
                <ClassroomSelectionProvider>
                    <SuperAdminDataProvider>{children}</SuperAdminDataProvider>
                </ClassroomSelectionProvider>
            );
        case "admin":
            return <AdminDataProvider>{children}</AdminDataProvider>;
        case "customer":
            return <CustomerDataProvider>{children}</CustomerDataProvider>;
        case "teacher":
            return <TeacherDataProvider>{children}</TeacherDataProvider>;
        default:
            return <div>未対応のロール: {userData.role}</div>;
    }
};

export default RoleBasedProvider;
