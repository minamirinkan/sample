import React from "react";
import { useAuth } from "./TestAuthContext";

import { AdminDataProvider } from "./TestAdminDataProvider";
import { SuperAdminDataProvider } from "./TestSuperAdminDataProvider";
import { CustomerDataProvider } from "./TestCustomerDataProvider";
import { TeacherDataProvider } from "./TestTeacherDataProvider";

const RoleBasedProvider = ({ children }: { children: React.ReactNode }) => {
    const { userData } = useAuth();

    if (!userData) return null;

    switch (userData.role) {
        case "superadmin":
            return <SuperAdminDataProvider>{children}</SuperAdminDataProvider>;
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
