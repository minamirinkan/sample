import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import TuitionForm from './TuitionForm';
import MaintenanceForm from './MaintenanceForm';
import TestForm from './TestForm';
import MaterialForm from './MaterialForm';
import MaterialOnceForm from './MaterialOnceForm';
import DiscountForm from './DiscountForm';
import PenaltyForm from './PenaltyForm';

const TAB_MAP: Record<string, string> = {
  通常授業料: 'tuition',
  維持費: 'maintenance',
  テスト: 'test',
  教材: 'material',
  '教材(都度)': 'material_once',
  割引: 'discount',
  違約金: 'penalty',
};

const TuitionFormContent: React.FC = () => {
  const { section } = useParams<{ section: string }>(); // URL から現在タブを取得
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [registrationLocation, setRegistrationLocation] = useState('');
  const yyyyMM = `${year}${String(month).padStart(2, '0')}`;

  const years = Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - 3 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">料金登録フォーム</h1>

        <div className="flex items-end gap-6">
          {/* 年・月セレクト */}
          <div className="flex gap-2">
            <select
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              className="border rounded px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {years.map(y => <option key={y} value={y}>{y}年</option>)}
            </select>
            <select
              value={month}
              onChange={e => setMonth(Number(e.target.value))}
              className="border rounded px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {months.map(m => <option key={m} value={m}>{m}月</option>)}
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
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="flex gap-3 border-b border-gray-300 mb-6 bg-gray-50 rounded-t">
        {Object.entries(TAB_MAP).map(([label, key]) => (
          <Link
            key={key}
            to={`/superadmin/tuitions/${key}`}
            className={`px-5 py-2 text-sm font-semibold border-t-[2px] transition-all duration-200
              ${section === key ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-400'}
            `}
            aria-selected={section === key}
            role="tab"
          >
            {label}
          </Link>
        ))}
      </div>

      {/* タブごとにフォームを表示 */}
      <div>
        {section === 'tuition' && <TuitionForm yyyyMM={yyyyMM} registrationLocation={registrationLocation} />}
        {section === 'maintenance' && <MaintenanceForm yyyyMM={yyyyMM} registrationLocation={registrationLocation} />}
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
