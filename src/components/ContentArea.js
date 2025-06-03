const ContentArea = ({ selectedMenu, openModal }) => {
    switch (selectedMenu) {
        case 'students':
            return (
                <div>
                    <h2 className="text-2xl font-bold mb-4">生徒情報一覧</h2>
                    {/* 生徒情報テーブルや一覧をここに表示 */}
                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                        onClick={openModal}
                    >
                        新規生徒登録
                    </button>
                </div>
            );
        case 'teachers':
            return <h2 className="text-2xl font-bold">講師情報一覧</h2>;
        case 'schedule':
            return <h2 className="text-2xl font-bold">スケジュール表示</h2>;
        default:
            return (
                <>
                    <h5>ようこそ、管理者様</h5>
                    <p>左側のメニューから操作を選択してください。</p>
                </>
            );
    }
};

export default ContentArea;
