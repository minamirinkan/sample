import { Student } from "../types/student";

export const filterStudentsByClassrooms = (students: Student[], classroomCodes: string[]) => {
    return students.filter((student) => classroomCodes.includes(student.classroomCode));
};

export const filterStudentsByCustomer = (students: Student[], customerUid: string) => {
    return students.filter((student) => student.customerUid === customerUid);
};
