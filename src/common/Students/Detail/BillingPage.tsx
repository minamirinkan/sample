import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import { useNavigate } from "react-router-dom";
import { Student } from "../../../contexts/types/student";
import { Customer } from "../../../contexts/types/customer";

export type Billing = {
    id: string;
    studentId: string;
    month: string;
    type: "monthly" | "spot";
    subtotal: number;
    taxAmount: number;
    total: number;
    note?: string;
    createdAt: any;
};

type Props = {
    formData: Student;
    customer: Customer;
};

const BillingPage: React.FC<Props> = ({ customer, formData }) => {
    const [billings, setBillings] = useState<Billing[]>([]);
    const navigate = useNavigate();
    const studentId = formData.studentId ?? ''
    const customerUid = customer.uid ?? ''

    useEffect(() => {
        const fetchBillings = async () => {
            const q = collection(db, "customers", customerUid, "billings");
            const snapshot = await getDocs(q);

            const data: Billing[] = snapshot.docs.map((doc) => {
                const d = doc.data();
                return {
                    id: doc.id,
                    studentId: d.studentId,
                    month: d.month,
                    type: d.type,
                    subtotal: d.subtotal ?? 0,
                    taxAmount: d.taxAmount ?? 0,
                    total: d.total ?? 0,
                    note: d.note ?? "",
                    createdAt: d.createdAt?.toDate?.() ?? null,
                };
            });
            setBillings(data);
        };

        fetchBillings();
    }, [customerUid]);

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold">請求書一覧</h2>
            <table className="w-full table-auto border">
                <thead>
                    <tr className="bg-blue-50">
                        <th className="border p-2">登録日</th>
                        <th className="border p-2">請求種別</th>
                        <th className="border p-2">請求対象年月</th>
                        <th className="border p-2">小計</th>
                        <th className="border p-2">消費税額</th>
                        <th className="border p-2">合計金額</th>
                        <th className="border p-2">備考</th>
                        <th className="border p-2">操作</th>
                    </tr>
                </thead>
                <tbody>
                    {billings.map((b) => (
                        <tr key={b.id}>
                            <td className="border p-2">
                                {b.createdAt ? b.createdAt.toLocaleDateString() : "-"}
                            </td>
                            <td className="border p-2">
                                {b.type === "monthly" ? "月締" : "都度"}
                            </td>
                            <td className="border p-2">
                                {b.month
                                    ? `${b.month.slice(0, 4)}年${b.month.slice(4, 6)}月`
                                    : "-"}
                            </td>
                            <td className="border p-2">{Math.floor(b.subtotal).toLocaleString()}円</td>
                            <td className="border p-2">{Math.floor(b.taxAmount).toLocaleString()}円</td>
                            <td className="border p-2">{Math.floor(b.total).toLocaleString()}円</td>
                            <td className="border p-2">{b.note || "-"}</td>
                            <td className="border p-2">
                                <button
                                    className="text-blue-600 hover:underline"
                                    onClick={() =>
                                        navigate(`/admin/students/${studentId}/bill/${b.month}`, {
                                            state: {
                                                billing: b,
                                                formData,
                                                customer
                                            }
                                        })
                                    }
                                >
                                    詳細
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div >
    );
};

export default BillingPage;
