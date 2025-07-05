import React, { useState } from 'react';

const grades = ['小学生', '中1／中2', '中3', '高1／高2', '高3／既卒'];

const initialSchedulesW = [
  '週1回（40分）',
  '週1回',
  '週2回',
  '週3回',
  '週4回',
  '週5回',
  '追加1コマ'
];

const initialSchedulesA = [
  '週1回',
  '週2回',
  '週3回',
  '週4回',
  '週5回',
  '追加1コマ'
];

const createInitialData = (rows, cols) => {
  return rows.map(() => new Array(cols.length).fill(''));
};

const TuitionRegistrationForm = () => {
  const [schedulesW, setSchedulesW] = useState(initialSchedulesW);
  const [schedulesA, setSchedulesA] = useState(initialSchedulesA);
  const [addedWeek6, setAddedWeek6] = useState(false);

  const [tuitionDataW, setTuitionDataW] = useState(() =>
    createInitialData(initialSchedulesW, grades)
  );
  const [tuitionDataA, setTuitionDataA] = useState(() =>
    createInitialData(initialSchedulesA, grades)
  );

  const [expenses, setExpenses] = useState({
    admissionFee: '',
    materialFee: '',
    testFee: '',
    maintenanceFee: '',
  });

  const [testPrices, setTestPrices] = useState(['', '']);
  const [registrationLocation, setRegistrationLocation] = useState('');

  const handleChange = (data, setData, rowIdx, colIdx, value) => {
    const updated = [...data];
    updated[rowIdx][colIdx] = value;
    setData(updated);
  };

  const handleExpenseChange = (e) => {
    setExpenses({
      ...expenses,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddWeek6 = () => {
    const insertAt = schedulesW.indexOf('追加1コマ');
    if (!addedWeek6) {
      const newSchedulesW = [...schedulesW];
      newSchedulesW.splice(insertAt, 0, '週6回');
      setSchedulesW(newSchedulesW);

      const newW = [...tuitionDataW];
      newW.splice(insertAt, 0, new Array(grades.length).fill(''));
      setTuitionDataW(newW);

      const insertAtA = schedulesA.indexOf('追加1コマ');
      const newSchedulesA = [...schedulesA];
      newSchedulesA.splice(insertAtA, 0, '週6回');
      setSchedulesA(newSchedulesA);

      const newA = [...tuitionDataA];
      newA.splice(insertAtA, 0, new Array(grades.length).fill(''));
      setTuitionDataA(newA);

      setAddedWeek6(true);
    } else {
      const newSchedulesW = schedulesW.filter(row => row !== '週6回');
      setSchedulesW(newSchedulesW);
      const newW = tuitionDataW.filter((_, idx) => schedulesW[idx] !== '週6回');
      setTuitionDataW(newW);

      const newSchedulesA = schedulesA.filter(row => row !== '週6回');
      setSchedulesA(newSchedulesA);
      const newA = tuitionDataA.filter((_, idx) => schedulesA[idx] !== '週6回');
      setTuitionDataA(newA);

      setAddedWeek6(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('マンツーマンW:', tuitionDataW);
    console.log('マンツーマンA:', tuitionDataA);
    console.log('諸費用:', expenses);
    alert('すべての情報を送信しました（仮）');
  };

  return (
    <form onSubmit={handleSubmit} className="overflow-x-auto space-y-12">
      {/* ▼ Wコース */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">マンツーマンW（ダブル）料金登録</h2>
          <button
            type="button"
            onClick={handleAddWeek6}
            className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 transition"
          >
            {addedWeek6 ? '← 週6回を削除' : '＋ 週6回を追加'}
          </button>
        </div>
        <table className="table-auto border border-collapse border-gray-400">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-2 py-1">回数＼学年</th>
              {grades.map((grade, i) => (
                <th key={i} className="border px-4 py-2">{grade}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {schedulesW.map((schedule, rowIdx) => (
              <tr key={rowIdx}>
                <td className="border px-2 py-1 font-medium bg-gray-100">{schedule}</td>
                {grades.map((_, colIdx) => {
                  const isA40Row = schedule === '週1回（40分）';
                  const isElementary = colIdx === 0;
                  return (
                    <td key={colIdx} className="border px-2 py-1 text-center">
                      {isA40Row && !isElementary ? (
                        <span className="text-gray-400">—</span>
                      ) : (
                        <div className="flex items-center justify-center">
                          <input
                            type="number"
                            className="border w-[80px] px-1 py-0.5 text-blue-600 text-center appearance-none 
                            [&::-webkit-outer-spin-button]:appearance-none 
                            [&::-webkit-inner-spin-button]:appearance-none"
                            value={tuitionDataW[rowIdx][colIdx]}
                            onChange={(e) =>
                              handleChange(tuitionDataW, setTuitionDataW, rowIdx, colIdx, e.target.value)
                            }
                            required
                          />
                          <span className="ml-1 text-sm">円</span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ▼ Aコース */}
      <div>
        <h2 className="text-2xl font-bold mb-4">マンツーマンA（エース）料金登録</h2>
        <table className="table-auto border border-collapse border-gray-400">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-2 py-1">回数＼学年</th>
              {grades.map((grade, i) => (
                <th key={i} className="border px-4 py-2">{grade}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {schedulesA.map((schedule, rowIdx) => (
              <tr key={rowIdx}>
                <td className="border px-2 py-1 font-medium bg-gray-100">{schedule}</td>
                {grades.map((_, colIdx) => (
                  <td key={colIdx} className="border px-2 py-1 text-center">
                    <div className="flex items-center justify-center">
                      <input
                        type="number"
                        className="border w-[80px] px-1 py-0.5 text-blue-600 text-center appearance-none 
                        [&::-webkit-outer-spin-button]:appearance-none 
                        [&::-webkit-inner-spin-button]:appearance-none"
                        value={tuitionDataA[rowIdx][colIdx]}
                        onChange={(e) =>
                          handleChange(tuitionDataA, setTuitionDataA, rowIdx, colIdx, e.target.value)
                        }
                        required
                      />
                      <span className="ml-1 text-sm">円</span>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ▼ テスト対策演習 */}
      <div>
        <h2 className="text-2xl font-bold mb-4">テスト対策演習・理社個別クラス（中1〜中3）</h2>
        <table className="table-auto border border-collapse border-gray-400">
          <thead className="bg-gray-200">
            <tr>
              <th className="border px-4 py-2">セット</th>
              <th className="border px-4 py-2">金額</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2].map((setNum) => (
              <tr key={setNum}>
                <td className="border px-4 py-2 text-center">{setNum}セット</td>
                <td className="border px-4 py-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="number"
                      className="border w-24 px-1 py-0.5 text-blue-600 text-center appearance-none 
                        [&::-webkit-outer-spin-button]:appearance-none 
                        [&::-webkit-inner-spin-button]:appearance-none"
                      value={testPrices[setNum - 1]}
                      onChange={(e) => {
                        const updated = [...testPrices];
                        updated[setNum - 1] = e.target.value;
                        setTestPrices(updated);
                      }}
                    />
                    <span className="text-sm">円</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ▼ 諸費用 */}
      <div>
        <h2 className="text-2xl font-bold mb-4">諸費用 登録フォーム</h2>
        <table className="table-auto border border-collapse border-gray-400 w-full">
          <tbody>
            {[
              { label: '① 入会金', name: 'admissionFee' },
              { label: '② 教材費', name: 'materialFee' },
              { label: '③ 塾内テスト代', name: 'testFee' },
              { label: '④ 教室維持費', name: 'maintenanceFee' }
            ].map((item, i) => (
              <tr key={i}>
                <td className="border px-3 py-2 w-1/4 font-semibold">{item.label}</td>
                <td className="border px-2 py-1">
                  <div className="flex items-center">
                    <input
                      type="number"
                      name={item.name}
                      value={expenses[item.name]}
                      onChange={handleExpenseChange}
                      className="border w-[100px] px-1 py-0.5 text-blue-600 text-center appearance-none 
                        [&::-webkit-outer-spin-button]:appearance-none 
                        [&::-webkit-inner-spin-button]:appearance-none"
                      required
                    />
                    <span className="ml-1 text-sm">円</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ▼ 登録地入力欄 */}
      <div className="mb-6">
        <label htmlFor="registrationLocation" className="block text-lg font-bold mb-2">
          登録地
        </label>
        <input
          type="text"
          id="registrationLocation"
          name="registrationLocation"
          value={registrationLocation}
          onChange={(e) => setRegistrationLocation(e.target.value)}
          className="border border-gray-400 px-2 py-1 w-64 text-blue-600"
          placeholder="例：渋谷校"
          required
        />
      </div>

      {/* ▼ 一括登録ボタン */}
      <div className="mt-6">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          すべてまとめて登録
        </button>
      </div>
    </form>
  );
};

export default TuitionRegistrationForm;
