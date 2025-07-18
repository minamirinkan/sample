import React from 'react';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onMarkAsRead: () => void;
    subject: string;
    content: string;
};

const MessageDetailModal: React.FC<Props> = ({ isOpen, onClose, onMarkAsRead, subject, content }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
            <div className="bg-white rounded shadow-md w-96 p-6 max-h-[80vh] overflow-y-auto">
                <h2 className="text-3xl font-extrabold mb-3 text-indigo-900 border-b border-indigo-300 pb-2">
                    {subject}
                </h2>
                <div className="bg-gray-50 p-4 rounded-md mb-6">
                    <p className="text-lg leading-relaxed text-gray-800 whitespace-pre-line">
                        {content}
                    </p>
                </div>
                <div className="flex justify-between">
                    <button
                        onClick={onMarkAsRead}
                        className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition"
                    >
                        既読にする
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-gray-200 text-gray-600 px-5 py-2 rounded hover:bg-gray-300 transition"
                    >
                        キャンセル
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MessageDetailModal;
