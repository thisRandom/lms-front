import request, { type HttpResponse } from '@/utils/request';

export interface OrderStatusItem {
  status: string;
  count: number;
}

export interface VehicleStatusItem {
  status: string;
  count: number;
}

export interface GoodsTypeItem {
  goodsType: string;
  count: number;
}

export interface DashboardStatsResponse {
  totalOrders: number;
  inProgressOrders: number;
  signedOrders: number;
  pendingOrders: number;
  orderStatusDistribution: OrderStatusItem[];
  vehicleStatusDistribution: VehicleStatusItem[];
  totalWeight: number;
  totalVolume: number;
  goodsTypeDistribution: GoodsTypeItem[];
}

export function getDashboardStats() {
  return request.get<any, HttpResponse<DashboardStatsResponse>>('/dashboard/stats');
}
