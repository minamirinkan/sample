// src/utils/generateInitialTimetable.js
import mockStudents from '../data/mockStudents';

export function generateInitialTimetable() {
    const classrooms = [
        { name: '101' },
        { name: '102' },
        { name: '103' },
    ];

    // 6時限 × 3教室 分の空配列を生成
    const periods = Array.from({ length: 6 }, () =>
        Array.from({ length: classrooms.length }, () => [])
    );

    // 仮に先頭10名をランダムに配置
    const studentsToPlace = mockStudents.slice(0, 10);

    studentsToPlace.forEach((student) => {
        const periodIndex = Math.floor(Math.random() * periods.length);
        const classroomIndex = Math.floor(Math.random() * classrooms.length);

        periods[periodIndex][classroomIndex].push({
            id: student.id,
            name: `${student.lastName} ${student.firstName}`,
            grade: student.grade,
        });
    });

    return { classrooms, periods };
}
