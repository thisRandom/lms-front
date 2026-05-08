<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { getDashboardStats } from '@/api/dashboard'
import { IconFile, IconCheckCircle, IconSafe, IconDriveFile } from '@arco-design/web-vue/es/icon'

const router = useRouter()

// === 统计数据 ===
const statsData = ref({
  totalOrders: 0,
  inProgressOrders: 0,
  signedOrders: 0,
  pendingOrders: 0,
})

// === 订单状态分布（饼图） ===
const orderStatusData = ref<{ name: string; value: number }[]>([])

// === 车辆状态分布（饼图） ===
const vehicleStatusData = ref<{ name: string; value: number }[]>([])

// === 货物类型分布（柱状图） ===
const goodsTypeData = ref<{ name: string; value: number }[]>([])

// === 累计发货统计 ===
const cumulativeStats = ref({
  totalWeight: 0,
  totalVolume: 0,
})

// === 加载状态 ===
const loading = ref(false)

// === 订单状态映射 ===
const orderStatusMap: Record<string, string> = {
  PENDING: '待调度',
  DISPATCHED: '已调度',
  IN_TRANSIT: '运输中',
  ARRIVED: '已到达',
  SIGNED: '已签收',
  CANCELLED: '已取消',
}

// === 车辆状态映射 ===
const vehicleStatusMap: Record<string, string> = {
  IDLE: '空闲',
  BUSY: '运输中',
  MAINTENANCE: '维修中',
  ASSIGNED: '已分配',
}

// === 获取数据 ===
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getDashboardStats()
    const data = res.data

    statsData.value = {
      totalOrders: data.totalOrders || 0,
      inProgressOrders: data.inProgressOrders || 0,
      signedOrders: data.signedOrders || 0,
      pendingOrders: data.pendingOrders || 0,
    }

    orderStatusData.value = (data.orderStatusDistribution || []).map((item: any) => ({
      name: orderStatusMap[item.status] || item.status,
      value: item.count || 0,
    }))

    vehicleStatusData.value = (data.vehicleStatusDistribution || []).map((item: any) => ({
      name: vehicleStatusMap[item.status] || item.status,
      value: item.count || 0,
    }))

    // 货物类型分布 - 合并相同类型
    const goodsMap = new Map<string, number>()
    ;(data.goodsTypeDistribution || []).forEach((item: any) => {
      const name = item.goodsType || '未知'
      const count = item.count || 0
      goodsMap.set(name, (goodsMap.get(name) || 0) + count)
    })
    goodsTypeData.value = Array.from(goodsMap.entries()).map(([name, value]) => ({
      name,
      value,
    }))

    cumulativeStats.value = {
      totalWeight: data.totalWeight || 0,
      totalVolume: data.totalVolume || 0,
    }

    // 更新图表
    updateCharts()
  } catch (error) {
    console.error('获取数据失败', error)
  } finally {
    loading.value = false
  }
}

// === 图表实例 ===
let orderChart: echarts.ECharts | null = null
let vehicleChart: echarts.ECharts | null = null
let goodsTypeChart: echarts.ECharts | null = null

// === 初始化订单状态饼图 ===
const initOrderChart = () => {
  const chartDom = document.getElementById('order-chart')
  if (!chartDom) return
  orderChart = echarts.init(chartDom)

  const option: echarts.EChartsOption = {
    title: {
      text: '订单状态分布',
      left: 'center',
      top: 10,
      textStyle: {
        fontSize: 15,
        fontWeight: 600,
        color: '#1d2129',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: 20,
      top: 'center',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        fontSize: 12,
        color: '#4e5969',
      },
    },
    color: ['#FFB020', '#165DFF', '#4080FF', '#00B42A', '#23C343', '#F53F3F'],
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['40%', '55%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
          },
        },
        data: orderStatusData.value,
      },
    ],
  }

  orderChart.setOption(option)
}

// === 初始化车辆状态饼图 ===
const initVehicleChart = () => {
  const chartDom = document.getElementById('vehicle-chart')
  if (!chartDom) return
  vehicleChart = echarts.init(chartDom)

  const option: echarts.EChartsOption = {
    title: {
      text: '车辆状态分布',
      left: 'center',
      top: 10,
      textStyle: {
        fontSize: 15,
        fontWeight: 600,
        color: '#1d2129',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: 20,
      top: 'center',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        fontSize: 12,
        color: '#4e5969',
      },
    },
    color: ['#00B42A', '#165DFF', '#FFB020'],
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['40%', '55%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
          },
        },
        data: vehicleStatusData.value,
      },
    ],
  }

  vehicleChart.setOption(option)
}

// === 初始化货物类型柱状图 ===
const initGoodsTypeChart = () => {
  const chartDom = document.getElementById('goods-type-chart')
  if (!chartDom) return
  goodsTypeChart = echarts.init(chartDom)

  const option: echarts.EChartsOption = {
    title: {
      text: '货物类型分布',
      left: 'center',
      top: 10,
      textStyle: {
        fontSize: 15,
        fontWeight: 600,
        color: '#1d2129',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      left: 50,
      right: 30,
      top: 50,
      bottom: 30,
    },
    xAxis: {
      type: 'category',
      data: goodsTypeData.value.map((item) => item.name),
      axisLabel: {
        fontSize: 12,
        color: '#4e5969',
      },
      axisLine: {
        lineStyle: {
          color: '#e5e6eb',
        },
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 12,
        color: '#4e5969',
      },
      splitLine: {
        lineStyle: {
          color: '#f2f3f5',
        },
      },
    },
    series: [
      {
        type: 'bar',
        barWidth: '50%',
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#165DFF' },
            { offset: 1, color: '#4080FF' },
          ]),
        },
        data: goodsTypeData.value.map((item) => item.value),
      },
    ],
  }

  goodsTypeChart.setOption(option)
}

