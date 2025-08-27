// src/common/components/Layout.tsx
import React from "react";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import SuperAdminHeader from "../Superadmin/Dashboard/components/SuperAdminHeader";
import AdminSidebar from "../admin/Dashboard/components/AdminSidebar";

const Layout: React.FC<{ role: 'superadmin' | 'admin' | 'customer' | 'teacher' }> = ({ role }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    return (
        <div className="flex h-screen">
            <SuperAdminHeader
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                role={role}
            />
            <div className="flex-1 flex flex-col">
                <AdminSidebar />
                <main className="flex-1 p-4 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
