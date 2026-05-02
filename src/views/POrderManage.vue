<template>
  <div class="quick-order-container">
    <div class="order-card">
      <div class="card-header">
        <div class="header-icon">
          <icon-send />
        </div>
        <div class="header-text">
          <h2>快速下单</h2>
          <p>填写货物信息，我们将为您安排最优配送</p>
        </div>
      </div>

      <a-form :model="form" layout="vertical" class="order-form">
        <div class="form-section">
          <div class="section-title">
            <span class="section-number">1</span>
            发货信息
          </div>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item field="shipperName" label="发货人" required>
                <a-input v-model="form.shipperName" placeholder="请输入发货人姓名" size="large">
                  <template #prefix><icon-user /></template>
                </a-input>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item field="shipperPhone" label="发货人电话" required>
                <a-input v-model="form.shipperPhone" placeholder="请输入联系电话" size="large">
                  <template #prefix><icon-phone /></template>
                </a-input>
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item field="shipperAddress" label="发货地址">
                <AddressCascader
                    v-model:province-code="form.shipperProvince"
                    v-model:city-code="form.shipperCity"
                    v-model:district-code="form.shipperDistrict"
                    v-model:detail-address="form.shipperDetailAddress"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </div>

        <div class="form-section">
          <div class="section-title">
            <span class="section-number">2</span>
            收货信息
          </div>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item field="receiverName" label="收货人">
                <a-input v-model="form.receiverName" placeholder="请输入收货人姓名" size="large">
                  <template #prefix><icon-user /></template>
                </a-input>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item field="receiverPhone" label="收货人电话" required>
                <a-input v-model="form.receiverPhone" placeholder="请输入联系电话" size="large">
                  <template #prefix><icon-phone /></template>
                </a-input>
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item field="receiverAddress" label="收货地址" required>
                <AddressCascader
                    v-model:province-code="form.receiverProvince"
                    v-model:city-code="form.receiverCity"
                    v-model:district-code="form.receiverDistrict"
                    v-model:detail-address="form.receiverDetailAddress"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </div>

        <div class="form-section">
          <div class="section-title">
            <span class="section-number">3</span>
            货物信息
          </div>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item field="goodsType" label="货物类型" required>
                <a-select v-model="form.goodsType" placeholder="请选择货物类型" size="large">
                  <a-option value="电子产品">电子产品</a-option>
                  <a-option value="服装鞋帽">服装鞋帽</a-option>
                  <a-option value="食品饮料">食品饮料</a-option>
                  <a-option value="家具家居">家具家居</a-option>
                  <a-option value="图书文具">图书文具</a-option>
                  <a-option value="医药用品">医药用品</a-option>
                  <a-option value="其他货物">其他货物</a-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item field="weight" label="重量（吨）" required>
                <a-input-number v-model="form.weight" placeholder="请输入重量" :min="0" :precision="2" size="large" style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item field="volume" label="体积（方）">
                <a-input-number v-model="form.volume" placeholder="请输入体积（选填）" :min="0" :precision="2" size="large" style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item field="remark" label="备注">
                <a-input v-model="form.remark" placeholder="特殊要求说明（选填）" size="large">
                  <template #prefix><icon-message /></template>
                </a-input>
              </a-form-item>
            </a-col>
          </a-row>
        </div>

        <div class="form-actions">
          <a-button type="outline" size="large" @click="handleReset">
            <template #icon><icon-refresh /></template>
            重置表单
          </a-button>
          <a-button type="primary" size="large" :loading="submitting" @click="handleSubmit">
            <template #icon><icon-send /></template>
            提交订单
          </a-button>
        </div>
      </a-form>
    </div>

    <div class="service-info">
      <div class="info-item">
        <div class="info-icon fast">
          <icon-send />
        </div>
        <div>
          <h4>快速响应</h4>
          <p>下单后立即安排调度</p>
        </div>
      </div>
      <div class="info-item">
        <div class="info-icon safe">
          <icon-lock />
        </div>
        <div>
          <h4>安全保障</h4>
          <p>全程货物追踪定位</p>
        </div>
      </div>
      <div class="info-item">
        <div class="info-icon service">
          <icon-phone />
        </div>
        <div>
          <h4>专属客服</h4>
          <p>24小时在线服务</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { Message } from '@arco-design/web-vue';
import {
  IconSend, IconUser, IconPhone, IconLocation,
  IconMessage, IconRefresh, IconLock, IconVoice
} from '@arco-design/web-vue/es/icon';

import { createOrder } from '@/api/orders';
import type { CreateOrderData } from '@/api/orders';
import AddressCascader from '@/components/AddressCascader/index.vue';
import { buildFullAddress } from '@/components/AddressCascader/utils';

const submitting = ref(false);

const form = reactive({
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

const handleReset = () => {
  form.shipperName = '';
  form.shipperPhone = '';
  form.shipperProvince = '';
  form.shipperCity = '';
  form.shipperDistrict = '';
  form.shipperDetailAddress = '';
  form.receiverName = '';
  form.receiverPhone = '';
  form.receiverProvince = '';
  form.receiverCity = '';
  form.receiverDistrict = '';
  form.receiverDetailAddress = '';
  form.goodsType = '';
  form.weight = 0;
  form.volume = 0;
  form.remark = '';
  Message.info('表单已重置');
};

const handleSubmit = async () => {
  if (!form.shipperName || !form.shipperPhone ||
      !form.receiverName || !form.receiverPhone ||
      !form.shipperProvince || !form.shipperCity || !form.shipperDistrict || !form.shipperDetailAddress ||
      !form.receiverProvince || !form.receiverCity || !form.receiverDistrict || !form.receiverDetailAddress ||
      !form.goodsType || !form.weight) {
    Message.warning('请填写完整的发货、收货和货物信息');
    return;
  }

  submitting.value = true;
  try {
    const shipperAddress = buildFullAddress(
      form.shipperProvince,
      form.shipperCity,
      form.shipperDistrict,
      form.shipperDetailAddress
    );
    const receiverAddress = buildFullAddress(
      form.receiverProvince,
      form.receiverCity,
      form.receiverDistrict,
      form.receiverDetailAddress
    );
    const data: CreateOrderData = {
      shipperName: form.shipperName,
      shipperPhone: form.shipperPhone,
      shipperAddress,
      receiverName: form.receiverName,
      receiverPhone: form.receiverPhone,
      receiverAddress,
      goodsType: form.goodsType,
      weight: form.weight,
      volume: form.volume || undefined,
      remark: form.remark || undefined,
    };
    await createOrder(data);
    Message.success('订单提交成功！我们将尽快为您安排配送');
    handleReset();
  } catch {
    Message.error('订单提交失败，请稍后重试');
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.quick-order-container {
  padding: 20px 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.order-card {
  background: var(--color-bg-2);
  border-radius: 12px;
  padding: 28px 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--color-border);
}

.header-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
}

.header-text h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-1);
}

.header-text p {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--color-text-3);
}

.form-section {
  margin-bottom: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-1);
  margin-bottom: 16px;
}

.section-number {
  width: 22px;
  height: 22px;
  background: linear-gradient(135deg, #165dff 0%, #4080ff 100%);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border);
}

.form-actions .arco-btn {
  min-width: 130px;
  height: 40px;
  font-size: 15px;
}

.service-info {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 20px;
}

.info-item {
  background: var(--color-bg-2);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.info-item .arco-icon {
  font-size: 26px;
  color: #165dff;
  margin-top: 2px;
}

.info-item h4 {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-1);
}

.info-item p {
  margin: 3px 0 0;
  font-size: 11px;
  color: var(--color-text-3);
}
</style>