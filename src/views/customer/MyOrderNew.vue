<template>
  <div class="my-order-container">
    <!-- 顶部欢迎和操作区域 -->
    <div class="header-section">
      <div class="welcome">
        <h2>欢迎回来</h2>
        <p>查看和管理您的物流订单</p>
      </div>
      <a-button type="primary" @click="goToQuickOrder">
        <template #icon><icon-send /></template>
        立即下单
      </a-button>
    </div>

    <!-- 订单统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card pending" @click="filterByStatus('PENDING')">
        <div class="stat-icon">
          <icon-safe />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.pending }}</div>
          <div class="stat-label">待调度</div>
        </div>
      </div>
      <div class="stat-card in-transit" @click="filterByStatus('IN_TRANSIT')">
        <div class="stat-icon">
          <icon-location />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.inTransit }}</div>
          <div class="stat-label">运输中</div>
        </div>
      </div>
      <div class="stat-card signed" @click="filterByStatus('SIGNED')">
        <div class="stat-icon">
          <icon-check-circle />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.signed }}</div>
          <div class="stat-label">已完成</div>
        </div>
      </div>
      <div class="stat-card total">
        <div class="stat-icon">
          <icon-file />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">累计订单</div>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-section">
      <div class="status-tabs">
        <div
            v-for="tab in statusTabs"
            :key="tab.value"
            :class="['status-tab', { active: searchForm.status === tab.value }]"
            @click="handleTabChange(tab.value)"
        >
          {{ tab.label }}
        </div>
      </div>
      <a-input-search
          v-model="searchForm.orderNo"
          placeholder="搜索订单号"
          style="width: 200px"
          @search="handleSearch"
          @press-enter="handleSearch"
          search-button
      />
    </div>

    <!-- 订单卡片列表 -->
    <div class="order-list">
      <div v-if="loading" class="loading-state">
        <a-spin />
      </div>
      <div v-else-if="tableData.length === 0" class="empty-state">
        <icon-file class="empty-icon" />
        <div class="empty-text">暂无订单</div>
        <a-button type="primary" @click="goToQuickOrder">立即下单</a-button>
      </div>
      <template v-else>
        <div
            v-for="record in tableData"
            :key="record.id"
            class="order-card"
            @click="handlePreview(record)"
        >
          <!-- 状态进度条 -->
          <div class="card-header">
            <div class="status-steps">
              <div
                  v-for="(step, index) in statusSteps"
                  :key="step.key"
                  :class="['step-item', { active: isStepActive(record.status, step.key), completed: isStepCompleted(record.status, step.key) }]"
              >
                <div class="step-dot">
                  <icon-check-circle v-if="isStepCompleted(record.status, step.key)" />
                  <span v-else class="dot-number">{{ index + 1 }}</span>
                </div>
                <span class="step-label">{{ step.label }}</span>
              </div>
            </div>
            <div class="order-no">{{ record.orderNo }}</div>
          </div>

          <!-- 地址信息 -->
          <div class="card-address">
            <div class="address-row">
              <span class="address-icon start">
                <icon-send />
              </span>
              <span class="address-text">{{ record.shipperAddress }}</span>
            </div>
            <div class="address-arrow">
              <icon-down />
            </div>
            <div class="address-row">
              <span class="address-icon end">
                <icon-send />
              </span>
              <span class="address-text">{{ record.receiverAddress }}</span>
            </div>
          </div>

          <!-- 货物信息 -->
          <div class="card-goods">
            <span class="goods-tag">{{ record.goodsType }}</span>
            <span class="goods-info">{{ record.weight }}吨 / {{ record.volume }}方</span>
          </div>

          <!-- 承运信息（详情中查看） -->
          <div class="card-driver">
            <div class="driver-info">
              <icon-user class="driver-icon" />
              <span>点击查看详情获取承运信息</span>
            </div>
          </div>

          <!-- 底部信息 -->
          <div class="card-footer">
            <span class="create-time">{{ record.createTime }}</span>
            <span class="view-detail">查看详情 <icon-right /></span>
          </div>
        </div>
      </template>
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="tableData.length > 0">
      <a-pagination
          v-model:current="pagination.current"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          show-total
          show-jumper
          show-page-size
          @change="onPageChange"
          @page-size-change="onPageSizeChange"
      />
    </div>

    <!-- 订单详情抽屉 -->
    <a-drawer
        :width="560"
        title="订单详情"
        :visible="previewVisible"
        @cancel="previewVisible = false"
    >
      <a-spin :loading="!orderDetail && previewVisible || trajectoryLoading" style="width: 100%">
        <div class="order-detail" v-if="orderDetail">
          <!-- 基本信息 -->
          <div class="detail-section">
            <div class="section-title">基本信息</div>
            <div class="detail-row">
              <div class="detail-item full">
                <span class="label">订单号</span>
                <span class="value mono">{{ orderDetail.orderNo }}</span>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-item">
                <span class="label">状态</span>
                <a-tag :color="getStatusColor(orderDetail.status)">
                  {{ getStatusName(orderDetail.status) }}
                </a-tag>
              </div>
              <div class="detail-item">
                <span class="label">创建时间</span>
                <span class="value">{{ orderDetail.createTime }}</span>
              </div>
            </div>
          </div>

          <!-- 发货信息 -->
          <div class="detail-section">
            <div class="section-title">发货信息</div>
            <div class="detail-row">
              <div class="detail-item full">
                <span class="label">发货人</span>
                <span class="value">{{ orderDetail.shipperName }} {{ orderDetail.shipperPhone }}</span>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-item full">
                <span class="label">发货地址</span>
                <span class="value">{{ orderDetail.shipperAddress }}</span>
              </div>
            </div>
          </div>

          <!-- 收货信息 -->
          <div class="detail-section">
            <div class="section-title">收货信息</div>
            <div class="detail-row">
              <div class="detail-item full">
                <span class="label">收货人</span>
                <span class="value">{{ orderDetail.receiverName }} {{ orderDetail.receiverPhone }}</span>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-item full">
                <span class="label">收货地址</span>
                <span class="value">{{ orderDetail.receiverAddress }}</span>
              </div>
            </div>
          </div>

          <!-- 货物信息 -->
          <div class="detail-section">
            <div class="section-title">货物信息</div>
            <div class="detail-row">
              <div class="detail-item">
                <span class="label">货物类型</span>
                <span class="value">{{ orderDetail.goodsType }}</span>
              </div>
              <div class="detail-item">
                <span class="label">重量</span>
                <span class="value">{{ orderDetail.weight }} 吨</span>
              </div>
              <div class="detail-item">
                <span class="label">体积</span>
                <span class="value">{{ orderDetail.volume }} 方</span>
              </div>
            </div>
            <div class="detail-row" v-if="orderDetail.remark">
              <div class="detail-item full">
                <span class="label">备注</span>
                <span class="value">{{ orderDetail.remark }}</span>
              </div>
            </div>
          </div>

          <!-- 调度信息 -->
          <div class="detail-section" v-if="orderDetail.dispatch">
            <div class="section-title">调度信息</div>
            <div class="detail-row">
              <div class="detail-item full">
                <span class="label">调度单号</span>
                <span class="value mono">{{ orderDetail.dispatch.dispatchNo }}</span>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-item">
                <span class="label">车牌号</span>
                <span class="value mono">{{ orderDetail.dispatch.plateNumber || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">调度状态</span>
                <a-tag :color="getDispatchStatusColor(orderDetail.dispatch.status)">
                  {{ getDispatchStatusName(orderDetail.dispatch.status) }}
                </a-tag>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-item">
                <span class="label">司机</span>
                <span class="value">{{ orderDetail.dispatch.driverName }} {{ orderDetail.dispatch.driverPhone }}</span>
              </div>
              <div class="detail-item">
                <span class="label">当前位置</span>
                <span class="value">{{ orderDetail.dispatch.currentLocation || '-' }}</span>
              </div>
            </div>
            <div class="detail-row" v-if="orderDetail.status === 'IN_TRANSIT' || orderDetail.status === 'ARRIVED' || orderDetail.status === 'SIGNED'">
              <div class="detail-item full">
                <a-button type="outline" size="small" @click="handleShowTrajectory">
                  <template #icon><icon-location /></template>
                  查看轨迹
                </a-button>
              </div>
            </div>
          </div>
        </div>
      </a-spin>
      <template #footer>
        <div class="drawer-footer" v-if="orderDetail?.dispatch">
          <a-button
              v-if="(orderDetail.dispatch as any).status === 'ARRIVED'"
              type="primary"
              @click="showSignModal"
          >
            确认签收
          </a-button>
          <span v-else-if="(orderDetail.dispatch as any).status === 'SIGNED'" class="signed-tip">
            已签收
          </span>
        </div>
      </template>
    </a-drawer>

    <!-- 签收模态框 -->
    <a-modal
        v-model:visible="signModalVisible"
        title="确认签收"
        :width="400"
        @ok="handleSignConfirm"
        @cancel="signModalVisible = false"
        ok-text="确认"
    >
      <a-form :model="signForm" layout="vertical">
        <a-form-item label="签收人" required>
          <a-input v-model="signForm.signName" placeholder="请输入签收人姓名" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 轨迹预览 -->
    <TrajectoryPreview
        v-model:visible="trajectoryVisible"
        :points="trajectoryPoints"
        height="400px"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import {
  IconSend, IconCheckCircle, IconFile,
  IconDown, IconRight, IconUser,
  IconLocation, IconSafe
} from '@arco-design/web-vue/es/icon';

import { getOrderList, getOrderDetail, cancelOrder } from '@/api/orders';
import { signForDispatch } from '@/api/dispatches';
import { getDispatchLocations } from '@/api/location';
import type { OrderListParams, OrderListItem, OrderDetail } from '@/api/orders';
import type { LocationPoint } from '@/api/location';
import TrajectoryPreview from '@/components/TrajectoryPreview/index.vue';

const router = useRouter();

const searchForm = reactive<Omit<OrderListParams, 'page' | 'size'>>({
  orderNo: '',
  status: undefined,
});

const loading = ref(false);
const tableData = ref<OrderListItem[]>([]);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showJumper: true,
  showPageSize: true,
});

