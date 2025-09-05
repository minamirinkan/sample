// src/pages/ChangePassword.test.tsx

// 解決策1: 必要なものをすべてインポートする
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChangePassword from './ChangePassword';

// 解決策2: モック関数をあらかじめ宣言しておく
const mockReauthenticate = jest.fn();
const mockUpdatePassword = jest.fn();
const mockSignOut = jest.fn();
const mockUpdateDoc = jest.fn();
const mockNavigate = jest.fn();

// --- モックの設定 ---
jest.mock('firebase/auth', () => ({
    ...jest.requireActual('firebase/auth'),
    reauthenticateWithCredential: () => mockReauthenticate(),
    updatePassword: () => mockUpdatePassword(),
    signOut: () => mockSignOut(),
    EmailAuthProvider: {
        credential: () => ({}),
    },
}));

jest.mock('firebase/firestore', () => ({
    ...jest.requireActual('firebase/firestore'),
    doc: () => ({}),
    updateDoc: () => mockUpdateDoc(),
}));

jest.mock('../firebase', () => ({
    auth: {
        currentUser: {
            email: 'test@example.com',
            uid: 'test-uid',
        },
    },
    db: {},
}));

jest.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}));

// --- テスト本体 ---
describe('ChangePasswordコンポーネントのテスト', () => {

    beforeEach(() => {
        // 各テストの前にモックの状態をリセット
        jest.clearAllMocks();
        // window.alertもモック化
        window.alert = jest.fn();
    });

    // シナリオ1: 正常にパスワードが変更される
    it('正しい値を入力するとパスワードが変更され、サインアウトする', async () => {
        mockReauthenticate.mockResolvedValue(undefined);
        mockUpdatePassword.mockResolvedValue(undefined);
        mockUpdateDoc.mockResolvedValue(undefined);

        render(<ChangePassword />);
        const user = userEvent.setup();

        await user.type(screen.getByPlaceholderText('現在のパスワード'), 'current-password');
        await user.type(screen.getByPlaceholderText(/新しいパスワード/), 'new-password-123');
        await user.click(screen.getByRole('button', { name: 'パスワードを変更' }));

        // ESLintエラー(no-wait-for-multiple-assertions)の修正
        // waitForでは、非同期処理の完了を示す「最後の状態」を1つだけ待つのが良いとされています。
        await waitFor(() => {
            // 成功アラートが表示されるのを待つ
            expect(window.alert).toHaveBeenCalledWith('パスワードを変更しました。再ログインしてください。');
        });

        // waitForが完了した時点で他の処理も終わっているはずなので、残りの検証をここで行う
        expect(mockReauthenticate).toHaveBeenCalledTimes(1);
        expect(mockUpdatePassword).toHaveBeenCalledTimes(1);
        expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
        expect(mockSignOut).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('/mypage/dashboard');
    });

    // ...ここに他のテストケースを追加...
});
