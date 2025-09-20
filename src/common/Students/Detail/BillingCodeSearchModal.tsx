// src/common/ui/BillingCodeSearchModal.tsx
import React from "react";

interface BillingCodeSearchModalProps {
    open: boolean;
    onClose: () => void;
    options: { code: string; name: string }[];
    onSelect: (code: string) => void;
}

const BillingCodeSearchModal: React.FC<BillingCodeSearchModalProps> = ({
    open,
    onClose,
    options,
    onSelect,
}) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
            <div className="bg-white p-4 rounded shadow-md w-96 max-h-[80vh] overflow-auto">
                <h2 className="text-lg font-bold mb-2">請求コード選択</h2>
                <div className="space-y-2">
                    {options.map((opt) => (
                        <button
                            key={opt.code}
                            className="w-full px-3 py-2 border rounded hover:bg-gray-100 text-left"
                            onClick={() => onSelect(opt.code)}
                        >
                            {opt.code} - {opt.name}
                        </button>
                    ))}
                </div>
                <button
                    className="mt-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    onClick={onClose}
                >
                    閉じる
                </button>
            </div>
        </div>
    );
};

export default BillingCodeSearchModal;
