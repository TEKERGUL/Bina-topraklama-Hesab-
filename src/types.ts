/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Point {
  x: number;
  y: number;
}

export interface LineSegment {
  id: string;
  points: [number, number, number, number]; // [x1, y1, x2, y2]
  length: number; // in meters
}

export enum BuildingType {
  RESIDENTIAL = 'Konut',
  INDUSTRIAL = 'Endüstriyel',
  TRANSFORMER = 'Trafo Merkezi',
  GENERATOR = 'Jeneratörlü Bina'
}

export enum SoilType {
  MARSHY = 'Bataklık (5-40 Ωm)',
  CLAY = 'Kil (20-200 Ωm)',
  SAND = 'Kum (200-2500 Ωm)',
  GRAVEL = 'Çakıl (2000-3000 Ωm)',
  ROCKY = 'Kayalık (>3000 Ωm)'
}

export const SoilResistivity: Record<SoilType, number> = {
  [SoilType.MARSHY]: 30,
  [SoilType.CLAY]: 100,
  [SoilType.SAND]: 500,
  [SoilType.GRAVEL]: 2500,
  [SoilType.ROCKY]: 4000,
};

export enum RodType {
  KÖŞEBENT = '65x65x7 mm Galvaniz Köşebent',
  BAKIR_1_5 = 'Q:20 mm L:1.5m Bakır Kaplı Çubuk',
  BAKIR_3_5 = 'Q:20 mm L:3.5m Bakır Topraklama Kazığı'
}

export enum RingMaterial {
  CU_16 = '16mm² Çıplak Bakır',
  CU_35 = '35mm² Çıplak Bakır',
  CU_50 = '50mm² Çıplak Bakır',
  CU_70 = '70mm² Çıplak Bakır',
  CU_95 = '95mm² Çıplak Bakır',
  CU_120 = '120mm² Çıplak Bakır',
  GALV_30_3_5 = '30x3.5mm Galvaniz Şerit'
}

export enum BaseMaterial {
  GALV_30_3_5 = '30x3.5mm Galvaniz Şerit',
  CU_16 = '16mm² Çıplak Bakır',
  CU_35 = '35mm² Çıplak Bakır',
  CU_50 = '50mm² Çıplak Bakır',
  CU_70 = '70mm² Çıplak Bakır',
  CU_95 = '95mm² Çıplak Bakır',
  CU_120 = '120mm² Çıplak Bakır'
}

export interface CalculationResult {
  totalResistance: number;
  requiredRods: number;
  ringResistance: number;
  baseResistance: number;
  cornerCount: number;
  internalLength: number;
  isSafe: boolean;
  equipment: {
    name: string;
    quantity: number;
    unit: string;
    description: string;
  }[];
}
