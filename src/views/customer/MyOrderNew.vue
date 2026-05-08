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


    <!-- 搜索和筛选 -->

    <!-- 搜索和筛选 -->
    <a-form :model="searchForm" layout="inline" class="search-form">
      <a-form-item field="orderNo" label="订单号">
        <a-input
            v-model="searchForm.orderNo"
            placeholder="订单号"
            allow-clear
            style="width: 140px"
            @press-enter="handleSearch"
            @clear="handleSearch"
        />
      </a-form-item>
      <a-form-item field="status" label="状态">
        <a-select
            v-model="searchForm.status"
            placeholder="状态"
            allow-clear
            style="width: 120px"
            @change="handleSearch"
            @clear="handleSearch"
        >
          <a-option value="PENDING">待调度</a-option>
          <a-option value="DISPATCHED">已调度</a-option>
          <a-option value="IN_TRANSIT">运输中</a-option>
          <a-option value="ARRIVED">已到达</a-option>
          <a-option value="SIGNED">已签收</a-option>
          <a-option value="CANCELLED">已取消</a-option>
        </a-select>
      </a-form-item>
      <a-form-item field="startDate" label="开始日期">
        <a-date-picker
            v-model="searchForm.startDate"
            placeholder="开始日期"
            style="width: 130px"
            @change="handleSearch"
        />
      </a-form-item>
      <a-form-item field="endDate" label="结束日期">
        <a-date-picker
            v-model="searchForm.endDate"
            placeholder="结束日期"
            style="width: 130px"
            @change="handleSearch"
        />
      </a-form-item>
      <a-space>
        <a-button type="primary" @click="handleSearch">
          <template #icon><icon-search /></template>
          搜索
        </a-button>
        <a-button @click="handleReset">
          <template #icon><icon-refresh /></template>
          重置
        </a-button>
      </a-space>
    </a-form>

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
            <div class="status-steps" v-if="record.status !== 'CANCELLED'">
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
            <div class="status-cancelled" v-else>
              <div class="cancelled-dot">
                <icon-close />
              </div>
              <span class="cancelled-label">已取消</span>
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

          <!-- 承运信息 -->
          <div class="card-driver" v-if="record.dispatchId">
            <div class="driver-info">
              <icon-user class="driver-icon" />
              <span>点击查看详情</span>
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
        v-model:visible="previewVisible"
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
        <div class="drawer-footer">
          <a-button
              v-if="orderDetail && orderDetail.status === 'PENDING'"
              type="outline"
              @click="handleEditDrawer"
          >
            <template #icon><icon-edit /></template>
            编辑订单
          </a-button>
          <a-popconfirm
              v-if="orderDetail && orderDetail.status === 'PENDING'"
              content="确定要取消该订单吗？"
              @ok="handleCancel(orderDetail)"
          >
            <a-button type="outline" status="danger">
              取消订单
            </a-button>
          </a-popconfirm>
          <a-button
              v-if="orderDetail?.dispatch && (orderDetail.dispatch as any).status === 'ARRIVED'"
              type="primary"
              @click="showSignModal"
          >
            确认签收
          </a-button>
          <span v-if="orderDetail?.dispatch && (orderDetail.dispatch as any).status === 'SIGNED'" class="signed-tip">
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

    <!-- 编辑订单模态框 -->
    <a-modal
        v-model:visible="editModalVisible"
        title="编辑订单"
        :width="720"
        @before-ok="handleEditSubmit"
        @cancel="editModalVisible = false"
        ok-text="提交"
    >
      <a-form :model="editForm" layout="vertical">
        <a-divider orientation="center">发货与收货信息</a-divider>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="shipperName" label="发货人" required>
              <a-input v-model="editForm.shipperName" placeholder="请输入发货人姓名" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="receiverName" label="收货人" required>
              <a-input v-model="editForm.receiverName" placeholder="请输入收货人姓名" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="shipperPhone" label="发货人电话" required>
              <a-input v-model="editForm.shipperPhone" placeholder="请输入发货人电话" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="receiverPhone" label="收货人电话" required>
              <a-input v-model="editForm.receiverPhone" placeholder="请输入收货人电话" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="shipperAddress" label="发货地址" required>
              <a-input v-model="editForm.shipperAddress" placeholder="请输入发货地址" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="receiverAddress" label="收货地址" required>
              <a-input v-model="editForm.receiverAddress" placeholder="请输入收货地址" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-divider orientation="center">货物信息</a-divider>
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item field="goodsType" label="货物类型" required>
              <a-select v-model="editForm.goodsType" placeholder="请选择或输入" allow-create filterable>
                <a-option v-for="type in GOODS_TYPE_OPTIONS" :key="type" :value="type">{{ type }}</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="weight" label="重量（吨）" required>
              <a-input-number v-model="editForm.weight" placeholder="请输入重量" :min="0" :precision="2" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="volume" label="体积（方）">
              <a-input-number v-model="editForm.volume" placeholder="请输入体积" :min="0" :precision="2" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item field="remark" label="备注">
          <a-input v-model="editForm.remark" placeholder="请输入备注信息" :max-length="200" show-word-limit />
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
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import dayjs from 'dayjs';
import {
  IconSend, IconCheckCircle, IconClose, IconFile,
  IconDown, IconRight, IconUser,
  IconLocation, IconEdit
} from '@arco-design/web-vue/es/icon';

import { getOrderList, getOrderDetail, cancelOrder, updateOrder, GOODS_TYPE_OPTIONS } from '@/api/orders';
import { signForDispatch } from '@/api/dispatches';
import { getDispatchLocations } from '@/api/location';
import type { OrderListParams, OrderListItem, UpdateOrderData, OrderDetail } from '@/api/orders';
import type { LocationPoint } from '@/api/location';
import TrajectoryPreview from '@/components/TrajectoryPreview/index.vue';

