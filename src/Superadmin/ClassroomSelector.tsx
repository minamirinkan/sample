import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const ClassroomSelector: React.FC<{ yyyyMM: string; onSelect: (loc: string) => void }> = ({ yyyyMM, onSelect }) => {
    const [locations, setLocations] = useState<string[]>([]);

    useEffect(() => {
        const fetchLocations = async () => {
            const colRef = collection(db, "FeeMaster");
            const snapshot = await getDocs(colRef);
            const codes = snapshot.docs
                .map((doc) => doc.id) // "202509_000"
                .filter((id) => id.startsWith(yyyyMM)) // 今の年月だけに絞る
                .map((id) => id.split("_")[1]); // "000" 部分だけ取る
            setLocations(codes);
        };

        fetchLocations();
    }, [yyyyMM]);

    return (
        <div className="flex gap-2 mt-4">
            {locations.map((loc) => (
                <button
                    key={loc}
                    onClick={() => onSelect(loc)}
                    className="px-3 py-1 border rounded bg-blue-100 hover:bg-blue-200"
                >
                    {loc}
                </button>
            ))}
        </div>
    );
};

export default ClassroomSelector;
