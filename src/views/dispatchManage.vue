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
          <a-option value="EXCEPTION">异常</a-option>
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
      </template>
    </a-table>

    <a-drawer
        :width="500"
        title="调度详情"
        :visible="previewVisible"
        @cancel="previewVisible = false"
        :footer="false"
    >
      <a-descriptions :column="2" bordered v-if="currentDispatch">
        <a-descriptions-item label="调度单号" :span="2">{{ currentDispatch.dispatchNo }}</a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="getStatusColor(currentDispatch.status)">
            {{ getStatusName(currentDispatch.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="订单号">{{ currentDispatch.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="车牌号">{{ currentDispatch.plateNumber }}</a-descriptions-item>
        <a-descriptions-item label="司机姓名">{{ currentDispatch.driverName }}</a-descriptions-item>
        <a-descriptions-item label="当前位置">{{ currentDispatch.currentLocation || '-' }}</a-descriptions-item>
        <a-descriptions-item label="预计发车时间">{{ currentDispatch.estimatedDepartureTime }}</a-descriptions-item>
        <a-descriptions-item label="预计到达时间">{{ currentDispatch.estimatedArrivalTime }}</a-descriptions-item>
      </a-descriptions>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import { IconSearch, IconRefresh, IconEye } from '@arco-design/web-vue/es/icon';
import type { TableColumnData } from '@arco-design/web-vue';

import { getDispatchList } from '@/api/dispatches';
import type { DispatchListParams, DispatchListItem } from '@/api/dispatches';

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

const previewVisible = ref(false);
const currentDispatch = ref<DispatchListItem | null>(null);

const statusMap: Record<string, string> = {
  ASSIGNED: '已分配',
  IN_TRANSIT: '运输中',
  ARRIVED: '已到达',
  SIGNED: '已签收',
  EXCEPTION: '异常',
  CANCELLED: '已取消',
};

const getStatusName = (code: string) => statusMap[code] || code;
const getStatusColor = (status: string) => {
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

const handlePreview = (record: DispatchListItem) => {
  currentDispatch.value = record;
  previewVisible.value = true;
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
  { title: '操作', slotName: 'operations', width: 80, align: 'center' },
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
</style>
