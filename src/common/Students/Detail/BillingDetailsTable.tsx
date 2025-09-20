// src/pages/Students/Detail/BillingDetailsTable.tsx
import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import BillingCodeSearchModal from "./BillingCodeSearchModal";

export interface BillingDetail {
    code: string;
    name: string;
    taxType: string;
    price: number;
    qty: number;
    total: number;
    note: string;
}

interface BillingDetailsTableProps {
    details: BillingDetail[];
    isEditing: boolean;
    onChange: (index: number, field: keyof BillingDetail, value: string | number) => void;
    onDragEnd?: (result: DropResult) => void;
}

const BillingDetailsTable: React.FC<BillingDetailsTableProps> = ({ details, isEditing, onChange, onDragEnd }) => {
    const [searchIndex, setSearchIndex] = useState<number | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const searchOptions = [
        { code: "N0W1T80_中1", name: "授業料 中1" },
        { code: "N0W2T80_中2", name: "授業料 中2" },
        { code: "E0W1T80_中1", name: "演習クラス 中1" },
    ];

    const handleSearchCode = (index: number) => {
        setSearchIndex(index);
        setModalOpen(true);
    };

    const handleSelectCode = (code: string) => {
        if (searchIndex === null) return;
        onChange(searchIndex, "code", code);
        setSearchIndex(null);
        setModalOpen(false);
    };

    const renderRow = (d: BillingDetail, index: number) => (
        <Draggable draggableId={d.code + index} index={index} key={d.code + index}>
            {(provided) => (
                <tr
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...(isEditing ? provided.dragHandleProps : {})}
                    className="border-b"
                >
                    <td className="p-2">
                        {isEditing ? (
                            <button
                                className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200"
                                onClick={() => handleSearchCode(index)}
                            >
                                検索
                            </button>
                        ) : (
                            d.code
                        )}
                    </td>
                    <td className="p-2">{d.name}</td>
                    <td className="p-2">{d.taxType}</td>
                    <td className="p-2">{d.price}</td>
                    <td className="p-2">{d.qty}</td>
                    <td className="p-2">{d.total}</td>
                    <td className="p-2">{d.note}</td>
                </tr>
            )}
        </Draggable>
    );

    return (
        <>
            <DragDropContext onDragEnd={onDragEnd ?? (() => { })}>
                <Droppable droppableId="billingDetails">
                    {(provided) => (
                        <table className="w-full text-left border-collapse" ref={provided.innerRef} {...provided.droppableProps}>
                            <thead>
                                <tr className="border-b">
                                    <th className="p-2">コード</th>
                                    <th className="p-2">項目名</th>
                                    <th className="p-2">課税区分</th>
                                    <th className="p-2">税抜単価</th>
                                    <th className="p-2">数量</th>
                                    <th className="p-2">税込金額</th>
                                    <th className="p-2">備考</th>
                                </tr>
                            </thead>
                            <tbody>{details.map(renderRow)}{provided.placeholder}</tbody>
                        </table>
                    )}
                </Droppable>
            </DragDropContext>

            <BillingCodeSearchModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                options={searchOptions}
                onSelect={handleSelectCode}
            />
        </>
    );
};

export default BillingDetailsTable;