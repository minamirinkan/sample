import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import formatPrice from "../utils/formatPrice";

type TuitionDataItem = {
    scheduleLabel: string;
    "小学生"?: string;
    "中1／中2"?: string;
    "中3"?: string;
    "高1／高2"?: string;
    "高3／既卒"?: string;
};

type TestPreparationData = string[];

type TuitionDoc = {
    tuitionDataA?: TuitionDataItem[];
    tuitionDataW?: TuitionDataItem[];
    testPreparationData?: TestPreparationData;
    tuitionFees?: {
        admissionFee?: string;
        maintenanceFee?: string;
        materialFee?: string;
    };
};

const TuitionPage: React.FC = () => {
    const { classroomName } = useParams<{ classroomName: string }>();
    const [tuition, setTuition] = useState<TuitionDoc | null>(null);

    useEffect(() => {
        const fetchTuition = async () => {
            if (!classroomName) return;
            const docRef = doc(db, "Tuition", classroomName);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                setTuition(snap.data() as TuitionDoc);
            }
        };
        fetchTuition();
    }, [classroomName]);

    if (!tuition) return <p className="text-gray-500 animate-pulse">読み込み中...</p>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">{classroomName} 授業料一覧</h1>

            {tuition.tuitionDataW && (
                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">通常授業（マンツーマンW 1：2）</h2>
                    <table className="border-collapse border w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border p-2">コマ数</th>
                                <th className="border p-2">小学生</th>
                                <th className="border p-2">中1／中2</th>
                                <th className="border p-2">中3</th>
                                <th className="border p-2">高1／高2</th>
                                <th className="border p-2">高3／既卒</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tuition.tuitionDataW.map((item, index) => (
                                <tr key={index} className="odd:bg-white even:bg-gray-50">
                                    <td className="border p-2">{item.scheduleLabel}</td>
                                    <td className="border p-2 text-center">{formatPrice(item["小学生"])}</td>
                                    <td className="border p-2 text-center">{formatPrice(item["中1／中2"])}</td>
                                    <td className="border p-2 text-center">{formatPrice(item["中3"])}</td>
                                    <td className="border p-2 text-center">{formatPrice(item["高1／高2"])}</td>
                                    <td className="border p-2 text-center">{formatPrice(item["高3／既卒"])}</td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {tuition.tuitionDataA && (
                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">通常授業（マンツーマンA 1：1）</h2>
                    <table className="border-collapse border w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border p-2">コマ数</th>
                                <th className="border p-2">小学生</th>
                                <th className="border p-2">中1／中2</th>
                                <th className="border p-2">中3</th>
                                <th className="border p-2">高1／高2</th>
                                <th className="border p-2">高3／既卒</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tuition.tuitionDataA.map((item, index) => (
                                <tr key={index} className="odd:bg-white even:bg-gray-50">
                                    <td className="border p-2">{item.scheduleLabel}</td>
                                    <td className="border p-2 text-center">{formatPrice(item["小学生"])}</td>
                                    <td className="border p-2 text-center">{formatPrice(item["中1／中2"])}</td>
                                    <td className="border p-2 text-center">{formatPrice(item["中3"])}</td>
                                    <td className="border p-2 text-center">{formatPrice(item["高1／高2"])}</td>
                                    <td className="border p-2 text-center">{formatPrice(item["高3／既卒"])}</td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="mb-6 flex flex-wrap gap-6">
                {/* テスト対策費用 */}
                {tuition.testPreparationData && tuition.testPreparationData.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-2">個別クラス</h2>
                        <table className="border-collapse border table-auto">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border p-2">コース</th>
                                    <th className="border p-2">中1〜中3</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tuition.testPreparationData.map((price, index) => (
                                    <tr key={index} className="odd:bg-white even:bg-gray-50">
                                        <td className="border p-2 text-center">{index + 1}セット{(index + 1) * 4}回</td>
                                        <td className="border p-2 text-center">{formatPrice(price)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* tuitionFees の表示（表形式） */}
                {tuition.tuitionFees && (
                    <div className="mb-6 overflow-x-auto">
                        <h2 className="text-xl font-semibold mb-2">その他費用</h2>
                        <table className="border-collapse border table-auto">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border p-2">項目</th>
                                    <th className="border p-2">金額</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tuition.tuitionFees.admissionFee && (
                                    <tr className="odd:bg-white even:bg-gray-50">
                                        <td className="border p-2">入会金</td>
                                        <td className="border p-2 text-center">{formatPrice(tuition.tuitionFees.admissionFee)}</td>
                                    </tr>
                                )}
                                {tuition.tuitionFees.maintenanceFee && (
                                    <tr className="odd:bg-white even:bg-gray-50">
                                        <td className="border p-2">維持費</td>
                                        <td className="border p-2 text-center">{formatPrice(tuition.tuitionFees.maintenanceFee)}</td>
                                    </tr>
                                )}
                                {tuition.tuitionFees.materialFee && (
                                    <tr className="odd:bg-white even:bg-gray-50">
                                        <td className="border p-2">教材費</td>
                                        <td className="border p-2 text-center">{formatPrice(tuition.tuitionFees.materialFee)}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

            </div>
        </div>
    );
};

export default TuitionPage;
