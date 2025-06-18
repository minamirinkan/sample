// src/components/ActionButtons.js
import React from 'react';
import { FaArrowLeft, FaEdit, FaSave, FaTimes } from 'react-icons/fa';

const ActionButtons = ({ isEditing, onBack, onEdit, onCancel, onSave }) => (
    <div className="flex justify-center space-x-8 mb-4">
        {!isEditing ? (
            <>
                <button
                    onClick={onBack}
                    className="px-5 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 transition flex items-center space-x-2"
                >
                    <FaArrowLeft />
                    <span>一覧へ戻る</span>
                </button>
                <button
                    onClick={onEdit}
                    className="px-5 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 transition flex items-center space-x-2"
                >
                    <FaEdit />
                    <span>編集</span>
                </button>
            </>
        ) : (
            <>
                <button
                    onClick={onSave}
                    className="px-5 py-2 bg-green-500 text-white rounded-md hover:bg-green-700 transition flex items-center space-x-2"
                >
                    <FaSave />
                    <span>保存</span>
                </button>
                <button
                    onClick={onCancel}
                    className="px-5 py-2 bg-red-500 text-white rounded-md hover:bg-red-700 transition flex items-center space-x-2"
                >
                    <FaTimes />
                    <span>キャンセル</span>
                </button>
            </>
        )}
    </div>
);

export default ActionButtons;
