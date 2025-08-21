// useDynamicTitle.ts
import { useEffect } from "react";

type Props = {
    role: string;
    classroomName?: string;
};

const useDynamicTitle = ({ role, classroomName }: Props) => {
    useEffect(() => {
        let title = "ATOM";
        if (role === "admin" || role === "superadmin") {
            if (classroomName) {
                title += ` ${classroomName}教室`;
            }
        }
        document.title = title;
    }, [role, classroomName]);
};

export default useDynamicTitle;
