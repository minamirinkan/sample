// src/components/CustomerSidebar.tsx
import { FC } from "react";
import {
  FaBell,
  FaBook,
  FaYenSign,
  FaDatabase,
} from "react-icons/fa";
import LoadingSpinner from "../../../common/LoadingSpinner";
import SidebarSection from "../../../admin/Dashboard/components/SidebarSection";
import { useCustomerData } from "../../../contexts/providers/CustomerDataProvider";

const CustomerSidebar: FC<{ isOpen?: boolean }> = ({ isOpen = true }) => {
  const { customers, loading } = useCustomerData();

  if (loading) return <LoadingSpinner />;
  console.log('customers', customers)
  const customerName = customers[0]?.guardianfullName

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
          { label: "authContext", key: "authTest", path: "/mypage/authTest" },
          { label: "userContext", key: "userTest", path: "/mypage/userTest" },
        ]}
      />
      <ul className="sidebar-menu">
        <SidebarSection
          icon={FaBook}
          title="時間割"
          subItems={[{ label: "時間割一覧", key: "timetable", path: "/mypage/timetable" }]}
        />
        <SidebarSection
          icon={FaBell}
          title="成績管理"
          subItems={[
            { label: "塾内テスト結果", key: "notification", path: "/mypage/notification" },
            { label: "模試結果", key: "notification", path: "/mypage/notification" },
            { label: "学校成績&テスト結果", key: "notification", path: "/mypage/notification" },
          ]}
        />
        <SidebarSection
          icon={FaBell}
          title="通知管理"
          subItems={[
            { label: "本部連絡", key: "tasks", path: "/mypage/tasks" },
            { label: "教室連絡", key: "notification", path: "/mypage/notification" },
          ]}
        />
        <SidebarSection
          icon={FaYenSign}
          title="請求情報"
          subItems={[{ label: "請求情報", key: "billing", path: "/mypage/bill" }]}
        />
        <SidebarSection
          icon={FaBell}
          title="チャット"
          subItems={[
            { label: "本部", key: "chat", path: "/mypage/chat" },
            { label: "教室", key: "chat", path: "/mypage/chat" },
          ]}
        />
      </ul>
    </aside>
  );
};

export default CustomerSidebar;
