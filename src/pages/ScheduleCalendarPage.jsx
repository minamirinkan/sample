import React, { useState, useRef } from 'react';  // useRefもインポート
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import EventModal from '../components/EventModal';

const ScheduleCalendarPage = () => {
    const [activeTab, setActiveTab] = useState('company');
    const [companyEvents, setCompanyEvents] = useState([
        { id: '1', title: '社内会議', start: '2025-06-25', backgroundColor: 'green' },
        { id: '2', title: '休業日', start: '2025-06-30', backgroundColor: 'gray' },
    ]);
    const [parentsEvents, setParentsEvents] = useState([
        { id: '3', title: '保護者面談', start: '2025-06-26', backgroundColor: 'blue' },
        { id: '4', title: '夏期講習申込締切', start: '2025-07-01', backgroundColor: 'orange' },
    ]);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);

    // refを作る
    const calendarRef = useRef(null);

    const events = activeTab === 'company' ? companyEvents : parentsEvents;
    const setEvents = activeTab === 'company' ? setCompanyEvents : setParentsEvents;

    const handleEventClick = (clickInfo) => {
        setSelectedEvent({
            id: clickInfo.event.id,
            title: clickInfo.event.title,
            startStr: clickInfo.event.startStr,
            backgroundColor: clickInfo.event.backgroundColor,
        });
        setSelectedDate(null);
        setModalOpen(true);
    };

    const handleSave = (eventData) => {
        if (selectedEvent) {
            // 編集モード
            setEvents(events.map(ev =>
                ev.id === selectedEvent.id
                    ? {
                        ...ev,
                        title: eventData.title,
                        start: eventData.start,
                        end: eventData.end,  // ← 追加
                        backgroundColor: eventData.color,
                    }
                    : ev
            ));
        } else {
            // 新規作成モード
            const newEvent = {
                id: String(Date.now()),
                title: eventData.title,
                start: eventData.start,
                end: eventData.end,
                color: eventData.color, // ← backgroundColor ではなく color を使う
                allDay: false,          // ← 時間付きイベントとして扱う
            };
            setEvents([...events, newEvent]);
        }

        setModalOpen(false);
    };

    const handleDelete = () => {
        if (selectedEvent) {
            setEvents(events.filter(ev => ev.id !== selectedEvent.id));
        }
        setModalOpen(false);
    };

    const handleEventDrop = (dropInfo) => {
        const { event } = dropInfo;
        setEvents(events.map(ev => ev.id === event.id ? { ...ev, start: event.startStr } : ev));
    };

    // これがビュー切り替え関数
    const handleViewChange = (viewName) => {
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            calendarApi.changeView(viewName);
        } else {
            console.warn("calendarRef.current is null");
        }
    };

    const [viewType, setViewType] = useState('timeGridWeek');

    return (
        <div>
            <h2 className="text-xl font-bold mb-2">スケジュールカレンダー</h2>

            <div className="mb-4 border-b flex">
                <button
                    className={`px-4 py-2 text-sm font-semibold ${activeTab === 'company' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('company')}
                >
                    会社カレンダー
                </button>
                <button
                    className={`px-4 py-2 text-sm font-semibold ml-4 ${activeTab === 'parents' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('parents')}
                >
                    保護者カレンダー
                </button>
            </div>

            <div className="mb-4 flex gap-2">
                <button
                    onClick={() => handleViewChange('dayGridMonth')}
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                >
                    月
                </button>
                <button
                    onClick={() => handleViewChange('timeGridWeek')}
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                >
                    週
                </button>
                <button
                    onClick={() => handleViewChange('timeGridDay')}
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                >
                    日
                </button>
            </div>

            <FullCalendar
                ref={calendarRef} // ← 必須
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                selectable={true}
                editable={true}
                events={events}
                dateClick={(info) => {
                    if (info.view.type === 'dayGridMonth') {
                        setViewType('month');
                        setSelectedDate(info.dateStr);
                        setSelectedEvent(null);
                        setModalOpen(true);
                    }
                }}
                select={(info) => {
                    if (info.view.type !== 'dayGridMonth') {
                        setViewType('time');
                        setSelectedEvent({
                            startStr: info.startStr,
                            endStr: info.endStr,
                        });
                        setSelectedDate(null);
                        setModalOpen(true);
                    }
                }}
                eventTimeFormat={{
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false // ← 24時間表示にしたい場合
                }}
                eventClick={handleEventClick}
                eventDrop={handleEventDrop}
                selectMirror={true}
                height="auto"
            />

            {modalOpen && (
                <EventModal
                    mode={viewType} // 'month' または 'time'
                    date={selectedDate}
                    event={selectedEvent}
                    onClose={() => setModalOpen(false)}
                    onSave={handleSave}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
};

export default ScheduleCalendarPage;
