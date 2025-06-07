import React, { Component } from 'react';

class CalendarPopup extends Component {
  constructor(props) {
    super(props);
    const today = new Date();
    this.state = {
      showCalendar: false,
      year: today.getFullYear(),
      month: today.getMonth(), // 0-11
      selectedDate: null, // 選択した日付
      today: today.getDate(),
    };
  }

  toggleCalendar = () => {
    this.setState({ showCalendar: !this.state.showCalendar });
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
    this.setState({ selectedDate: date });

    // 選択された日付を親コンポーネントに渡す
    if (this.props.onDateSelect) {
      this.props.onDateSelect({
        year: this.state.year,
        month: this.state.month + 1, // 月は 0-index なので +1
        date,
      });
    }
  };

  render() {
    const { year, month, showCalendar, selectedDate, today } = this.state;

    const days = ['日', '月', '火', '水', '木', '金', '土'];
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    const calendarCells = [];
    for (let i = 0; i < firstDay; i++) calendarCells.push(null);
    for (let d = 1; d <= lastDate; d++) calendarCells.push(d);

    return (
      <div className="relative inline-block">
        {/* 📅 カレンダーアイコン */}
        <button onClick={this.toggleCalendar} className="text-2xl">
          📅
        </button>

        {showCalendar && (
          <div className="absolute z-10 mt-2 p-4 bg-white border rounded shadow-md w-64">
            {/* ヘッダー */}
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

            {/* 曜日 */}
            <div className="grid grid-cols-7 text-center font-semibold mb-1">
              {days.map((d, i) => (
                <div key={i} className={i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : ''}>
                  {d}
                </div>
              ))}
            </div>

            {/* 日付 */}
            <div className="grid grid-cols-7 text-center gap-y-1">
              {calendarCells.map((date, idx) => {
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
                    className={`${colorClass} ${isSelected} ${isToday} cursor-pointer`}
                    onClick={() => this.handleDateClick(date)}
                  >
                    {date ?? ''}
                  </div>
                );
              })}
            </div>

            {/* 選択された日付表示 */}
            {selectedDate && (
              <div className="mt-2 text-center text-sm text-gray-600">
                選択した日付: {year}年 {month + 1}月 {selectedDate}日
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

export default CalendarPopup;
