import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';

/**
 * Firestoreの `Tuition` コレクションから登録済み教室名（ドキュメントID）を取得
 */
const ExistingLocationsList = ({ onLocationClick }) => {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'Tuition'));
        const locationNames = snapshot.docs.map((doc) => doc.id); // ドキュメントIDだけを使用
        console.log('✅ 登録済教室ID一覧:', locationNames);
        setLocations(locationNames);
      } catch (error) {
        console.error('❌ 教室一覧の取得エラー:', error);
      }
    };

    fetchLocations();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">登録済の教室一覧</h2>
      <div className="flex flex-wrap gap-2">
        {locations.map((locationName) => (
          <button
            key={locationName}
            onClick={() => onLocationClick(locationName)}
            className="px-4 py-2 bg-blue-100 text-blue-800 border border-blue-400 rounded hover:bg-blue-200"
          >
            {locationName}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ExistingLocationsList;
