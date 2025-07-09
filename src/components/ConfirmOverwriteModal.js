import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ConfirmOverwriteModal({ isOpen, onConfirm, onCancel }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onCancel}
                >
                    <motion.div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                    >
                        <h2 className="text-lg font-semibold mb-4">確認</h2>
                        <p className="mb-6 whitespace-pre-wrap">
                            この時間割はすでに出席を確定済みです。
                            {"\n"}修正後に保存すると再度「出席の確定」が必要になります。
                            {"\n"}続行しますか？
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={onCancel}
                                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={onConfirm}
                                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                            >
                                はい、続行する
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