// 统计数据
const stats = reactive({
  pending: 0,
  inTransit: 0,
  signed: 0,
  total: 0,
});

const statusTabs = [
  { label: '全部', value: undefined },
  { label: '待调度', value: 'PENDING' },
  { label: '运输中', value: 'IN_TRANSIT' },
  { label: '已完成', value: 'SIGNED' },
];

const statusSteps = [
  { key: 'PENDING', label: '待调度' },
  { key: 'DISPATCHED', label: '已调度' },
  { key: 'IN_TRANSIT', label: '运输中' },
  { key: 'ARRIVED', label: '已到达' },
  { key: 'SIGNED', label: '已签收' },
];

const statusOrder = ['PENDING', 'DISPATCHED', 'IN_TRANSIT', 'ARRIVED', 'SIGNED', 'CANCELLED'];

const isStepCompleted = (currentStatus: string, stepKey: string) => {
  const currentIndex = statusOrder.indexOf(currentStatus);
  const stepIndex = statusOrder.indexOf(stepKey);
  if (currentStatus === 'CANCELLED') return stepKey === 'PENDING';
  return stepIndex < currentIndex;
};

const isStepActive = (currentStatus: string, stepKey: string) => {
  return currentStatus === stepKey;
};

const statusMap: Record<string, string> = {
  PENDING: '待调度',
  DISPATCHED: '已调度',
  IN_TRANSIT: '运输中',
  ARRIVED: '已到达',
  SIGNED: '已签收',
  CANCELLED: '已取消',
};

