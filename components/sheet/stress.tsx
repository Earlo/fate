import { useState } from 'react';

const Stress: React.FC = () => {
  const [physicalStress, setPhysicalStress] = useState([false, false, false]);
  const [mentalStress, setMentalStress] = useState([false, false, false]);

  const toggleStress = (index: number, type: 'physical' | 'mental') => {
    if (type === 'physical') {
      setPhysicalStress((prev) =>
        prev.map((val, i) => (i === index ? !val : val)),
      );
    } else {
      setMentalStress((prev) =>
        prev.map((val, i) => (i === index ? !val : val)),
      );
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex space-x-2">
        <span>Physical:</span>
        {physicalStress.map((stressed, index) => (
          <input
            key={index}
            type="checkbox"
            checked={stressed}
            onChange={() => toggleStress(index, 'physical')}
            className="form-checkbox h-5 w-5"
          />
        ))}
      </div>
      <div className="flex space-x-2">
        <span>Mental:</span>
        {mentalStress.map((stressed, index) => (
          <input
            key={index}
            type="checkbox"
            checked={stressed}
            onChange={() => toggleStress(index, 'mental')}
            className="form-checkbox h-5 w-5"
          />
        ))}
      </div>
    </div>
  );
};

export default Stress;
