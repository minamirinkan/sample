
import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconType } from 'react-icons';

interface SidebarItem {
    label: string;
    key: string;
    path: string;
    external?: boolean;
}

interface SidebarSectionProps {
    icon: IconType;
    title: string;
    subItems: SidebarItem[];
}

const SidebarSection: FC<SidebarSectionProps> = ({ icon: Icon, title, subItems }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const navigate = useNavigate();

    const handleClick = (e: React.MouseEvent, path: string) => {
        // 右クリックや Ctrl / Cmd 押下なら普通にリンクとして開く
        if (e.ctrlKey || e.metaKey || e.button === 1) return;

        // 左クリックの場合のみ SPA 遷移
        e.preventDefault();
        navigate(path);
    };

    return (
        <div className="mb-2">
            {/* タイトル部分 */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full p-2 font-bold text-gray-800 hover:bg-gray-100 rounded"
            >
                <div className="flex items-center gap-2">
                    <Icon />
                    {title}
                </div>
                <span className={`transition-transform duration-200 ${isOpen ? '-rotate-90' : ''}`}>
                    ＜
                </span>
            </button>

            {/* subItems */}
            {isOpen && (
                <ul className="ml-6 mt-1">
                    {subItems.map(item => (
                        <li key={item.key}>
                            {item.external ? (
                                // 外部リンクは新しいタブで開く
                                <a
                                    href={item.path}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block p-1 hover:bg-gray-200 rounded"
                                >
                                    {item.label}
                                </a>
                            ) : (
                                // 内部リンクは SPA ナビゲーション
                                <a
                                    href={item.path}
                                    onClick={(e) => handleClick(e, item.path)}
                                    className="block p-1 hover:bg-gray-200 rounded"
                                >
                                    {item.label}
                                </a>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SidebarSection;
