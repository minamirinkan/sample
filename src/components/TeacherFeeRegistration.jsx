import React, { useState } from 'react';

const categories = ['小学生', '中学生', '高校生'];
const types = ['1対1', '1対2', '1対6まで'];

const TeacherFeeRegistration = () => {
  const [fees, setFees] = useState(
    categories.map(() => types.map(() => ''))
  );

  const handleChange = (rowIdx, colIdx, value) => {
    const newFees = [...fees];
    newFees[rowIdx][colIdx] = value;
    setFees(newFees);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('講師料金データ:', fees);
    alert('講師料金を保存しました（実装例）');
    // TODO: Firestoreなどに保存処理を実装
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4">
      <h2 className="text-2xl font-bold mb-4">講師料金登録フォーム</h2>
      <table className="table-auto border border-collapse border-gray-400">
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
                        onChange={(e) => handleChange(rowIdx, colIdx, e.target.value)}
                        className="border w-[80px] px-1 py-0.5 text-blue-600 text-center appearance-none
                          [&::-webkit-outer-spin-button]:appearance-none 
                          [&::-webkit-inner-spin-button]:appearance-none"
                        required
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

      <div className="mt-4">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          講師料金を保存
        </button>
      </div>
    </form>
  );
};

export default TeacherFeeRegistration;
