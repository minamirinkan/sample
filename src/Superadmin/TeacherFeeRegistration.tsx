import React, { useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { saveTeacherFees } from './saveTeacherFees';
import ExistingTeacherFeeLocationsList from './ExistingTeacherFeeLocationsList';

type TeacherFeeRegistrationProps = {
  onRegistered?: (location: string) => void;
};

const TeacherFeeRegistration: React.FC<TeacherFeeRegistrationProps> = ({ onRegistered }) => {
  const categories = ['小学生', '中学生', '高校生'];
  const types = ['1対1', '1対2', '1対6まで'];
  const initialMatrix = () => categories.map(() => types.map(() => ''));
  const [fees80, setFees80] = useState<string[][]>(initialMatrix());
  const [fees70, setFees70] = useState<string[][]>(initialMatrix());
  const [registrationLocation, setRegistrationLocation] = useState('');
  const [fees40, setFees40] = useState<string[][]>([types.map(() => '')]);
  const [workFees, setWorkFees] = useState<{ admin: string; training?: string; other?: string }>({
    admin: '',
  });

  const handleChange = (rowIdx: number, colIdx: number, value: string, duration: '80' | '70' | '40') => {
    if (duration === '80') {
      const newFees = [...fees80];
      newFees[rowIdx][colIdx] = value;
      setFees80(newFees);
    } else if (duration === '70') {
      const newFees = [...fees70];
      newFees[rowIdx][colIdx] = value;
      setFees70(newFees);
    } else if (duration === '40') {
      const newFees = [...fees40];
      newFees[rowIdx][colIdx] = value;
      setFees40(newFees);
    }
  };

  const handleWorkFeeChange = (field: string, value: string) => {
    setWorkFees((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!registrationLocation.trim()) {
      alert('登録地を入力してください');
      return;
    }

    const convertMatrixToObjectArray = (matrix: string[][]) => {
      return matrix.map((row) => {
        const obj: Record<string, string> = {};
        types.forEach((type, idx) => {
          obj[type] = row[idx] || '';
        });
        return obj;
      });
    };

    const payload = {
      registrationLocation,
      '80minutes': convertMatrixToObjectArray(fees80),
      '70minutes': convertMatrixToObjectArray(fees70),
      '40minutes': convertMatrixToObjectArray(fees40),
      workFees,
    };

    try {
      await saveTeacherFees(registrationLocation, payload);
      alert('講師料金と作業給を保存しました');
      if (onRegistered) {
        onRegistered(registrationLocation);
      }
    } catch (error) {
      console.error('保存エラー:', error);
      alert('保存に失敗しました');
    }
  };

  // renderTable / renderTable40 は型をそのまま流用
  const renderTable = (title: string, fees: string[][], duration: '80' | '70') => (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <table className="table-auto border border-collapse border-gray-400 w-full">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">対象</th>
            {types.map((type, idx) => (
              <th key={idx} className="border px-4 py-2">{type}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.map((category, rowIdx) => (
            <tr key={rowIdx}>
              <td className="border px-4 py-2 bg-gray-100 font-semibold">{category}</td>
              {types.map((_, colIdx) => (
                <td key={colIdx} className="border px-2 py-1 text-center">
                  {colIdx === 2 && rowIdx !== 1 ? (
                    <span className="text-gray-400">—</span>
                  ) : (
                    <div className="flex items-center justify-center">
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={fees[rowIdx][colIdx]}
                        onChange={(e) => handleChange(rowIdx, colIdx, e.target.value, duration)}
                        onWheel={(e) => e.currentTarget.blur()}
                        className="border w-[80px] px-1 py-0.5 text-blue-600 text-center appearance-none
                          [&::-webkit-outer-spin-button]:appearance-none 
                          [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="ml-1 text-sm">円</span>
                    </div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderTable40 = () => (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-2">■ 40分コース</h3>
      <table className="table-auto border border-collapse border-gray-400 w-full">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">対象</th>
            {types.map((type, idx) => (
              <th key={idx} className="border px-4 py-2">{type}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border px-4 py-2 bg-gray-100 font-semibold">小学生</td>
            {types.map((_, colIdx) => (
              <td key={colIdx} className="border px-2 py-1 text-center">
                {colIdx === 2 ? (
                  <span className="text-gray-400">—</span>
                ) : (
                  <div className="flex items-center justify-center">
                    <input
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={fees40[0][colIdx]}
                      onChange={(e) => handleChange(0, colIdx, e.target.value, '40')}
                      onWheel={(e) => e.currentTarget.blur()}
                      className="border w-[80px] px-1 py-0.5 text-blue-600 text-center appearance-none
                        [&::-webkit-outer-spin-button]:appearance-none 
                        [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="ml-1 text-sm">円</span>
                  </div>
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4">
      <ExistingTeacherFeeLocationsList
        onLocationClick={async (locationName: string) => {
          try {
            const docRef = doc(db, 'TeacherFees', locationName);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
              const data = docSnap.data() as any;
              const parseObjectArrayToMatrix = (objArray: any[]) =>
                objArray.map((obj) => types.map((type) => obj[type] || ''));

              setFees80(parseObjectArrayToMatrix(data['80minutes'] || []));
              setFees70(parseObjectArrayToMatrix(data['70minutes'] || []));
              setFees40(parseObjectArrayToMatrix(data['40minutes'] || []));
              setWorkFees({
                admin: data.workFees?.admin || '',
                training: data.workFees?.training || '',
                other: data.workFees?.other || '',
              });
            } else {
              alert(`"${locationName}" に該当するデータが見つかりませんでした`);
            }
          } catch (error) {
            console.error('教師給与データの取得に失敗:', error);
          }
        }}
      />

      <h2 className="text-2xl font-bold mb-4">講師料金登録フォーム</h2>

      <div>
        <label className="block mb-1 text-sm font-medium">登録地</label>
        <input
          type="text"
          placeholder="例：渋谷校"
          value={registrationLocation}
          onChange={(e) => setRegistrationLocation(e.target.value)}
          className="border px-2 py-1 w-full"
        />
      </div>

      {renderTable('■ 80分コース', fees80, '80')}
      {renderTable('■ 70分コース', fees70, '70')}
      {renderTable40()}

      <div className="border-t pt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium">事務作業給</label>
            <div className="flex items-center">
              <input
                type="number"
                value={workFees.admin}
                onChange={(e) => handleWorkFeeChange('admin', e.target.value)}
                onWheel={(e) => e.currentTarget.blur()}
                className="border px-2 py-1 w-[100px] text-center appearance-none
                    [&::-webkit-inner-spin-button]:appearance-none 
                    [&::-webkit-outer-spin-button]:appearance-none"
              />
              <span className="ml-1 text-sm">円</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          全て保存
        </button>
      </div>
    </form>
  );
};

export default TeacherFeeRegistration;
