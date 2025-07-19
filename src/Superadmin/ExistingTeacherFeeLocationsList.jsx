import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

/**
 * Firestoreの `TeacherFees` コレクションから登録済み教室名（ドキュメントID）を取得
 */
const ExistingTeacherFeeLocationsList = ({ onLocationClick }) => {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'TeacherFees'));
        const locationNames = snapshot.docs.map((doc) => doc.id);
        console.log('✅ 登録済教室ID一覧（TeacherFees）:', locationNames);
        setLocations(locationNames);
      } catch (error) {
        console.error('❌ 教室一覧の取得エラー（TeacherFees）:', error);
      }
    };

    fetchLocations();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">登録済の教師給与（登録地一覧）</h2>
      <div className="flex flex-wrap gap-2">
        {locations.map((locationName) => (
          <button
          type="button"
            key={locationName}
            onClick={() => onLocationClick(locationName)}
            className="px-4 py-2 bg-green-100 text-green-800 border border-green-400 rounded hover:bg-green-200"
          >
            {locationName}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ExistingTeacherFeeLocationsList;
