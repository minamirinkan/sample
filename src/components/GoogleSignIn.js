import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";

export default function GoogleSignIn() {
    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const { isNewUser } = result._tokenResponse;

            if (isNewUser) {
                alert("登録されていません。管理者にお問い合わせください。");
                // ここでログアウトさせるのも検討しても良いです
                await auth.signOut();
            } else {
                alert("ログインしました");
                // 既存ユーザーのログイン後処理をここに書く
            }
        } catch (error) {
            console.error(error);
            alert("Googleログインに失敗しました");
        }
    };

    return (
        <button
            onClick={handleGoogleLogin}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded w-full mt-4"
        >
            Googleでログイン
        </button>
    );
}