// === 更新图表数据 ===
const updateCharts = () => {
  if (orderChart) {
    orderChart.setOption({
      series: [{ data: orderStatusData.value }],
    })
  }
  if (vehicleChart) {
    vehicleChart.setOption({
      series: [{ data: vehicleStatusData.value }],
    })
  }
  if (goodsTypeChart) {
    goodsTypeChart.setOption({
      xAxis: {
        data: goodsTypeData.value.map((item) => item.name),
      },
      series: [{ data: goodsTypeData.value.map((item) => item.value) }],
    })
  }
}

// === 路由跳转 ===
const goToOrder = () => router.push('/dashboard/order')
const goToVehicle = () => router.push('/dashboard/vehicle')
const goToDispatch = () => router.push('/dashboard/dispatch')

// === 窗口调整时重绘图表 ===
const handleResize = () => {
  orderChart?.resize()
  vehicleChart?.resize()
  goodsTypeChart?.resize()
}

onMounted(async () => {
  // 先初始化图表
  initOrderChart()
  initVehicleChart()
  initGoodsTypeChart()
  // 再请求数据
  await fetchData()
  window.addEventListener('resize', handleResize)
})
</script>

<template>
  <div class="dashboard-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <h2>数据概览</h2>
        <span class="date">{{ new Date().toLocaleDateString('zh-CN') }}</span>
      </div>
      <a-button type="outline" @click="fetchData">
        <template #icon><icon-refresh /></template>
        刷新
      </a-button>
    </div>

    <a-spin :loading="loading" style="width: 100%">
      <!-- 统计卡片 -->
      <div class="stats-grid">
        <div class="stat-card clickable" @click="goToOrder">
          <div class="stat-icon total">
            <icon-file />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statsData.totalOrders.toLocaleString() }}</div>
            <div class="stat-label">累计总订单</div>
          </div>
        </div>
        <div class="stat-card clickable" @click="goToOrder">
          <div class="stat-icon in-progress">
            <icon-drive-file />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statsData.inProgressOrders }}</div>
            <div class="stat-label">进行中订单</div>
          </div>
        </div>
        <div class="stat-card clickable" @click="goToOrder">
          <div class="stat-icon signed">
            <icon-check-circle />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statsData.signedOrders.toLocaleString() }}</div>
            <div class="stat-label">已签收订单</div>
          </div>
        </div>
        <div class="stat-card clickable" @click="goToOrder">
          <div class="stat-icon pending">
            <icon-safe />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statsData.pendingOrders }}</div>
            <div class="stat-label">待调度订单</div>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="charts-grid">
        <div class="chart-card clickable" @click="goToOrder">
          <div id="order-chart" class="chart-container"></div>
        </div>
        <div class="chart-card clickable" @click="goToVehicle">
          <div id="vehicle-chart" class="chart-container"></div>
        </div>
      </div>

      <!-- 下方统计区域 -->
      <div class="bottom-grid">
        <div class="chart-card wide">
          <div id="goods-type-chart" class="chart-container"></div>
        </div>
        <div class="stats-card">
          <div class="card-title">累计发货统计</div>
          <div class="cumulative-stats">
            <div class="cumulative-item">
              <div class="cumulative-value">{{ cumulativeStats.totalWeight.toLocaleString() }}</div>
              <div class="cumulative-label">累计发货重量（吨）</div>
            </div>
            <div class="cumulative-divider"></div>
            <div class="cumulative-item">
              <div class="cumulative-value">{{ cumulativeStats.totalVolume.toLocaleString() }}</div>
              <div class="cumulative-label">累计发货体积（方）</div>
            </div>
          </div>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<style scoped>
.dashboard-container {
  width: 100%;
  padding: 0;
  background: var(--color-bg-1);
  box-sizing: border-box;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.header-left h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-1);
}

.date {
  font-size: 13px;
  color: var(--color-text-3);
}

/* 统计卡片网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.stat-card {
  background: var(--color-bg-2);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s;
}

.stat-card.clickable {
  cursor: pointer;
}

.stat-card.clickable:hover {
  border-color: var(--color-primary-light-2);
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
}

.stat-icon.total {
  background: linear-gradient(135deg, #722ED1, #9254DE);
}

.stat-icon.in-progress {
  background: linear-gradient(135deg, #165DFF, #4080FF);
}

.stat-icon.signed {
  background: linear-gradient(135deg, #00B42A, #23C343);
}

.stat-icon.pending {
  background: linear-gradient(135deg, #FFB020, #FF8C00);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: var(--color-text-1);
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: var(--color-text-3);
  margin-top: 4px;
}

/* 图表网格 */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.bottom-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
}

.chart-card {
  background: var(--color-bg-2);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s;
}

.chart-card.clickable {
  cursor: pointer;
}

.chart-card.clickable:hover {
  border-color: var(--color-primary-light-2);
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.1);
}

.chart-card.wide {
  min-height: 360px;
}

.chart-container {
  width: 100%;
  height: 300px;
}

.bottom-grid .chart-container {
  height: 320px;
}

/* 累计统计卡片 */
.stats-card {
  background: var(--color-bg-2);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-1);
  margin-bottom: 24px;
}

.cumulative-stats {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.cumulative-item {
  text-align: center;
  padding: 20px 0;
}

.cumulative-value {
  font-size: 32px;
  font-weight: 700;
  color: #165DFF;
  line-height: 1.2;
}

.cumulative-label {
  font-size: 13px;
  color: var(--color-text-3);
  margin-top: 8px;
}

.cumulative-divider {
  height: 1px;
  background: var(--color-border);
  margin: 8px 0;
}
</style>