import React, { Component, createRef } from 'react';
import { RiCalendarLine } from 'react-icons/ri';

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
    };
    this.popupRef = createRef();
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

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

    this.setState({ selectedDate: date });

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
    const { year, month } = this.state; // 今表示中の年月
    const weekdayNames = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
    const weekday = weekdayNames[weekdayIndex];

    this.setState((prevState) => ({
      selectedWeekday: prevState.selectedWeekday === weekdayIndex ? null : weekdayIndex
    }));

    if (this.props.onDateSelect) {
      this.props.onDateSelect({
        type: 'weekday',
        year,            // ← 追加
        month: month + 1, // ← 0-basedなので +1
        weekday,
      });
    }
  };


  render() {
    const { year, month, showCalendar, selectedDate, today, selectedWeekday } = this.state;

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
                  className={`cursor-pointer select-none px-1 py-0.5 rounded ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : ''
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
                if (date === null) {
                  return <div key={idx} className="h-6" />; // ← 余白セルは透明に
                }

                const weekday = idx % 7;
                const colorClass =
                  weekday === 0
                    ? 'text-red-500'
                    : weekday === 6
                      ? 'text-blue-500'
                      : 'text-black';
                const isSelected = date === selectedDate ? 'bg-gray-300' : '';
                const isToday = date === today ? 'bg-yellow-300' : '';


                return (
                  <div
                    key={idx}
                    className={`cursor-pointer rounded ${colorClass} ${isSelected} ${isToday} `}
                    onClick={() => this.handleDateClick(date)}
                  >
                    {date}
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
