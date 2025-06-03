const SuperAdminSidebar = ({ onSelectMenu }) => {
    return (
        <aside className="w-64 border-r border-gray-300 p-4">
            <h4 className="text-lg font-bold mb-4">管理者ページ</h4>
            <ul>
                <li>
                    <button
                        className="block mb-2 text-left w-full"
                        onClick={() => onSelectMenu('students')}
                    >
                        生徒情報
                    </button>
                </li>
                <li>
                    <button
                        className="block mb-2 text-left w-full"
                        onClick={() => onSelectMenu('teachers')}
                    >
                        講師情報
                    </button>
                </li>
                <li>
                    <button
                        className="block mb-2 text-left w-full"
                        onClick={() => onSelectMenu('schedule')}
                    >
                        スケジュール
                    </button>
                </li>
            </ul>
        </aside>
    );
};

export default SuperAdminSidebar;
