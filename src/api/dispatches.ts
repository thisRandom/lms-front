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

export interface DispatchDetailItem extends DispatchListItem {
  orderId: number;
  vehicleId: number;
  driverId: number;
  driverPhone: string;
  actualDepartureTime: string | null;
  actualArrivalTime: string | null;
  signName: string | null;
  remark: string;
  createTime: string;
}

export function getDispatchDetail(id: number) {
  return request.get<any, HttpResponse<DispatchDetailItem>>(`/dispatches/${id}`);
}

export function createDispatch(data: CreateDispatchData) {
  return request.post<any, HttpResponse>('/dispatches', data);
}

export interface SignData {
  signName: string;
}

export function signForDispatch(id: number, data: SignData) {
  return request.put<any, HttpResponse>(`/dispatches/${id}/sign`, data);
}

export type DispatchStatus = 'ASSIGNED' | 'IN_TRANSIT' | 'ARRIVED' | 'SIGNED' | 'CANCELLED';

export interface UpdateStatusData {
  status: DispatchStatus;
  currentLocation?: string;
}

export function updateDispatchStatus(id: number, data: UpdateStatusData) {
  return request.put<any, HttpResponse>(`/dispatches/${id}/status`, data);
}
