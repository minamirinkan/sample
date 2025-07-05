import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const ExistingLocationsList = ({ onLocationClick }) => {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, 'tuitionSettings'));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("TuitionDetails データ確認:", data);
      setLocations(data);
    };

    
    fetchData();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">登録済の教室一覧</h2>
      <div className="flex flex-wrap gap-2">
        {locations.map((loc) => (
          <button
            key={loc.id}
            onClick={() => onLocationClick(loc.registrationLocation)}
            className="px-4 py-2 bg-blue-100 text-blue-800 border border-blue-400 rounded hover:bg-blue-200"
          >
            {loc.registrationLocation}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ExistingLocationsList;
