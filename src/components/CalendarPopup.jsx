//components/CalendarPopup.jsx
import React, { Component, createRef } from 'react';
import { RiCalendarLine } from 'react-icons/ri';
import { getFirestore, collection, onSnapshot, query, where } from 'firebase/firestore';

class CalendarPopup extends Component {
  constructor(props) {
    super(props);
    const today = new Date();
    this.state = {
      showCalendar: false,
      year: today.getFullYear(),
      month: today.getMonth(),
      selectedDate: null,
      today: today.getDate(),
      selectedWeekday: null,
      savedDates: new Set(),
    };
    this.popupRef = createRef();
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
    this.setupSavedDatesListener();
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
    if (this.unsubscribe) this.unsubscribe();
  }

  // componentDidUpdate(prevProps, prevState) {
  //   if (prevState.year !== this.state.year || prevState.month !== this.state.month) {
  //     if (this.unsubscribe) this.unsubscribe(); // 前の監視を止める
  //     this.setupSavedDatesListener(); // 新たにリッスン開始
  //   }
  // }

  handleClickOutside = (event) => {
    if (
      this.state.showCalendar &&
      this.popupRef.current &&
      !this.popupRef.current.contains(event.target)
    ) {
      this.setState({ showCalendar: false });
    }
  };

  toggleCalendar = () => {
    this.setState((prev) => ({ showCalendar: !prev.showCalendar }));
  };

  handlePrevMonth = () => {
    this.setState((prevState) => {
      const newMonth = prevState.month === 0 ? 11 : prevState.month - 1;
      const newYear = prevState.month === 0 ? prevState.year - 1 : prevState.year;
      return { year: newYear, month: newMonth };
    });
  };

  handleNextMonth = () => {
    this.setState((prevState) => {
      const newMonth = prevState.month === 11 ? 0 : prevState.month + 1;
      const newYear = prevState.month === 11 ? prevState.year + 1 : prevState.year;
      return { year: newYear, month: newMonth };
    });
  };

  handleDateClick = (date) => {
    const { year, month } = this.state;
    const selected = new Date(year, month, date);
    const weekdayNames = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
    const weekday = weekdayNames[selected.getDay()];

    this.setState({
      selectedDate: date,
      showCalendar: false,
    });

    if (this.props.onDateSelect) {
      this.props.onDateSelect({
        type: 'date',
        year,
        month: month + 1,
        date,
        weekday,
      });
    }
  };

  handleWeekdayClick = (weekdayIndex) => {
    const { year, month } = this.state;
    const weekdayNames = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
    const weekday = weekdayNames[weekdayIndex];

    this.setState((prevState) => ({
      selectedWeekday: prevState.selectedWeekday === weekdayIndex ? null : weekdayIndex,
    }));

    if (this.props.onDateSelect) {
      this.props.onDateSelect({
        type: 'weekday',
        year,
        month: month + 1,
        weekday,
      });
    }
  };

  setupSavedDatesListener = () => {
    const { year, month } = this.state;
    const { classroomCode } = this.props;

    if (!classroomCode) {
      console.warn('classroomCode prop is required');
      return;
    }

    const db = getFirestore();
    const prefix = `${classroomCode}_`;
    const dailySchedulesRef = collection(db, "dailySchedules");

    const q = query(
      dailySchedulesRef,
      where("isSaved", "==", true)
    );

    // onSnapshotでリアルタイム監視スタート
    this.unsubscribe = onSnapshot(q, (snapshot) => {
      const datesSet = new Set();

      snapshot.forEach((doc) => {
        const docId = doc.id;
        if (docId.startsWith(prefix)) {
          const dateStr = docId.replace(prefix, '');
          const [y, m] = dateStr.split('-');
          if (parseInt(y) === year && parseInt(m) === month + 1) {
            datesSet.add(dateStr);
          }
        }
      });

      this.setState({ savedDates: datesSet });
    }, (error) => {
      console.error('Failed to listen saved dates:', error);
    });
  };

  render() {
    const { year, month, showCalendar, selectedDate, today, selectedWeekday, savedDates } = this.state;

    const days = ['日', '月', '火', '水', '木', '金', '土'];
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    const calendarCells = [];
    for (let i = 0; i < firstDay; i++) calendarCells.push(null);
    for (let d = 1; d <= lastDate; d++) calendarCells.push(d);

    return (
      <div className="relative inline-block" ref={this.popupRef}>
        <button
          onClick={this.toggleCalendar}
          className="text-3xl text-blue-600 hover:text-blue-800 transform hover:scale-110 transition duration-150"
          aria-label="Toggle Calendar"
        >
          <RiCalendarLine />
        </button>

        {showCalendar && (
          <div className="absolute z-10 mt-2 p-4 bg-white border rounded shadow-md w-64">
            <div className="flex justify-between items-center mb-2">
              <button onClick={this.handlePrevMonth} className="text-gray-600 hover:text-black px-2">
                ◀
              </button>
              <div className="font-bold text-lg">
                {year}年 {month + 1}月
              </div>
              <button onClick={this.handleNextMonth} className="text-gray-600 hover:text-black px-2">
                ▶
              </button>
            </div>

            {/* 曜日ヘッダー */}
            <div className="grid grid-cols-7 text-center font-semibold mb-1">
              {days.map((d, i) => (
                <div
                  key={i}
                  className={`cursor-pointer select-none px-1 py-0.5 rounded ${i === 0
                    ? 'text-red-500'
                    : i === 6
                      ? 'text-blue-500'
                      : ''
                    } ${selectedWeekday === i ? 'bg-gray-200 font-bold' : ''}`}
                  onClick={() => this.handleWeekdayClick(i)}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* 日付セル */}
            <div className="grid grid-cols-7 text-center gap-y-1">
              {calendarCells.map((date, idx) => {
                if (date === null) return <div key={idx} className="h-6" />;

                const weekday = idx % 7;
                const colorClass =
                  weekday === 0 ? 'text-red-500' : weekday === 6 ? 'text-blue-500' : 'text-black';

                const isSelected = date === selectedDate ? 'bg-gray-300' : '';
                const isToday = date === today ? 'bg-yellow-300' : '';

                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
                const isConfirmed = savedDates.has(dateStr);

                return (
                  <div
                    key={dateStr}
                    className={`relative p-2 h-10 text-center cursor-pointer rounded flex items-center justify-center 
                    ${colorClass} ${isSelected} ${isToday}`}
                    onClick={() => this.handleDateClick(date)}
                  >
                    <span className="text-sm font-medium">{date}</span>
                    {isConfirmed && (
                      <span className="absolute bottom-1 right-1 text-green-600 text-[10px] opacity-80 pointer-events-none">
                        ✅
                      </span>
                    )}
                    {!isConfirmed && (
                      <span className="absolute bottom-1 right-1 text-gray-500 text-[10px] opacity-40 pointer-events-none">
                        未
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default CalendarPopup;
