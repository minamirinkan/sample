import React, { useEffect, useState } from 'react';
import { collectionGroup, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';

// データ構造の型定義
type ClassTypeCounts = {
    [classType: string]: number;
};
type MonthlyCounts = {
    [month: string]: ClassTypeCounts;
};
type PayrollData = {
    [teacherName: string]: MonthlyCounts;
};

const PayrollSheet: React.FC = () => {
    const [payrollData, setPayrollData] = useState<PayrollData>({});
    const [months, setMonths] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState<string>('');
    const [uniqueClassTypes, setUniqueClassTypes] = useState<string[]>([]);

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                const querySnapshot = await getDocs(collectionGroup(db, 'dailySchedules'));
                const aggregatedData: PayrollData = {};
                const allMonths = new Set<string>();
                const allClassTypes = new Set<string>();

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const docId = doc.id;
                    if (data.rows && Array.isArray(data.rows)) {
                        data.rows.forEach(row => {
                            if (!row.teacher || !row.teacher.name || !row.periods) {
                                return;
                            }
                            const teacherName = row.teacher.name;

                            const dateMatch = docId.match(/(\d{4}-\d{2}-\d{2})/);
                            if (!dateMatch) return;
                            const yearMonth = dateMatch[1].substring(0, 7);

                            allMonths.add(yearMonth);
                            if (!aggregatedData[teacherName]) aggregatedData[teacherName] = {};
                            if (!aggregatedData[teacherName][yearMonth]) aggregatedData[teacherName][yearMonth] = {};

                            // periodsマップの値（period1~8の配列）をループ
                            Object.values(row.periods).forEach((periodArray: any) => {
                                // 配列であり、空でなく、最初の要素が存在することを確認
                                if (Array.isArray(periodArray) && periodArray.length > 0 && periodArray[0]) {
                                    // 配列の最初の要素に授業情報があると仮定
                                    const classInfo = periodArray[0];
                                    const classType = classInfo.classType || '不明';
                                    allClassTypes.add(classType);

                                    const currentCount = aggregatedData[teacherName][yearMonth][classType] || 0;
                                    aggregatedData[teacherName][yearMonth][classType] = currentCount + 1;
                                }
                            });
                        });
                    }
                });

                const sortedMonths = Array.from(allMonths).sort().reverse();
                setPayrollData(aggregatedData);
                setMonths(sortedMonths);
                setUniqueClassTypes(Array.from(allClassTypes).sort());

                if (sortedMonths.length > 0) {
                    const now = new Date();
                    const currentYearMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
                    if (sortedMonths.includes(currentYearMonth)) {
                        setSelectedMonth(currentYearMonth);
                    } else {
                        setSelectedMonth(sortedMonths[0]);
                    }
                }
            } catch (error) {
                console.error("データ取得中にエラーが発生しました:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSchedules();
    }, []);

    const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedMonth(event.target.value);
    };

    if (loading) return <p className="text-gray-500 animate-pulse p-6">読み込み中...</p>;
    if (Object.keys(payrollData).length === 0) return <p className="text-red-500 p-6">表示するデータがありません。</p>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">講師別・月別 担当コマ数一覧</h1>
            <div className="mb-4">
                <label htmlFor="month-select" className="mr-2 font-medium">表示月:</label>
                <select id="month-select" value={selectedMonth} onChange={handleMonthChange} className="p-2 border rounded-md shadow-sm">
                    {months.map(month => <option key={month} value={month}>{month}</option>)}
                </select>
            </div>
            <div className="overflow-x-auto">
                <table className="border-collapse border table-auto w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border p-2 text-left">講師名</th>
                            <th className="border p-2">合計コマ数</th>
                            {uniqueClassTypes.map(type => (
                                <th key={type} className="border p-2">{type}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(payrollData).map(([teacher, monthlyCounts]) => {
                            const countsForMonth = monthlyCounts[selectedMonth] || {};
                            const totalCount = Object.values(countsForMonth).reduce((sum, count) => sum + count, 0);

                            return (
                                <tr key={teacher} className="odd:bg-white even:bg-gray-50">
                                    <td className="border p-2 font-medium">{teacher}</td>
                                    <td className="border p-2 text-center font-bold">{totalCount}</td>
                                    {uniqueClassTypes.map(type => (
                                        <td key={type} className="border p-2 text-center">
                                            {countsForMonth[type] || 0}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PayrollSheet;
