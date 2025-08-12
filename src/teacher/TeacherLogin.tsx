import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { FirebaseError } from "firebase/app"; // ★修正点1: FirebaseErrorをインポート

const TeacherLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("メールアドレスとパスワードを入力してください");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const userRef = doc(db, "teachers", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        alert("講師情報が見つかりません");
        await signOut(auth);
        setLoading(false);
        return;
      }

      const userData = userSnap.data();

      if (userData.role !== "teacher") {
        alert("講師アカウントではありません");
        await signOut(auth);
        setLoading(false);
        return;
      }

      if (userData.isFirstLogin) {
        if (password !== userData.code) {
          alert("初回ログインのパスワードが講師コードと一致しません");
          await signOut(auth);
          setLoading(false);
          return;
        }

        alert("初回ログインです。パスワードを変更してください。");
        navigate("/teacher/change-password");
      } else {
        alert("ログイン成功");
        navigate("/teacher/dashboard");
      }
    } catch (error) {
      // ★修正点2: errorがFirebaseErrorかチェックする
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/user-not-found":
          case "auth/invalid-credential": // 新しいSDKではこのエラーコードに統合されている場合がある
            alert("メールアドレスまたはパスワードが間違っています");
            break;
          case "auth/wrong-password":
            alert("パスワードが間違っています");
            break;
          default:
            alert("ログインに失敗しました: " + error.message);
            break;
        }
      } else if (error instanceof Error) {
        // Firebase以外のエラー
        alert("ログインに失敗しました: " + error.message);
      } else {
        // その他の予期せぬエラー
        alert("予期せぬエラーが発生しました。");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // JSXは変更なし
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-3xl font-bold mb-8 text-center text-blue-600">
          Teacher ログイン
        </h2>
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 rounded-md p-3 w-full mb-4"
          disabled={loading}
        />
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-300 rounded-md p-3 w-full mb-6"
          disabled={loading}
        />
        <button
          onClick={handleLogin}
          className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "ログイン中..." : "ログイン"}
        </button>
      </div>
    </div>
  );
};

export default TeacherLogin;
