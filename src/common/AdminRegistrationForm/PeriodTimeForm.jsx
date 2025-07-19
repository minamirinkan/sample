import React, { useState } from 'react';
import { doc, setDoc,getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import ExistingPeriodTimeList from './ExistingPeriodTimeList';

const periods = ['1限', '2限', '3限', '4限', '5限', '6限', '7限', '8限'];

const PeriodTimeForm = ({ onRegistered }) => {
    const [times80, setTimes80] = useState(Array(8).fill(''));
    const [times70, setTimes70] = useState(Array(8).fill(''));
    const [location, setLocation] = useState('');

    const handleChange = (index, value, type) => {
        const newTimes = [...(type === '80' ? times80 : times70)];
        newTimes[index] = value;
        type === '80' ? setTimes80(newTimes) : setTimes70(newTimes);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!location.trim()) {
            alert('登録地を入力してください');
            return;
        }

        const data = {
            '80minutes': periods.map((label, idx) => ({ label, time: times80[idx] || '' })),
            '70minutes': periods.map((label, idx) => ({ label, time: times70[idx] || '' })),
        };

        try {
            await setDoc(doc(db, 'PeriodTimes', location), data);
            alert('授業時限を保存しました');
            onRegistered?.(location); // モーダル側で閉じるなどの処理に使える
        } catch (error) {
            console.error('保存エラー:', error);
            alert('保存に失敗しました');
        }
    };

    const renderTable = (title, times, type) => (
        <div className="mb-6">
            <h3 className="text-lg font-bold mb-2">{title}</h3>
            <table className="w-full border border-collapse border-gray-400">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border px-4 py-2">時限</th>
                        <th className="border px-4 py-2">時間</th>
                    </tr>
                </thead>
                <tbody>
                    {periods.map((label, idx) => (
                        <tr key={idx}>
                            <td className="border px-4 py-2 bg-gray-50 font-semibold">{label}</td>
                            <td className="border px-4 py-2">
                                <input
                                    type="text"
                                    value={times[idx]}
                                    onChange={(e) => handleChange(idx, e.target.value, type)}
                                    placeholder="例: 10:00～11:20"
                                    className="w-full border px-2 py-1"
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
            <ExistingPeriodTimeList
                onLocationClick={async (locationName) => {
                    try {
                        const docRef = doc(db, 'PeriodTimes', locationName);
                        const docSnap = await getDoc(docRef);

                        if (docSnap.exists()) {
                            const data = docSnap.data();

                            // データの復元
                            const times80Data = data['80minutes']?.map((item) => item.time || '') || Array(8).fill('');
                            const times70Data = data['70minutes']?.map((item) => item.time || '') || Array(8).fill('');

                            
                            setTimes80(times80Data);
                            setTimes70(times70Data);
                        } else {
                            alert(`"${locationName}" に該当する時限データが見つかりませんでした`);
                        }
                    } catch (error) {
                        console.error('❌ 時限データ取得エラー:', error);
                        alert('データの取得に失敗しました');
                    }
                }}
            />

            <h2 className="text-2xl font-bold mb-4">授業時限 登録フォーム</h2>

            <div>
                <label className="block mb-1 font-medium">登録地</label>
                <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="例：渋谷"
                    className="w-full border px-3 py-2"
                />
            </div>

            {renderTable('■ 80分バージョン', times80, '80')}
            {renderTable('■ 70分バージョン', times70, '70')}

            <div className="text-center">
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                    保存
                </button>
            </div>
        </form>
    );
};

export default PeriodTimeForm;
