import request, { type HttpResponse } from '@/utils/request';

export interface OrderListParams {
  page?: number;
  size?: number;
  orderNo?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface OrderListItem {
  id: number;
  orderNo: string;
  shipperName: string;
  shipperPhone: string;
  shipperAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  goodsType: string;
  weight: number;
  volume: number;
  status: string;
  dispatchId: number | null;
  createTime: string;
}

export interface OrderListResponse {
  total: number;
  pages: number;
  current: number;
  records: OrderListItem[];
}

export function getOrderList(params: OrderListParams) {
  return request.get<any, HttpResponse<OrderListResponse>>('/orders', { params });
}

export interface CreateOrderData {
  shipperName: string;
  shipperPhone: string;
  shipperAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  goodsType: string;
  weight: number;
  volume?: number;
  remark?: string;
}

export interface CreateOrderResponse {
  id: number;
  orderNo: string;
}

export function createOrder(data: CreateOrderData) {
  return request.post<any, HttpResponse<CreateOrderResponse>>('/orders', data);
}

export function cancelOrder(orderId: number) {
  return request.put<any, HttpResponse>(`/orders/${orderId}/cancel`, {});
}

export interface UpdateOrderData {
  shipperName?: string;
  shipperPhone?: string;
  shipperAddress?: string;
  receiverName?: string;
  receiverPhone?: string;
  receiverAddress?: string;
  goodsType?: string;
  weight?: number;
  volume?: number;
  remark?: string;
}

export function updateOrder(orderId: number, data: UpdateOrderData) {
  return request.put<any, HttpResponse>(`/orders/${orderId}`, data);
}

export interface OrderDispatchInfo {
  id: number;
  dispatchNo: string;
  plateNumber: string;
  driverName: string;
  driverPhone: string;
  status: string;
  currentLocation: string;
}

export interface OrderDetail {
  id: number;
  orderNo: string;
  shipperName: string;
  shipperPhone: string;
  shipperAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  goodsType: string;
  weight: number;
  volume: number;
  status: string;
  remark: string;
  dispatch: OrderDispatchInfo | null;
  createTime: string;
}

export function getOrderDetail(orderId: number) {
  return request.get<any, HttpResponse<OrderDetail>>(`/orders/${orderId}`);
}