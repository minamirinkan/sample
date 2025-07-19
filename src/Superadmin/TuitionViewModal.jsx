import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const grades = ['小学生', '中1／中2', '中3', '高1／高2', '高3／既卒'];

const TuitionViewModal = ({ initialLocationName }) => {
  const [tuitionDataW, setTuitionDataW] = useState([]);
  const [tuitionDataA, setTuitionDataA] = useState([]);
  const [expenses, setExpenses] = useState({});
  const [testPrices, setTestPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!initialLocationName) return;

    const fetchData = async () => {
      try {
        const ref = doc(db, 'tuitionSettings', initialLocationName);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          alert(`"${initialLocationName}" のデータが見つかりません`);
          return;
        }

        const data = snap.data();
        setTuitionDataW(data.tuitionDataW || []);
        setTuitionDataA(data.tuitionDataA || []);
        setExpenses(data.expenses || {});
        setTestPrices(data.testPreparationData || []);
      } catch (error) {
        console.error('データ取得失敗:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [initialLocationName]);

  if (loading) return <p className="text-center">読み込み中...</p>;

  const renderTable = (title, tuitionData) => (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <table className="table-auto border-collapse border border-gray-300 w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">回数＼学年</th>
            {grades.map((grade, idx) => (
              <th key={idx} className="border px-2 py-1">{grade}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tuitionData.map((row, rowIdx) => (
            <tr key={rowIdx}>
              <td className="border px-2 py-1">{row.scheduleLabel}</td>
              {grades.map((grade, colIdx) => (
                <td key={colIdx} className="border px-2 py-1 text-center">
                  <input
                    type="text"
                    value={row[grade] || ''}
                    disabled
                    className="bg-gray-100 text-center w-full"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">登録済み授業料（{initialLocationName}）</h1>

      {renderTable('マンツーマンW（ダブル）', tuitionDataW)}
      {renderTable('マンツーマンA（エース）', tuitionDataA)}

      <div>
        <h2 className="text-xl font-bold mb-2">諸費用</h2>
        <ul className="space-y-1">
          <li>① 入会金: {expenses.admissionFee || '-'} 円</li>
          <li>② 教材費: {expenses.materialFee || '-'} 円</li>
          <li>③ 塾内テスト代:
            <ul className="ml-4">
              <li>小学生: {expenses.testFee?.elementary || '-'} 円</li>
              <li>中学生: {expenses.testFee?.middle || '-'} 円</li>
            </ul>
          </li>
          <li>④ 教室維持費: {expenses.maintenanceFee || '-'} 円</li>
        </ul>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-2">テスト対策演習</h2>
        <ul className="list-disc list-inside">
          <li>1セット: {testPrices[0] || '-'} 円</li>
          <li>2セット: {testPrices[1] || '-'} 円</li>
        </ul>
      </div>
    </div>
  );
};

export default TuitionViewModal;
