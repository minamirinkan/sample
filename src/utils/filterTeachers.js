// utils/filterTeachers.js
export const filterTeachers = (teachers, searchTerm) => {
    if (!searchTerm) return teachers;
    const lowerTerm = searchTerm.toLowerCase();
    return teachers.filter((t) =>
        (t.lastName + t.firstName).toLowerCase().includes(lowerTerm) ||
        t.email?.toLowerCase().includes(lowerTerm)
    );
};
