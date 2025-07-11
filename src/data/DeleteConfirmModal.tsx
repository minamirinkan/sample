import React from "react";

type Props = {
    onConfirm: () => void;
    onCancel: () => void;
};

const DeleteConfirmModal: React.FC<Props> = ({ onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-72 text-center">
                <p className="mb-4 text-lg">選択した祝日をすべて削除します。よろしいですか？</p>
                <div className="flex justify-center space-x-4">
                    <button
                        className="px-4 py-2 bg-gray-300 rounded"
                        onClick={onCancel}
                    >
                        キャンセル
                    </button>
                    <button
                        className="px-4 py-2 bg-red-600 text-white rounded"
                        onClick={onConfirm}
                    >
                        削除
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;
