<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { Message } from '@arco-design/web-vue'
import { IconPhone, IconUser, IconLock, IconSafe, IconCamera } from '@arco-design/web-vue/es/icon'
import { encryptPassword } from '@/utils/crypto'
import { updatePassword } from '@/api/user'
import { uploadFile } from '@/api/upload'
import VueCropper from 'vue-cropperjs'
import 'vue-cropperjs/node_modules/cropperjs/dist/cropper.css'

const userStore = useUserStore()

const avatarFullUrl = computed(() => userStore.url ? `/api/images${userStore.url}` : null)

// === 1. 基础信息表单逻辑 ===
const profileFormRef = ref()
const profileLoading = ref(false)
const isEditing = ref(false)

const profileForm = reactive({
  realName: '',
  phone: '',
})

const originFormData = reactive({
  realName: '',
  phone: '',
})

const profileRules = {
  realName: [{ required: true, message: '姓名不能为空' }],
  phone: [
    { required: false },
    { match: /^1[3-9]\d{9}$/, message: '请输入正确的11位手机号格式' }
  ]
}

const handleProfileSubmit = async ({ errors, values }: any) => {
  if (errors) return

  profileLoading.value = true
  try {
    await userStore.updateProfile({
      realName: profileForm.realName,
      phone: profileForm.phone,
    })
    Message.success('个人资料已成功更新')
    isEditing.value = false
  } catch (error) {
    console.error('更新失败', error)
  } finally {
    profileLoading.value = false
  }
}

const toggleEdit = () => {
  if (isEditing.value) {
    profileForm.realName = originFormData.realName
    profileForm.phone = originFormData.phone
  }
  isEditing.value = !isEditing.value
}

onMounted(async () => {
  await userStore.fetchUserInfo()
  profileForm.realName = userStore.realName || ''
  profileForm.phone = userStore.phone || ''
  originFormData.realName = profileForm.realName
  originFormData.phone = profileForm.phone
})

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

// === 3. 头像上传 + 裁切逻辑 ===
const fileInput = ref<HTMLInputElement>()
const cropModalVisible = ref(false)
const cropImgSrc = ref('')
const cropperRef = ref()
const avatarUploading = ref(false)

const handleAvatarClick = () => {
  fileInput.value?.click()
}

const handleFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    Message.warning('请选择图片文件')
    return
  }

  const reader = new FileReader()
  reader.onload = (event) => {
    cropImgSrc.value = event.target?.result as string
    cropModalVisible.value = true
  }
  reader.readAsDataURL(file)

  // 重置 input，允许重复选择同一文件
  input.value = ''
}

/** 将裁切后的 canvas 压缩为 Blob（300x300，JPEG 0.7） */
const getCroppedBlob = (): Promise<Blob> => {
  const canvas = cropperRef.value?.getCroppedCanvas({
    width: 300,
    height: 300,
    imageSmoothingQuality: 'high',
  })
  if (!canvas) return Promise.reject(new Error('裁切失败'))

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob: Blob | null) => {
        if (blob) resolve(blob)
        else reject(new Error('压缩失败'))
      },
      'image/jpeg',
      0.7
    )
  })
}

