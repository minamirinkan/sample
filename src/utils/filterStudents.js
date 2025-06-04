// utils/filterStudents.js
export const filterStudents = (students, searchTerm) => {
    return students.filter(student =>
        `${student.lastName}${student.firstName}`.includes(searchTerm) ||
        student.code.includes(searchTerm)
    );
};
