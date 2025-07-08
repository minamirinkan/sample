import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const ExistingPeriodTimeList = ({ onLocationClick }) => {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const fetchLocations = async () => {
      const snapshot = await getDocs(collection(db, 'PeriodTimes'));
      setLocations(snapshot.docs.map(doc => doc.id));
    };
    fetchLocations();
  }, []);

  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold mb-2">登録済みの地名一覧</h2>
      <div className="flex flex-wrap gap-2">
        {locations.map((name) => (
          <button
          type="button"
            key={name}
            onClick={() => onLocationClick(name)}
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-1 rounded hover:bg-green-200"
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ExistingPeriodTimeList;
