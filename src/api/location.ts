import request, { type HttpResponse } from '@/utils/request';

export interface LocationPoint {
  id: number;
  dispatchId: number;
  latitude: number;
  longitude: number;
  location?: string;
  recordTime: string;
}

export interface ReportLocationData {
  dispatchId: number;
  latitude: number;
  longitude: number;
  location?: string;
}

export function reportLocation(data: ReportLocationData) {
  return request.post<any, HttpResponse>('/locations', data);
}

export function getDispatchLocations(dispatchId: number) {
  return request.get<any, HttpResponse<LocationPoint[]>>(`/dispatches/${dispatchId}/locations`);
}