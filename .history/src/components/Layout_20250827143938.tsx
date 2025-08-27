// src/common/components/Layout.tsx
import React from "react";
import { useState } from "react";
import { Outlet } from "react-router-dom"; 
import SuperAdminHeader from "../Superadmin/Dashboard/components/SuperAdminHeader";
import AdminSidebar from "../admin/Dashboard/components/AdminSidebar";

const Layout: React.FC<{ children: React.ReactNode; role: 'superadmin' | 'admin' | 'customer' | 'teacher' }> = ({ children, role }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    return (
        <div className="flex h-screen">
            <AdminSidebar />
            <div className="flex-1 flex flex-col">
                <SuperAdminHeader
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    role={role}
                />
                <main className="flex-1 p-4 overflow-auto"><Outlet /></main>
            </div>
        </div>
    );
};

export default Layout;
