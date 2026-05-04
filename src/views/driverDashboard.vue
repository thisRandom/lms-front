<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getVehicleList } from '@/api/vehicles'
import { getDispatchList } from '@/api/dispatches'
import type { VehicleListItem } from '@/api/vehicles'
import type { DispatchListItem } from '@/api/dispatches'

const router = useRouter()

// 我的车辆列表
const myVehicles = ref<VehicleListItem[]>([])
const vehicleLoading = ref(false)

// 我的任务列表
const myTasks = ref<DispatchListItem[]>([])
const taskLoading = ref(false)

const fetchMyVehicles = async () => {
  vehicleLoading.value = true
  try {
    const res = await getVehicleList({ page: 1, size: 100 })
    myVehicles.value = res.data.records
  } catch (error) {
    console.error('获取车辆信息失败', error)
  } finally {
    vehicleLoading.value = false
  }
}

const fetchMyTasks = async () => {
  taskLoading.value = true
  try {
    const res = await getDispatchList({ page: 1, size: 100 })
    myTasks.value = res.data.records.filter(
      (item: DispatchListItem) => ['ASSIGNED', 'IN_TRANSIT', 'ARRIVED'].includes(item.status)
    )
  } catch (error) {
    console.error('获取任务信息失败', error)
  } finally {
    taskLoading.value = false
  }
}

const getStatusName = (status: string) => {
  const map: Record<string, string> = {
    ASSIGNED: '待发车',
    IN_TRANSIT: '运输中',
    ARRIVED: '已到达',
    SIGNED: '已签收',
  }
  return map[status] || status
}

const getStatusColor = (status: string) => {
  const map: Record<string, string> = {
    ASSIGNED: 'blue',
    IN_TRANSIT: 'orange',
    ARRIVED: 'green',
    SIGNED: 'green',
  }
  return map[status] || 'gray'
}

const getVehicleStatusName = (status: string) => {
  const map: Record<string, string> = {
    IDLE: '空闲',
    BUSY: '运输中',
    MAINTENANCE: '维修中',
  }
  return map[status] || status
}

const getVehicleStatusColor = (status: string) => {
  const map: Record<string, string> = {
    IDLE: 'green',
    BUSY: 'blue',
    MAINTENANCE: 'orange',
  }
  return map[status] || 'gray'
}

const vehicleTypeMap: Record<string, string> = {
  TRUCK: '货车（大型）',
  VAN: '厢式货车（中型）',
  PICKUP: '皮卡（小型）',
}

const getVehicleTypeName = (type: string) => vehicleTypeMap[type] || type || '未知'

onMounted(() => {
  fetchMyVehicles()
  fetchMyTasks()
})
</script>

<template>
  <div class="driver-dashboard">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <h2>我的工作台</h2>
      </div>
    </div>

    <!-- 我的车辆列表 -->
    <div class="section-card">
      <div class="section-header">
        <h3>我的车辆</h3>
        <a-button type="text" size="small" @click="router.push('/dashboard/my-vehicle')">
          查看全部 <icon-right />
        </a-button>
      </div>
      <a-spin :loading="vehicleLoading">
        <div v-if="myVehicles.length > 0" class="vehicle-grid">
          <div v-for="vehicle in myVehicles" :key="vehicle.id" class="vehicle-card">
            <div class="vehicle-header">
              <span class="plate-number">{{ vehicle.plateNumber }}</span>
              <a-tag :color="getVehicleStatusColor(vehicle.status)" size="small">
                {{ getVehicleStatusName(vehicle.status) }}
              </a-tag>
            </div>
            <div class="vehicle-body">
              <span class="info-item">
                <span class="info-label">车型</span>
                <span class="info-value">{{ getVehicleTypeName(vehicle.vehicleType) }}</span>
              </span>
              <span class="info-item">
                <span class="info-label">载重</span>
                <span class="info-value">{{ vehicle.loadCapacity }} 吨</span>
              </span>
              <span class="info-item">
                <span class="info-label">容积</span>
                <span class="info-value">{{ vehicle.volume }} 方</span>
              </span>
              <span class="info-item">
                <span class="info-label">司机</span>
                <span class="info-value">{{ vehicle.driverName || '-' }}</span>
              </span>
            </div>
          </div>
        </div>
        <div v-else class="empty-tip">
          暂未绑定车辆
        </div>
      </a-spin>
    </div>

    <!-- 我的任务列表 -->
    <div class="section-card">
      <div class="section-header">
        <h3>我的任务</h3>
        <a-button type="text" size="small" @click="router.push('/dashboard/dispatch')">
          查看全部 <icon-right />
        </a-button>
      </div>
      <a-spin :loading="taskLoading">
        <div v-if="myTasks.length > 0" class="task-list">
          <div v-for="task in myTasks" :key="task.id" class="task-item">
            <div class="task-main">
              <div class="task-no">
                <span class="dispatch-no">{{ task.dispatchNo }}</span>
                <a-tag :color="getStatusColor(task.status)" size="small">
                  {{ getStatusName(task.status) }}
                </a-tag>
              </div>
              <div class="task-route">
                <span>{{ task.orderNo }}</span>
              </div>
            </div>
            <div class="task-detail">
              <div class="detail-item">
                <icon-location />
                <span>{{ task.currentLocation || '暂无位置信息' }}</span>
              </div>
              <div class="detail-item" v-if="task.estimatedArrivalTime">
                <icon-clock />
                <span>预计 {{ task.estimatedArrivalTime }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-tip">
          暂无进行中的任务
        </div>
      </a-spin>
    </div>
  </div>
</template>

<style scoped>
.driver-dashboard {
  padding: 0;
  background: var(--color-bg-1);
}

.page-header {
  margin-bottom: 20px;
}

.header-left h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-1);
}

.section-card {
  background: var(--color-bg-2);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-1);
}

/* 车辆信息 */
/* 车辆列表 */
.vehicle-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.vehicle-card {
  background: var(--color-bg-1);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 16px;
  transition: all 0.2s;
}

.vehicle-card:hover {
  border-color: var(--color-primary-light-2);
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.08);
}

.vehicle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
}

.plate-number {
  font-size: 16px;
  font-weight: 600;
  font-family: 'Monaco', 'Menlo', monospace;
  color: var(--color-text-1);
}

.vehicle-body {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: var(--color-text-3);
}

.info-value {
  font-size: 14px;
  color: var(--color-text-1);
  font-weight: 500;
}

.empty-tip {
  text-align: center;
  padding: 32px 0;
  color: var(--color-text-3);
  font-size: 14px;
}

/* 任务列表 */
.task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  background: var(--color-bg-1);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 14px 16px;
  transition: all 0.2s;
}

.task-item:hover {
  border-color: var(--color-primary-light-2);
}

.task-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.task-no {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dispatch-no {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-1);
}

.task-route {
  font-size: 13px;
  color: var(--color-text-2);
}

.task-detail {
  display: flex;
  gap: 24px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-text-3);
}
</style>