import React from 'react';

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            onClick={onClose}
        >
            <div
                className="bg-white p-6 rounded shadow-lg w-full max-w-md"
                onClick={(e) => e.stopPropagation()} // 背景クリックで閉じるが中身クリックは閉じない
            >
                {children}
            </div>
        </div>
    );
};

export default Modal;
