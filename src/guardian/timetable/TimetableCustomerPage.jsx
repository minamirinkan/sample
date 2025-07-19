import { useState } from 'react';
import CustomerCalendar from './/CustomerCalendar';

export default function TimetableCustomerPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const handlePrevMonth = () => {
    const newDate = new Date(year, month - 1);
    setYear(newDate.getFullYear());
    setMonth(newDate.getMonth());
  };

  const handleNextMonth = () => {
    const newDate = new Date(year, month + 1);
    setYear(newDate.getFullYear());
    setMonth(newDate.getMonth());
  };

  const handleDateClick = (date) => {
    console.log('クリックした日付:', date);
    // ここで選択日に基づいて時間割を取得など後で追加
  };

  return (
    <div className="p-6">
      <CustomerCalendar
        year={year}
        month={month}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onDateClick={handleDateClick}
      />

    </div>
  );
}
