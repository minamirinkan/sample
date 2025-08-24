import React, { useState, useEffect } from "react"; // Reactをインポート
import { IconType } from "react-icons"; // react-iconsの型をインポート
import { FaBell, FaBook, FaYenSign, FaAngleLeft } from "react-icons/fa";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../../firebase";
import { onAuthStateChanged } from "firebase/auth";

// --- ▼ 型定義を追加 ▼ ---

// subItemsのオブジェクトの型
interface SubItem {
  label: string;
  key: string;
}

// SidebarSectionコンポーネントのpropsの型
interface SidebarSectionProps {
  icon: IconType; // react-iconsのコンポーネントの型
  title: string;
  subItems: SubItem[]; // SubItemオブジェクトの配列
  onSelectMenu?: (key: string) => void; // stringを引数に取る関数、あってもなくても良い
}

// TeacherSidebarコンポーネントのpropsの型
interface TeacherSidebarProps {
  onSelectMenu?: (key: string) => void;
}

const SidebarSection: React.FC<SidebarSectionProps> = ({
  icon: Icon,
  title,
  subItems,
  onSelectMenu,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  return (
    <li className="mb-2">
      <button
        className="flex items-center justify-between w-full text-left hover:bg-gray-100 p-2 rounded"
        onClick={toggle}
      >
        <div className="flex items-center">
          <Icon className="mr-2" />
          {title}
        </div>
        <FaAngleLeft
          className={`transition-transform duration-200 ${isOpen ? "rotate-[-90deg]" : ""}`}
        />
      </button>
      {isOpen && (
        // `item`はSubItem型、`idx`はnumber型と自動で推論される
        <ul className="pl-8 mt-1 space-y-1 text-sm text-gray-700">
          {subItems.map((item, idx) => (
            <li
              key={idx}
              className="hover:underline cursor-pointer"
              onClick={() => onSelectMenu?.(item.key)}
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

const TeacherSidebar: React.FC<TeacherSidebarProps> = ({ onSelectMenu }) => {
  const [teacherName, setTeacherName] = useState("お客様");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "teachers", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setTeacherName(docSnap.data().name || "お客様");
        } else {
          setTeacherName("お客様データなし");
        }
      } else {
        setTeacherName("未ログイン");
      }
    });

    return () => unsubscribe();
  }, []);

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
          subItems={[{ label: "時間割一覧", key: "timetable" }]}
          onSelectMenu={onSelectMenu}
        />
        <SidebarSection
          icon={FaBook}
          title="予定"
          subItems={[{ label: "色塗り", key: "attendance" }]}
          onSelectMenu={onSelectMenu}
        />
        <SidebarSection
          icon={FaBell}
          title="成績管理"
          subItems={[
            { label: "塾内テスト結果", key: "notification" },
            { label: "模試結果", key: "notification" },
            { label: "学校成績&テスト結果", key: "notification" },
          ]}
          onSelectMenu={onSelectMenu}
        />
        <SidebarSection
          icon={FaBell}
          title="通知管理"
          subItems={[
            { label: "本部連絡", key: "notification" },
            { label: "教室連絡", key: "notification" },
          ]}
          onSelectMenu={onSelectMenu}
        />
        <SidebarSection
          icon={FaYenSign}
          title="請求情報"
          subItems={[{ label: "請求情報", key: "billing" }]}
          onSelectMenu={onSelectMenu}
        />
      </ul>
    </aside>
  );
};

export default TeacherSidebar;
