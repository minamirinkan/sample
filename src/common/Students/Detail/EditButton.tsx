import React from "react";
import { FaArrowLeft, FaEdit, FaSave, FaTrash } from 'react-icons/fa';

type EditButtonProps = {
    isEditing: boolean;
    onBack: () => void;
    onEdit: () => void;
    onSave: () => void;
    onDelete: () => void;
};

const EditButton: React.FC<EditButtonProps> = ({ isEditing, onBack, onEdit, onSave, onDelete }) => (
    <div className="flex justify-center space-x-8 mb-4">
        <button
            onClick={onBack}
            className="px-5 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 transition flex items-center space-x-2"
        >
            <FaArrowLeft />
            <span>戻る</span>
        </button>

        {isEditing ? (
            <>
                <button
                    onClick={onSave}
                    className="px-5 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 transition flex items-center space-x-2"
                >
                    <FaSave />
                    <span>保存</span>
                </button>
            </>
        ) : (
            <>
                <button
                    onClick={onEdit}
                    className="px-5 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 transition flex items-center space-x-2"
                >
                    <FaEdit />
                    <span>編集</span>
                </button>
                <button
                    onClick={onDelete}
                    className="px-5 py-2 bg-red-500 text-white rounded-md hover:bg-red-700 transition flex items-center space-x-2"
                >
                    <FaTrash />
                    <span>削除</span>
                </button>
            </>
        )}
    </div >
);

export default EditButton;
