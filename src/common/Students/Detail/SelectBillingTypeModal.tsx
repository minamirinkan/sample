import React from "react";

interface SelectBillingTypeModalProps {
    onClose: () => void;
    onSelect: (type: "monthly" | "spot") => void;
}

const SelectBillingTypeModal: React.FC<SelectBillingTypeModalProps> = ({
    onClose,
    onSelect,
}) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-80">
                <h2 className="text-lg font-semibold text-center mb-4">
                    請求の種類を選択
                </h2>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => onSelect("monthly")}
                        className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        月締請求を作成
                    </button>
                    <button
                        onClick={() => onSelect("spot")}
                        className="bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                    >
                        都度請求を作成
                    </button>
                </div>
                <button
                    onClick={onClose}
                    className="mt-4 text-gray-500 hover:text-gray-700 text-sm block mx-auto"
                >
                    キャンセル
                </button>
            </div>
        </div>
    );
};

export default SelectBillingTypeModal;
