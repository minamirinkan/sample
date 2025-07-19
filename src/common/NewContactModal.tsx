import React, { useState } from 'react';
import Modal from './Modal.tsx';

type NewContactModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (subject: string, content: string) => void;
};

const NewContactModal: React.FC<NewContactModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = () => {
        onSubmit(subject, content);
        setSubject('');
        setContent('');
        onClose();
    };

    const handleCancel = () => {
        setSubject('');
        setContent('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleCancel}>
            <h3 className="text-lg font-semibold mb-4">新規連絡作成</h3>
            <label className="block mb-2">
                件名：
                <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="border border-gray-300 rounded w-full p-2 mt-1"
                />
            </label>
            <label className="block mb-4">
                内容：
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={5}
                    className="border border-gray-300 rounded w-full p-2 mt-1"
                />
            </label>
            <div className="flex justify-end space-x-3">
                <button
                    onClick={handleCancel}
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                    type="button"
                >
                    キャンセル
                </button>
                <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                    type="button"
                    disabled={!subject.trim() || !content.trim()}
                >
                    送信
                </button>
            </div>
        </Modal>
    );
};

export default NewContactModal;
