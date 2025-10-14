
import { FiFilePlus } from "react-icons/fi";

type Props = {
    studentId: string;
};

const EnrollmentPage: React.FC<Props> = ({ studentId }) => {

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold flex justify-between items-center">
                在籍情報
                <button
                    className="inline-flex items-center gap-1.5 bg-orange-400 text-white text-sm px-3 py-1.5 rounded hover:bg-orange-600 active:scale-95 transition-all shadow-sm"
                    onClick={() => {
                        console.log('在籍情報の登録クリック');
                    }}
                >
                    <FiFilePlus className="w-4 h-4" />
                    在籍情報の登録
                </button>
            </h2>
            <table className="w-full table-auto border">
                <thead>
                    <tr className="bg-blue-50">
                        <th className="border p-2">異動年月</th>
                        <th className="border p-2">在籍区分</th>
                        <th className="border p-2">備考</th>
                        <th className="border p-2">操作</th>
                    </tr>
                </thead>
            </table>
        </div>
    );
};

export default EnrollmentPage;