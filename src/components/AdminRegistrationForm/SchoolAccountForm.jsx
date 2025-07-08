import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import SchoolAccountFormFee from './SchoolAccountFormFee';
import TeacherFeeRegistration from './TeacherFeeRegistration';
import PeriodTimeForm from './PeriodTimeForm';
import AddressInfoSection from '../StudentRegistrationForm/AddressInfoSection';

const SchoolAccountForm = ({ onAdd }) => {
    const [newName, setNewName] = useState('');
    const [newCode, setNewCode] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [tuitionOptions, setTuitionOptions] = useState([]);
    const [selectedTuition, setSelectedTuition] = useState('');
    const [showTuitionModal, setShowTuitionModal] = useState(false); // モーダル表示制御
    const [showTeacherModal, setShowTeacherModal] = useState(false);
    const [selectedTeacherLocation, setSelectedTeacherLocation] = useState('');
    const [teacherOptions, setTeacherOptions] = useState([]);
    const [showPeriodModal, setShowPeriodModal] = useState(false);
    const [selectedPeriodLocation, setSelectedPeriodLocation] = useState('');
    const [periodOptions, setPeriodOptions] = useState([]);
    const [minimumWage, setMinimumWage] = useState('');
    const [formData, setFormData] = useState({
        postalCode: '',
        prefecture: '',
        address2: '',
        address3: '',
        address2Kana: '',
        address3Kana: ''
    });


    // Firestoreから登録済み授業料の一覧を取得
    useEffect(() => {
        const fetchTuitions = async () => {
            const snap = await getDocs(collection(db, 'Tuition'));
            const names = snap.docs.map(doc => doc.id);
            setTuitionOptions(names);
        };
        fetchTuitions();
    }, []);

    useEffect(() => {
        // 講師給与一覧の取得
        const fetchTeacherFees = async () => {
            const snap = await getDocs(collection(db, 'TeacherFees'));
            const names = snap.docs.map(doc => doc.id);
            setTeacherOptions(names);
        };
        fetchTeacherFees();
    }, []);

    useEffect(() => {
        const fetchPeriods = async () => {
            const snap = await getDocs(collection(db, 'PeriodTimes'));
            const names = snap.docs.map(doc => doc.id);
            setPeriodOptions(names);
        };
        fetchPeriods();
    }, []);


    const handleSubmit = () => {
        onAdd({
            newName,
            newCode,
            newEmail,
            newPassword,
            tuitionName: selectedTuition,
            teacherFeeName: selectedTeacherLocation,
            periodTimeName: selectedPeriodLocation,
            addressInfo: formData,
            minimumWage: minimumWage !== '' ? Number(minimumWage) : null,
        });

        // フォーム初期化
        setNewName('');
        setNewCode('');
        setNewEmail('');
        setNewPassword('');
        setSelectedTuition('');
        setSelectedTeacherLocation('');
        setSelectedPeriodLocation('');
        setMinimumWage('');
    };


    const handleTuitionSelect = (value) => {
        if (value === 'add_new') {
            setShowTuitionModal(true);
        } else {
            setSelectedTuition(value);
        }
    };

    return (
        <div className="flex flex-col gap-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex flex-col sm:w-32">
                    <label className="mb-1 text-sm font-medium text-gray-700">教室コード</label>
                    <input
                        type="text"
                        value={newCode}
                        onChange={(e) => setNewCode(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 text-center font-mono"
                        placeholder="例: 007"
                        maxLength={3}
                        inputMode="numeric"
                    />
                </div>
                <div className="flex flex-col flex-1">
                    <label className="mb-1 text-sm font-medium text-gray-700">教室名</label>
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2"
                    />
                </div>
            </div>

            <AddressInfoSection
                formData={formData}
                onChange={(newData) => setFormData(newData)}
            />
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex flex-col flex-1">
                    <label className="mb-1 text-sm font-medium text-gray-700">メールアドレス</label>
                    <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2"
                        placeholder="例: school007@example.com"
                    />
                </div>
                <div className="flex flex-col flex-1">
                    <label className="mb-1 text-sm font-medium text-gray-700">初期パスワード</label>
                    <input
                        type="text"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2"
                        placeholder="6文字以上"
                    />
                </div>
            </div>

            <div className="flex flex-col mt-6">
                <label className="mb-1 text-sm font-medium text-gray-700">最低賃金（円）</label>
                <input
                    type="number"
                    className="border border-gray-300 rounded px-3 py-2 bg-white no-spinner"
                    value={minimumWage}
                    onChange={(e) => setMinimumWage(e.target.value)}
                    placeholder="例: 1120"
                    min="0"
                    onWheel={(e) => e.target.blur()}
                />
            </div>


            <div className="flex flex-col sm:flex-row gap-4 mt-6">
                {/* ▼ 授業料 */}
                <div className="flex flex-col flex-1">
                    <label className="mb-1 text-sm font-medium text-gray-700">授業料（登録地名）</label>
                    <select
                        className="border border-gray-300 rounded px-3 py-2 bg-white"
                        value={selectedTuition}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value === 'add_new') {
                                setShowTuitionModal(true);
                            } else {
                                setSelectedTuition(value);
                            }
                        }}
                    >
                        <option value="" disabled>選択してください</option>
                        {tuitionOptions.map((name) => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                        <option value="add_new">＋ 新規登録</option>
                    </select>
                </div>

                {/* ▼ 講師給与 */}
                <div className="flex flex-col flex-1">
                    <label className="mb-1 text-sm font-medium text-gray-700">講師給与（登録地名）</label>
                    <select
                        className="border border-gray-300 rounded px-3 py-2 bg-white"
                        value={selectedTeacherLocation}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value === 'add_new') {
                                setShowTeacherModal(true);
                            } else {
                                setSelectedTeacherLocation(value);
                            }
                        }}
                    >
                        <option value="" disabled>選択してください</option>
                        {teacherOptions.map((name) => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                        <option value="add_new">＋ 新規登録</option>
                    </select>
                </div>

                {/* ▼ 時限 */}
                <div className="flex flex-col flex-1">
                    <label className="mb-1 text-sm font-medium text-gray-700">時限（80分・70分）</label>
                    <select
                        className="border border-gray-300 rounded px-3 py-2 bg-white"
                        value={selectedPeriodLocation}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value === 'add_new') {
                                setShowPeriodModal(true);
                            } else {
                                setSelectedPeriodLocation(value);
                            }
                        }}
                    >
                        <option value="" disabled>選択してください</option>
                        {periodOptions.map((name) => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                        <option value="add_new">＋ 新規登録</option>
                    </select>
                </div>
            </div>


            <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-fit self-end"
            >
                新規登録
            </button>

            {/* ▼ モーダル表示 */}
            {showTuitionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white max-h-[90vh] overflow-y-auto p-6 rounded shadow-lg w-[90%] max-w-5xl relative">
                        {/* ✕ ボタンで閉じる */}
                        <button
                            onClick={() => setShowTuitionModal(false)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
                        >
                            ✕
                        </button>

                        {/* TuitionFormContent に登録完了後のコールバックを渡す */}
                        <SchoolAccountFormFee
                            onRegistered={(newLocationName) => {
                                setShowTuitionModal(false);                    // モーダルを閉じる
                                setSelectedTuition(newLocationName);           // 自動選択
                                setTuitionOptions((prev) => {
                                    if (!prev.includes(newLocationName)) {
                                        return [...prev, newLocationName];         // 新規地名を選択肢に追加
                                    }
                                    return prev;
                                });
                            }}
                        />
                    </div>
                </div>
            )}

            {showTeacherModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white max-h-[90vh] overflow-y-auto p-6 rounded shadow-lg w-[90%] max-w-5xl relative">
                        {/* ✕ ボタンで閉じる */}
                        <button
                            onClick={() => setShowTeacherModal(false)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
                        >
                            ✕
                        </button>

                        {/* TeacherFeeRegistration に登録完了後のコールバックを渡す */}
                        <TeacherFeeRegistration
                            onRegistered={(locationName) => {
                                setShowTeacherModal(false);                   // モーダルを閉じる
                                setSelectedTeacherLocation(locationName);     // 自動選択（必要なら）
                                setTeacherOptions((prev) => {
                                    if (!prev.includes(locationName)) {
                                        return [...prev, locationName];       // 新規地名をリストに追加
                                    }
                                    return prev;
                                });
                            }}
                        />
                    </div>
                </div>
            )}

            {showPeriodModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white max-h-[90vh] overflow-y-auto p-6 rounded shadow-lg w-[90%] max-w-5xl relative">
                        {/* ✕ ボタンで閉じる */}
                        <button
                            onClick={() => setShowPeriodModal(false)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
                        >
                            ✕
                        </button>

                        {/* PeriodTimeForm に登録完了後のコールバックを渡す */}
                        <PeriodTimeForm
                            onRegistered={(locationName) => {
                                setShowPeriodModal(false);               // モーダルを閉じる
                                setSelectedPeriodLocation(locationName); // 自動選択（必要なら）
                                setPeriodOptions((prev) => {
                                    if (!prev.includes(locationName)) {
                                        return [...prev, locationName];      // 新規地名をリストに追加
                                    }
                                    return prev;
                                });
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default SchoolAccountForm;