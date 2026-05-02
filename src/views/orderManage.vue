<template>
  <div class="order-manage-container">
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
        <a-button v-permission="['ADMIN']" type="primary" @click="handleAdd">
          <template #icon><icon-plus /></template>
          新增订单
        </a-button>
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
        <a-space>
          <a-button type="text" size="mini" @click="handlePreview(record)">
            <template #icon><icon-eye /></template>
            详情
          </a-button>
          <a-button
              v-if="(userStore.role === 'ADMIN' || userStore.role === 'DISPATCHER') && record.status !== 'CANCELLED' && record.status !== 'SIGNED'"
              type="text"
              size="mini"
              @click="handleEdit(record)"
          >
            <template #icon><icon-edit /></template>
            编辑
          </a-button>
          <a-popconfirm
              v-if="record.status === 'PENDING' && (userStore.role === 'ADMIN' || userStore.role === 'DISPATCHER')"
              content="确定要取消该订单吗？"
              @ok="handleCancel(record)"
          >
            <a-button type="text" size="mini" status="danger">
              <template #icon><icon-close /></template>
              取消
            </a-button>
          </a-popconfirm>
          <a-button
              v-if="(userStore.role === 'ADMIN' || userStore.role === 'DISPATCHER') && record.status === 'PENDING'"
              type="text"
              size="mini"
              status="warning"
              @click="handleDispatch(record)"
          >
            <template #icon><icon-list /></template>
            调度
          </a-button>
        </a-space>
      </template>
    </a-table>

    <a-modal
        v-model:visible="addModalVisible"
        title="新增订单"
        :width="720"
        @before-ok="handleAddSubmit"
        @cancel="addModalVisible = false"
        ok-text="提交"
    >
      <a-form :model="addForm" layout="vertical">
        <a-form-item field="customerId" label="客户" required>
          <a-select
              v-model="addForm.customerId"
              placeholder="请选择客户"
              allow-search
              :filter="filterCustomer"
              style="width: 100%"
          >
            <a-option v-for="customer in customerList" :key="customer.id" :value="customer.id">
              {{ customer.realName }} - {{ customer.phone }}
            </a-option>
          </a-select>
        </a-form-item>
        <a-divider orientation="center">发货与收货信息</a-divider>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="shipperName" label="发货人" required>
              <a-input v-model="addForm.shipperName" placeholder="请输入发货人姓名" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="receiverName" label="收货人" required>
              <a-input v-model="addForm.receiverName" placeholder="请输入收货人姓名" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="shipperPhone" label="发货人电话" required>
              <a-input v-model="addForm.shipperPhone" placeholder="请输入发货人电话" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="receiverPhone" label="收货人电话" required>
              <a-input v-model="addForm.receiverPhone" placeholder="请输入收货人电话" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="shipperAddress" label="发货地址">
              <AddressCascader
                  v-model:province-code="addForm.shipperProvince"
                  v-model:city-code="addForm.shipperCity"
                  v-model:district-code="addForm.shipperDistrict"
                  v-model:detail-address="addForm.shipperDetailAddress"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="receiverAddress" label="收货地址">
              <AddressCascader
                  v-model:province-code="addForm.receiverProvince"
                  v-model:city-code="addForm.receiverCity"
                  v-model:district-code="addForm.receiverDistrict"
                  v-model:detail-address="addForm.receiverDetailAddress"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-divider orientation="center">货物信息</a-divider>
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item field="goodsType" label="货物类型" required>
              <a-select v-model="addForm.goodsType" placeholder="请选择">
                <a-option value="电子产品">电子产品</a-option>
                <a-option value="服装">服装</a-option>
                <a-option value="食品">食品</a-option>
                <a-option value="家具">家具</a-option>
                <a-option value="图书">图书</a-option>
                <a-option value="其他">其他</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="weight" label="重量（吨）" required>
              <a-input-number v-model="addForm.weight" placeholder="请输入重量" :min="0" :precision="2" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="volume" label="体积（方）">
              <a-input-number v-model="addForm.volume" placeholder="请输入体积" :min="0" :precision="2" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item field="remark" label="备注">
          <a-input v-model="addForm.remark" placeholder="请输入备注信息" :max-length="200" show-word-limit />
        </a-form-item>
      </a-form>
    </a-modal>

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
            <a-form-item field="shipperAddress" label="发货地址">
              <AddressCascader
                  v-model:province-code="editForm.shipperProvince"
                  v-model:city-code="editForm.shipperCity"
                  v-model:district-code="editForm.shipperDistrict"
                  v-model:detail-address="editForm.shipperDetailAddress"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="receiverAddress" label="收货地址">
              <AddressCascader
                  v-model:province-code="editForm.receiverProvince"
                  v-model:city-code="editForm.receiverCity"
                  v-model:district-code="editForm.receiverDistrict"
                  v-model:detail-address="editForm.receiverDetailAddress"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-divider orientation="center">货物信息</a-divider>
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item field="goodsType" label="货物类型" required>
              <a-select v-model="editForm.goodsType" placeholder="请选择">
                <a-option value="电子产品">电子产品</a-option>
                <a-option value="服装">服装</a-option>
                <a-option value="食品">食品</a-option>
                <a-option value="家具">家具</a-option>
                <a-option value="图书">图书</a-option>
                <a-option value="其他">其他</a-option>
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

    <a-modal
        v-model:visible="dispatchModalVisible"
        title="调度 - {{ currentOrder?.orderNo }}"
        :width="600"
        @before-ok="handleDispatchSubmit"
        @cancel="dispatchModalVisible = false"
        ok-text="确认调度"
    >
      <a-form :model="dispatchForm" layout="vertical">
        <div class="dispatch-order-info">
          <a-descriptions :column="2" size="small" bordered>
            <a-descriptions-item label="订单号" :span="2">{{ currentOrder?.orderNo }}</a-descriptions-item>
            <a-descriptions-item label="发货地址" :span="2">{{ currentOrder?.shipperAddress }}</a-descriptions-item>
            <a-descriptions-item label="收货地址" :span="2">{{ currentOrder?.receiverAddress }}</a-descriptions-item>
          </a-descriptions>
        </div>
        <a-divider orientation="center">时间安排</a-divider>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="estimatedDepartureTime" label="预计发车时间" required>
              <a-date-picker
                  v-model="dispatchForm.estimatedDepartureTime"
                  show-time
                  placeholder="选择日期时间"
                  style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="estimatedArrivalTime" label="预计到达时间" required>
              <a-date-picker
                  v-model="dispatchForm.estimatedArrivalTime"
                  show-time
                  placeholder="选择日期时间"
                  style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-divider orientation="center">选择空闲车辆</a-divider>
        <a-radio-group v-model="dispatchForm.vehicleId" style="width: 100%">
          <a-table
              :data="availableVehicles"
              :loading="idleVehicleLoading"
              :pagination="false"
              :scroll="{ y: 220 }"
              size="small"
              show-header
              row-key="id"
              :row-class="(record: any) => dispatchForm.vehicleId === record.id ? 'selected-row' : ''"
              @row-click="(record: any) => { dispatchForm.vehicleId = record.id; handleVehicleChange(record.id); }"
          >
            <template #columns>
              <a-table-column :width="40">
                <template #cell="{ record }">
                  <a-radio :value="record.id" />
                </template>
              </a-table-column>
              <a-table-column title="车牌号" data-index="plateNumber" :width="100" />
              <a-table-column title="车辆类型" :width="80">
                <template #cell="{ record }">
                  {{ record.vehicleType === 'TRUCK' ? '货车' : record.vehicleType === 'VAN' ? '厢式货车' : '皮卡' }}
                </template>
              </a-table-column>
              <a-table-column title="体积(方)" :width="70">
                <template #cell="{ record }">
                  {{ record.volume }}
                </template>
              </a-table-column>
              <a-table-column title="司机" data-index="driverName" :width="80" />
              <a-table-column title="最后位置" data-index="lastLocation" ellipsis />
            </template>
          </a-table>
        </a-radio-group>
        <a-form-item field="remark" label="备注">
          <a-input v-model="dispatchForm.remark" placeholder="请输入备注信息" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-drawer
        :width="500"
        title="订单详情"
        :visible="previewVisible"
        @cancel="previewVisible = false"
        :footer="false"
    >
      <a-descriptions :column="2" bordered v-if="currentOrder">
        <a-descriptions-item label="订单号" :span="2">{{ currentOrder.orderNo }}</a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="getStatusColor(currentOrder.status)">
            {{ getStatusName(currentOrder.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ currentOrder.createTime }}</a-descriptions-item>
        <a-descriptions-item label="发货人" :span="2">{{ currentOrder.shipperName }} {{ currentOrder.shipperPhone }}</a-descriptions-item>
        <a-descriptions-item label="发货地址" :span="2">{{ currentOrder.shipperAddress }}</a-descriptions-item>
        <a-descriptions-item label="收货人" :span="2">{{ currentOrder.receiverName }} {{ currentOrder.receiverPhone }}</a-descriptions-item>
        <a-descriptions-item label="收货地址" :span="2">{{ currentOrder.receiverAddress }}</a-descriptions-item>
        <a-descriptions-item label="货物类型">{{ currentOrder.goodsType }}</a-descriptions-item>
        <a-descriptions-item label="重量">{{ currentOrder.weight }} 吨</a-descriptions-item>
        <a-descriptions-item label="体积">{{ currentOrder.volume }} 方</a-descriptions-item>
      </a-descriptions>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import { IconSearch, IconRefresh, IconEye, IconPlus, IconEdit, IconClose, IconList } from '@arco-design/web-vue/es/icon';
import type { TableColumnData } from '@arco-design/web-vue';
import dayjs from 'dayjs';

import { getOrderList, createOrder, updateOrder, cancelOrder } from '@/api/orders';
import type { OrderListParams, OrderListItem, CreateOrderData, UpdateOrderData } from '@/api/orders';
import { getUserList } from '@/api/user';
import { getIdleVehicles } from '@/api/vehicles';
import type { IdleVehicleItem } from '@/api/vehicles';
import { createDispatch } from '@/api/dispatches';
import type { CreateDispatchData } from '@/api/dispatches';
import { useUserStore } from '@/stores/user';
import AddressCascader from '@/components/AddressCascader/index.vue';
import { buildFullAddress } from '@/components/AddressCascader/utils';

const userStore = useUserStore();

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

const previewVisible = ref(false);
const currentOrder = ref<OrderListItem | null>(null);

const addModalVisible = ref(false);
const editModalVisible = ref(false);
const customerList = ref<{ id: number; realName: string; phone: string }[]>([]);
const addForm = reactive({
  customerId: undefined as number | undefined,
  shipperName: '',
  shipperPhone: '',
  shipperProvince: '',
  shipperCity: '',
  shipperDistrict: '',
  shipperDetailAddress: '',
  receiverName: '',
  receiverPhone: '',
  receiverProvince: '',
  receiverCity: '',
  receiverDistrict: '',
  receiverDetailAddress: '',
  goodsType: '',
  weight: 0,
  volume: 0,
  remark: '',
});

const filterCustomer = (option: any, searchText: string) => {
  const item = option.children?.[0]?.children?.[0] || '';
  return item.includes?.(searchText) || searchText.length === 0;
};

const editForm = reactive({
  id: 0,
  shipperName: '',
  shipperPhone: '',
  shipperProvince: '',
  shipperCity: '',
  shipperDistrict: '',
  shipperDetailAddress: '',
  receiverName: '',
  receiverPhone: '',
  receiverProvince: '',
  receiverCity: '',
  receiverDistrict: '',
  receiverDetailAddress: '',
  goodsType: '',
  weight: 0,
  volume: 0,
  remark: '',
});

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

const fetchCustomerList = async () => {
  try {
    const res = await getUserList({ roleId: 4, size: 100 });
    customerList.value = res.data.records.map((r: any) => ({
      id: r.id,
      realName: r.realName,
      phone: r.phone,
    }));
  } catch (error) {
    console.error('获取客户列表失败', error);
  }
};

const handleSearch = () => {
  pagination.current = 1;
  fetchData();
};

const handleReset = () => {
  searchForm.orderNo = '';
  searchForm.status = undefined;
  searchForm.startDate = undefined;
  searchForm.endDate = undefined;
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

const handlePreview = (record: OrderListItem) => {
  currentOrder.value = record;
  previewVisible.value = true;
};

const handleAdd = () => {
  addForm.customerId = undefined;
  addForm.shipperName = '';
  addForm.shipperPhone = '';
  addForm.shipperProvince = '';
  addForm.shipperCity = '';
  addForm.shipperDistrict = '';
  addForm.shipperDetailAddress = '';
  addForm.receiverName = '';
  addForm.receiverPhone = '';
  addForm.receiverProvince = '';
  addForm.receiverCity = '';
  addForm.receiverDistrict = '';
  addForm.receiverDetailAddress = '';
  addForm.goodsType = '';
  addForm.weight = 0;
  addForm.volume = 0;
  addForm.remark = '';
  addModalVisible.value = true;
};

const handleAddSubmit = async (done: (val: boolean) => void) => {
  if (!addForm.customerId || !addForm.shipperName || !addForm.shipperPhone ||
      !addForm.receiverName || !addForm.receiverPhone ||
      !addForm.shipperProvince || !addForm.shipperCity || !addForm.shipperDistrict || !addForm.shipperDetailAddress ||
      !addForm.receiverProvince || !addForm.receiverCity || !addForm.receiverDistrict || !addForm.receiverDetailAddress ||
      !addForm.goodsType || !addForm.weight) {
    Message.warning('请填写完整信息');
    done(false);
    return;
  }
  try {
    const shipperAddress = buildFullAddress(
      addForm.shipperProvince,
      addForm.shipperCity,
      addForm.shipperDistrict,
      addForm.shipperDetailAddress
    );
    const receiverAddress = buildFullAddress(
      addForm.receiverProvince,
      addForm.receiverCity,
      addForm.receiverDistrict,
      addForm.receiverDetailAddress
    );
    const data: CreateOrderData = {
      shipperName: addForm.shipperName,
      shipperPhone: addForm.shipperPhone,
      shipperAddress,
      receiverName: addForm.receiverName,
      receiverPhone: addForm.receiverPhone,
      receiverAddress,
      goodsType: addForm.goodsType,
      weight: addForm.weight,
      volume: addForm.volume || undefined,
      remark: addForm.remark || undefined,
    };
    await createOrder(data);
    Message.success('新增订单成功');
    addModalVisible.value = false;
    fetchData();
    done(true);
  } catch {
    Message.error('新增订单失败');
    done(false);
  }
};

const handleEdit = (record: OrderListItem) => {
  editForm.id = record.id;
  editForm.shipperName = record.shipperName;
  editForm.shipperPhone = record.shipperPhone;
  editForm.receiverName = record.receiverName;
  editForm.receiverPhone = record.receiverPhone;
  editForm.goodsType = record.goodsType;
  editForm.weight = record.weight;
  editForm.volume = record.volume;
  editForm.remark = '';
  editForm.shipperProvince = '';
  editForm.shipperCity = '';
  editForm.shipperDistrict = '';
  editForm.shipperDetailAddress = '';
  editForm.receiverProvince = '';
  editForm.receiverCity = '';
  editForm.receiverDistrict = '';
  editForm.receiverDetailAddress = '';
  editModalVisible.value = true;
};

const handleEditSubmit = async (done: (val: boolean) => void) => {
  if (!editForm.shipperName || !editForm.shipperPhone ||
      !editForm.receiverName || !editForm.receiverPhone ||
      !editForm.goodsType || !editForm.weight) {
    Message.warning('请填写完整信息');
    done(false);
    return;
  }
  try {
    const data: UpdateOrderData = {
      shipperName: editForm.shipperName,
      shipperPhone: editForm.shipperPhone,
      receiverName: editForm.receiverName,
      receiverPhone: editForm.receiverPhone,
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

const handleCancel = async (record: OrderListItem) => {
  try {
    await cancelOrder(record.id);
    Message.success('订单已取消');
    fetchData();
  } catch {
    Message.error('取消订单失败，请稍后重试');
  }
};

const dispatchModalVisible = ref(false);
const idleVehicleLoading = ref(false);
const idleVehicleList = ref<IdleVehicleItem[]>([]);
const availableVehicles = computed(() => {
  const order = currentOrder.value;
  if (!order) return idleVehicleList.value;
  return idleVehicleList.value.filter((v) => {
    if (v.loadCapacity < order.weight) return false;
    if (order.volume && v.volume < order.volume) return false;
    return true;
  });
});
const dispatchForm = reactive({
  vehicleId: undefined as number | undefined,
  estimatedDepartureTime: '',
  estimatedArrivalTime: '',
  remark: '',
});

const handleVehicleChange = (vehicleId: any) => {
  const id = Number(vehicleId);
  idleVehicleList.value.find((v) => v.id === id);
};

const handleDispatch = async (record: OrderListItem) => {
  currentOrder.value = record;
  dispatchForm.vehicleId = undefined;
  dispatchForm.estimatedDepartureTime = '';
  dispatchForm.estimatedArrivalTime = '';
  dispatchForm.remark = '';
  dispatchModalVisible.value = true;
  idleVehicleLoading.value = true;
  try {
    const res = await getIdleVehicles();
    idleVehicleList.value = res.data;
  } catch {
    Message.error('获取空闲车辆失败');
    idleVehicleList.value = [];
  } finally {
    idleVehicleLoading.value = false;
  }
};

const handleDispatchSubmit = async (done: (val: boolean) => void) => {
  if (!dispatchForm.vehicleId || !dispatchForm.estimatedDepartureTime || !dispatchForm.estimatedArrivalTime) {
    Message.warning('请选择车辆并填写时间');
    done(false);
    return;
  }
  if (!currentOrder.value) {
    Message.warning('订单信息丢失');
    done(false);
    return;
  }
  const vehicle = idleVehicleList.value.find((v) => v.id === dispatchForm.vehicleId);
  if (!vehicle) {
    Message.warning('车辆信息丢失');
    done(false);
    return;
  }
  try {
    const data: CreateDispatchData = {
      orderId: currentOrder.value.id,
      vehicleId: dispatchForm.vehicleId,
      driverId: vehicle.driverId,
      estimatedDepartureTime: dispatchForm.estimatedDepartureTime,
      estimatedArrivalTime: dispatchForm.estimatedArrivalTime,
      remark: dispatchForm.remark || undefined,
    };
    await createDispatch(data);
    Message.success('调度成功');
    dispatchModalVisible.value = false;
    fetchData();
    done(true);
  } catch {
    Message.error('调度失败');
    done(false);
  }
};

const columns: TableColumnData[] = [
  { title: '订单号', dataIndex: 'orderNo', width: 150 },
  { title: '发货人', dataIndex: 'shipperName', width: 100 },
  { title: '收货人', dataIndex: 'receiverName', width: 100 },
  { title: '货物类型', dataIndex: 'goodsType', width: 100 },
  { title: '重量(吨)', dataIndex: 'weight', width: 80 },
  { title: '体积(方)', dataIndex: 'volume', width: 80 },
  { title: '状态', dataIndex: 'status', slotName: 'status', width: 90 },
  { title: '创建时间', dataIndex: 'createTime', width: 160 },
  { title: '操作', slotName: 'operations', width: 160, align: 'center' },
];

onMounted(() => {
  fetchData();
  if (userStore.role === 'ADMIN') {
    fetchCustomerList();
  }
});
</script>

<style scoped>
.order-manage-container {
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
.dispatch-order-info {
  margin-bottom: 8px;
}
:deep(.selected-row) {
  background-color: var(--color-primary-light-1) !important;
}
:deep(.selected-row:hover) {
  background-color: var(--color-primary-light-2) !important;
}
</style>