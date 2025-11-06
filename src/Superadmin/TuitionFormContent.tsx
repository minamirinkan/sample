import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import TuitionForm from './TuitionForm';
import MaintenanceForm from './MaintenanceForm';
import TestForm from './TestForm';
import MaterialForm from './MaterialForm';
import MaterialOnceForm from './MaterialOnceForm';
import DiscountForm from './DiscountForm';
import PenaltyForm from './PenaltyForm';
import ClassroomSelector from './ClassroomSelector';
import AdmissionForm from './AdmissionForm';
import { useAuth } from '../contexts/AuthContext';
import { saveTaxRate } from './saveTaxRate';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import SpringForm from './SpringForm';
import SummerForm from './SummerForm';
import WinterForm from './WinterForm';

const TAB_MAP: Record<string, string> = {
  通常授業料: 'tuition',
  春季講習: 'spring',
  夏季講習: 'summer',
  冬季講習: 'winter',
  維持費: 'maintenance',
  入会金: 'admission',
  テスト: 'test',
  教材: 'material',
  '教材(都度)': 'material_once',
  割引: 'discount',
  違約金: 'penalty',
};

const TuitionFormContent: React.FC = () => {
  const { section } = useParams<{ section: string }>();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [registrationLocation, setRegistrationLocation] = useState('');
  const [taxRate, setTaxRate] = useState<number | ''>('');
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth(); // 🔹 uidを取得
  const yyyyMM = `${year}${String(month).padStart(2, '0')}`;

  const years = Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - 3 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  useEffect(() => {
    const fetchTaxRate = async () => {
      const ref = doc(db, "Tax", "current");
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setTaxRate(data.taxRate ?? '');
      }
    };

    fetchTaxRate();
  }, []);

  // 🔹 消費税登録処理
  const handleSaveTax = async () => {
    if (taxRate === '') {
      alert('消費税率を入力してください。');
      return;
    }

    setIsSaving(true);
    try {
      const userId = user?.uid ?? "unknown"; // useAuth()などから取得できる想定
      await saveTaxRate(Number(taxRate), userId);
      alert('消費税を登録しました。');
    } catch (error) {
      console.error('Error saving tax:', error);
      alert('保存に失敗しました。');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">料金登録フォーム</h1>

        {/* === 上部設定バー === */}
        <div className="flex items-end gap-6 flex-wrap">
          {/* 年・月セレクト */}
          <div className="flex gap-2">
            <select
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              className="border rounded px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}年</option>
              ))}
            </select>
            <select
              value={month}
              onChange={e => setMonth(Number(e.target.value))}
              className="border rounded px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {months.map(m => (
                <option key={m} value={m}>{m}月</option>
              ))}
            </select>
          </div>

          {/* 登録地 */}
          <div className="flex items-center gap-1">
            <label className="font-semibold">登録地</label>
            <input
              type="text"
              value={registrationLocation}
              onChange={e => setRegistrationLocation(e.target.value)}
              placeholder="例：東京校"
              className="border rounded px-2 py-1 w-36 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* 💰 消費税登録（右寄せ） */}
          <div className="flex items-center gap-2 ml-auto">
            <label className="font-semibold">消費税</label>
            <div className="flex items-center border rounded px-2 py-1 bg-white">
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-16 text-right focus:outline-none"
                min="0"
                max="20"
              />
              <span className="ml-1 text-gray-700">%</span>
            </div>
            <button
              onClick={handleSaveTax}
              className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 transition"
            >
              登録
            </button>
          </div>
        </div>

        <ClassroomSelector
          yyyyMM={yyyyMM}
          onSelect={(loc) => setRegistrationLocation(loc)}
        />
      </div>

      {/* === タブナビゲーション === */}
      <div className="overflow-x-auto">
        <div className="flex gap-3 border-b border-gray-300 mb-6 bg-gray-50 rounded-t min-w-max px-2">
          {Object.entries(TAB_MAP).map(([label, key]) => (
            <Link
              key={key}
              to={`/superadmin/tuitions/${key}`}
              className={`whitespace-nowrap px-5 py-2 text-sm font-semibold border-t-[2px] transition-all duration-200
          ${section === key
                  ? 'border-blue-600 text-blue-700 bg-white'
                  : 'border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-400'}
        `}
              aria-selected={section === key}
              role="tab"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* === タブごとのフォーム === */}
      <div>
        {section === 'tuition' && <TuitionForm yyyyMM={yyyyMM} registrationLocation={registrationLocation} />}
        {section === 'spring' && <SpringForm seasonCode="SP" yyyyMM={yyyyMM} registrationLocation={registrationLocation} />}
        {section === 'summer' && <SummerForm seasonCode="SU" yyyyMM={yyyyMM} registrationLocation={registrationLocation} />}
        {section === 'winter' && <WinterForm seasonCode="WI" yyyyMM={yyyyMM} registrationLocation={registrationLocation} />}
        {section === 'maintenance' && <MaintenanceForm yyyyMM={yyyyMM} registrationLocation={registrationLocation} />}
        {section === 'admission' && <AdmissionForm yyyyMM={yyyyMM} registrationLocation={registrationLocation} />}
        {section === 'test' && <TestForm yyyyMM={yyyyMM} registrationLocation={registrationLocation} />}
        {section === 'material' && <MaterialForm yyyyMM={yyyyMM} registrationLocation={registrationLocation} />}
        {section === 'material_once' && <MaterialOnceForm yyyyMM={yyyyMM} registrationLocation={registrationLocation} />}
        {section === 'discount' && <DiscountForm yyyyMM={yyyyMM} registrationLocation={registrationLocation} />}
        {section === 'penalty' && <PenaltyForm yyyyMM={yyyyMM} registrationLocation={registrationLocation} />}
      </div>
    </div>
  );
};

export default TuitionFormContent;
