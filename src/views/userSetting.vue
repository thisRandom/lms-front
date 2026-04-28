<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useUserStore } from '@/stores/user'
import { Message } from '@arco-design/web-vue'
import { IconPhone, IconUser, IconLock, IconSafe } from '@arco-design/web-vue/es/icon'
import { encryptPassword } from '@/utils/crypto'

const userStore = useUserStore()

// === 1. 基础信息表单逻辑 ===
const profileFormRef = ref()
const profileLoading = ref(false)

const profileForm = reactive({
  username: userStore.username || '',
  phone: '',
})

const profileRules = {
  username: [{ required: true, message: '姓名不能为空' }],
  phone: [
    { required: false },
    { match: /^1[3-9]\d{9}$/, message: '请输入正确的11位手机号格式' }
  ]
}

const handleProfileSubmit = async ({ errors, values }: any) => {
  if (errors) return

  profileLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 800))
    userStore.setInfo({ username: values.username })
    Message.success('个人资料已成功更新')
  } catch (error) {
    console.error('更新失败', error)
  } finally {
    profileLoading.value = false
  }
}

// === 2. 修改密码表单逻辑 ===
const pwdFormRef = ref()
const pwdLoading = ref(false)

const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const pwdRules = {
  oldPassword: [{ required: true, message: '请输入当前密码' }],
  newPassword: [
    { required: true, message: '请输入新密码' },
    {
      // 直接使用后端的正则表达式
      match: /^(?![a-zA-Z]+$)(?![a-z0-9]+$)(?![a-z\W_]+$)(?![A-Z0-9]+$)(?![A-Z\W_]+$)(?![0-9\W_]+$)[a-zA-Z0-9\W_]{8,16}$/,
      message: '密码需8-16位，且包含大、小写字母、数字、特殊符号中的至少三种'
    }
  ],
  confirmPassword: [
    { required: true, message: '请再次确认新密码' },
    {
      validator: (value: string, cb: (error?: string) => void) => {
        if (value !== pwdForm.newPassword) {
          cb('两次输入的密码不一致')
        } else {
          cb()
        }
      }
    }
  ]
}

