import { regionData, codeToText } from 'element-china-area-data';
import type { AreaOption } from './types';

export { codeToText };

export const areaOptions: AreaOption[] = regionData as AreaOption[];

export function buildFullAddress(
  provinceCode: string,
  cityCode: string,
  districtCode: string,
  detailAddress: string
): string {
  if (!provinceCode) return '';
  const provinceName = codeToText[provinceCode] || '';
  const cityName = codeToText[cityCode] || '';
  const districtName = codeToText[districtCode] || '';
  return `${provinceName}${cityName}${districtName}${detailAddress}`;
}
