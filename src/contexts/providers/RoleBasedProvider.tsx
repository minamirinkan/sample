import React from "react";
import { useAuth } from "../AuthContext";
import { SuperAdminDataProvider } from "./SuperAdminDataProvider";
import { AdminDataProvider } from "./AdminDataProvider";
import { TeacherDataProvider } from "./TeacherDataProvider";
import { CustomerDataProvider } from "./CustomerDataProvider";

const RoleBasedProvider = ({ children }: { children: React.ReactNode }) => {
    const { role, loading } = useAuth();

    // ローディング中はnull（またはスピナー等）を返す
    if (loading) {
        return <div className="p-4">読み込み中...</div>;
    }

    if (role === "superadmin") {
        return <SuperAdminDataProvider>{children}</SuperAdminDataProvider>;
    }

    if (role === "admin") {
        return <AdminDataProvider>{children}</AdminDataProvider>;
    }

    if (role === "teacher") {
        return <TeacherDataProvider>{children}</TeacherDataProvider>;
    }

    if (role === "customer") {
        return <CustomerDataProvider>{children}</CustomerDataProvider>;
    }

    // 未ログインまたはロール未判定の場合はそのまま
    return <>{children}</>;
};

export default RoleBasedProvider;
