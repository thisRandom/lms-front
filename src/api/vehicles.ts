import request, { type HttpResponse } from '@/utils/request';

// 车辆列表查询参数
export interface VehicleListParams {
  page?: number;
  size?: number;
  keyword?: string;
  vehicleType?: string;
  status?: string;
}

// 车辆列表项数据类型
export interface VehicleListItem {
  id: number;
  plateNumber: string;
  vehicleType: string;
  loadCapacity: number;
  driverId: number;
  driverName: string;
  driverPhone: string;
  status: string;
  lastLocation: string;
  lastUpdateTime: string;
}

export interface VehicleListResponse {
  total: number;
  pages: number;
  current: number;
  records: VehicleListItem[];
}

// 车辆列表接口 (4.1)
export function getVehicleList(params: VehicleListParams) {
    return request.get<any, HttpResponse<VehicleListResponse>>('/vehicles', { params });
}

// 新增车辆接口
export function addVehicle(data: {
    plateNumber: string;
    vehicleType: string;
    loadCapacity: number;
    driverId: number;
    status: string;
}) {
    return request.post<any, HttpResponse>('/vehicles', data);
}

// 更新车辆状态接口
export function updateVehicleStatus(vehicleId: number, status: string) {
    return request.put<any, HttpResponse>(`/vehicles/${vehicleId}/status`, { status });
}

// 编辑车辆接口
export function updateVehicle(vehicleId: number, data: {
    plateNumber?: string;
    vehicleType?: string;
    loadCapacity?: number;
    driverId?: number;
}) {
    return request.put<any, HttpResponse>(`/vehicles/${vehicleId}`, data);
}

// 删除车辆接口
export function deleteVehicle(vehicleId: number) {
    return request.delete<any, HttpResponse>(`/vehicles/${vehicleId}`);
}
