<template>
  <div class="vehicle-manage-container">
    <a-form :model="searchForm" layout="horizontal" class="search-form">
      <a-row :gutter="24">
        <a-col :span="6">
          <a-form-item field="keyword" label="关键字">
            <a-input
                v-model="searchForm.keyword"
                placeholder="请输入关键字"
                allow-clear
                @press-enter="handleSearch"
                @clear="handleSearch"
            />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item field="vehicleType" label="车辆类型">
            <a-select
                v-model="searchForm.vehicleType"
                placeholder="请选择车辆类型"
                allow-clear
                @change="handleSearch"
                @clear="handleSearch"
            >
              <a-option value="TRUCK">货车（大型）</a-option>
              <a-option value="VAN">厢式货车（中型）</a-option>
              <a-option value="PICKUP">皮卡（小型）</a-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item field="status" label="状态">
            <a-select
                v-model="searchForm.status"
                placeholder="请选择状态"
                allow-clear
                @change="handleSearch"
                @clear="handleSearch"
            >
              <a-option value="IDLE">空闲</a-option>
              <a-option value="BUSY">运输中</a-option>
              <a-option value="MAINTENANCE">维修中</a-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-space>
            <a-button v-permission="['ADMIN', 'DISPATCHER']" type="primary" @click="handleAdd">
              <template #icon><icon-plus /></template>
              新增车辆
            </a-button>
            <a-button type="primary" @click="debouncedSearch">
              <template #icon><icon-search /></template>
              搜索
            </a-button>
            <a-button @click="handleReset">
              <template #icon><icon-refresh /></template>
              重置
            </a-button>
          </a-space>
        </a-col>
      </a-row>
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

      <template #vehicleType="{ record }">
        {{ getVehicleTypeName(record.vehicleType) }}
      </template>

      <template #operations="{ record }">
        <a-space>
          <a-button type="text" size="mini" @click="handlePreview(record)">
            <template #icon><icon-eye /></template>
            预览
          </a-button>
          <a-button
              v-if="canEdit"
              type="text"
              size="mini"
              @click="handleEdit(record)"
          >
            <template #icon><icon-edit /></template>
            编辑
          </a-button>
          <a-button
              v-if="userStore.role === 'ADMIN'"
              type="text"
              size="mini"
              status="danger"
              @click="handleDelete(record)"
          >
            <template #icon><icon-delete /></template>
            删除
          </a-button>
        </a-space>
      </template>
    </a-table>

    <a-modal
        v-model:visible="addModalVisible"
        title="新增车辆"
        :width="480"
        @before-ok="handleAddSubmit"
        @cancel="addModalVisible = false"
        ok-text="提交"
    >
      <a-form :model="addForm" layout="vertical">
        <a-form-item field="plateNumber" label="车牌号" required>
          <a-input v-model="addForm.plateNumber" placeholder="请输入车牌号" />
        </a-form-item>
        <a-form-item field="vehicleType" label="车辆类型" required>
          <select v-model="addForm.vehicleType" class="native-select">
            <option value="" disabled>请选择车辆类型</option>
            <option value="TRUCK">货车（大型）</option>
            <option value="VAN">厢式货车（中型）</option>
            <option value="PICKUP">皮卡（小型）</option>
          </select>
        </a-form-item>
        <a-form-item field="loadCapacity" label="载重能力" required>
          <a-input-number v-model="addForm.loadCapacity" placeholder="请输入载重能力（吨）" :min="0" />
        </a-form-item>
        <a-form-item field="volume" label="体积" required>
          <a-input-number v-model="addForm.volume" placeholder="请输入体积（方）" :min="0" />
        </a-form-item>
        <a-form-item field="driverId" label="司机" required>
          <select v-model="addForm.driverId" class="native-select" :disabled="driverList.length === 0">
            <option :value="undefined" disabled>请选择司机</option>
            <option v-for="driver in driverList" :key="driver.id" :value="driver.id">
              {{ driver.realName }} - {{ driver.phone }}
            </option>
          </select>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
        v-model:visible="editModalVisible"
        title="编辑车辆"
        :width="480"
        @before-ok="handleEditSubmit"
        @cancel="editModalVisible = false"
        ok-text="提交"
    >
      <a-form :model="editForm" layout="vertical">
        <a-form-item field="plateNumber" label="车牌号" required>
          <a-input v-model="editForm.plateNumber" placeholder="请输入车牌号" />
        </a-form-item>
        <a-form-item field="vehicleType" label="车辆类型" required>
          <a-select v-model="editForm.vehicleType" placeholder="请选择车辆类型">
            <a-option value="TRUCK">货车（大型）</a-option>
            <a-option value="VAN">厢式货车（中型）</a-option>
            <a-option value="PICKUP">皮卡（小型）</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="loadCapacity" label="载重能力" required>
          <a-input-number v-model="editForm.loadCapacity" placeholder="请输入载重能力（吨）" :min="0" />
        </a-form-item>
        <a-form-item field="volume" label="体积" required>
          <a-input-number v-model="editForm.volume" placeholder="请输入体积（方）" :min="0" />
        </a-form-item>
      </a-form>
    </a-modal>

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
        <a-descriptions-item label="体积">{{ currentVehicle.volume }} 方</a-descriptions-item>
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
import { ref, reactive, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import { IconSearch, IconRefresh, IconEye, IconPlus, IconEdit, IconDelete } from '@arco-design/web-vue/es/icon';
import type { TableColumnData } from '@arco-design/web-vue';

import { getVehicleList, addVehicle, updateVehicle, deleteVehicle } from '@/api/vehicles.ts';
import { getUserList } from '@/api/user.ts';
import type { VehicleListParams, VehicleListItem } from '@/api/vehicles.ts';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

const searchForm = reactive<Omit<VehicleListParams, 'page' | 'size'>>({
  keyword: '',
  vehicleType: undefined,
  status: undefined,
});

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

const previewVisible = ref(false);
const currentVehicle = ref<VehicleListItem | null>(null);

const addModalVisible = ref(false);
const addForm = reactive({
  plateNumber: '',
  vehicleType: '',
  loadCapacity: 0,
  volume: 0,
  driverId: undefined as number | undefined,
});

const driverList = ref<{ id: number; realName: string; phone: string }[]>([]);

const editModalVisible = ref(false);
const editForm = reactive({
  id: 0,
  plateNumber: '',
  vehicleType: '',
  loadCapacity: 0,
  volume: 0,
});

const canEdit = userStore.role === 'ADMIN' || userStore.role === 'DISPATCHER';

const vehicleTypeMap: Record<string, string> = {
  TRUCK: '货车（大型）',
  VAN: '厢式货车（中型）',
  PICKUP: '皮卡（小型）',
};

const statusMap: Record<string, string> = {
  IDLE: '空闲',
  BUSY: '运输中',
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
    const params: VehicleListParams = {
      page: pagination.current,
      size: pagination.pageSize,
      ...searchForm,
    };
    const res = await getVehicleList(params);
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

const fetchDriverList = async () => {
  try {
    const res = await getUserList({ roleId: 3, size: 100 });
    driverList.value = res.data.records.map((r: any) => ({
      id: r.id,
      realName: r.realName,
      phone: r.phone,
    }));
  } catch (error) {
    console.error('获取司机列表失败', error);
  }
};

let searchTimer: ReturnType<typeof setTimeout> | null = null;
const debouncedSearch = () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    handleSearch();
  }, 300);
};

const handleSearch = () => {
  pagination.current = 1;
  fetchData();
};

const handleReset = () => {
  searchForm.keyword = '';
  searchForm.vehicleType = undefined;
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

const handlePreview = (record: VehicleListItem) => {
  currentVehicle.value = record;
  previewVisible.value = true;
};

const handleAdd = () => {
  addForm.plateNumber = '';
  addForm.vehicleType = '';
  addForm.loadCapacity = 0;
  addForm.volume = 0;
  addForm.driverId = undefined;
  addModalVisible.value = true;
};

const handleAddSubmit = async (done: (val: boolean) => void) => {
  if (!addForm.plateNumber || !addForm.vehicleType || !addForm.loadCapacity || addForm.volume === undefined || addForm.driverId === undefined) {
    Message.warning('请填写完整信息');
    done(false);
    return;
  }
  try {
    await addVehicle({
      plateNumber: addForm.plateNumber,
      vehicleType: addForm.vehicleType,
      loadCapacity: addForm.loadCapacity,
      volume: addForm.volume,
      driverId: addForm.driverId as number,
      status: 'IDLE',
    });
    Message.success('新增车辆成功');
    addModalVisible.value = false;
    fetchData();
    done(true);
  } catch {
    Message.error('新增车辆失败');
    done(false);
  }
};

const handleEdit = (record: VehicleListItem) => {
  editForm.id = record.id;
  editForm.plateNumber = record.plateNumber;
  editForm.vehicleType = record.vehicleType;
  editForm.loadCapacity = record.loadCapacity;
  editForm.volume = record.volume;
  editModalVisible.value = true;
};

const handleEditSubmit = async (done: (val: boolean) => void) => {
  if (!editForm.plateNumber || !editForm.vehicleType || !editForm.loadCapacity || editForm.volume === undefined) {
    Message.warning('请填写完整信息');
    done(false);
    return;
  }
  try {
    await updateVehicle(editForm.id, {
      plateNumber: editForm.plateNumber,
      vehicleType: editForm.vehicleType,
      loadCapacity: editForm.loadCapacity,
      volume: editForm.volume,
    });
    Message.success('编辑车辆成功');
    editModalVisible.value = false;
    fetchData();
    done(true);
  } catch {
    Message.error('编辑车辆失败');
    done(false);
  }
};

const handleDelete = async (record: VehicleListItem) => {
  if (!confirm('确定要删除该车辆吗？')) return;
  try {
    await deleteVehicle(record.id);
    Message.success('删除成功');
    fetchData();
  } catch {
    Message.error('删除失败');
  }
};

const columns: TableColumnData[] = [
  { title: '车牌号', dataIndex: 'plateNumber' },
  { title: '车辆类型', dataIndex: 'vehicleType', slotName: 'vehicleType' },
  { title: '载重能力(吨)', dataIndex: 'loadCapacity' },
  { title: '体积(方)', dataIndex: 'volume' },
  { title: '司机姓名', dataIndex: 'driverName' },
  { title: '司机电话', dataIndex: 'driverPhone' },
  { title: '状态', dataIndex: 'status', slotName: 'status' },
  { title: '操作', slotName: 'operations', width: 160, align: 'center' },
];

onMounted(() => {
  fetchData();
  fetchDriverList();
});
</script>

<style scoped>
.vehicle-manage-container {
  padding: 20px;
  background-color: var(--color-bg-2);
  border-radius: 4px;
}
.search-form {
  margin-bottom: 20px;
}
.native-select {
  width: 100%;
  height: 32px;
  padding: 4px 12px;
  font-size: 14px;
  line-height: 1.5715;
  color: var(--color-text-1);
  background-color: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-small);
  outline: none;
  transition: border-color 0.2s;
  appearance: auto;
}
.native-select:focus {
  border-color: rgb(var(--primary-6));
  box-shadow: 0 0 0 2px rgba(var(--primary-6), 0.1);
}
.native-select:disabled {
  color: var(--color-text-4);
  background-color: var(--color-fill-2);
  cursor: not-allowed;
}
.native-select:hover:not(:disabled) {
  border-color: var(--color-border-hover);
}
</style>
