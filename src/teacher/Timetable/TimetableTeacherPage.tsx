import TeacherCalendar from "./components/TeacherCalendar";

export default function TimetableTeacherPage() {
  // ★修正点1: TeacherCalendarが内部で日付を管理するため、このコンポーネントでの状態管理は不要になる
  // const today = new Date();
  // const [year, setYear] = useState(today.getFullYear());
  // const [month, setMonth] = useState(today.getMonth());

  // const handlePrevMonth = () => { ... };
  // const handleNextMonth = () => { ... };
  // const handleDateClick = (date: Date) => { ... };

  return (
    <div className="p-6">
      {/*
        ★修正点2: TeacherCalendarはpropsを必要としないため削除
        これにより 'IntrinsicAttributes' のエラーが解消される
      */}
      <TeacherCalendar />
    </div>
  );
}
