/** Mock weather service — swap the body for a real API call later. */
export interface DayWeather {
  temperature: number;
  windSpeed: number; // m/s
  rainProbability: number; // %
}

export async function fetchDayWeather(day: number): Promise<DayWeather> {
  await new Promise((r) => setTimeout(r, 500 + Math.random() * 400));
  // Day 2 is deliberately windy so the AI alert can be demonstrated.
  const windy = day === 2;
  return {
    temperature: 16 + ((day * 3) % 7),
    windSpeed: windy ? 12 : 3 + ((day * 2) % 5),
    rainProbability: windy ? 60 : (day * 17) % 40,
  };
}

export const HIGH_WIND = 10;
