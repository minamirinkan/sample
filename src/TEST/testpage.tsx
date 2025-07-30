import React from "react";
import { AuthProvider } from "./TestAuthContext"; // あなたのAuthContextのパス
import { AdminDataProvider } from "./TestAdminDataProvider"; // あなたのAdminDataProviderのパス
import AdminTestComponent from "./AdminTestComponent"; // 下で作るやつ

const AdminDataTestPage = () => {
    return (
        <AuthProvider>
            <AdminDataProvider>
                <AdminTestComponent />
            </AdminDataProvider>
        </AuthProvider>
    );
};

export default AdminDataTestPage;
