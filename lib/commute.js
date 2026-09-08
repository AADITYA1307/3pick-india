import { getCar } from "./cars.js";
import { araiMileageLabel } from "./carSpecs.js";
import { monthlyFuel, monthlyKm } from "./score.js";

const FUEL_NOTE = {
  petrol: "petrol @ ₹96/l",
  diesel: "diesel @ ₹89/l",
  cng: "CNG @ ₹76/kg",
  hybrid: "petrol hybrid @ ₹96/l (ARAI combined)",
  ev: "home charging @ ₹8.5/kWh",
};

export function buildCommuteSummary(answers, picks) {
  const dailyKm = Number(answers.commuteKm || 0);
  const kmMonth = monthlyKm(answers);
  const kmYear = kmMonth * 12;

  const rows = picks.map((p) => {
    const car = getCar(p.carId);
    const monthly = Math.round(monthlyFuel(car, answers));
    return {
      rank: p.rank,
      rankLabel: p.rankLabel,
      name: p.name,
      fuelLabel: FUEL_NOTE[car.fuel] || "fuel",
      araiMileage: araiMileageLabel(car),
      monthlyFuel: monthly,
      yearlyFuel: monthly * 12,
    };
  });

  return {
    dailyKm,
    kmMonth,
    kmYear,
    rows,
    assumption: "26 working days/month · illustrative pump/charging rates · commute km only (not weekend trips)",
  };
}
