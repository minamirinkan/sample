// 例: periodLabel から "period1" などを得るヘルパー
export function convertToPeriodKey(label) {
    const match = label.match(/(\d)/);
    return match ? `period${match[1]}` : 'period1';
}

// attendanceList → rows形式に変換
export function convertAttendanceListToRows(attendanceList) {
    const rowMap = {};

    attendanceList.forEach(entry => {
        const date = entry.date;
        const weekdayIndex = new Date(date).getDay(); // 0〜6（日曜〜土曜）
        const periodKey = convertToPeriodKey(entry.periodLabel);

        if (!rowMap[weekdayIndex]) {
            rowMap[weekdayIndex] = {
                status: entry.status || '未定',
                teacher: entry.teacher || null,
                periods: {
                    period1: [],
                    period2: [],
                    period3: [],
                    period4: [],
                    period5: [],
                    period6: [],
                    period7: [],
                    period8: [],
                },
            };
        }

        rowMap[weekdayIndex].periods[periodKey].push({
            studentId: entry.studentId,
            name: entry.name || '',
            grade: entry.grade || '',
            seat: entry.seat || '',
            subject: entry.subject || '',
            status: entry.status || '',
        });
    });

    const rows = [];
    for (let i = 0; i <= 6; i++) {
        rows[i] = rowMap[i] || {
            status: '未定',
            teacher: null,
            periods: {
                period1: [],
                period2: [],
                period3: [],
                period4: [],
                period5: [],
                period6: [],
                period7: [],
                period8: [],
            },
        };
    }

    return rows;
}
