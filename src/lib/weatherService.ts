/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WeatherData {
  temp: number;
  windSpeed: number;
  windDirection: number;
  location: string;
}

/**
 * Fetches real-time weather for Balneário Camboriú using Open-Meteo.
 */
export async function getBalnearioWeather(): Promise<WeatherData> {
  try {
    // Balneário Camboriú coordinates
    const lat = -26.9918;
    const lon = -48.6346;

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
    );

    if (!response.ok) throw new Error('Weather API failed');

    const data = await response.json();
    const current = data.current_weather;

    return {
      temp: current.temperature,
      windSpeed: current.windspeed / 3.6, // Convert km/h to m/s
      windDirection: current.winddirection,
      location: 'Balneário Camboriú, SC',
    };
  } catch (error) {
    console.error('Failed to fetch weather:', error);
    // Fallback data
    return {
      temp: 25,
      windSpeed: 5,
      windDirection: 45,
      location: 'Balneário Camboriú (Offline/Fallback)',
    };
  }
}