const router = useRouter();

const searchForm = reactive<Omit<OrderListParams, 'page' | 'size'>>({
  orderNo: '',
  status: undefined,
  startDate: undefined,
  endDate: undefined,
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

const goToQuickOrder = () => {
  router.push('/customer/POder');
};

const handleReset = () => {
  searchForm.orderNo = '';
  searchForm.status = undefined;
  searchForm.startDate = undefined;
  searchForm.endDate = undefined;
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
      startDate: searchForm.startDate ? dayjs(searchForm.startDate).format('YYYY-MM-DD') : undefined,
      endDate: searchForm.endDate ? dayjs(searchForm.endDate).format('YYYY-MM-DD') : undefined,
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
const editModalVisible = ref(false);
const editForm = reactive({
  id: 0,
  shipperName: '',
  shipperPhone: '',
  shipperAddress: '',
  receiverName: '',
  receiverPhone: '',
  receiverAddress: '',
  goodsType: '',
  weight: 0,
  volume: 0,
  remark: '',
});
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

const handleEditDrawer = () => {
  if (!orderDetail.value) return;
  editForm.id = orderDetail.value.id;
  editForm.shipperName = orderDetail.value.shipperName;
  editForm.shipperPhone = orderDetail.value.shipperPhone;
  editForm.shipperAddress = orderDetail.value.shipperAddress;
  editForm.receiverName = orderDetail.value.receiverName;
  editForm.receiverPhone = orderDetail.value.receiverPhone;
  editForm.receiverAddress = orderDetail.value.receiverAddress;
  editForm.goodsType = orderDetail.value.goodsType;
  editForm.weight = orderDetail.value.weight;
  editForm.volume = orderDetail.value.volume;
  editForm.remark = orderDetail.value.remark || '';
  editModalVisible.value = true;
};

const handleEditSubmit = async (done: (val: boolean) => void) => {
  if (!editForm.shipperName || !editForm.shipperPhone ||
      !editForm.receiverName || !editForm.receiverPhone ||
      !editForm.shipperAddress || !editForm.receiverAddress ||
      !editForm.goodsType || !editForm.weight) {
    Message.warning('请填写完整信息');
    done(false);
    return;
  }
  try {
    const data: UpdateOrderData = {
      shipperName: editForm.shipperName,
      shipperPhone: editForm.shipperPhone,
      shipperAddress: editForm.shipperAddress,
      receiverName: editForm.receiverName,
      receiverPhone: editForm.receiverPhone,
      receiverAddress: editForm.receiverAddress,
      goodsType: editForm.goodsType,
      weight: editForm.weight,
      volume: editForm.volume || undefined,
      remark: editForm.remark || undefined,
    };
    await updateOrder(editForm.id, data);
    Message.success('编辑订单成功');
    editModalVisible.value = false;
    fetchData();
    done(true);
  } catch {
    Message.error('编辑订单失败');
    done(false);
  }
};

const handleCancel = async (order: OrderListItem | OrderDetail) => {
  try {
    await cancelOrder(order.id);
    Message.success('订单已取消');
    previewVisible.value = false;
    fetchData();
  } catch {
    Message.error('取消订单失败，请稍后重试');
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
  } catch {
    Message.error('签收失败，请重试');
  }
};

onMounted(() => {
  fetchData();
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
  border: 1px solid var(--color-border-2);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.order-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border-color: var(--color-primary-light-3);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

/* 状态步骤条 */
.status-steps {
  display: flex;
  align-items: center;
  gap: 0;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 6px;
  position: relative;
}

.step-item + .step-item {
  margin-left: 8px;
  padding-left: 8px;
}

.step-item + .step-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 1px;
  height: 14px;
  background: var(--color-border);
}

.step-dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--color-fill-1);
  border: 2px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: var(--color-text-3);
  flex-shrink: 0;
  transition: all 0.2s;
}

.step-item.active .step-dot {
  background: linear-gradient(135deg, #165DFF, #4080FF);
  border-color: #165DFF;
  color: #fff;
  box-shadow: 0 2px 8px rgba(22, 93, 255, 0.35);
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
  font-size: 12px;
  color: var(--color-text-3);
  white-space: nowrap;
  font-weight: 500;
}

.step-item.active .step-label {
  color: #165DFF;
}

.step-item.completed .step-label {
  color: #00B42A;
}

/* 取消状态 */
.status-cancelled {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cancelled-dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F53F3F, #F76969);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #fff;
  flex-shrink: 0;
}

.cancelled-label {
  font-size: 13px;
  color: #F53F3F;
  font-weight: 600;
}

.order-no {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
  color: var(--color-text-3);
  letter-spacing: 0.3px;
}

/* 地址信息 */
.card-address {
  background: var(--color-fill-1);
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 14px;
}

.address-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.address-row + .address-row {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px dashed var(--color-border);
}

.address-icon {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #fff;
  flex-shrink: 0;
  margin-top: 1px;
}

.address-icon.start {
  background: linear-gradient(135deg, #165DFF, #4080FF);
}

.address-icon.end {
  background: linear-gradient(135deg, #00B42A, #23C343);
}

.address-text {
  font-size: 13px;
  color: var(--color-text-1);
  line-height: 1.5;
}

.address-arrow {
  padding-left: 30px;
  color: var(--color-text-4);
  font-size: 12px;
}

/* 货物信息 */
.card-goods {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--color-border);
}

.goods-tag {
  background: rgba(255, 176, 32, 0.12);
  color: #FF8C00;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
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
  font-weight: 500;
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
