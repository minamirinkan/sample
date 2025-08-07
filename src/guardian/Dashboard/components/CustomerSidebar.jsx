// src/components/CustomerSidebar.jsx

import { useState, useEffect } from 'react';
import {
  FaBell,
  FaBook,
  FaYenSign,
  FaDatabase,
  FaAngleLeft
} from 'react-icons/fa';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../../firebase'; // authを直接使う
import { onAuthStateChanged } from 'firebase/auth';

const SidebarSection = ({ icon: Icon, title, subItems, onSelectMenu }) => {
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
          className={`transition-transform duration-200 ${isOpen ? 'rotate-[-90deg]' : ''}`}
        />
      </button>
      {isOpen && (
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

const CustomerSidebar = ({ onSelectMenu }) => {
  const [customerName, setCustomerName] = useState('お客様');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, 'customers', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setCustomerName(docSnap.data().name || 'お客様');
        } else {
          setCustomerName('お客様データなし');
        }
      } else {
        setCustomerName('未ログイン');
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <aside className="w-64 border-r border-gray-300 p-4 overflow-auto h-screen">
      <h4 className="text-lg font-bold mb-4 text-center text-gray-800" style={{ fontSize: '20px' }}>
        {customerName}
      </h4>
      <SidebarSection
        icon={FaDatabase}
        title="テストデータ"
        subItems={[
          { label: 'authContext', key: 'authTest' },
          { label: 'userContext', key: 'userTest' },
        ]}
        onSelectMenu={onSelectMenu}
      />
      <ul className="sidebar-menu">
        <SidebarSection
          icon={FaBook}
          title="時間割"
          subItems={[
            { label: '時間割一覧', key: 'timetable' }
          ]}
          onSelectMenu={onSelectMenu}
        />
        <SidebarSection
          icon={FaBell}
          title="成績管理"
          subItems={[
            { label: '塾内テスト結果', key: 'notification' },
            { label: '模試結果', key: 'notification' },
            { label: '学校成績&テスト結果', key: 'notification' }
          ]}
          onSelectMenu={onSelectMenu}
        />
        <SidebarSection
          icon={FaBell}
          title="通知管理"
          subItems={[
            { label: '本部連絡', key: 'tasks' },
            { label: '教室連絡', key: 'notification' }
          ]}
          onSelectMenu={onSelectMenu}
        />
        <SidebarSection
          icon={FaYenSign}
          title="請求情報"
          subItems={[
            { label: '請求情報', key: 'billing' }
          ]}
          onSelectMenu={onSelectMenu}
        />
        <SidebarSection
          icon={FaBell}
          title="チャット"
          subItems={[
            { label: '本部', key: 'chat' },
            { label: '教室', key: 'chat' }
          ]}
          onSelectMenu={onSelectMenu}
        />
      </ul>
    </aside>
  );
};

export default CustomerSidebar;