const handleCropConfirm = async () => {
  avatarUploading.value = true
  try {
    const blob = await getCroppedBlob()
    const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })

    // 1. 上传文件（后端已自动关联头像到当前用户）
    await uploadFile(file)

    // 2. 刷新本地 store
    await userStore.fetchUserInfo()

    Message.success('头像更新成功')
    cropModalVisible.value = false
  } catch (error) {
    console.error('头像上传失败', error)
  } finally {
    avatarUploading.value = false
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
            <IconUser class="tab-icon"/> 基本信息
          </template>

          <div class="tab-content">
            <div class="avatar-section">
              <div class="avatar-wrapper" @click="handleAvatarClick">
                <a-avatar v-if="avatarFullUrl" :size="72" :image-url="avatarFullUrl" />
                <a-avatar v-else :size="72" :style="{ backgroundColor: '#3370ff' }">
                  <IconUser/>
                </a-avatar>
                <div class="avatar-overlay">
                  <IconCamera :size="20" />
                  <span>更换头像</span>
                </div>
              </div>
              <div class="avatar-tips">
                <h3 class="user-name">{{ userStore.username }}</h3>
                <div class="role-wrapper">
                  <span class="role-label">角色：</span>
                  <span class="role-tag">{{ userStore.role }}</span>
                </div>
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
              <a-form-item field="realName" label="姓名">
                <a-input v-model="profileForm.realName" placeholder="请输入姓名" size="large" :disabled="!isEditing">
                  <template #prefix><IconUser /></template>
                </a-input>
              </a-form-item>

              <a-form-item field="phone" label="手机号">
                <a-input v-model="profileForm.phone" placeholder="请输入手机号" size="large" :disabled="!isEditing">
                  <template #prefix><IconPhone /></template>
                </a-input>
              </a-form-item>

              <a-form-item>
                <div class="action-row">
                  <a-button v-if="!isEditing" type="primary" size="large" @click="toggleEdit">
                    编辑
                  </a-button>
                  <template v-else>
                    <a-button type="primary" html-type="submit" :loading="profileLoading" size="large">
                      保存
                    </a-button>
                    <a-button size="large" @click="toggleEdit" style="margin-left: 12px">
                      取消
                    </a-button>
                  </template>
                </div>
              </a-form-item>
            </a-form>
          </div>
        </a-tab-pane>

        <a-tab-pane key="security">
          <template #title>
            <IconSafe class="tab-icon"/> 安全设置
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
                  <template #prefix><IconLock /></template>
                </a-input-password>
              </a-form-item>

              <a-form-item field="newPassword" label="新密码">
                <a-input-password v-model="pwdForm.newPassword" placeholder="8-16位，含大小写/数字/符号至少三种" size="large">
                  <template #prefix><IconLock /></template>
                </a-input-password>
              </a-form-item>

              <a-form-item field="confirmPassword" label="确认新密码">
                <a-input-password v-model="pwdForm.confirmPassword" placeholder="请再次输入新密码" size="large">
                  <template #prefix><IconLock /></template>
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

    <!-- 隐藏的文件选择框 -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleFileChange"
    />

    <!-- 裁切弹窗 -->
    <a-modal
      v-model:visible="cropModalVisible"
      title="裁切头像"
      :width="520"
      :mask-closable="false"
      :footer="false"
      @close="cropImgSrc = ''"
    >
      <div class="crop-container" v-if="cropModalVisible && cropImgSrc">
        <VueCropper
          ref="cropperRef"
          :src="cropImgSrc"
          :auto-crop="true"
          :auto-crop-width="300"
          :auto-crop-height="300"
          :aspect-ratio="1"
          :fixed-box="true"
          :crop-box-resizable="false"
          :center-box="true"
          :can-move-box="true"
          :can-scale="true"
          :output-type="'png'"
          :check-cross-origin="false"
        />
      </div>
      <div class="crop-actions">
        <a-button @click="cropModalVisible = false" :disabled="avatarUploading">取消</a-button>
        <a-button type="primary" @click="handleCropConfirm" :loading="avatarUploading" style="margin-left: 12px">
          确认上传
        </a-button>
      </div>
    </a-modal>
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
    padding: 10px 24px;

    :deep(.arco-tabs-nav-tab) {
      justify-content: flex-start;
    }

    :deep(.arco-tabs-tab) {
      font-size: 16px;
      padding: 14px 20px;
      margin-right: 16px;
      border-radius: 6px;
      transition: all 0.2s;
    }

    :deep(.arco-tabs-tab:hover) {
      background-color: var(--color-fill-2);
    }

    :deep(.arco-tabs-nav::before) {
      display: none;
    }

    :deep(.arco-tabs-nav-tab-list) {
      gap: 32px;
    }

    .tab-icon {
      margin-right: 6px;
      font-size: 18px;
      vertical-align: -2px;
    }
  }

  .tab-content {
    padding: 32px 0 24px 0;
    max-width: 500px;

    .avatar-section {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 16px 0;

      .avatar-wrapper {
        position: relative;
        cursor: pointer;
        border-radius: 50%;
        overflow: hidden;
        flex-shrink: 0;

        .avatar-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          color: #fff;
          font-size: 12px;
          opacity: 0;
          transition: opacity 0.25s;
          border-radius: 50%;
        }

        &:hover .avatar-overlay {
          opacity: 1;
        }
      }

      .role-label {
        color: var(--color-text-3, #86909c);
        font-weight: 500;
        margin-right: 4px;
      }

      .role-wrapper {
        display: flex;
        align-items: center;
        font-size: 14px;
      }

      .avatar-tips .user-name {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: var(--color-text-1, #1d2129);
        line-height: 1.2;
      }

      .avatar-tips {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 8px;
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

      .action-row {
        display: flex;
        align-items: center;
      }
    }
  }
}

.crop-container {
  width: 100%;
  height: 360px;
  background: #000;
  border-radius: 6px;
  overflow: hidden;
}

.crop-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
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
