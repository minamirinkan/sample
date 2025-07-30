import React, { useEffect, useState } from "react";
import { getUserDataByRole } from "../contexts/utils/getUserDataByRole";
import { UserRole, UserData } from "../contexts/types/user";

const TestUserDataFetch = () => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [role, setRole] = useState<UserRole>(null);

    // テスト用のUID（ログインユーザーのUIDに置き換えてOK）
    const testUid = "0vb3EyoDWGYfkpmlmEFtkRYFegF2";

    useEffect(() => {
        const fetch = async () => {
            try {
                const { role, userData } = await getUserDataByRole(testUid);
                setRole(role);
                setUserData(userData);
                console.log("取得したロール:", role);
                console.log("取得したデータ:", userData);
            } catch (error) {
                console.error("ユーザーデータ取得エラー:", error);
            }
        };
        fetch();
    }, []);

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-2">UserData Fetch テスト</h2>
            <p className="mb-2">ロール: {role ?? "未取得"}</p>
            <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(userData, null, 2)}</pre>
        </div>
    );
};

export default TestUserDataFetch;
