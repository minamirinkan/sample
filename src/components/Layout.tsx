// src/Superadmin/Layout.tsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminHeader from "../admin/Dashboard/components/AdminHeader";
import AdminSidebar from "../admin/Dashboard/components/AdminSidebar";
import SuperAdminHeader from "../Superadmin/Dashboard/components/SuperAdminHeader";
import SuperAdminSidebar from "../Superadmin/Dashboard/components/SuperAdminSidebar";
import TeacherHeader from "../teacher/Dashboard/components/TeacherHeader";
import TeacherSidebar from "../teacher/Dashboard/components/TeacherSidebar";
import CustomerSidebar from "../guardian/Dashboard/components/CustomerSidebar";
import CustomerHeader from "../guardian/Dashboard/components/CustomerHeader";

const Layout: React.FC<{ role: 'superadmin' | 'admin' | 'customer' | 'teacher' }> = ({ role }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(
        role === "teacher" || role === "customer" ? false : true
    );

    const headers = {
        superadmin: SuperAdminHeader,
        admin: AdminHeader,
        teacher: TeacherHeader,
        customer: CustomerHeader,
    };

    const sidebars = {
        superadmin: SuperAdminSidebar,
        admin: AdminSidebar,
        teacher: TeacherSidebar,
        customer: CustomerSidebar,
    };

    const Header = headers[role];
    const Sidebar = sidebars[role];

    const isOverlayRole = role === "teacher" || role === "customer";

    return (
        <div className="flex-col h-screen">
            <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} role={role} />

            <div className="flex flex-1 overflow-hidden relative">
                {/* ✅ teacher/customer の場合 → オーバーレイ表示 */}
                {isOverlayRole ? (
                    <>
                        {isSidebarOpen && (
                            <div
                                className="fixed inset-0 bg-black bg-opacity-30 z-30"
                                onClick={() => setIsSidebarOpen(false)}
                            />
                        )}
                        <aside
                            className={`fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-gray-300 shadow-lg transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                                }`}
                        >
                            <Sidebar isOpen={isSidebarOpen} />
                        </aside>
                    </>
                ) : (
                    // ✅ superadmin/admin は固定サイドバー
                    <Sidebar isOpen={isSidebarOpen} />
                )}

                <main className="flex-1 p-4 overflow-auto z-0">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
