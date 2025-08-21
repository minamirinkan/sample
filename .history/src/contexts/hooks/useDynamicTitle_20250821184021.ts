import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext"; // ログインユーザーのrole取得用

type Props = {
    classroomName?: string; // 管理者なら教室名を渡す
};

const useDynamicTitle = ({ classroomName }: Props) => {
    const { user } = useAuth(); // user.role が "admin" | "superadmin" など

    useEffect(() => {
        let title = "ATOM";

        if (user?.role === "admin") {
            if (classroomName) {
                title += ` ${classroomName}教室`; // 例: "ATOM 南林間教室"
            }
            else if (user?.role === "superadmin") {
                title += ` ${classroomName}`;
            }
        }

        document.title = title;
    }, [user, classroomName]);
};

export default useDynamicTitle;