const getStatusName = (code: string) => statusMap[code] || code;
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    PENDING: 'blue',
    DISPATCHED: 'cyan',
    IN_TRANSIT: 'orange',
    ARRIVED: 'green',
    SIGNED: 'green',
    CANCELLED: 'red',
  };
  return colors[status] || 'gray';
};

const dispatchStatusMap: Record<string, string> = {
  ASSIGNED: '已分配',
  IN_TRANSIT: '运输中',
  ARRIVED: '已到达',
  SIGNED: '已签收',
  EXCEPTION: '异常',
  CANCELLED: '已取消',
};
const getDispatchStatusName = (code: string) => dispatchStatusMap[code] || code;
const getDispatchStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    ASSIGNED: 'cyan',
    IN_TRANSIT: 'orange',
    ARRIVED: 'green',
    SIGNED: 'green',
    EXCEPTION: 'red',
    CANCELLED: 'gray',
  };
  return colors[status] || 'gray';
};

const maskPhone = (phone: string) => {
  if (!phone) return '';
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};

const goToQuickOrder = () => {
  router.push('/customer/POder');
};

const filterByStatus = (status: string | undefined) => {
  searchForm.status = status;
  pagination.current = 1;
  fetchData();
};

const handleTabChange = (status: string | undefined) => {
  searchForm.status = status;
  pagination.current = 1;
  fetchData();
};

