// utils/timetable/flattenRows.js

export function flattenRows(rows) {
    return rows.map((row) => {
        const rowStatus = row.status ?? '予定';

        const flatPeriods = {};
        row.periods?.forEach((students, idx) => {
            flatPeriods[`period${idx + 1}`] = students.map(student => ({
                studentId: student?.studentId ?? '',
                grade: student?.grade ?? '',
                name: student?.name ?? '',
                seat: student?.seat ?? '',
                subject: student?.subject ?? '',
                status: rowStatus
            }));
        });

        return {
            teacher: row.teacher && (row.teacher.code || row.teacher.name)
                ? {
                    code: row.teacher.code ?? '',
                    name: row.teacher.name ?? ''
                }
                : null,
            periods: flatPeriods,
            status: rowStatus
        };
    });
}
