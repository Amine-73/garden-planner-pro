import { useMemo, useState } from 'react';

export const useGardenData = (plants, savedGardens) => {
  const [gardenData, setGardenData] = useState({});

  const totalYield = useMemo(() => {
    return plants.reduce((acc, plant) => {
      const qty = gardenData[plant._id] || 0;
      return acc + (qty * plant.yieldPerPlantLbs);
    }, 0);
  }, [gardenData, plants]);

  const totalSavings = useMemo(() => {
    return plants.reduce((acc, plant) => {
      const qty = gardenData[plant._id] || 0;
      const price = plant.marketPricePerLb || 4.50;
      return acc + (qty * plant.yieldPerPlantLbs * price);
    }, 0);
  }, [gardenData, plants]);

  const chartData = useMemo(() => {
    return [...savedGardens]
      .reverse()
      .slice(-7)
      .map(garden => ({
        date: new Date(garden.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        savings: garden.totalEstimatedSavings
      }));
  }, [savedGardens]);

  const hasUnsavedChanges = Object.values(gardenData).some(val => val > 0);

  return { 
    gardenData, 
    setGardenData, 
    totalYield, 
    totalSavings, 
    chartData, 
    hasUnsavedChanges 
  };
};