// src/Superadmin/Layout.tsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminHeader from "../admin/Dashboard/components/AdminHeader";
import AdminSidebar from "../admin/Dashboard/components/AdminSidebar";
import SuperAdminHeader from "../Superadmin/Dashboard/components/SuperAdminHeader";
import SuperAdminSidebar from "../Superadmin/Dashboard/components/SuperAdminSidebar";

const Layout: React.FC<{ role: 'superadmin' | 'admin' | 'customer' | 'teacher' }> = ({ role }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // roleごとにHeaderとSidebarを選択
    const Header = role === "superadmin" ? SuperAdminHeader : AdminHeader;
    const Sidebar = role === "superadmin" ? SuperAdminSidebar : AdminSidebar;

    return (
        <div className="flex-col h-screen">
            <Header
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                role={role}
            />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar isOpen={isSidebarOpen} />
                <main className="flex-1 p-4 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
