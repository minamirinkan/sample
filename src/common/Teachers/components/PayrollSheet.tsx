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
    // 選択された月を管理するための新しいstate
    const [selectedMonth, setSelectedMonth] = useState<string>('');

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                const querySnapshot = await getDocs(collectionGroup(db, 'dailySchedules'));
                const aggregatedData: PayrollData = {};
                const allMonths = new Set<string>();

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const docId = doc.id;
                    if (data.rows && Array.isArray(data.rows)) {
                        data.rows.forEach(row => {
                            if (!row.teacher || !row.teacher.name || !row.periods) {
                                return;
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

                // 月を降順（新しい順）にソート
                const sortedMonths = Array.from(allMonths).sort().reverse();
                setPayrollData(aggregatedData);
                setMonths(sortedMonths);

                // デフォルトで表示する月を設定
                if (sortedMonths.length > 0) {
                    const now = new Date();
                    const currentYearMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;

                    // 今月のデータがあれば今月を、なければ最新月を選択
                    if (sortedMonths.includes(currentYearMonth)) {
                        setSelectedMonth(currentYearMonth);
                    } else {
                        setSelectedMonth(sortedMonths[0]); // データが存在する最新月をセット
                    }
                }

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

    // プルダウンの選択が変更されたときに呼ばれる関数
    const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedMonth(event.target.value);
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">講師別・月別 担当コマ数一覧</h1>

            {/* 月選択プルダウンメニュー */}
            <div className="mb-4">
                <label htmlFor="month-select" className="mr-2 font-medium">表示月:</label>
                <select
                    id="month-select"
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    className="p-2 border rounded-md shadow-sm"
                >
                    {months.map(month => (
                        <option key={month} value={month}>
                            {month}
                        </option>
                    ))}
                </select>
            </div>

            <div className="overflow-x-auto">
                <table className="border-collapse border table-auto w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border p-2 text-left">講師名</th>
                            {/* ヘッダーを選択された月のみ表示 */}
                            <th className="border p-2">
                                {selectedMonth} のコマ数
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* selectedMonth のデータのみを表示 */}
                        {Object.entries(payrollData).map(([teacher, monthlyCounts]) => (
                            <tr key={teacher} className="odd:bg-white even:bg-gray-50">
                                <td className="border p-2 font-medium">{teacher}</td>
                                <td className="border p-2 text-center">
                                    {monthlyCounts[selectedMonth] || 0}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PayrollSheet;
