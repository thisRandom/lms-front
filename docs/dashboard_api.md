# Dashboard 可视化 API 文档

## 一、现有 API（已对接）

### 1.1 订单管理 `/api/orders`

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 订单列表 | GET | `/orders` | 分页查询，支持 `page`, `size`, `orderNo`, `status`, `startDate`, `endDate` |
| 订单详情 | GET | `/orders/{id}` | 获取单个订单详情 |
| 创建订单 | POST | `/orders` | 新增订单 |
| 更新订单 | PUT | `/orders/{id}` | 编辑订单 |
| 取消订单 | PUT | `/orders/{id}/cancel` | 取消订单 |

### 1.2 车辆管理 `/api/vehicles`

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 车辆列表 | GET | `/vehicles` | 分页查询，支持 `page`, `size`, `keyword`, `vehicleType`, `status` |
| 空闲车辆 | GET | `/vehicles/idle` | 获取所有空闲车辆 |
| 新增车辆 | POST | `/vehicles` | 新增车辆 |
| 编辑车辆 | PUT | `/vehicles/{id}` | 编辑车辆信息 |
| 删除车辆 | DELETE | `/vehicles/{id}` | 删除车辆 |

### 1.3 调度管理 `/api/dispatches`

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 调度列表 | GET | `/dispatches` | 分页查询，支持 `page`, `size`, `dispatchNo`, `status` |
| 调度详情 | GET | `/dispatches/{id}` | 获取调度详情 |
| 创建调度 | POST | `/dispatches` | 新增调度单 |
| 调度签收 | PUT | `/dispatches/{id}/sign` | 确认签收 |
| 更新状态 | PUT | `/dispatches/{id}/status` | 更新调度状态 |

---

## 二、Dashboard 可视化需新增 API

### 2.1 数据概览统计 `GET /dashboard/stats`

**接口说明**：获取管理员/调度员首页的汇总统计数据

**请求参数**：无

**响应字段**：

```typescript
interface DashboardStatsResponse {
  // 订单统计
  totalOrders: number;           // 累计总订单数
  inProgressOrders: number;      // 进行中订单数（DISPATCHED + IN_TRANSIT + ARRIVED）
  signedOrders: number;          // 已签收订单数（SIGNED）
  pendingOrders: number;         // 待调度订单数（PENDING）

  // 订单状态分布
  orderStatusDistribution: {
    status: string;      // PENDING/DISPATCHED/IN_TRANSIT/ARRIVED/SIGNED/CANCELLED
    count: number;       // 该状态订单数量
  }[];

  // 车辆状态分布
  vehicleStatusDistribution: {
    status: string;      // IDLE/BUSY/MAINTENANCE
    count: number;       // 该状态车辆数量
  }[];

  // 累计发货统计
  totalWeight: number;   // 累计发货重量（吨）
  totalVolume: number;   // 累计发货体积（方）

  // 货物类型分布
  goodsTypeDistribution: {
    goodsType: string;    // 货物类型名称
    count: number;        // 该类型订单数量
  }[];
}
```

**响应示例**：

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "totalOrders": 1256,
    "inProgressOrders": 45,
    "signedOrders": 892,
    "pendingOrders": 23,
    "orderStatusDistribution": [
      { "status": "PENDING", "count": 23 },
      { "status": "DISPATCHED", "count": 15 },
      { "status": "IN_TRANSIT", "count": 30 },
      { "status": "ARRIVED", "count": 45 },
      { "status": "SIGNED", "count": 892 },
      { "status": "CANCELLED", "count": 12 }
    ],
    "vehicleStatusDistribution": [
      { "status": "IDLE", "count": 28 },
      { "status": "BUSY", "count": 25 },
      { "status": "MAINTENANCE", "count": 9 }
    ],
    "totalWeight": 12580,
    "totalVolume": 45280,
    "goodsTypeDistribution": [
      { "goodsType": "电子产品", "count": 256 },
      { "goodsType": "服装鞋帽", "count": 198 },
      { "goodsType": "食品饮料", "count": 156 },
      { "goodsType": "家具家居", "count": 89 },
      { "goodsType": "其他", "count": 67 }
    ]
  }
}
```

---

## 三、前端 API 文件更新

### 3.1 新建 `src/api/dashboard.ts`

```typescript
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
```

---

## 四、状态码参考

### 4.1 订单状态（ord_order.status）
| 状态码 | 说明 |
|--------|------|
| PENDING | 待调度 |
| DISPATCHED | 已调度 |
| IN_TRANSIT | 运输中 |
| ARRIVED | 已到达 |
| SIGNED | 已签收 |
| CANCELLED | 已取消 |

### 4.2 车辆状态（veh_vehicle.status）
| 状态码 | 说明 |
|--------|------|
| IDLE | 空闲 |
| BUSY | 运输中 |
| MAINTENANCE | 维修中 |

### 4.3 调度状态（dis_dispatch.status）
| 状态码 | 说明 |
|--------|------|
| ASSIGNED | 已分配 |
| IN_TRANSIT | 运输中 |
| ARRIVED | 已到达 |
| SIGNED | 已签收 |
| CANCELLED | 已取消 |