/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface StackEffectResult {
  height: number;
  stackPressure: number;
  windPressure: number;
  totalPressure: number;
}

export interface SimulationParams {
  floors: number;
  floorHeight: number;
  tempIn: number;
  tempOut: number;
  windSpeed: number;
  windAngle: number;
  nplRatio: number; // Neutral Pressure Level ratio (0 to 1)
}

/**
 * Calculates the stack effect and wind pressure based on ASHRAE fundamentals.
 */
export function calculateStackEffect(params: SimulationParams): StackEffectResult[] {
  const { floors, floorHeight, tempIn, tempOut, windSpeed, windAngle, nplRatio } = params;
  const totalHeight = floors * floorHeight;
  const hNpl = totalHeight * nplRatio;

  // Constants
  const g = 9.80665; // Gravity (m/s2)
  const R = 287.058; // Gas constant for dry air (J/kg·K)
  const P_std = 101325; // Standard atmospheric pressure (Pa)

  // Convert to Kelvin
  const Ti = tempIn + 273.15;
  const To = tempOut + 273.15;

  // Densities (simplified ideal gas law)
  const rho_i = P_std / (R * Ti);
  const rho_o = P_std / (R * To);

  // ASHRAE Wind Coefficients (Simplified for a rectangular building)
  // Wind pressure = Cp * 0.5 * rho_o * V^2
  const rad = (windAngle * Math.PI) / 180;
  // Cp varies with angle: simplified model
  const cp = 0.8 * Math.cos(rad) + 0.1;

  const results: StackEffectResult[] = [];

  for (let floor = 0; floor <= floors; floor++) {
    const h = floor * floorHeight;

    // Stack pressure at height h relative to indoor pressure
    // ∆Ps = (ρo - ρi) * g * (h - h_npl)
    const stackPressure = (rho_o - rho_i) * g * (h - hNpl);

    // Wind pressure at height h (including power law for vertical profile)
    // V_h = V_ref * (h/h_ref)^alpha
    const alpha = 0.22; // Typical for urban areas/coastal cities like BC
    const vH = windSpeed * Math.pow(Math.max(h, 1) / 10, alpha);
    const windPressure = cp * 0.5 * rho_o * Math.pow(vH, 2);

    results.push({
      height: h,
      stackPressure,
      windPressure,
      totalPressure: stackPressure + windPressure,
    });
  }

  return results;
}
