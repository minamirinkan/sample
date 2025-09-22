// src/components/CustomerSidebar.tsx
import { FC } from "react";
import {
  FaBell,
  FaBook,
  FaYenSign,
  FaDatabase,
} from "react-icons/fa";
import LoadingSpinner from "../../../common/LoadingSpinner";
import useCustomer from "../../../contexts/hooks/useCustomer";
import SidebarSection from "../../../admin/Dashboard/components/SidebarSection";

const CustomerSidebar: FC<{ isOpen?: boolean }> = ({ isOpen = true }) => {
  const { customer, loading } = useCustomer();

  if (loading) return <LoadingSpinner />;
  
  const customerName = customer?.guardianfullName

  if (!isOpen) return null;

  return (
    <aside className="w-64 border-r border-gray-300 p-4 overflow-auto h-screen">
      <h4
        className="text-lg font-bold mb-4 text-center text-gray-800"
        style={{ fontSize: "20px" }}
      >
        {customerName}
      </h4>
      <SidebarSection
        icon={FaDatabase}
        title="テストデータ"
        subItems={[
          { label: "authContext", key: "authTest", path: "/customer/authTest" },
          { label: "userContext", key: "userTest", path: "/customer/userTest" },
        ]}
      />
      <ul className="sidebar-menu">
        <SidebarSection
          icon={FaBook}
          title="時間割"
          subItems={[{ label: "時間割一覧", key: "timetable", path: "/customer/timetable" }]}
        />
        <SidebarSection
          icon={FaBell}
          title="成績管理"
          subItems={[
            { label: "塾内テスト結果", key: "notification", path: "/customer/notification" },
            { label: "模試結果", key: "notification", path: "/customer/notification" },
            { label: "学校成績&テスト結果", key: "notification", path: "/customer/notification" },
          ]}
        />
        <SidebarSection
          icon={FaBell}
          title="通知管理"
          subItems={[
            { label: "本部連絡", key: "tasks", path: "/customer/tasks" },
            { label: "教室連絡", key: "notification", path: "/customer/notification" },
          ]}
        />
        <SidebarSection
          icon={FaYenSign}
          title="請求情報"
          subItems={[{ label: "請求情報", key: "billing", path: "/customer/bill" }]}
        />
        <SidebarSection
          icon={FaBell}
          title="チャット"
          subItems={[
            { label: "本部", key: "chat", path: "/customer/chat" },
            { label: "教室", key: "chat", path: "/customer/chat" },
          ]}
        />
      </ul>
    </aside>
  );
};

export default CustomerSidebar;
