import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import formatPrice from "../utils/formatPrice"; // 既存の関数

type WorkFeeItem = {
    "1対1"?: string;
    "1対2"?: string;
    "1対6まで"?: string;
};

type TuitionWorkFees = {
    "40minutes"?: WorkFeeItem[];
    "70minutes"?: WorkFeeItem[];
    "80minutes"?: WorkFeeItem[];
};

const durationLabels: Record<string, string> = {
    "40minutes": "40分授業",
    "70minutes": "70分授業",
    "80minutes": "80分授業",
};

const gradeLabels = ["小学生", "中学生", "高校生"];

const TeacherWorkFeesPage: React.FC = () => {
    const { location } = useParams<{ location: string }>();
    const [workFees, setWorkFees] = useState<TuitionWorkFees | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!location) return;

        const fetchWorkFees = async () => {
            const docRef = doc(db, "TeacherFees", location);
            const snap = await getDoc(docRef);

            if (snap.exists()) {
                const data = snap.data();
                setWorkFees({
                    "40minutes": data["40minutes"] || [],
                    "70minutes": data["70minutes"] || [],
                    "80minutes": data["80minutes"] || [],
                });
            }
            setLoading(false);
        };

        fetchWorkFees();
    }, [location]);

    if (loading) return <p className="text-gray-500 animate-pulse">読み込み中...</p>;
    if (!workFees) return <p className="text-red-500">データが見つかりません</p>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">{location} 講師給与一覧</h1>

            {["40minutes", "70minutes", "80minutes"].map((duration) =>
                workFees[duration as keyof TuitionWorkFees]?.length ? (
                    <div key={duration} className="mb-6 overflow-x-auto">
                        <h2 className="text-xl font-semibold mb-2">{durationLabels[duration]}</h2>
                        <table className="border-collapse border table-auto w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border p-2">学年</th>
                                    <th className="border p-2">1対1</th>
                                    <th className="border p-2">1対2</th>
                                    <th className="border p-2">1対6まで</th>
                                </tr>
                            </thead>
                            <tbody>
                                {workFees[duration as keyof TuitionWorkFees]?.map((item, idx) => (
                                    <tr key={idx} className="odd:bg-white even:bg-gray-50">
                                        <td className="border p-2 text-center">{gradeLabels[idx] || `学年${idx + 1}`}</td>
                                        <td className="border p-2 text-center">
                                            {item["1対1"] ? formatPrice(item["1対1"]) : "ー"}
                                        </td>
                                        <td className="border p-2 text-center">
                                            {item["1対2"] ? formatPrice(item["1対2"]) : "ー"}
                                        </td>
                                        <td className="border p-2 text-center">
                                            {item["1対6まで"] ? formatPrice(item["1対6まで"]) : "ー"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : null
            )}
        </div>
    );
};

export default TeacherWorkFeesPage;
