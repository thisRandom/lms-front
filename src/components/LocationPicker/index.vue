<template>
  <div class="location-picker">
    <!-- 搜索框 -->
    <div class="search-box">
      <a-input-search
          v-model="searchKeyword"
          placeholder="搜索城市名称"
          allow-clear
          search-button
          @search="handleSearch"
          style="width: 100%"
      />
      <!-- 搜索结果下拉 -->
      <div v-if="searchResults.length > 0" class="search-results">
        <div
            v-for="item in searchResults"
            :key="item.properties.name"
            class="search-result-item"
            @click="handleSelectCity(item)"
        >
          {{ item.properties.name }}
        </div>
      </div>
    </div>

    <!-- 地图容器 -->
    <div ref="mapContainer" class="map-container" :style="{ height }"></div>

    <!-- 轨迹模式：显示已选点列表 -->
    <div v-if="mode === 'trajectory' && points.length > 0" class="points-list">
      <div class="points-list-title">已选轨迹点 ({{ points.length }})</div>
      <div
          v-for="(point, index) in points"
          :key="index"
          class="point-item"
      >
        <span class="point-index">{{ index + 1 }}</span>
        <span class="point-name">{{ point.address || '未知位置' }}</span>
        <span class="point-coords">({{ point.latitude.toFixed(4) }}, {{ point.longitude.toFixed(4) }})</span>
        <icon-close class="point-remove" @click="removePoint(index)" />
      </div>
    </div>

    <!-- 单选模式：显示已选位置 -->
    <div v-else-if="selectedLocation" class="selected-info">
      <span class="address">{{ selectedLocation.address || '' }}</span>
      <span class="coords">
        ({{ selectedLocation.latitude.toFixed(4) }}, {{ selectedLocation.longitude.toFixed(4) }})
      </span>
    </div>
    <div v-else class="empty-hint">
      点击地图选择位置{{ mode === 'trajectory' ? '，可选择多个点形成轨迹' : '' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, onMounted, onUnmounted, watch, computed } from 'vue';
import * as echarts from 'echarts';
import { IconClose } from '@arco-design/web-vue/es/icon';

import chinaCityData from '@/assets/china.json';
import { getAddressByAdcode } from '@/utils/geo';

export interface LocationItem {
  latitude: number;
  longitude: number;
  address?: string;
  recordTime?: string;
}

interface Props {
  height?: string;
  mode?: 'single' | 'trajectory';
  initialLocation?: LocationItem;
  initialPoints?: LocationItem[];
}

const props = withDefaults(defineProps<Props>(), {
  height: '300px',
  mode: 'single',
});

interface Emits {
  (e: 'confirm', location: LocationItem): void;
  (e: 'pointsChange', points: LocationItem[]): void;
}

const emit = defineEmits<Emits>();

const mapContainer = ref<HTMLElement | null>(null);
const selectedLocation = ref<LocationItem | null>(null);
const points = ref<LocationItem[]>([]);
const searchKeyword = ref('');
const searchResults = ref<any[]>([]);

// 使用 shallowRef 存储 echarts 实例
const chartInstance = shallowRef<echarts.ECharts | null>(null);
let resizeObserver: ResizeObserver | null = null;

// 更新地图标记点
const updateMapMarker = (data: any[]) => {
  if (!chartInstance.value) return;
  chartInstance.value.setOption({
    series: [{
      data
    }]
  });
};

// 获取所有城市名称用于搜索
const allCities = computed(() => {
  return (chinaCityData as any).features || [];
});

// 根据 adcode 获取省市地址
const getAddressWithProvince = (cityFeature: any): string => {
  const adcode = cityFeature.properties?.adcode;
  const cityName = cityFeature.properties?.name || '';
  if (adcode) {
    return getAddressByAdcode(adcode, cityName);
  }
  return cityName;
};

// 搜索城市
const handleSearch = (value: string) => {
  if (!value.trim()) {
    searchResults.value = [];
    return;
  }
  const keyword = value.toLowerCase();
  searchResults.value = allCities.value.filter(
    (city: any) => city.properties.name.toLowerCase().includes(keyword)
  ).slice(0, 10);
};

// 选择城市
const handleSelectCity = (cityFeature: any) => {
  const [lng, lat] = cityFeature.properties.center;
  const address = getAddressWithProvince(cityFeature);
  const location = { latitude: lat, longitude: lng, address };

  if (props.mode === 'trajectory') {
    addPoint(location);
  } else {
    selectedLocation.value = location;
    updateMapMarker([{ name: address, value: [lng, lat] }]);
  }

  // 地图飞行到该位置
  chartInstance.value?.dispatchAction({
    type: 'geoRoam',
    targetScope: 'series',
    name: '选中点',
  });
  // 直接设置中心点
  chartInstance.value?.setOption({
    geo: {
      center: [lng, lat],
      zoom: 6
    }
  });

  searchResults.value = [];
  searchKeyword.value = '';
};

// 添加轨迹点
const addPoint = (location: LocationItem) => {
  points.value.push({
    ...location,
    recordTime: location.recordTime || new Date().toISOString()
  });
  emit('pointsChange', points.value);
  updateTrajectoryOnMap();
};

// 移除轨迹点
const removePoint = (index: number) => {
  points.value.splice(index, 1);
  emit('pointsChange', points.value);
  updateTrajectoryOnMap();
};

// 在地图上绘制轨迹
const updateTrajectoryOnMap = () => {
  if (!chartInstance.value) return;

  const scatterData = points.value.map((p, index) => ({
    name: p.address || `点${index + 1}`,
    value: [p.longitude, p.latitude]
  }));

  // 绘制轨迹线
  const lineData = points.value.map((p, index) => ({
    name: `线段${index}`,
    coords: index > 0
      ? [[points.value[index - 1]!.longitude, points.value[index - 1]!.latitude], [p.longitude, p.latitude]]
      : [[p.longitude, p.latitude], [p.longitude, p.latitude]]
  }));

  chartInstance.value.setOption({
    series: [
      {
        name: '轨迹点',
        type: 'effectScatter',
        coordinateSystem: 'geo',
        symbolSize: 10,
        itemStyle: { color: '#1890ff' },
        data: scatterData
      },
      {
        name: '轨迹线',
        type: 'lines',
        coordinateSystem: 'geo',
        polyline: true,
        lineStyle: { color: '#1890ff', width: 2, opacity: 0.6 },
        effect: { show: false },
        data: points.value.length > 1
          ? [{
              coords: points.value.map(p => [p.longitude, p.latitude])
            }]
          : []
      }
    ]
  });

  // 自动调整视野
  if (points.value.length > 1) {
    chartInstance.value.dispatchAction({ type: 'geoRoam' });
  }
};

// 地图初始化
const initMap = () => {
  if (!mapContainer.value) return;

  echarts.registerMap('china_cities', chinaCityData as any);
  chartInstance.value = echarts.init(mapContainer.value);

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}'
    },
    geo: {
      map: 'china_cities',
      roam: true,
      scaleLimit: { min: 0.8, max: 10 },
      label: { show: false },
      itemStyle: {
        areaColor: '#f3f4f5',
        borderColor: '#999',
        borderWidth: 0.5
      },
      emphasis: {
        itemStyle: { areaColor: '#e6f7ff' },
        label: { show: true, color: '#333' }
      }
    },
    series: [
      {
        name: '轨迹点',
        type: 'effectScatter',
        coordinateSystem: 'geo',
        symbolSize: 10,
        itemStyle: { color: '#1890ff' },
        data: []
      },
      {
        name: '轨迹线',
        type: 'lines',
        coordinateSystem: 'geo',
        polyline: true,
        lineStyle: { color: '#1890ff', width: 2, opacity: 0.6 },
        effect: { show: false },
        data: []
      }
    ]
  };

  chartInstance.value.setOption(option);

  // 点击地图选点
  chartInstance.value.on('click', (params: any) => {
    if (params.componentType !== 'geo' && params.componentType !== 'series') return;

    const cityName = params.name;
    const cityFeature = allCities.value.find(
      (f: any) => f.properties.name === cityName
    );

    if (cityFeature && cityFeature.properties.center) {
      const [lng, lat] = cityFeature.properties.center;
      const address = getAddressWithProvince(cityFeature);
      const location = { latitude: lat, longitude: lng, address };

      if (props.mode === 'trajectory') {
        addPoint(location);
      } else {
        selectedLocation.value = location;
        updateMapMarker([{ name: address, value: [lng, lat] }]);
      }
    }
  });

  // 初始数据回显
  if (props.mode === 'trajectory' && props.initialPoints && props.initialPoints.length > 0) {
    points.value = [...props.initialPoints];
    updateTrajectoryOnMap();
  } else if (props.initialLocation) {
    selectedLocation.value = { ...props.initialLocation };
    updateMapMarker([{
      name: props.initialLocation.address || '初始位置',
      value: [props.initialLocation.longitude, props.initialLocation.latitude]
    }]);
  }

  // 监听容器尺寸变化
  resizeObserver = new ResizeObserver(() => {
    chartInstance.value?.resize();
  });
  resizeObserver.observe(mapContainer.value);
};

