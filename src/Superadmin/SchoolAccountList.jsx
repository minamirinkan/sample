const SchoolAccountList = ({ users }) => {
    return (
        <table className="w-full mb-8 text-gray-700 border-collapse">
            <thead>
                <tr className="bg-gray-200 text-left">
                    <th className="p-3">教室コード</th>
                    <th className="p-3">教室名</th>
                    <th className="p-3">メール</th>
                </tr>
            </thead>
            <tbody>
                {users.map(school => (
                    <tr key={school.id} className="border-b hover:bg-blue-50">
                        <td className="p-3 font-mono text-blue-600">{school.code}</td>
                        <td className="p-3">{school.name}</td>
                        <td className="p-3 text-sm text-gray-600">{school.email}</td>
                    </tr>
                ))}
                {users.length === 0 && (
                    <tr>
                        <td colSpan={3} className="p-3 text-center text-gray-400 italic">
                            教室が登録されていません。
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );
};

export default SchoolAccountList;