const handlePwdSubmit = async ({ errors }: any) => {
  if (errors) return

  pwdLoading.value = true
  try {
    const payload = {
      oldPassword: encryptPassword(pwdForm.oldPassword),
      newPassword: encryptPassword(pwdForm.newPassword)
    }

    console.log('发给后端的加密密码载荷:', payload)
    await new Promise(resolve => setTimeout(resolve, 1000))

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
  <div class="settings-page anim-fade-in">
    <div class="page-header">
      <h2>个人中心</h2>
      <p>管理您的基础信息与账户安全</p>
    </div>

    <a-card class="settings-card" :bordered="false">
      <a-tabs default-active-key="basic" size="large" type="line" class="top-tabs">

        <a-tab-pane key="basic">
          <template #title>
            <icon-user class="tab-icon"/> 基本信息
          </template>

          <div class="tab-content">
            <div class="avatar-section">
              <a-avatar :size="72" :style="{ backgroundColor: 'var(--color-primary)' }">
                <IconUser />
              </a-avatar>
              <div class="avatar-tips">
                <h3>{{ userStore.username }}</h3>
                <span class="role-tag">{{ userStore.role }}</span>
              </div>
            </div>

            <a-form
                ref="profileFormRef"
                :model="profileForm"
                :rules="profileRules"
                @submit="handleProfileSubmit"
                layout="vertical"
                class="form-container"
            >
              <a-form-item field="username" label="真实姓名/昵称">
                <a-input v-model="profileForm.username" placeholder="请输入姓名" size="large">
                  <template #prefix><icon-user /></template>
                </a-input>
              </a-form-item>

              <a-form-item field="phone" label="联系手机">
                <a-input v-model="profileForm.phone" placeholder="请输入手机号" size="large">
                  <template #prefix><icon-phone /></template>
                </a-input>
              </a-form-item>

              <a-form-item>
                <a-button type="primary" html-type="submit" :loading="profileLoading" size="large">
                  保存基本信息
                </a-button>
              </a-form-item>
            </a-form>
          </div>
        </a-tab-pane>

        <a-tab-pane key="security">
          <template #title>
            <icon-safe class="tab-icon"/> 安全设置
          </template>

          <div class="tab-content">
            <div class="security-header">
              <h3>修改账户密码</h3>
              <p>密码长度需至少 6 位，修改成功后需重新登录。</p>
            </div>

            <a-form
                ref="pwdFormRef"
                :model="pwdForm"
                :rules="pwdRules"
                @submit="handlePwdSubmit"
                layout="vertical"
                class="form-container"
            >
              <a-form-item field="oldPassword" label="当前密码">
                <a-input-password v-model="pwdForm.oldPassword" placeholder="请输入当前密码" size="large">
                  <template #prefix><icon-lock /></template>
                </a-input-password>
              </a-form-item>

              <a-form-item field="newPassword" label="新密码">
                <a-input-password v-model="pwdForm.newPassword" placeholder="8-16位，含大小写/数字/符号至少三种" size="large">
                  <template #prefix><icon-lock /></template>
                </a-input-password>
              </a-form-item>

              <a-form-item field="confirmPassword" label="确认新密码">
                <a-input-password v-model="pwdForm.confirmPassword" placeholder="请再次输入新密码" size="large">
                  <template #prefix><icon-lock /></template>
                </a-input-password>
              </a-form-item>

              <a-form-item>
                <a-button type="primary" html-type="submit" :loading="pwdLoading" size="large">
                  提交并修改密码
                </a-button>
              </a-form-item>
            </a-form>
          </div>
        </a-tab-pane>

      </a-tabs>
    </a-card>
  </div>
</template>

<style lang="scss" scoped>
.settings-page {
  padding: 0 12px;

  .page-header {
    margin-bottom: 24px;
    h2 {
      margin: 0 0 8px 0;
      color: var(--color-text-1);
      font-size: 20px;
    }
    p {
      margin: 0;
      color: var(--color-text-3);
      font-size: 14px;
    }
  }

  .settings-card {
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
    min-height: 550px;
    padding: 10px 24px; // 给整个卡片内部增加一点呼吸感


    /* 优化顶部 Tabs 的样式，恢复官方的松快感 */
    :deep(.arco-tabs-nav-tab) {
      justify-content: flex-start;
    }

    :deep(.arco-tabs-tab) {
      font-size: 16px;
      /* 核心修复：加大左右内边距 (padding)，让文字周围充满空气感 */
      padding: 14px 20px;
      /* 增加外边距 (margin)，拉开两个 Tab 之间的物理距离 */
      margin-right: 16px;
      border-radius: 6px;
      transition: all 0.2s;
    }

    /* 优化悬浮效果，增加一点微交互底色 */
    :deep(.arco-tabs-tab:hover) {
      background-color: var(--color-fill-2);
    }

    /* 隐藏默认自带的底部灰线，让界面更干净 */
    :deep(.arco-tabs-nav::before) {
      display: none;
    }



    :deep(.arco-tabs-nav-tab-list) {
      gap: 32px; // 拉开两个 Tab 之间的距离
    }



    .tab-icon {
      margin-right: 6px;
      font-size: 18px;
      vertical-align: -2px;
    }
  }

  .tab-content {
    padding: 32px 0 24px 0; /* 顶部留白，让内容与 Tab 分开 */
    max-width: 500px; /* 限制表单最大宽度，防止横向拉伸过长 */

    .avatar-section {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 36px;

      .avatar-tips {
        h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          color: var(--color-text-1);
        }
        .role-tag {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          background: var(--color-primary-light-1);
          color: var(--color-primary);
          font-size: 12px;
          font-weight: 500;
        }
      }
    }

    .security-header {
      margin-bottom: 32px;
      h3 {
        margin: 0 0 8px 0;
        font-size: 18px;
        color: var(--color-text-1);
      }
      p {
        margin: 0;
        color: var(--color-text-3);
        font-size: 14px;
      }
    }

    .form-container {
      width: 100%;
    }
  }
}

.anim-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>