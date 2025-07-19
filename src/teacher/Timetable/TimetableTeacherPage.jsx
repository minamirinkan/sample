import { useState } from 'react';
import TeacherCalendar from './components/TeacherCalendar';

export default function TimetableTeacherPage() {
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
  };

  return (
    <div className="p-6">
      <TeacherCalendar
        year={year}
        month={month}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onDateClick={handleDateClick}
      />
    </div>
  );
}
