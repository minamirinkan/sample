import React, { useEffect, useState } from 'react';
import { collectionGroup, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';

// データ構造の型定義
type CategoryCounts = { [category: string]: number };
type MonthlyCounts = { [month: string]: CategoryCounts };
type PayrollData = { [teacherName: string]: MonthlyCounts };

// ヘルパー関数（変更なし）
const getSchoolLevel = (grade: string): '小学生' | '中学生' | '高校生' => {
    if (grade?.startsWith('高')) return '高校生';
    if (grade?.startsWith('中')) return '中学生';
    return '小学生';
};
const getHighestSchoolLevel = (grades: string[]): '小学生' | '中学生' | '高校生' => {
    if (grades.some(g => g?.startsWith('高'))) return '高校生';
    if (grades.some(g => g?.startsWith('中'))) return '中学生';
    return '小学生';
};
const categorizePeriod = (periodArray: any[]): string => {
    if (!Array.isArray(periodArray) || periodArray.length === 0) return '不明';
    const isAllSeminar = periodArray.every(p => p.classType === '演習クラス');
    if (isAllSeminar) return '演習クラス';
    if (periodArray.length === 1) {
        const level = getSchoolLevel(periodArray[0].grade);
        return `1名（${level}）`;
    }
    if (periodArray.length === 2) {
        const grades = periodArray.map(p => p.grade);
        const highestLevel = getHighestSchoolLevel(grades);
        return `2名（${highestLevel}）`;
    }
    return '演習クラス';
};

// ★★★ 修正点1: 表示する列のカテゴリーを固定リストとして定義 ★★★
const DISPLAY_CATEGORIES = [
    '1名（小学生）', '1名（中学生）', '1名（高校生）',
    '2名（小学生）', '2名（中学生）', '2名（高校生）',
    '演習クラス'
];

const PayrollSheet: React.FC = () => {
    const [payrollData, setPayrollData] = useState<PayrollData>({});
    const [months, setMonths] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState<string>('');
    // uniqueCategories stateは不要になったため削除

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
                            if (!row.teacher || !row.teacher.name || !row.periods) return;
                            const teacherName = row.teacher.name;
                            const dateMatch = docId.match(/(\d{4}-\d{2}-\d{2})/);
                            if (!dateMatch) return;
                            const yearMonth = dateMatch[1].substring(0, 7);
                            allMonths.add(yearMonth);
                            if (!aggregatedData[teacherName]) aggregatedData[teacherName] = {};
                            if (!aggregatedData[teacherName][yearMonth]) aggregatedData[teacherName][yearMonth] = {};

                            Object.values(row.periods).forEach((periodArray: any) => {
                                const category = categorizePeriod(periodArray);
                                if (category === '不明') return;

                                // allCategoriesの収集は不要に
                                const currentCount = aggregatedData[teacherName][yearMonth][category] || 0;
                                aggregatedData[teacherName][yearMonth][category] = currentCount + 1;
                            });
                        });
                    }
                });

                const sortedMonths = Array.from(allMonths).sort().reverse();
                setPayrollData(aggregatedData);
                setMonths(sortedMonths);

                if (sortedMonths.length > 0) {
                    const now = new Date();
                    const currentYearMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
                    setSelectedMonth(sortedMonths.includes(currentYearMonth) ? currentYearMonth : sortedMonths[0]);
                }
            } catch (error) {
                console.error("データ取得中にエラーが発生しました:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSchedules();
    }, []);

    const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => setSelectedMonth(event.target.value);

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
                            {/* ★★★ 修正点2: 固定リストを使って列ヘッダーを生成 ★★★ */}
                            {DISPLAY_CATEGORIES.map(category => (
                                <th key={category} className="border p-2">{category}</th>
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
                                    {/* ★★★ 修正点3: 固定リストを使ってセルを生成 ★★★ */}
                                    {DISPLAY_CATEGORIES.map(category => (
                                        <td key={category} className="border p-2 text-center">
                                            {countsForMonth[category] || 0}
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
