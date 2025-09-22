import { FC } from 'react';
import { FaBell, FaBook, FaYenSign } from "react-icons/fa";
import { useTeacherData } from "../../../contexts/providers/TeacherDataProvider";
import SidebarSection from '../../../admin/Dashboard/components/SidebarSection';
import LoadingSpinner from "../../../common/LoadingSpinner";

const TeacherSidebar: FC<{ isOpen?: boolean }> = ({ isOpen = true }) => {
  const { teacher, loading } = useTeacherData();

  if (loading) return <LoadingSpinner />;
  
  const teacherName = teacher?.teacher?.fullname

  if (!isOpen) return null;

  return (
    <aside className="w-64 border-r border-gray-300 p-4 overflow-auto h-screen">
      <h4
        className="text-lg font-bold mb-4 text-center text-gray-800"
        style={{ fontSize: "20px" }}
      >
        {teacherName}
      </h4>
      <ul className="sidebar-menu">
        <SidebarSection
          icon={FaBook}
          title="時間割"
          subItems={[{ label: "時間割一覧", key: "timetable", path: "/teacher/timetable" }]}
        />
        <SidebarSection
          icon={FaBook}
          title="予定"
          subItems={[{ label: "色塗り", key: "attendance", path: "/teacher/attendance" }]}
        />
        <SidebarSection
          icon={FaBell}
          title="成績管理"
          subItems={[
            { label: "塾内テスト結果", key: "notification", path: "/teacher/dashboard" },
            { label: "模試結果", key: "notification", path: "/teacher/dashboard" },
            { label: "学校成績&テスト結果", key: "notification", path: "/teacher/dashboard" },
          ]}
        />
        <SidebarSection
          icon={FaBell}
          title="通知管理"
          subItems={[
            { label: "本部連絡", key: "notification", path: "/teacher/dashboard" },
            { label: "教室連絡", key: "notification", path: "/teacher/dashboard" },
          ]}
        />
        <SidebarSection
          icon={FaYenSign}
          title="給与情報"
          subItems={[{ label: "給与情報", key: "salary", path: "/teacher/dashboard" }]}
        />
      </ul>
    </aside>
  );
};

export default TeacherSidebar;
