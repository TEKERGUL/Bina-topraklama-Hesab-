/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  CalculationResult, 
  SoilResistivity, 
  SoilType, 
  BuildingType, 
  RodType, 
  RingMaterial, 
  BaseMaterial 
} from '../types';

/**
 * Elektrik Tesislerinde Topraklamalar Yönetmeliği'ne uygun detaylı hesaplamalar.
 */
export function calculateEarthing(
  area: number, // m^2
  perimeter: number, // m
  soilType: SoilType,
  buildingType: BuildingType,
  rodType: RodType,
  userRodCount: number,
  ringMaterial: RingMaterial,
  baseMaterial: BaseMaterial,
  internalLength: number = 0,
  cornerCount: number = 0,
  customRho?: number
): CalculationResult {
  const rho = customRho || SoilResistivity[soilType];
  
  // Total strip length includes perimeter and internal segments
  const totalStripLength = perimeter + internalLength;

  // 1. Temel Topraklama Direnci (İşletme) - Laurent & Niemann (Grid Resistance)
  const equivalentDiameterBase = 2 * Math.sqrt(area / Math.PI);
  const basePart1 = rho / (2 * equivalentDiameterBase);
  const basePart2 = totalStripLength > 0 ? (rho / totalStripLength) : 0;
  const baseResistance = basePart1 + basePart2;

  // 2. Çevre Topraklama (Koruma)
  const ringArea = area * 1.3; 
  const equivalentDiameterRing = 2 * Math.sqrt(ringArea / Math.PI);
  let ringResistance = rho / (2 * equivalentDiameterRing);

  // 3. Kazık Direnci
  let rodLength = 1.5;
  let rodDiameter = 0.02;
  
  if (rodType === RodType.KÖŞEBENT) {
    rodLength = 1.5; 
    rodDiameter = 0.065;
  } else if (rodType === RodType.BAKIR_3_5) {
    rodLength = 3.5;
    rodDiameter = 0.02;
  }

  const singleRodResistance = (rho / (2 * Math.PI * rodLength)) * (Math.log((4 * rodLength) / rodDiameter));
  const totalRodResistance = userRodCount > 0 ? (singleRodResistance / (userRodCount * 0.9)) : Infinity;

  // 4. Toplam Eşdeğer Direnç (Paralel Bağlantı)
  const totalResistance = 1 / (1 / baseResistance + 1 / ringResistance + 1 / totalRodResistance);

  let limitResistance = 2.0; 
  if (buildingType === BuildingType.TRANSFORMER) limitResistance = 1.0;
  if (buildingType === BuildingType.GENERATOR) limitResistance = 1.5;

  const equipment: CalculationResult['equipment'] = [
    {
      name: baseMaterial as string,
      quantity: Math.ceil(totalStripLength * 1.1),
      unit: 'mt',
      description: 'İç temel ve bölme topraklaması için sıcak daldırma galvaniz şerit.'
    },
    {
      name: ringMaterial as string,
      quantity: Math.ceil(perimeter * 1.4),
      unit: 'mt',
      description: 'Dış koruma halkası için çıplak örgülü bakır.'
    },
    {
      name: 'Vidalı Topraklama Ek Elemanı',
      quantity: cornerCount,
      unit: 'Adet',
      description: 'Her dönüş noktasına ve ek yerlerine monte edilen klemens.'
    }
  ];

  if (userRodCount > 0) {
    equipment.push({
      name: rodType as string,
      quantity: userRodCount,
      unit: 'Adet',
      description: 'Direnci düşürmek için dikey yönde çakılan kazık.'
    });
    equipment.push({
      name: 'Muayene Bacası (Menhol)',
      quantity: Math.ceil(userRodCount / 2),
      unit: 'Adet',
      description: 'Kontrol ve ölçüm noktası.'
    });
  }

  equipment.push({
    name: 'Termokaynak / Bara Seti',
    quantity: Math.ceil(userRodCount + 2),
    unit: 'Takım',
    description: 'Ana bağlantı noktaları için kaynak veya bara seti.'
  });

  return {
    totalResistance: Number(totalResistance.toFixed(2)),
    requiredRods: userRodCount,
    ringResistance: Number(ringResistance.toFixed(2)),
    baseResistance: Number(baseResistance.toFixed(2)),
    cornerCount,
    internalLength,
    isSafe: totalResistance <= limitResistance,
    equipment
  };
}
