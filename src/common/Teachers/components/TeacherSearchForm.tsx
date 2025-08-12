import { useState, FC, FormEvent } from 'react';

// Propsの型を定義します
interface TeacherSearchFormProps {
    onSearch: (input: string) => void;
}

const TeacherSearchForm: FC<TeacherSearchFormProps> = ({ onSearch }) => {
    const [input, setInput] = useState('');

    // イベントオブジェクト 'e' に型を付与します
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSearch(input);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
            <div className="box-header with-border">
                <h3 className="box-title">検索条件の設定</h3>
            </div>

            {/* 検索条件例 */}
            <div className="flex space-x-4 items-center">
                <label className="font-semibold">在籍形態:</label>
                <label><input type="checkbox" defaultChecked /> 在籍中</label>
                <label><input type="checkbox" defaultChecked /> 退職</label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                    <label className="block font-semibold mb-1">講師コード / 名前</label>
                    <input
                        type="text"
                        placeholder="コード or 名前"
                        className="w-full border rounded px-3 py-2"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                </div>
            </div>

            <div>
                <button type="submit" className="btn btn-primary">検索</button>
            </div>
        </form>
    );
};

export default TeacherSearchForm;
