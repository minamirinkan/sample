import React from "react";
import { AuthProvider } from "./TestAuthContext"; // あなたのAuthContextのパス
import RoleBasedProvider from "./TestRoleBasedProvider"; // あなたのRoleBasedProviderのパス
import RoleBasedTestComponent from "./TestComponent"; // 下で作るやつ

const AdminDataTestPage = () => {
    return (
        <AuthProvider>
            <RoleBasedProvider>
                <RoleBasedTestComponent />
            </RoleBasedProvider>
        </AuthProvider>
    );
};

export default AdminDataTestPage;
