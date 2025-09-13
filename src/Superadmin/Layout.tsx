// src/Superadmin/Layout.tsx
import React from "react";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminHeader from "../admin/Dashboard/components/AdminHeader";
import AdminSidebar from "../admin/Dashboard/components/AdminSidebar";

const Layout: React.FC<{ role: 'superadmin' | 'admin' | 'customer' | 'teacher' }> = ({ role }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    return (
        <div className="flex-col h-screen">
            <AdminHeader
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                role={role}
            />
            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar isOpen={isSidebarOpen} />
                <main className="flex-1 p-4 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