const fetchData = async () => {
  loading.value = true;
  try {
    const params: OrderListParams = {
      page: pagination.current,
      size: pagination.pageSize,
      orderNo: searchForm.orderNo || undefined,
      status: searchForm.status || undefined,
    };
    const res = await getOrderList(params);
    const { records, total, current } = res.data;
    tableData.value = records;
    pagination.total = total;
    pagination.current = current;
  } catch (error) {
    Message.error('获取订单列表失败，请重试');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 获取统计数据
const fetchStats = async () => {
  try {
    // 获取全部数据用于统计
    const res = await getOrderList({ page: 1, size: 1000 });
    const allOrders = res.data.records;
    stats.total = res.data.total;
    stats.pending = allOrders.filter((o: any) => o.status === 'PENDING').length;
    stats.inTransit = allOrders.filter((o: any) => ['DISPATCHED', 'IN_TRANSIT', 'ARRIVED'].includes(o.status)).length;
    stats.signed = allOrders.filter((o: any) => o.status === 'SIGNED').length;
  } catch (error) {
    console.error('获取统计数据失败', error);
  }
};

const handleSearch = () => {
  pagination.current = 1;
  fetchData();
};

const onPageChange = (current: number) => {
  pagination.current = current;
  fetchData();
};

const onPageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize;
  pagination.current = 1;
  fetchData();
};

const previewVisible = ref(false);
const currentOrder = ref<OrderListItem | null>(null);
const orderDetail = ref<OrderDetail | null>(null);
const signModalVisible = ref(false);
const signForm = reactive({ signName: '' });
const signDispatchId = ref<number | null>(null);
const trajectoryVisible = ref(false);
const trajectoryPoints = ref<LocationPoint[]>([]);
const trajectoryLoading = ref(false);

const handlePreview = async (record: OrderListItem) => {
  currentOrder.value = record;
  previewVisible.value = true;
  try {
    const res = await getOrderDetail(record.id);
    orderDetail.value = res.data;
  } catch {
    orderDetail.value = null;
  }
};

const handleShowTrajectory = async () => {
  if (!orderDetail.value?.dispatch?.id) return;
  trajectoryVisible.value = true;
  trajectoryLoading.value = true;
  trajectoryPoints.value = [];
  try {
    const res = await getDispatchLocations(orderDetail.value.dispatch.id);
    trajectoryPoints.value = res.data || [];
  } catch {
    Message.error('获取轨迹信息失败');
  } finally {
    trajectoryLoading.value = false;
  }
};

const showSignModal = () => {
  if (!orderDetail.value?.dispatch) return;
  signDispatchId.value = (orderDetail.value.dispatch as any).id;
  signForm.signName = orderDetail.value.receiverName;
  signModalVisible.value = true;
};

const handleSignConfirm = async () => {
  if (!signDispatchId.value || !signForm.signName.trim()) {
    Message.warning('请输入签收人姓名');
    return;
  }
  try {
    await signForDispatch(signDispatchId.value, { signName: signForm.signName.trim() });
    Message.success('签收成功');
    signModalVisible.value = false;
    previewVisible.value = false;
    fetchData();
    fetchStats();
  } catch {
    Message.error('签收失败，请重试');
  }
};

onMounted(() => {
  fetchData();
  fetchStats();
});
</script>

<style scoped>
.my-order-container {
  padding: 20px;
  background-color: var(--color-bg-1);
  min-height: 100%;
}

/* 头部区域 */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.welcome h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-1);
}

.welcome p {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--color-text-3);
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  background: var(--color-bg-2);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: var(--color-primary-light-2);
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #fff;
}

