import { useTeachers } from '../hooks/useTeachers';

const TeacherList = () => {
    const { teachers } = useTeachers();

    return (
        <ul>
            {teachers.map(teacher => (
                <li key={teacher.code}>
                    {teacher.lastName} {teacher.firstName}
                </li>
            ))}
        </ul>
    );
};

export default TeacherList;
