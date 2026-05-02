import request, { type HttpResponse } from '@/utils/request';

export interface DispatchListParams {
  page?: number;
  size?: number;
  dispatchNo?: string;
  status?: string;
}

export interface DispatchListItem {
  id: number;
  dispatchNo: string;
  orderNo: string;
  plateNumber: string;
  driverName: string;
  status: string;
  currentLocation: string;
  estimatedDepartureTime: string;
  estimatedArrivalTime: string;
}

export interface DispatchListResponse {
  total: number;
  pages: number;
  current: number;
  records: DispatchListItem[];
}

export function getDispatchList(params: DispatchListParams) {
  return request.get<any, HttpResponse<DispatchListResponse>>('/dispatches', { params });
}

export interface CreateDispatchData {
  orderId: number;
  vehicleId: number;
  driverId: number;
  estimatedDepartureTime: string;
  estimatedArrivalTime: string;
  remark?: string;
}

export function createDispatch(data: CreateDispatchData) {
  return request.post<any, HttpResponse>('/dispatches', data);
}
