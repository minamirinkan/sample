import React, { useState, useEffect } from 'react';

const EventModal = ({ mode = 'time', date, event, onClose, onSave, onDelete }) => {
    const [title, setTitle] = useState('');
    const [color, setColor] = useState('#3788d8');
    const [hour, setHour] = useState('09');
    const [minute, setMinute] = useState('00');
    const [endHour, setEndHour] = useState('10');  // 初期値は開始時間の1時間後などでOK
    const [endMinute, setEndMinute] = useState('00');

    // 時間と分の選択肢を用意
    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

    useEffect(() => {
        if (event) {
            setTitle(event.title);
            setColor(event.backgroundColor || '#3788d8');

            const dtStart = new Date(event.startStr);
            setHour(dtStart.getHours().toString().padStart(2, '0'));
            setMinute(dtStart.getMinutes().toString().padStart(2, '0'));

            const dtEnd = new Date(event.endStr);
            setEndHour(dtEnd.getHours().toString().padStart(2, '0'));
            setEndMinute(dtEnd.getMinutes().toString().padStart(2, '0'));
        } else {
            setTitle('');
            setColor('#3788d8');
            setHour('09');
            setMinute('00');
            setEndHour('10');    // 開始時間の1時間後を仮初期値に
            setEndMinute('00');
        }
    }, [event]);


    const handleSubmit = () => {
        if (!title || !title.trim()) return;

        let fullDateTimeStart = '';
        let fullDateTimeEnd = '';

        const timeStrStart = `${hour}:${minute}`;
        const timeStrEnd = `${endHour}:${endMinute}`;

        if (!event) {
            // 新規作成時（modeにかかわらず）
            const datePart = date?.slice(0, 10);  // YYYY-MM-DD
            if (!datePart) {
                console.error('dateが不正です');
                return;
            }
            fullDateTimeStart = `${datePart}T${timeStrStart}:00`;
            fullDateTimeEnd = `${datePart}T${timeStrEnd}:00`;
        } else {
            // 既存イベント編集時
            const startDate = new Date(event.startStr);
            startDate.setHours(Number(hour));
            startDate.setMinutes(Number(minute));

            const endDate = new Date(event.endStr);
            endDate.setHours(Number(endHour));
            endDate.setMinutes(Number(endMinute));

            fullDateTimeStart = startDate.toISOString();
            fullDateTimeEnd = endDate.toISOString();
        }

        onSave({
            title,
            start: fullDateTimeStart,
            end: fullDateTimeEnd,
            color,
            backgroundColor: color,
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded shadow-md w-96">
                <h3 className="text-lg font-bold mb-4">
                    {event ? 'イベントを編集' : '新規イベント'}
                </h3>

                <input
                    className="w-full border px-3 py-2 mb-4"
                    placeholder="イベント名"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />

                {mode === 'month' ? (
                    <div className="mb-4">
                        {/* 開始時間 */}
                        <label className="block mb-1 font-semibold">開始時間</label>
                        <div className="flex items-center gap-2 mb-2">
                            <select
                                value={hour}
                                onChange={e => setHour(e.target.value)}
                                className="border px-3 py-2 rounded"
                            >
                                {hours.map(h => (
                                    <option key={h} value={h}>{h}</option>
                                ))}
                            </select>
                            <span>:</span>
                            <select
                                value={minute}
                                onChange={e => setMinute(e.target.value)}
                                className="border px-3 py-2 rounded"
                            >
                                {minutes.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>

                        {/* 終了時間 */}
                        <label className="block mb-1 font-semibold">終了時間</label>
                        <div className="flex items-center gap-2">
                            <select
                                value={endHour}
                                onChange={e => setEndHour(e.target.value)}
                                className="border px-3 py-2 rounded"
                            >
                                {hours.map(h => (
                                    <option key={h} value={h}>{h}</option>
                                ))}
                            </select>
                            <span>:</span>
                            <select
                                value={endMinute}
                                onChange={e => setEndMinute(e.target.value)}
                                className="border px-3 py-2 rounded"
                            >
                                {minutes.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                ) : (
                    <div className="mb-4">
                        {/* 開始時間 */}
                        <label className="block mb-1 font-semibold">開始時間</label>
                        <div className="flex items-center gap-2">
                            <select
                                value={hour}
                                onChange={e => setHour(e.target.value)}
                                className="border px-3 py-2 rounded"
                            >
                                {hours.map(h => (
                                    <option key={h} value={h}>{h}</option>
                                ))}
                            </select>
                            <span>:</span>
                            <select
                                value={minute}
                                onChange={e => setMinute(e.target.value)}
                                className="border px-3 py-2 rounded"
                            >
                                {minutes.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>

                        {/* 終了時間 */}
                        <label className="block mt-4 mb-1 font-semibold">終了時間</label>
                        <div className="flex items-center gap-2">
                            <select
                                value={endHour}
                                onChange={e => setEndHour(e.target.value)}
                                className="border px-3 py-2 rounded"
                            >
                                {hours.map(h => (
                                    <option key={h} value={h}>{h}</option>
                                ))}
                            </select>
                            <span>:</span>
                            <select
                                value={endMinute}
                                onChange={e => setEndMinute(e.target.value)}
                                className="border px-3 py-2 rounded"
                            >
                                {minutes.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                <input
                    type="color"
                    className="mb-4"
                    value={color}
                    onChange={e => setColor(e.target.value)}
                />

                <div className="flex justify-end gap-2">
                    {event && (
                        <button
                            onClick={onDelete}
                            className="bg-red-500 text-white px-3 py-1 rounded"
                        >
                            削除
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="bg-gray-300 px-3 py-1 rounded"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="bg-blue-500 text-white px-3 py-1 rounded"
                    >
                        保存
                    </button>
                </div>
            </div>
        </div >
    );
};

export default EventModal;
