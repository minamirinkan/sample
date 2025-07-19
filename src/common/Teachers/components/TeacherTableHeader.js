// src/components/TeacherTableHeader.js
const TeacherTableHeader = () => (
    <thead>
        <tr className="bg-gray-100 text-sm">
            <th className="border px-4 py-2 text-center">選択</th>
            <th className="border px-4 py-2 text-center">講師コード</th>
            <th className="border px-4 py-2 text-center">氏名</th>
            <th className="border px-4 py-2 text-center">フリガナ</th>
            <th className="border px-4 py-2 text-center">担当科目</th>
            <th className="border px-4 py-2 text-center">雇用日</th>
            <th className="border px-4 py-2 text-center">状況</th>
            <th className="border px-4 py-2 text-center">操作</th>
        </tr>
    </thead>
);

export default TeacherTableHeader;
