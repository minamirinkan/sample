import { useState, useEffect } from 'react';

const mockStudents = [
    { id: 1, code: '20230001', lastName: '山田', firstName: '太郎', grade: '中3' },
    { id: 2, code: '20230002', lastName: '佐藤', firstName: '花子', grade: '中2' },
    { id: 3, code: '20230003', lastName: '鈴木', firstName: '一郎', grade: '中1' },
];

const SuperAdminStudents = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredStudents, setFilteredStudents] = useState(mockStudents);

    useEffect(() => {
        const results = mockStudents.filter(student =>
            `${student.lastName}${student.firstName}`.includes(searchTerm) ||
            student.code.includes(searchTerm)
        );
        setFilteredStudents(results);
    }, [searchTerm]);

    return (
        <div className="space-y-4">
            {/* 検索条件フォーム */}
            <div className="bg-white p-4 rounded shadow">
                <h2 className="text-lg font-semibold mb-2">生徒検索</h2>
                <input
                    type="text"
                    className="w-full border px-3 py-2 rounded"
                    placeholder="氏名または生徒コードで検索"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* 生徒一覧（カード形式） */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredStudents.map(student => (
                    <div key={student.id} className="bg-white p-4 rounded shadow">
                        <h3 className="text-md font-bold mb-1">{student.lastName} {student.firstName}</h3>
                        <p>学年: {student.grade}</p>
                        <p>生徒コード: {student.code}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SuperAdminStudents;
