import React from 'react';

type Props = {
    isOpen: boolean;
    onRequestClose: () => void;
    onConfirm: () => void;
    isProcessing?: boolean; // ← 任意で受け取れるようにしておくと拡張性◎
  };
  
  const ConfirmAttendanceModal: React.FC<Props> = ({
    isOpen,
    onRequestClose,
    onConfirm,
    isProcessing = false, // デフォルト false にしておくと安全
  }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 w-80 max-w-full">
                <h2 className="text-xl font-bold mb-4">出席を確定しますか？</h2>
                <p className="mb-6">当日の「予定」ステータスの授業をすべて「出席」に変更します。</p>
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={onRequestClose}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        確定する
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmAttendanceModal;