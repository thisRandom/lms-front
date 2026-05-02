<template>
  <div class="dispatch-manage-container">
    <a-form :model="searchForm" layout="inline" class="search-form">
      <a-form-item field="dispatchNo" label="调度单号">
        <a-input
            v-model="searchForm.dispatchNo"
            placeholder="调度单号"
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
          <a-option value="ASSIGNED">已分配</a-option>
          <a-option value="IN_TRANSIT">运输中</a-option>
          <a-option value="ARRIVED">已到达</a-option>
          <a-option value="SIGNED">已签收</a-option>
          <a-option value="CANCELLED">已取消</a-option>
        </a-select>
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

    <a-table
        row-key="id"
        :loading="loading"
        :columns="columns"
        :data="tableData"
        :pagination="pagination"
        @page-change="onPageChange"
        @page-size-change="onPageSizeChange"
    >
      <template #status="{ record }">
        <a-tag :color="getStatusColor(record.status)">
          {{ getStatusName(record.status) }}
        </a-tag>
      </template>

      <template #operations="{ record }">
        <a-button type="text" size="mini" @click="handlePreview(record)">
          <template #icon><icon-eye /></template>
          详情
        </a-button>
        <a-button
            v-if="record.status !== 'ASSIGNED' && record.status !== 'CANCELLED'"
            type="text"
            size="mini"
            @click="openTrajectoryPreview(record)"
        >
          <template #icon><icon-history /></template>
          轨迹
        </a-button>
        <!-- 司机操作按钮 -->
        <template v-if="isDriver">
          <a-button
              v-if="record.status === 'ASSIGNED'"
              type="primary"
              size="mini"
              @click="openStartTransitModal(record)"
          >
            开始运输
          </a-button>
          <template v-if="record.status === 'IN_TRANSIT'">
            <a-button
                type="primary"
                size="mini"
                status="success"
                @click="openArriveModal(record)"
            >
              到达
            </a-button>
            <a-button
                type="primary"
                size="mini"
                @click="openReportLocationModal(record)"
            >
              上报位置
            </a-button>
          </template>
        </template>
      </template>
    </a-table>

    <!-- 详情抽屉 -->
    <a-drawer
        :width="560"
        title="调度详情"
        :visible="previewVisible"
        @cancel="previewVisible = false"
    >
      <div v-if="currentDispatch" class="dispatch-detail">
        <!-- 基本信息区块 -->
        <div class="detail-section">
          <div class="section-title">基本信息</div>
          <div class="detail-row">
            <div class="detail-item full">
              <span class="label">调度单号</span>
              <span class="value mono">{{ currentDispatch.dispatchNo }}</span>
            </div>
            <div class="detail-item full">
              <span class="label">订单号</span>
              <span class="value mono">{{ currentDispatch.orderNo }}</span>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-item">
              <span class="label">状态</span>
              <a-tag :color="getStatusColor(currentDispatch.status)">
                {{ getStatusName(currentDispatch.status) }}
              </a-tag>
            </div>
            <div class="detail-item">
              <span class="label">当前位置</span>
              <span class="value">{{ currentDispatch.currentLocation || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- 车辆与司机区块 -->
        <div class="detail-section">
          <div class="section-title">车辆与司机</div>
          <div class="detail-row">
            <div class="detail-item">
              <span class="label">车牌号</span>
              <span class="value mono">{{ currentDispatch.plateNumber }}</span>
            </div>
            <div class="detail-item">
              <span class="label">司机姓名</span>
              <span class="value">{{ currentDispatch.driverName }}</span>
            </div>
            <div class="detail-item">
              <span class="label">联系电话</span>
              <span class="value">{{ currentDispatch.driverPhone || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- 时间信息区块 -->
        <div class="detail-section">
          <div class="section-title">时间信息</div>
          <div class="detail-row">
            <div class="detail-item">
              <span class="label">预计发车</span>
              <span class="value">{{ currentDispatch.estimatedDepartureTime || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">预计到达</span>
              <span class="value">{{ currentDispatch.estimatedArrivalTime || '-' }}</span>
            </div>
          </div>
          <div class="detail-row" v-if="currentDispatch.actualDepartureTime">
            <div class="detail-item">
              <span class="label">实际发车</span>
              <span class="value">{{ currentDispatch.actualDepartureTime }}</span>
            </div>
            <div class="detail-item">
              <span class="label">实际到达</span>
              <span class="value">{{ currentDispatch.actualArrivalTime || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- 签收信息区块 -->
        <div class="detail-section" v-if="currentDispatch.signName">
          <div class="section-title">签收信息</div>
          <div class="detail-row">
            <div class="detail-item full">
              <span class="label">签收人</span>
              <span class="value">{{ currentDispatch.signName }}</span>
            </div>
          </div>
        </div>

        <!-- 备注区块 -->
        <div class="detail-section" v-if="currentDispatch.remark">
          <div class="section-title">备注</div>
          <div class="detail-row">
            <div class="detail-item full">
              <span class="value remark">{{ currentDispatch.remark }}</span>
            </div>
          </div>
        </div>
      </div>
    </a-drawer>

    <!-- 开始运输模态框 -->
    <a-modal
        v-model:visible="startTransitModalVisible"
        title="开始运输"
        :width="560"
        :loading="startTransitLoading"
        @ok="handleStartTransitConfirm"
        @cancel="startTransitModalVisible = false"
        ok-text="确认"
    >
      <div class="status-modal-content">
        <div class="form-label">当前位置</div>
        <LocationPicker
            ref="startTransitLocationRef"
            :height="'280px'"
        />
      </div>
    </a-modal>

    <!-- 确认到达模态框 -->
    <a-modal
        v-model:visible="arriveModalVisible"
        title="确认到达"
        :width="560"
        :loading="arriveLoading"
        @ok="handleArriveConfirm"
        @cancel="arriveModalVisible = false"
        ok-text="确认"
    >
      <div class="status-modal-content">
        <div class="form-label">当前位置</div>
        <LocationPicker
            ref="arriveLocationRef"
            :height="'280px'"
        />
      </div>
    </a-modal>

    <!-- 上报位置模态框 -->
    <a-modal
        v-model:visible="reportLocationModalVisible"
        title="上报位置"
        :width="560"
        :loading="reportLocationLoading"
        @ok="handleReportLocationConfirm"
        @cancel="reportLocationModalVisible = false"
        ok-text="上报"
    >
      <div class="status-modal-content">
        <div class="form-label">当前位置</div>
        <LocationPicker
            ref="reportLocationRef"
            :height="'280px'"
        />
      </div>
    </a-modal>

    <!-- 轨迹预览模态框 -->
    <TrajectoryPreview
        v-model:visible="trajectoryPreviewVisible"
        :points="trajectoryPoints"
        height="500px"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import { IconSearch, IconRefresh, IconEye, IconHistory } from '@arco-design/web-vue/es/icon';
import type { TableColumnData } from '@arco-design/web-vue';
import { useUserStore } from '@/stores/user';

import { getDispatchList, getDispatchDetail, updateDispatchStatus, type DispatchListItem, type DispatchDetailItem, type DispatchListParams } from '@/api/dispatches';
import { reportLocation, getDispatchLocations, type LocationPoint } from '@/api/location';
import LocationPicker from '@/components/LocationPicker/index.vue';
import TrajectoryPreview from '@/components/TrajectoryPreview/index.vue';

const userStore = useUserStore();
const isDriver = computed(() => userStore.role === 'DRIVER');

const searchForm = reactive<Omit<DispatchListParams, 'page' | 'size'>>({
  dispatchNo: '',
  status: undefined,
});

const loading = ref(false);
const tableData = ref<DispatchListItem[]>([]);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showJumper: true,
  showPageSize: true,
});

// 详情相关
const previewVisible = ref(false);
const currentDispatch = ref<DispatchDetailItem | null>(null);

// 开始运输模态框
const startTransitModalVisible = ref(false);
const startTransitLoading = ref(false);
const startTransitRecord = ref<DispatchListItem | null>(null);
const startTransitLocationRef = ref<InstanceType<typeof LocationPicker> | null>(null);

// 确认到达模态框
const arriveModalVisible = ref(false);
const arriveLoading = ref(false);
const arriveRecord = ref<DispatchListItem | null>(null);
const arriveLocationRef = ref<InstanceType<typeof LocationPicker> | null>(null);

// 上报位置模态框
const reportLocationModalVisible = ref(false);
const reportLocationLoading = ref(false);
const reportLocationRecord = ref<DispatchListItem | null>(null);
const reportLocationRef = ref<InstanceType<typeof LocationPicker> | null>(null);

// 轨迹预览模态框
const trajectoryPreviewVisible = ref(false);
const trajectoryPoints = ref<LocationPoint[]>([]);

const statusMap: Record<string, string> = {
  ASSIGNED: '已分配',
  IN_TRANSIT: '运输中',
  ARRIVED: '已到达',
  SIGNED: '已签收',
  CANCELLED: '已取消',
};

const getStatusName = (code: string) => statusMap[code] || code;
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    ASSIGNED: 'cyan',
    IN_TRANSIT: 'orange',
    ARRIVED: 'green',
    SIGNED: 'green',
    CANCELLED: 'gray',
  };
  return colors[status] || 'gray';
};

const fetchData = async () => {
  loading.value = true;
  try {
    const params: DispatchListParams = {
      page: pagination.current,
      size: pagination.pageSize,
      dispatchNo: searchForm.dispatchNo || undefined,
      status: searchForm.status || undefined,
    };
    const res = await getDispatchList(params);
    const { records, total, current } = res.data;
    tableData.value = records;
    pagination.total = total;
    pagination.current = current;
  } catch (error) {
    Message.error('获取调度列表失败，请重试');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.current = 1;
  fetchData();
};

const handleReset = () => {
  searchForm.dispatchNo = '';
  searchForm.status = undefined;
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

const handlePreview = async (record: DispatchListItem) => {
  try {
    const res = await getDispatchDetail(record.id);
    currentDispatch.value = res.data;
    previewVisible.value = true;
  } catch (error) {
    Message.error('获取调度详情失败');
  }
};

// 司机操作：开始运输
const openStartTransitModal = (record: DispatchListItem) => {
  startTransitRecord.value = record;
  startTransitModalVisible.value = true;
};

const handleStartTransitConfirm = async () => {
  if (!startTransitRecord.value) return;

  const location = startTransitLocationRef.value?.getSelectedLocation?.();
  if (!location) {
    Message.warning('请先在地图上选择位置');
    return;
  }

  startTransitLoading.value = true;
  try {
    // 同时调用修改状态和上报位置
    await Promise.all([
      updateDispatchStatus(startTransitRecord.value.id, {
        status: 'IN_TRANSIT',
        currentLocation: location.address || `(${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)})`,
      }),
      reportLocation({
        dispatchId: startTransitRecord.value.id,
        latitude: location.latitude,
        longitude: location.longitude,
        location: location.address,
      }),
    ]);
    Message.success('已开始运输');
    startTransitModalVisible.value = false;
    fetchData();
    if (previewVisible.value && currentDispatch.value?.id === startTransitRecord.value.id) {
      const res = await getDispatchDetail(startTransitRecord.value.id);
      currentDispatch.value = res.data;
    }
  } catch (error) {
    Message.error('操作失败，请重试');
  } finally {
    startTransitLoading.value = false;
  }
};

// 司机操作：确认到达
const openArriveModal = (record: DispatchListItem) => {
  arriveRecord.value = record;
  arriveModalVisible.value = true;
};

const handleArriveConfirm = async () => {
  if (!arriveRecord.value) return;

  const location = arriveLocationRef.value?.getSelectedLocation?.();
  if (!location) {
    Message.warning('请先在地图上选择位置');
    return;
  }

  arriveLoading.value = true;
  try {
    await Promise.all([
      updateDispatchStatus(arriveRecord.value.id, {
        status: 'ARRIVED',
        currentLocation: location.address || `(${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)})`,
      }),
      reportLocation({
        dispatchId: arriveRecord.value.id,
        latitude: location.latitude,
        longitude: location.longitude,
        location: location.address,
      }),
    ]);
    Message.success('已确认到达');
    arriveModalVisible.value = false;
    fetchData();
    if (previewVisible.value && currentDispatch.value?.id === arriveRecord.value.id) {
      const res = await getDispatchDetail(arriveRecord.value.id);
      currentDispatch.value = res.data;
    }
  } catch (error) {
    Message.error('操作失败，请重试');
  } finally {
    arriveLoading.value = false;
  }
};

// 司机操作：上报位置
const openReportLocationModal = (record: DispatchListItem) => {
  reportLocationRecord.value = record;
  reportLocationModalVisible.value = true;
};

const handleReportLocationConfirm = async () => {
  if (!reportLocationRecord.value) return;

  const location = reportLocationRef.value?.getSelectedLocation?.();
  if (!location) {
    Message.warning('请先在地图上选择位置');
    return;
  }

  reportLocationLoading.value = true;
  try {
    await reportLocation({
      dispatchId: reportLocationRecord.value.id,
      latitude: location.latitude,
      longitude: location.longitude,
      location: location.address,
    });
    Message.success('位置已上报');
    reportLocationModalVisible.value = false;
    if (previewVisible.value && currentDispatch.value?.id === reportLocationRecord.value.id) {
      const res = await getDispatchDetail(reportLocationRecord.value.id);
      currentDispatch.value = res.data;
    }
  } catch (error) {
    Message.error('上报失败，请重试');
  } finally {
    reportLocationLoading.value = false;
  }
};

// 轨迹预览
const openTrajectoryPreview = async (record: DispatchListItem) => {
  try {
    const res = await getDispatchLocations(record.id);
    trajectoryPoints.value = res.data || [];
    trajectoryPreviewVisible.value = true;
  } catch (error) {
    Message.error('获取轨迹失败');
  }
};

const columns: TableColumnData[] = [
  { title: '调度单号', dataIndex: 'dispatchNo', width: 170 },
  { title: '订单号', dataIndex: 'orderNo', width: 170 },
  { title: '车牌号', dataIndex: 'plateNumber', width: 100 },
  { title: '司机姓名', dataIndex: 'driverName', width: 100 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 90 },
  { title: '当前位置', dataIndex: 'currentLocation', ellipsis: true },
  { title: '预计发车', dataIndex: 'estimatedDepartureTime', width: 150 },
  { title: '预计到达', dataIndex: 'estimatedArrivalTime', width: 150 },
  { title: '操作', slotName: 'operations', width: 200, align: 'center' },
];

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.dispatch-manage-container {
  padding: 20px;
  background-color: var(--color-bg-2);
  border-radius: 4px;
}
.search-form {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}
.search-form :deep(.arco-form-item) {
  margin-bottom: 0;
}

/* 调度详情面板样式 */
.dispatch-detail {
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

.detail-item .value.remark {
  color: var(--color-text-2);
  line-height: 1.5;
}

/* 状态更新模态框 */
.status-modal-content {
  padding: 8px 0;
}

.form-label {
  font-size: 13px;
  color: var(--color-text-2);
  margin-bottom: 8px;
  font-weight: 500;
}
</style>