// src/utils/dateUtils.js
export const getWeekdayIndex = (selectedDate) => {
  return selectedDate.type === 'weekday'
    ? ['日曜日','月曜日','火曜日','水曜日','木曜日','金曜日','土曜日'].indexOf(selectedDate.weekday)
    : new Date(getDateKey(selectedDate)).getDay();
};

export const getDateKey = (selectedDate) => {
  return `${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}-${String(selectedDate.date).padStart(2, '0')}`;
};

export const formatDateDisplay = (selectedDate) => {
  return selectedDate.type === 'date'
    ? `${selectedDate.year}年${selectedDate.month}月${selectedDate.date}日`
    : selectedDate.weekday;
};
