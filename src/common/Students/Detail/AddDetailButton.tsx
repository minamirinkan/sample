// src/pages/AddDetailButton.tsx
import React from "react";

interface AddDetailButtonProps {
    onClick: () => void;
    disabled?: boolean;
}

const AddDetailButton: React.FC<AddDetailButtonProps> = ({ onClick, disabled }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="ml-2 px-3 py-1 text-sm rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
        >
            請求項目を追加
        </button>
    );
};

export default AddDetailButton;