.stat-card.pending .stat-icon {
  background: linear-gradient(135deg, #FFB020, #FF8C00);
}

.stat-card.in-transit .stat-icon {
  background: linear-gradient(135deg, #165DFF, #4080FF);
}

.stat-card.signed .stat-icon {
  background: linear-gradient(135deg, #00B42A, #23C343);
}

.stat-card.total .stat-icon {
  background: linear-gradient(135deg, #722ED1, #9254DE);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-1);
  line-height: 1;
}

.stat-label {
  font-size: 13px;
  color: var(--color-text-3);
  margin-top: 4px;
}

/* 搜索区域 */
.search-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--color-bg-2);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 16px;
}

.status-tabs {
  display: flex;
  gap: 8px;
}

.status-tab {
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 14px;
  color: var(--color-text-2);
  cursor: pointer;
  transition: all 0.2s;
}

.status-tab:hover {
  color: var(--color-text-1);
  background: var(--color-fill-1);
}

.status-tab.active {
  color: #fff;
  background: linear-gradient(135deg, #165DFF, #4080FF);
}

/* 订单列表 */
.order-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  background: var(--color-bg-2);
  border: 1px solid var(--color-border);
  border-radius: 12px;
}

.empty-icon {
  font-size: 48px;
  color: var(--color-text-3);
  margin-bottom: 16px;
}

.empty-text {
  font-size: 14px;
  color: var(--color-text-3);
  margin-bottom: 16px;
}

/* 订单卡片 */
.order-card {
  background: var(--color-bg-2);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.order-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: var(--color-primary-light-2);
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

/* 状态步骤条 */
.status-steps {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
  position: relative;
}

.step-item:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 12px;
  left: calc(50% + 12px);
  width: calc(100% - 24px);
  height: 2px;
  background: var(--color-border);
}

.step-item.completed:not(:last-child)::after {
  background: linear-gradient(90deg, #00B42A, #23C343);
}

.step-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-fill-1);
  border: 2px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--color-text-3);
  position: relative;
  z-index: 1;
  transition: all 0.2s;
}

.step-item.active .step-dot {
  background: linear-gradient(135deg, #165DFF, #4080FF);
  border-color: #165DFF;
  color: #fff;
  box-shadow: 0 2px 8px rgba(22, 93, 255, 0.3);
}

.step-item.completed .step-dot {
  background: linear-gradient(135deg, #00B42A, #23C343);
  border-color: #00B42A;
  color: #fff;
}

.dot-number {
  font-size: 11px;
  font-weight: 600;
}

.step-label {
  font-size: 11px;
  color: var(--color-text-3);
  white-space: nowrap;
}

.step-item.active .step-label {
  color: #165DFF;
  font-weight: 500;
}

.step-item.completed .step-label {
  color: #00B42A;
}

.order-no {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
  color: var(--color-text-3);
  text-align: right;
}

/* 地址信息 */
.card-address {
  margin-bottom: 12px;
  padding-left: 8px;
}

.address-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.address-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #fff;
}

.address-icon.start {
  background: linear-gradient(135deg, #165DFF, #4080FF);
}

.address-icon.end {
  background: linear-gradient(135deg, #00B42A, #23C343);
}

.address-text {
  font-size: 14px;
  color: var(--color-text-1);
}

.address-arrow {
  padding-left: 24px;
  color: var(--color-text-3);
  font-size: 12px;
}

/* 货物信息 */
.card-goods {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
}

.goods-tag {
  background: var(--color-fill-1);
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  color: var(--color-text-2);
}

.goods-info {
  font-size: 13px;
  color: var(--color-text-3);
}

/* 承运信息 */
.card-driver {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
}

.driver-info,
.vehicle-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-2);
}

.driver-icon,
.vehicle-icon {
  font-size: 14px;
  color: var(--color-text-3);
}

.phone {
  color: var(--color-text-3);
}

/* 底部信息 */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.create-time {
  font-size: 12px;
  color: var(--color-text-3);
}

.view-detail {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--color-primary);
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 详情抽屉 */
.order-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-section {
  background: var(--color-fill-1);
  border-radius: 8px;
  padding: 14px 16px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-1);
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--color-border);
}

.detail-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 8px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-item {
  flex: 1;
  min-width: 130px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.detail-item.full {
  flex-basis: 100%;
}

.detail-item .label {
  font-size: 12px;
  color: var(--color-text-3);
}

.detail-item .value {
  font-size: 14px;
  color: var(--color-text-1);
}

.detail-item .value.mono {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
  letter-spacing: 0.5px;
}

.drawer-footer {
  display: flex;
  justify-content: center;
  align-items: center;
}

.signed-tip {
  color: var(--color-success);
  font-size: 14px;
}
</style>
