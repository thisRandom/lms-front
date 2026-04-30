<template>
  <div class="address-cascader">
    <a-cascader
        v-model="selectedValue"
        :options="areaOptions"
        :placeholder="placeholder || '请选择省市区'"
        :disabled="disabled"
        :allow-clear="allowClear !== false"
        :size="size"
        :field-names="{ label: 'label', value: 'value', children: 'children' }"
        style="width: 100%; margin-bottom: 8px;"
    />
    <a-input
        v-model="detailAddress"
        :placeholder="'请输入详细地址'"
        :disabled="disabled"
        :size="size"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { AddressCascaderProps } from './types';
import { areaOptions } from './utils';

const props = withDefaults(defineProps<AddressCascaderProps>(), {
  disabled: false,
  allowClear: true,
  size: 'medium',
  placeholder: '请选择省市区',
});

const emit = defineEmits<{
  (e: 'update:provinceCode', value: string): void;
  (e: 'update:cityCode', value: string): void;
  (e: 'update:districtCode', value: string): void;
  (e: 'update:detailAddress', value: string): void;
  (e: 'change', value: { provinceCode: string; cityCode: string; districtCode: string; detailAddress: string }): void;
}>();

const selectedValue = ref<string[]>([]);
const detailAddress = ref('');

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    selectedValue.value = [
      newVal.provinceCode,
      newVal.cityCode,
      newVal.districtCode,
    ].filter(Boolean);
    detailAddress.value = newVal.detailAddress || '';
  }
}, { immediate: true });

watch(selectedValue, ([provinceCode, cityCode, districtCode]) => {
  emit('update:provinceCode', provinceCode || '');
  emit('update:cityCode', cityCode || '');
  emit('update:districtCode', districtCode || '');
  emit('change', {
    provinceCode: provinceCode || '',
    cityCode: cityCode || '',
    districtCode: districtCode || '',
    detailAddress: detailAddress.value,
  });
});

watch(detailAddress, (val) => {
  emit('update:detailAddress', val);
  emit('change', {
    provinceCode: selectedValue.value[0] || '',
    cityCode: selectedValue.value[1] || '',
    districtCode: selectedValue.value[2] || '',
    detailAddress: val,
  });
});
</script>

<style scoped>
.address-cascader {
  width: 100%;
}
</style>
