<template>
  <div class="my-order-container">
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
              v-if="record.status === 'PENDING'"
              type="text"
              size="mini"
              @click="handleEdit(record)"
          >
            <template #icon><icon-edit /></template>
            编辑
          </a-button>
          <a-popconfirm
              v-if="record.status === 'PENDING'"
              content="确定要取消该订单吗？"
              @ok="handleCancel(record)"
          >
            <a-button type="text" size="mini" status="danger">
              <template #icon><icon-close /></template>
              取消
            </a-button>
          </a-popconfirm>
        </a-space>
      </template>
    </a-table>

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

    <a-drawer
        :width="560"
        title="订单详情"
        :visible="previewVisible"
        @cancel="previewVisible = false"
    >
      <a-spin :loading="!orderDetail && previewVisible" style="width: 100%">
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
                <span class="value mono">{{ orderDetail.dispatch?.plateNumber || '-' }}</span>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import { IconSearch, IconRefresh, IconEye, IconClose, IconEdit } from '@arco-design/web-vue/es/icon';
import type { TableColumnData } from '@arco-design/web-vue';
import dayjs from 'dayjs';

import { getOrderList, getOrderDetail, cancelOrder, updateOrder } from '@/api/orders';
import { signForDispatch } from '@/api/dispatches';
import type { OrderListParams, OrderListItem, UpdateOrderData, OrderDetail } from '@/api/orders';

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
const editModalVisible = ref(false);
const signModalVisible = ref(false);
const signForm = reactive({ signName: '' });
const signDispatchId = ref<number | null>(null);

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

const orderDetail = ref<OrderDetail | null>(null);

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

const handleCancel = async (record: OrderListItem) => {
  try {
    await cancelOrder(record.id);
    Message.success('订单已取消');
    fetchData();
  } catch {
    Message.error('取消订单失败，请稍后重试');
  }
};

const handleEdit = (record: OrderListItem) => {
  editForm.id = record.id;
  editForm.shipperName = record.shipperName;
  editForm.shipperPhone = record.shipperPhone;
  editForm.shipperAddress = record.shipperAddress;
  editForm.receiverName = record.receiverName;
  editForm.receiverPhone = record.receiverPhone;
  editForm.receiverAddress = record.receiverAddress;
  editForm.goodsType = record.goodsType;
  editForm.weight = record.weight;
  editForm.volume = record.volume;
  editForm.remark = '';
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
});
</script>

<style scoped>
.my-order-container {
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

/* 订单详情面板样式 */
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