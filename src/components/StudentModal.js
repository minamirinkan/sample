const StudentModal = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded p-6 w-96">
                <h3 className="text-xl font-bold mb-4">新規生徒登録</h3>
                {/* ここにフォームコンポーネントを作成 */}
                <form>
                    <input
                        type="text"
                        placeholder="コード番号（8桁）"
                        className="border p-2 w-full mb-3"
                        pattern="\d{8}"
                        required
                    />
                    <input
                        type="text"
                        placeholder="名前"
                        className="border p-2 w-full mb-3"
                        required
                    />
                    {/* 他のフォーム要素も同様に追加 */}
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded"
                        >
                            キャンセル
                        </button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                            登録
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentModal;
