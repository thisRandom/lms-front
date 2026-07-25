<template>
  <div class="user-manage-container">
    <a-form :model="searchForm" layout="horizontal" class="search-form">
      <a-row :gutter="24">
        <a-col :span="6">
          <a-form-item field="realName" label="姓名">
            <a-input
                v-model="searchForm.realName"
                placeholder="请输入姓名"
                allow-clear
                @press-enter="handleSearch"
                @clear="handleSearch"
            />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item field="roleId" label="角色">
            <a-select
                v-model="searchForm.roleId"
                placeholder="请选择角色"
                allow-clear
                @change="handleSearch"
                @clear="handleSearch"
            >
              <a-option :value="2">调度员</a-option>
              <a-option :value="3">司机</a-option>
              <a-option :value="4">客户</a-option>
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
              <a-option :value="1">启用</a-option>
              <a-option :value="0">禁用</a-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-space>
            <a-button v-permission="['ADMIN']" type="primary" @click="handleAdd">
              <template #icon><icon-plus /></template>
              新增用户
            </a-button>
            <a-button id="user-search-btn" type="primary" @click="debouncedSearch">
              <template #icon><icon-search /></template>
              搜索
            </a-button>
            <a-button id="user-reset-btn" @click="handleReset">
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
        <template v-if="userStore.role === 'ADMIN'">
          <a-switch
              :model-value="record.status === 1"
              @change="(val) => handleStatusChange(record, !!val)"
          />
        </template>
        <template v-else>
          <a-tag :color="record.status === 1 ? 'green' : 'red'">
            {{ record.status === 1 ? '启用' : '禁用' }}
          </a-tag>
        </template>
      </template>

      <template #operations="{ record }">
        <a-space>
          <a-button type="text" size="mini" @click="handlePreview(record)">
            <template #icon><icon-eye /></template>
            预览
          </a-button>
          <a-button
              v-if="canEdit(record)"
              type="text"
              size="mini"
              @click="handleEdit(record)"
          >
            <template #icon><icon-edit /></template>
            编辑
          </a-button>
          <a-popconfirm
              v-if="userStore.role === 'ADMIN'"
              content="确定要删除该用户吗？"
              @ok="handleDelete(record)"
          >
            <a-button type="text" size="mini" status="danger">
              <template #icon><icon-delete /></template>
              删除
            </a-button>
          </a-popconfirm>
          <a-popconfirm
              v-if="userStore.role === 'ADMIN'"
              content="确定要重置该用户的密码吗？"
              @ok="handleResetPassword(record)"
          >
            <a-button type="text" size="mini">
              <template #icon><icon-lock /></template>
              重置密码
            </a-button>
          </a-popconfirm>
        </a-space>
      </template>
    </a-table>

    <a-modal
        v-model:visible="addModalVisible"
        title="新增用户"
        :width="480"
        @before-ok="handleAddSubmit"
        @cancel="addModalVisible = false"
        ok-text="提交"
    >
      <a-form :model="addForm" layout="vertical">
        <a-form-item field="username" label="用户名" required>
          <a-input v-model="addForm.username" placeholder="请输入用户名" />
        </a-form-item>
        <a-form-item field="password" label="密码" required>
          <a-input-password v-model="addForm.password" placeholder="请输入密码" />
        </a-form-item>
        <a-form-item field="realName" label="姓名" required>
          <a-input v-model="addForm.realName" placeholder="请输入姓名" />
        </a-form-item>
        <a-form-item field="phone" label="手机号" required>
          <a-input v-model="addForm.phone" placeholder="请输入手机号" />
        </a-form-item>
        <a-form-item field="roleId" label="角色" required>
          <a-select v-model="addForm.roleId" placeholder="请选择角色">
            <a-option :value="1">管理员</a-option>
            <a-option :value="2">调度员</a-option>
            <a-option :value="3">司机</a-option>
            <a-option :value="4">客户</a-option>
          </a-select>
        </a-form-item>
        <a-form-item field="status" label="状态" required>
          <a-select v-model="addForm.status" placeholder="请选择状态">
            <a-option :value="1">启用</a-option>
            <a-option :value="0">禁用</a-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
        v-model:visible="editModalVisible"
        :title="isAdminEditing ? '编辑用户' : '编辑司机信息'"
        :width="480"
        @before-ok="handleEditSubmit"
        @cancel="editModalVisible = false"
        ok-text="提交"
    >
      <a-form :model="editForm" layout="vertical">
        <a-form-item field="realName" label="姓名" required>
          <a-input v-model="editForm.realName" placeholder="请输入姓名" />
        </a-form-item>
        <a-form-item field="phone" label="手机号" required>
          <a-input v-model="editForm.phone" placeholder="请输入手机号" />
        </a-form-item>
        <a-form-item v-if="isAdminEditing" field="roleId" label="角色" required>
          <a-select v-model="editForm.roleId" placeholder="请选择角色">
            <a-option :value="1">管理员</a-option>
            <a-option :value="2">调度员</a-option>
            <a-option :value="3">司机</a-option>
            <a-option :value="4">客户</a-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-drawer
        :width="400"
        title="用户详情"
        :visible="previewVisible"
        @cancel="previewVisible = false"
        :footer="false"
    >
      <a-descriptions :column="1" bordered v-if="currentUser">
        <a-descriptions-item label="用户名">{{ currentUser.username }}</a-descriptions-item>
        <a-descriptions-item label="姓名">{{ currentUser.realName }}</a-descriptions-item>
        <a-descriptions-item label="手机号">{{ currentUser.phone }}</a-descriptions-item>
        <a-descriptions-item label="角色">{{ currentUser.roleName }}</a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="currentUser.status === 1 ? 'green' : 'red'">
            {{ currentUser.status === 1 ? '启用' : '禁用' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">{{ currentUser.createTime }}</a-descriptions-item>
      </a-descriptions>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import { IconSearch, IconRefresh, IconEye, IconPlus, IconEdit, IconDelete, IconLock } from '@arco-design/web-vue/es/icon';
import type { TableColumnData } from '@arco-design/web-vue';

import { getUserList, addUser, updateUserStatus, updateUser, deleteUser, resetPassword } from '@/api/user.ts';
import { encryptPassword } from '@/utils/crypto';
import type { UserListParams, UserListItem } from '@/api/user.ts';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

const searchForm = reactive<Omit<UserListParams, 'page' | 'size'>>({
  realName: '',
  roleId: undefined,
  status: undefined,
});

const loading = ref(false);
const tableData = ref<UserListItem[]>([]);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showJumper: true,
  showPageSize: true,
});

