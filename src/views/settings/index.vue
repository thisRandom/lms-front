<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useUserStore } from '@/stores/user'
import { Message } from '@arco-design/web-vue'
import { IconEmail, IconPhone, IconUser } from '@arco-design/web-vue/es/icon'

const userStore = useUserStore()
const loading = ref(false)

const form = reactive({
  username: userStore.userInfo.username,
  realName: userStore.userInfo.realName,
  phone: userStore.userInfo.phone,
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const handleSubmit = () => {
  loading.value = true
  // TODO: call API to update user info
  setTimeout(() => {
    loading.value = false
    userStore.setUserInfo({
      ...userStore.userInfo,
      realName: form.realName,
      phone: form.phone,
    })
    Message.success('保存成功')
  }, 1000)
}
</script>

<template>
  <div class="settings-page">
    <a-card title="个人信息">
      <a-form :model="form" layout="vertical">
        <a-form-item label="用户名">
          <a-input :model-value="form.username" disabled>
            <template #prefix>
              <component :is="IconUser" />
            </template>
          </a-input>
        </a-form-item>
        <a-form-item label="真实姓名">
          <a-input v-model="form.realName" placeholder="请输入真实姓名">
            <template #prefix>
              <component :is="IconUser" />
            </template>
          </a-input>
        </a-form-item>
        <a-form-item label="手机号">
          <a-input v-model="form.phone" placeholder="请输入手机号">
            <template #prefix>
              <component :is="IconPhone" />
            </template>
          </a-input>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" :loading="loading" @click="handleSubmit">
            保存修改
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <a-card title="修改密码" style="margin-top: 16px;">
      <a-form :model="passwordForm" layout="vertical">
        <a-form-item label="旧密码">
          <a-input-password v-model="passwordForm.oldPassword" placeholder="请输入旧密码" />
        </a-form-item>
        <a-form-item label="新密码">
          <a-input-password v-model="passwordForm.newPassword" placeholder="请输入新密码（6-20位）" />
        </a-form-item>
        <a-form-item label="确认新密码">
          <a-input-password v-model="passwordForm.confirmPassword" placeholder="请再次输入新密码" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary">修改密码</a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<style lang="scss" scoped>
.settings-page {
  max-width: 600px;
}
</style>