onMounted(() => {
  initMap();
});

onUnmounted(() => {
  if (resizeObserver && mapContainer.value) {
    resizeObserver.unobserve(mapContainer.value);
    resizeObserver.disconnect();
  }
  if (chartInstance.value) {
    chartInstance.value.dispose();
    chartInstance.value = null;
  }
});

// 监听高度变化
watch(() => props.height, () => {
  setTimeout(() => {
    chartInstance.value?.resize();
  }, 0);
});

// 点击空白处关闭搜索结果
const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (!target.closest('.search-box')) {
    searchResults.value = [];
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// 对外暴露方法
defineExpose({
  confirm: () => {
    if (props.mode === 'trajectory') {
      const lastPoint = points.value[points.value.length - 1];
      if (lastPoint) {
        emit('confirm', lastPoint);
      }
    } else if (selectedLocation.value) {
      emit('confirm', selectedLocation.value);
    }
  },
  getSelectedLocation: () => selectedLocation.value,
  getPoints: () => [...points.value],
  addPoint,
  clearPoints: () => {
    points.value = [];
    updateMapMarker([]);
    chartInstance.value?.setOption({
      series: [{ data: [] }, { data: [] }]
    });
  },
});
</script>

<style scoped>
.location-picker {
  border: 1px solid var(--color-border, #e5e6eb);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.search-box {
  padding: 8px;
  position: relative;
  z-index: 10;
  background: #fff;
  border-bottom: 1px solid var(--color-border, #e5e6eb);
}

.search-results {
  position: absolute;
  top: 100%;
  left: 8px;
  right: 8px;
  background: #fff;
  border: 1px solid var(--color-border, #e5e6eb);
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
}

.search-result-item {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
}

.search-result-item:hover {
  background: var(--color-fill-1, #f7f8fa);
}

.map-container {
  width: 100%;
  flex-shrink: 0;
  z-index: 1;
  background: var(--color-fill-1, #f7f8fa);
}

.points-list {
  background: var(--color-fill-1, #f7f8fa);
  border-top: 1px solid var(--color-border, #e5e6eb);
  max-height: 150px;
  overflow-y: auto;
}

.points-list-title {
  padding: 8px 12px;
  font-size: 12px;
  color: var(--color-text-3, #86909c);
  font-weight: 500;
  border-bottom: 1px solid var(--color-border, #e5e6eb);
  position: sticky;
  top: 0;
  background: var(--color-fill-1, #f7f8fa);
}

.point-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  font-size: 13px;
}

.point-index {
  width: 18px;
  height: 18px;
  background: var(--color-primary, #1890ff);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  flex-shrink: 0;
}

.point-name {
  flex: 1;
  color: var(--color-text-1, #1d2129);
}

.point-coords {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 11px;
  color: var(--color-text-3, #86909c);
}

.point-remove {
  cursor: pointer;
  color: var(--color-text-3, #86909c);
  font-size: 12px;
}

.point-remove:hover {
  color: var(--color-red, #f53f3f);
}

.selected-info {
  padding: 10px 12px;
  background: var(--color-fill-1, #f7f8fa);
  display: flex;
  align-items: center;
  gap: 8px;
  border-top: 1px solid var(--color-border, #e5e6eb);
}

.selected-info .address {
  flex: 1;
  font-size: 14px;
  color: var(--color-text-1, #1d2129);
  font-weight: 500;
}

.selected-info .coords {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
  color: var(--color-text-3, #86909c);
}

.empty-hint {
  padding: 12px;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-3, #86909c);
  background: var(--color-fill-1, #f7f8fa);
  border-top: 1px solid var(--color-border, #e5e6eb);
}
</style>