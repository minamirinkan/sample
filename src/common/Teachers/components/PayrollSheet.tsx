import React, { useEffect, useState } from 'react';
import { collectionGroup, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';

type PayrollData = {
    [teacherName: string]: {
        [month: string]: number;
    };
};

const PayrollSheet: React.FC = () => {
    const [payrollData, setPayrollData] = useState<PayrollData>({});
    const [months, setMonths] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                const querySnapshot = await getDocs(collectionGroup(db, 'dailySchedules'));
                const aggregatedData: PayrollData = {};
                const allMonths = new Set<string>();

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const docId = doc.id;

                    // 1. 'rows' フィールドが存在し、配列であることを確認
                    if (data.rows && Array.isArray(data.rows)) {

                        // 2. 'rows' 配列の中身を一つずつ処理
                        data.rows.forEach(row => {
                            // 3. 配列の各要素に teacher と periods があるか確認
                            if (!row.teacher || !row.teacher.name || !row.periods) {
                                return; // データが不完全な要素はスキップ
                            }

                            const dateMatch = docId.match(/(\d{4}-\d{2}-\d{2})/);
                            if (!dateMatch) return;

                            const yearMonth = dateMatch[1].substring(0, 7);
                            const teacherName = row.teacher.name;
                            const classCount = Object.keys(row.periods).length;

                            allMonths.add(yearMonth);

                            if (!aggregatedData[teacherName]) {
                                aggregatedData[teacherName] = {};
                            }
                            if (!aggregatedData[teacherName][yearMonth]) {
                                aggregatedData[teacherName][yearMonth] = 0;
                            }
                            aggregatedData[teacherName][yearMonth] += classCount;
                        });
                    }
                });

                const sortedMonths = Array.from(allMonths).sort();
                setPayrollData(aggregatedData);
                setMonths(sortedMonths);

            } catch (error) {
                console.error("データ取得または処理中にエラーが発生しました:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSchedules();
    }, []);

    if (loading) {
        return <p className="text-gray-500 animate-pulse p-6">読み込み中...</p>;
    }

    if (Object.keys(payrollData).length === 0) {
        return <p className="text-red-500 p-6">表示するデータがありません。</p>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">講師別・月別 担当コマ数一覧</h1>
            <div className="overflow-x-auto">
                <table className="border-collapse border table-auto w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border p-2 text-left">講師名</th>
                            {months.map(month => (
                                <th key={month} className="border p-2">
                                    {month}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(payrollData).map(([teacher, monthlyCounts]) => (
                            <tr key={teacher} className="odd:bg-white even:bg-gray-50">
                                <td className="border p-2 font-medium">{teacher}</td>
                                {months.map(month => (
                                    <td key={`${teacher}-${month}`} className="border p-2 text-center">
                                        {monthlyCounts[month] || 0}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PayrollSheet;
