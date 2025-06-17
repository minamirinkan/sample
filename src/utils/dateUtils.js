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
  // 年月があれば「2025年7月 水曜日」
  if (selectedDate.year && selectedDate.month) {
    return `${selectedDate.year}年${selectedDate.month}月 ${selectedDate.weekday}`;
  }
  return selectedDate.weekday;
};


/**
 * "yyyy-MM" を生成
 */
export const getYearMonthKey = (selectedDate) => {
  const today = new Date();
  const year = selectedDate.year || today.getFullYear();
  const month = selectedDate.month || (today.getMonth() + 1);
  return `${year}-${String(month).padStart(2, '0')}`;
};

/**
 * 前月の "yyyy-MM" を生成
 */
export const getPreviousYearMonth = (ymKey) => {
  const [y, m] = ymKey.split('-').map(Number);
  if (y <= 2000 && m <= 1) return null;
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};
