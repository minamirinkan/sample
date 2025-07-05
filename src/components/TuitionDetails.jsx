import React, { useState } from 'react';
import { updateTuitionSettings } from '../utils/firebase/updateTuitionSettings';

const grades = ['小学生', '中1／中2', '中3', '高1／高2', '高3／既卒'];

const TuitionDetails = ({ data, onBack }) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(data ? structuredClone(data) : {});
  const [isSaving, setIsSaving] = useState(false);

  if (!data) return <p className="text-red-500">データが読み込まれていません。</p>;

  const handleChange = (type, rowIdx, grade, value) => {
    const newData = { ...formData };
    newData[type][rowIdx][grade] = value;
    setFormData(newData);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const { id, ...updatePayload } = formData;
      await updateTuitionSettings(data.id, updatePayload);
      alert('保存しました！');
      setEditMode(false);
    } catch (err) {
      console.error('保存エラー', err);
      alert('保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDateTime = (dateObj) => {
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const hh = String(dateObj.getHours()).padStart(2, '0');
    const min = String(dateObj.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  };

  const extractRow = (row) =>
    typeof row.scheduleLabel === 'object' ? row.scheduleLabel : row;

  const renderTable = (label, type) => (
    <section>
      <h2 className="text-xl font-bold mb-2">{label}</h2>
      <table className="table-auto border border-collapse border-gray-400">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">回数＼学年</th>
            {grades.map((grade) => (
              <th key={grade} className="border px-2 py-1">{grade}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {formData[type].map((row, rowIdx) => {
            console.log('🚨 row', row);
            const rowData = extractRow(row);
            return (
              <tr key={rowIdx}>
                <td className="border px-2 py-1 font-semibold bg-gray-50">
                  {rowData.scheduleLabel}
                </td>
                {grades.map((grade) => (
                  <td key={grade} className="border px-2 py-1 text-center">
                    {editMode ? (
                      <input
                        type="number"
                        value={rowData[grade] || ''}
                        onChange={(e) =>
                          handleChange(type, rowIdx, grade, e.target.value)
                        }
                        className="w-[80px] text-center border appearance-none 
                          [&::-webkit-outer-spin-button]:appearance-none 
                          [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    ) : (
                      rowData[grade] ? `${rowData[grade]} 円` : '—'
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold underline">料金詳細：{formData.registrationLocation}</h1>

      <div className="flex items-center gap-4">
        <button onClick={onBack} className="text-blue-600 underline">
          ← 戻る
        </button>
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="bg-yellow-500 text-white px-4 py-1 rounded hover:bg-yellow-600"
          >
            編集
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
          >
            {isSaving ? '保存中...' : '保存'}
          </button>
        )}
      </div>

      {renderTable('Wコース（ダブル）', 'tuitionDataW')}
      {renderTable('Aコース（エース）', 'tuitionDataA')}

      {/* ▼ テスト対策演習 */}
      <section>
        <h2 className="text-xl font-bold mb-2">テスト対策演習</h2>
        <ul className="list-disc pl-6">
          {[0, 1].map((i) => (
            <li key={i}>
              {i + 1}セット：
              {editMode ? (
                <input
                  type="number"
                  value={formData.testPreparationData?.[i] || ''}
                  onChange={(e) => {
                    const newArr = [...formData.testPreparationData];
                    newArr[i] = e.target.value;
                    setFormData({ ...formData, testPreparationData: newArr });
                  }}
                  className="w-[100px] text-center border appearance-none 
                    [&::-webkit-outer-spin-button]:appearance-none 
                    [&::-webkit-inner-spin-button]:appearance-none"
                />
              ) : (
                `${formData.testPreparationData?.[i] || '—'} 円`
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* ▼ 諸費用 */}
      <section>
        <h2 className="text-xl font-bold mb-2">諸費用</h2>
        <ul className="list-disc pl-6 space-y-1">
          {[
            { label: '入会金', key: 'admissionFee' },
            { label: '教材費', key: 'materialFee' },
            { label: '教室維持費', key: 'maintenanceFee' },
          ].map(({ label, key }) => (
            <li key={key}>
              {label}：
              {editMode ? (
                <input
                  type="number"
                  value={formData.tuitionFees[key] || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tuitionFees: {
                        ...formData.tuitionFees,
                        [key]: e.target.value,
                      },
                    })
                  }
                  className="w-[100px] text-center border appearance-none 
                    [&::-webkit-outer-spin-button]:appearance-none 
                    [&::-webkit-inner-spin-button]:appearance-none"
                />
              ) : (
                `${formData.tuitionFees[key] || '—'} 円`
              )}
            </li>
          ))}
          <li>
            塾内テスト代：
            <ul className="pl-4">
              {['elementary', 'middle'].map((g) => (
                <li key={g}>
                  {g === 'elementary' ? '小学生' : '中学生'}：
                  {editMode ? (
                    <input
                      type="number"
                      value={formData.tuitionFees.testFee?.[g] || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tuitionFees: {
                            ...formData.tuitionFees,
                            testFee: {
                              ...formData.tuitionFees.testFee,
                              [g]: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-[100px] text-center border appearance-none 
                        [&::-webkit-outer-spin-button]:appearance-none 
                        [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  ) : (
                    `${formData.tuitionFees.testFee?.[g] || '—'} 円`
                  )}
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </section>

      
    </div>
  );
};

export default TuitionDetails;
