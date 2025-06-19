// src/utils/dateUtils.js

export const getWeekdayIndex = (selectedDate) => {
  return selectedDate.type === 'weekday'
    ? ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'].indexOf(selectedDate.weekday)
    : new Date(getDateKey(selectedDate)).getDay();
};

export const getDateKey = (selectedDate) => {
  return `${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}-${String(selectedDate.date).padStart(2, '0')}`;
};

export const formatDateDisplay = (selectedDate) => {
  if (selectedDate.type === 'date') {
    return `${selectedDate.year}年${selectedDate.month}月${selectedDate.date}日`;
  }
  if (selectedDate.year && selectedDate.month) {
    return `${selectedDate.year}年${selectedDate.month}月 ${selectedDate.weekday}`;
  }
  return selectedDate.weekday;
};

export const getYearMonthKey = (selectedDate) => {
  const today = new Date();
  const year = selectedDate.year || today.getFullYear();
  const month = selectedDate.month || (today.getMonth() + 1);
  return `${year}-${String(month).padStart(2, '0')}`;
};

export const getPreviousYearMonth = (ymKey) => {
  const [y, m] = ymKey.split('-').map(Number);
  if (y <= 2000 && m <= 1) return null;
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

/**
 * 過去6ヶ月から未来5ヶ月の年月文字列配列を返す
 * 例: ['2024-12', ..., '2025-06']
 */
export const getYearMonthRange = () => {
  const months = [];
  const today = new Date();
  const startMonth = new Date(today.getFullYear(), today.getMonth() - 6, 1);
  for (let i = 0; i < 12; i++) {
    const d = new Date(startMonth.getFullYear(), startMonth.getMonth() + i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return months;
};

/**
 * 日付文字列 'yyyy-MM-dd' から曜日番号(0=日,1=月,...6=土)を取得
 */
export const getDayOfWeekFromDateStr = (dateStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day); // 0-indexed month
  return date.getDay(); // 0 = 日, 1 = 月, ..., 6 = 土
};

