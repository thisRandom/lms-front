<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { Message } from '@arco-design/web-vue'
import { IconUser, IconPhone, IconLock } from '@arco-design/web-vue/es/icon'
import { encryptPassword } from '@/utils/crypto'
import { updatePassword } from '@/api/user'

const userStore = useUserStore()

const activeTab = ref('profile')

// === 个人信息表单 ===
const profileLoading = ref(false)
const profileForm = reactive({
  realName: '',
  phone: '',
})

onMounted(async () => {
  await userStore.fetchUserInfo()
  profileForm.realName = userStore.realName || ''
  profileForm.phone = userStore.phone || ''
})

const handleProfileSave = async () => {
  if (!profileForm.realName.trim()) {
    Message.warning('请输入姓名')
    return
  }
  profileLoading.value = true
  try {
    await userStore.updateProfile({
      realName: profileForm.realName,
      phone: profileForm.phone,
    })
    Message.success('保存成功')
  } catch (error) {
    console.error('更新失败', error)
  } finally {
    profileLoading.value = false
  }
}

// === 修改密码表单 ===
const pwdLoading = ref(false)
const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const pwdFormRef = ref()

const handlePwdSave = async () => {
  if (!pwdForm.oldPassword) {
    Message.warning('请输入当前密码')
    return
  }
  if (!pwdForm.newPassword) {
    Message.warning('请输入新密码')
    return
  }
  if (pwdForm.newPassword.length < 6) {
    Message.warning('新密码长度至少6位')
    return
  }
  if (pwdForm.newPassword !== pwdForm.confirmPassword) {
    Message.warning('两次输入的密码不一致')
    return
  }

  pwdLoading.value = true
  try {
    await updatePassword(
      encryptPassword(pwdForm.oldPassword),
      encryptPassword(pwdForm.newPassword)
    )
    Message.success('密码修改成功，请重新登录')
    await userStore.logout()
    window.location.reload()
  } catch (error) {
    console.error('修改密码失败', error)
  } finally {
    pwdLoading.value = false
  }
}
</script>

<template>
  <div class="customer-settings">
    <div class="settings-container">
      <!-- 侧边导航 -->
      <div class="settings-nav">
        <div class="nav-header">
          <div class="avatar">
            <IconUser />
          </div>
          <div class="user-info">
            <span class="username">{{ userStore.realName || userStore.username }}</span>
            <span class="role">客户</span>
          </div>
        </div>
        <div class="nav-items">
          <div
              :class="['nav-item', { active: activeTab === 'profile' }]"
              @click="activeTab = 'profile'"
          >
            <IconUser />
            <span>个人信息</span>
          </div>
          <div
              :class="['nav-item', { active: activeTab === 'security' }]"
              @click="activeTab = 'security'"
          >
            <IconLock />
            <span>修改密码</span>
          </div>
        </div>
      </div>

      <!-- 内容区 -->
      <div class="settings-content">
        <!-- 个人信息 -->
        <div v-show="activeTab === 'profile'" class="content-panel">
          <div class="panel-header">
            <h3>个人信息</h3>
            <p>管理您的账户基本信息</p>
          </div>
          <div class="form-card">
            <div class="form-item">
              <label>用户名</label>
              <div class="value-text">{{ userStore.username }}</div>
            </div>
            <div class="form-item">
              <label>姓名</label>
              <a-input
                  v-model="profileForm.realName"
                  placeholder="请输入姓名"
                  style="width: 320px"
              />
            </div>
            <div class="form-item">
              <label>手机号</label>
              <a-input
                  v-model="profileForm.phone"
                  placeholder="请输入手机号"
                  style="width: 320px"
              />
            </div>
            <div class="form-actions">
              <a-button type="primary" :loading="profileLoading" @click="handleProfileSave">
                保存修改
              </a-button>
            </div>
          </div>
        </div>

        <!-- 修改密码 -->
        <div v-show="activeTab === 'security'" class="content-panel">
          <div class="panel-header">
            <h3>修改密码</h3>
            <p>定期更换密码可以保护账户安全</p>
          </div>
          <div class="form-card">
            <div class="form-item">
              <label>当前密码</label>
              <a-input-password
                  v-model="pwdForm.oldPassword"
                  placeholder="请输入当前密码"
                  style="width: 320px"
              />
            </div>
            <div class="form-item">
              <label>新密码</label>
              <a-input-password
                  v-model="pwdForm.newPassword"
                  placeholder="请输入新密码（至少6位）"
                  style="width: 320px"
              />
            </div>
            <div class="form-item">
              <label>确认新密码</label>
              <a-input-password
                  v-model="pwdForm.confirmPassword"
                  placeholder="请再次输入新密码"
                  style="width: 320px"
              />
            </div>
            <div class="form-actions">
              <a-button type="primary" :loading="pwdLoading" @click="handlePwdSave">
                修改密码
              </a-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.customer-settings {
  padding: 20px;
  min-height: calc(100vh - 60px);
  background: var(--color-bg-1);
}

.settings-container {
  display: flex;
  gap: 28px;
  max-width: 1100px;
  margin: 0 auto;
}

/* 侧边导航 */
.settings-nav {
  width: 260px;
  flex-shrink: 0;
  background: var(--color-bg-2);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
}

.nav-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 16px;
  border-bottom: 1px solid var(--color-border);
  background: linear-gradient(135deg, #165DFF 0%, #4080FF 100%);
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.username {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
}

.role {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.nav-items {
  padding: 12px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  font-size: 14px;
  color: var(--color-text-2);
  cursor: pointer;
  transition: all 0.2s;
}

.nav-item:hover {
  background: var(--color-fill-1);
  color: var(--color-text-1);
}

.nav-item.active {
  background: var(--color-primary-light-1);
  color: var(--color-primary);
  font-weight: 500;
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--color-primary);
  border-radius: 0 2px 2px 0;
}

/* 内容区 */
.settings-content {
  flex: 1;
  min-width: 0;
}

.content-panel {
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.panel-header {
  margin-bottom: 16px;
}

.panel-header h3 {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-1);
}

.panel-header p {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-3);
}

/* 表单卡片 */
.form-card {
  background: var(--color-bg-2);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 32px;
}

.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.form-item label {
  width: 120px;
  font-size: 14px;
  color: var(--color-text-3);
  flex-shrink: 0;
}

.value-text {
  font-size: 14px;
  color: var(--color-text-1);
}

.form-actions {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border);
}
</style>