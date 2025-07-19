// utils/timetable/parseTimetableSnapshot.js

export function parseTimetableSnapshot(snap) {
    const data = snap.data();
    const rows = data.rows.map((row) => {
        const periodsArray = [];
        for (let i = 1; i <= 8; i++) {
            const periodKey = `period${i}`;
            const students = row.periods?.[periodKey] || [];
            periodsArray.push(
                students.map((s) => ({
                    studentId: s.studentId ?? '',
                    grade: s.grade ?? '',
                    name: s.name ?? '',
                    seat: s.seat ?? '',
                    subject: s.subject ?? '',
                }))
            );
        }
        return {
            teacher: row.teacher || null,
            periods: periodsArray,
            status: row.status || '予定'
        };
    });

    return { rows };
}
