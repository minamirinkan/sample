import React from "react";
import { useAuth } from "./TestAuthContext";
import AdminTestComponent from "./AdminTestComponent";
import SuperAdminTestComponent from "./SuperAdminTestComponent";
import CustomerTestComponent from "./CustomerTestComponent";
import TeacherTestComponent from "./TeacherTestComponent";

const RoleBasedTestComponent = () => {
    const { userData } = useAuth();
    const role = userData?.role;

    if (!role) {
        return <div className="p-4 text-red-500">ログイン情報が見つかりません</div>;
    }

    switch (role) {
        case "admin":
            return <AdminTestComponent />;
        case "superadmin":
            return <SuperAdminTestComponent />;
        case "customer":
            return <CustomerTestComponent />;
        case "teacher":
            return <TeacherTestComponent />;
        default:
            return <div className="p-4 text-red-500">未対応のロールです: {role}</div>;
    }
};

export default RoleBasedTestComponent;
