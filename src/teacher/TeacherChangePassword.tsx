// src/pages/ChangePassword.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  signOut,
} from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { FirebaseError } from "firebase/app";

const TeacherChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChangePassword = async () => {
    const user = auth.currentUser;

    if (!user) {
      alert("ログイン情報が見つかりません。再ログインしてください。");
      navigate("/teacher/login");
      return;
    }

    if (!currentPassword || !newPassword) {
      alert("現在のパスワードと新しいパスワードを入力してください");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;

      // userとuser.emailが存在するかチェック
      if (!user || !user.email) {
        alert("ユーザー情報が取得できませんでした。再度ログインしてください。");
        setLoading(false);
        return; // 処理を中断
      }
      // 現在のパスワードで再認証
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // パスワード更新
      await updatePassword(user, newPassword);

      // isFirstLogin を false に更新
      const userRef = doc(db, "teachers", user.uid);
      await updateDoc(userRef, {
        isFirstLogin: false,
      });

      alert("パスワードを変更しました。再ログインしてください。");
      await signOut(auth);
      navigate("/teacher/mypage/dashboard");
    } catch (error) {
      // 'error' が FirebaseError かどうかを正しく判定できるようになる
      if (error instanceof FirebaseError) {
        console.error("Firebase Error Code:", error.code); // 安全にアクセスできる
        switch (error.code) {
          case "auth/wrong-password":
            alert("現在のパスワードが間違っています");
            break;
          case "auth/weak-password":
            alert("新しいパスワードは6文字以上で入力してください");
            break;
          default:
            alert("パスワードの変更に失敗しました：" + error.message);
            break;
        }
      } else {
        // Firebase以外の予期せぬエラーの処理
        console.error("An unexpected error occurred:", error);
        alert("予期せぬエラーが発生しました。");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center text-red-600">
          パスワード変更
        </h2>
        <input
          type="password"
          placeholder="現在のパスワード"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="border border-gray-300 rounded-md p-3 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
          disabled={loading}
        />
        <input
          type="password"
          placeholder="新しいパスワード（6文字以上）"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="border border-gray-300 rounded-md p-3 w-full mb-6 focus:outline-none focus:ring-2 focus:ring-red-500"
          disabled={loading}
        />
        <button
          onClick={handleChangePassword}
          className={`w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-md transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "変更中..." : "パスワードを変更"}
        </button>
      </div>
    </div>
  );
};

export default TeacherChangePassword;
