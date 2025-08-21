// useDynamicTitle.ts
import { useEffect } from "react";

type Props = {
    role: string;
    classroomName?: string;
};

const useDynamicTitle = ({ role, classroomName }: Props) => {
    useEffect(() => {
        let title = "ATOM";

        if (role === "admin") {
            if (classroomName) {
                title += ` ${classroomName}教室`;
            }
        } else if (role === "superadmin") {
            if (classroomName) {
                title += ` ${classroomName}`;
            }
        }
        document.title = title;
    }, [role, classroomName]);
};

export default useDynamicTitle;