const previewVisible = ref(false);
const currentUser = ref<UserListItem | null>(null);

const addModalVisible = ref(false);
const addForm = reactive({
  username: '',
  password: '',
  realName: '',
  phone: '',
  roleId: undefined as number | undefined,
  status: 1,
});

const editModalVisible = ref(false);
const editForm = reactive({
  id: 0,
  realName: '',
  phone: '',
  roleId: undefined as number | undefined,
});
const isAdminEditing = ref(false);

const fetchData = async () => {
  loading.value = true;
  try {
    const params: UserListParams = {
      page: pagination.current,
      size: pagination.pageSize,
      ...searchForm,
    };
    const res = await getUserList(params);
    let { records, total, current } = res.data;
    if (userStore.role === 'ADMIN') {
      const originalTotal = total;
      records = records.filter((r) => r.roleId !== 1);
      // 分页数量用原始 total，保持分页器正确
      pagination.total = originalTotal;
    } else {
      pagination.total = total;
    }
    tableData.value = records;
    pagination.current = current;
  } catch (error) {
    Message.error('获取用户列表失败，请重试');
    console.error(error);
  } finally {
    loading.value = false;
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
  searchForm.realName = '';
  searchForm.roleId = undefined;
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

const handlePreview = (record: UserListItem) => {
  currentUser.value = record;
  previewVisible.value = true;
};

const handleAdd = () => {
  addForm.username = '';
  addForm.password = '';
  addForm.realName = '';
  addForm.phone = '';
  addForm.roleId = undefined;
  addForm.status = 1;
  addModalVisible.value = true;
};

const handleAddSubmit = async (done: (val: boolean) => void) => {
  if (!addForm.username || !addForm.password || !addForm.realName || !addForm.phone || addForm.roleId === undefined) {
    Message.warning('请填写完整信息');
    done(false);
    return;
  }
  try {
    await addUser({
      username: addForm.username,
      password: encryptPassword(addForm.password),
      realName: addForm.realName,
      phone: addForm.phone,
      roleId: addForm.roleId as number,
      status: addForm.status,
    });
    Message.success('新增用户成功');
    addModalVisible.value = false;
    fetchData();
    done(true);
  } catch {
    Message.error('新增用户失败');
    done(false);
  }
};

// 判断当前用户是否有权限编辑某条记录
const canEdit = (record: UserListItem): boolean => {
  if (userStore.role === 'ADMIN') return true;
  if (userStore.role === 'DISPATCHER' && record.roleId === 3) return true;
  return false;
};

const handleEdit = (record: UserListItem) => {
  isAdminEditing.value = userStore.role === 'ADMIN';
  editForm.id = record.id;
  editForm.realName = record.realName;
  editForm.phone = record.phone;
  editForm.roleId = record.roleId;
  editModalVisible.value = true;
};

const handleEditSubmit = async (done: (val: boolean) => void) => {
  if (!editForm.realName || !editForm.phone) {
    Message.warning('请填写完整信息');
    done(false);
    return;
  }
  try {
    const data: { realName: string; phone: string; roleId?: number } = {
      realName: editForm.realName,
      phone: editForm.phone,
    };
    if (isAdminEditing.value && editForm.roleId !== undefined) {
      data.roleId = editForm.roleId;
    }
    await updateUser(editForm.id, data);
    Message.success('编辑用户成功');
    editModalVisible.value = false;
    fetchData();
    done(true);
  } catch {
    Message.error('编辑用户失败');
    done(false);
  }
};

const handleDelete = async (record: UserListItem) => {
  try {
    await deleteUser(record.id);
    Message.success('删除成功');
    fetchData();
  } catch {
    Message.error('删除失败');
  }
};

const handleResetPassword = async (record: UserListItem) => {
  try {
    await resetPassword(record.id);
    Message.success('密码已重置');
  } catch {
    Message.error('重置密码失败');
  }
};

const handleStatusChange = async (record: UserListItem, val: boolean) => {
  const newStatus = val ? 1 : 0;
  try {
    await updateUserStatus(record.id, newStatus);
    record.status = newStatus;
    Message.success(newStatus === 1 ? '已启用' : '已禁用');
  } catch {
    Message.error('更新状态失败');
  }
};

const columns: TableColumnData[] = [
  { title: '用户名', dataIndex: 'username' },
  { title: '姓名', dataIndex: 'realName' },
  { title: '手机号', dataIndex: 'phone' },
  { title: '角色名称', dataIndex: 'roleName' },
  { title: '状态', dataIndex: 'status', slotName: 'status' },
  { title: '创建时间', dataIndex: 'createTime' },
  { title: '操作', slotName: 'operations', width: 160, align: 'center' },
];

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.user-manage-container {
  padding: 20px;
  background-color: var(--color-bg-2);
  border-radius: 4px;
}
.search-form {
  margin-bottom: 20px;
}
</style>
