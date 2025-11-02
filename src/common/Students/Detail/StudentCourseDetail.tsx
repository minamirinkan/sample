// src/common/Students/Detail/StudentCourseDetail.tsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SimpleCard from "../../../common/ToDo/ToDoContent/SimpleCard";
import EditButton from "./EditButton";
import { Student } from "../../../contexts/types/student";
import { Customer } from "../../../contexts/types/customer";
import { StudentCourse } from "./Tabs/StudentCourseTable";

const StudentCourseDetail: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { formData, customer, course } = location.state as {
        formData: Student;
        customer: Customer;
        course: StudentCourse;
    };

    const handleBack = () => {
        navigate(`/admin/students/${formData?.studentId}/course`, { state: { formData, customer } });
    };

    const isNormal = course.lessonType === "通常";

    return (
        <div className="space-y-4">
            <EditButton
                isEditing={false}
                onBack={handleBack}
                onEdit={() => navigate(`/admin/students/${formData.studentId}/course/${course.id}/edit`, { state: { formData, customer, course } })}
            />

            <SimpleCard title="受講情報詳細">
                <div className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-3">
                    <div className="font-medium">生徒名</div>
                    <div>{formData.lastName} {formData.firstName}</div>

                    <div className="font-medium">授業種別</div>
                    <div>{course.lessonType || "-"}</div>

                    <div className="font-medium">授業形態</div>
                    <div>{course.classType || "-"}</div>

                    {isNormal && (
                        <>
                            <div className="font-medium">週回数</div>
                            <div>{course.times ? `${course.times}回` : "-"}</div>
                        </>
                    )}

                    <div className="font-medium">授業時間</div>
                    <div>{course.duration ? `${course.duration}分` : "-"}</div>

                    <div className="font-medium">受講開始月</div>
                    <div>{course.startYear && course.startMonth ? `${course.startYear}/${course.startMonth}` : "-"}</div>

                    <div className="font-medium">受講終了月</div>
                    <div>{course.endYear && course.endMonth ? `${course.endYear}/${course.endMonth}` : "-"}</div>

                    <div className="font-medium">備考</div>
                    <div>{course.note || "-"}</div>
                </div>
            </SimpleCard>
            
            <EditButton
                isEditing={false}
                onBack={handleBack}
                onEdit={() => navigate(`/admin/students/${formData.studentId}/course/${course.id}/edit`, { state: { formData, customer, course } })}
            />
        </div>
    );
};

export default StudentCourseDetail;
