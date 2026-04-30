<template>
  <div class="my-vehicle-container">
    <a-table
        row-key="id"
        :loading="loading"
        :columns="columns"
        :data="tableData"
        :pagination="pagination"
        :empty-text="emptyText"
        @page-change="onPageChange"
        @page-size-change="onPageSizeChange"
    >
      <template #status="{ record }">
        <a-tag :color="getStatusColor(record.status)">
          {{ getStatusName(record.status) }}
        </a-tag>
      </template>

      <template #vehicleType="{ record }">
        {{ getVehicleTypeName(record.vehicleType) }}
      </template>

      <template #operations="{ record }">
        <a-button type="text" size="mini" @click="handlePreview(record)">
          <template #icon><icon-eye /></template>
          预览
        </a-button>
      </template>
    </a-table>

    <a-drawer
        :width="400"
        title="车辆详情"
        :visible="previewVisible"
        @cancel="previewVisible = false"
        :footer="false"
    >
      <a-descriptions :column="1" bordered v-if="currentVehicle">
        <a-descriptions-item label="车牌号">{{ currentVehicle.plateNumber }}</a-descriptions-item>
        <a-descriptions-item label="车辆类型">{{ getVehicleTypeName(currentVehicle.vehicleType) }}</a-descriptions-item>
        <a-descriptions-item label="载重能力">{{ currentVehicle.loadCapacity }} 吨</a-descriptions-item>
        <a-descriptions-item label="司机姓名">{{ currentVehicle.driverName }}</a-descriptions-item>
        <a-descriptions-item label="司机电话">{{ currentVehicle.driverPhone }}</a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="getStatusColor(currentVehicle.status)">
            {{ getStatusName(currentVehicle.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="最后位置">{{ currentVehicle.lastLocation }}</a-descriptions-item>
        <a-descriptions-item label="最后更新时间">{{ currentVehicle.lastUpdateTime }}</a-descriptions-item>
      </a-descriptions>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { Message } from '@arco-design/web-vue';
import { IconEye } from '@arco-design/web-vue/es/icon';
import type { TableColumnData } from '@arco-design/web-vue';

import { getVehicleList } from '@/api/vehicles.ts';
import type { VehicleListItem } from '@/api/vehicles.ts';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

const loading = ref(false);
const tableData = ref<VehicleListItem[]>([]);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showJumper: true,
  showPageSize: true,
});

const emptyText = computed(() => {
  if (loading.value) return '加载中...';
  return '暂无车辆，请添加一个吧';
});

const previewVisible = ref(false);
const currentVehicle = ref<VehicleListItem | null>(null);

const vehicleTypeMap: Record<string, string> = {
  TRUCK: '货车（大型）',
  VAN: '厢式货车（中型）',
  PICKUP: '皮卡（小型）',
};

const statusMap: Record<string, string> = {
  IDLE: '空闲',
  BUSY: '忙碌',
  MAINTENANCE: '维修中',
};

const getVehicleTypeName = (code: string) => vehicleTypeMap[code] || code;
const getStatusName = (code: string) => statusMap[code] || code;
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    IDLE: 'green',
    BUSY: 'orange',
    MAINTENANCE: 'red',
  };
  return colors[status] || 'gray';
};

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await getVehicleList({
      page: pagination.current,
      size: pagination.pageSize,
      keyword: userStore.realName || '',
    });
    const { records, total, current } = res.data;
    tableData.value = records;
    pagination.total = total;
    pagination.current = current;
  } catch (error) {
    Message.error('获取车辆列表失败，请重试');
    console.error(error);
  } finally {
    loading.value = false;
  }
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

const handlePreview = (record: VehicleListItem) => {
  currentVehicle.value = record;
  previewVisible.value = true;
};

const columns: TableColumnData[] = [
  { title: '车牌号', dataIndex: 'plateNumber' },
  { title: '车辆类型', dataIndex: 'vehicleType', slotName: 'vehicleType' },
  { title: '载重能力(吨)', dataIndex: 'loadCapacity' },
  { title: '状态', dataIndex: 'status', slotName: 'status' },
  { title: '操作', slotName: 'operations', width: 100, align: 'center' },
];

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.my-vehicle-container {
  padding: 20px;
  background-color: var(--color-bg-2);
  border-radius: 4px;
}
</style>
