<template>
  <a-modal
      :visible="visible"
      title="轨迹预览"
      :width="900"
      :footer="false"
      @update:visible="visible = $event"
  >
    <div class="trajectory-container">
      <!-- 地图 -->
      <div ref="mapContainer" class="map-container" :style="{ height }"></div>

      <!-- 时间线列表 -->
      <div class="timeline" v-if="points.length > 0">
        <div class="timeline-title">轨迹点 ({{ points.length }})</div>
        <div class="timeline-list">
          <div
              v-for="(point, index) in points"
              :key="point.id || index"
              class="timeline-item"
              :class="{ active: activeIndex === index }"
              @click="focusPoint(index)"
          >
            <div class="timeline-marker">
              <div class="marker-dot" :class="{ start: index === 0, end: index === points.length - 1 }"></div>
              <div class="marker-line" v-if="index < points.length - 1"></div>
            </div>
            <div class="timeline-content">
              <div class="timeline-address">{{ point.location || '未知位置' }}</div>
              <div class="timeline-time">{{ formatTime(point.recordTime) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        暂无轨迹数据
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, shallowRef, watch, nextTick, computed } from 'vue';
import * as echarts from 'echarts';

import chinaCityData from '@/assets/china.json';
import type { LocationPoint } from '@/api/location';

interface Props {
  visible?: boolean;
  points?: LocationPoint[];
  height?: string;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  points: () => [],
  height: '500px',
});

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
}>();

const visible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
});

const mapContainer = ref<HTMLElement | null>(null);
const chartInstance = shallowRef<echarts.ECharts | null>(null);
const activeIndex = ref(-1);

const formatTime = (time: string) => {
  if (!time) return '';
  const date = new Date(time);
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const initMap = () => {
  if (!mapContainer.value) return;

  echarts.registerMap('china_cities', chinaCityData as any);
  chartInstance.value = echarts.init(mapContainer.value);

  updateChart();

  // 点击地图上的点
  chartInstance.value.on('click', (params: any) => {
    if (params.componentType === 'series') {
      const index = params.dataIndex;
      if (typeof index === 'number') {
        focusPoint(index);
      }
    }
  });
};

const updateChart = () => {
  if (!chartInstance.value || props.points.length === 0) return;

  const scatterData = props.points.map((p, index) => ({
    name: p.location || `点${index + 1}`,
    value: [p.longitude, p.latitude],
  }));

  chartInstance.value.setOption({
    tooltip: {
      trigger: 'item' as const,
      formatter: (params: any) => {
        const point = props.points[params.dataIndex];
        if (!point) return '';
        return `${point.location || '未知位置'}<br/>${formatTime(point.recordTime)}`;
      }
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
        data: scatterData
      },
      {
        name: '轨迹线',
        type: 'lines',
        coordinateSystem: 'geo',
        polyline: true,
        lineStyle: { color: '#1890ff', width: 2, opacity: 0.6 },
        effect: { show: false },
        data: [{
          coords: props.points.map(p => [p.longitude, p.latitude])
        }]
      }
    ]
  });

  // 自动调整视野
  nextTick(() => {
    chartInstance.value?.dispatchAction({ type: 'geoRoam' });
  });
};

const focusPoint = (index: number) => {
  if (!chartInstance.value || index < 0 || index >= props.points.length) return;

  activeIndex.value = index;
  const point = props.points[index];
  if (!point) return;

  // 飞行到该点
  chartInstance.value.setOption({
    geo: {
      center: [point.longitude, point.latitude],
      zoom: 8
    }
  });

  // 标记当前点
  chartInstance.value.setOption({
    series: [{
      data: props.points.map((p, i) => ({
        name: p.location || `点${i + 1}`,
        value: [p.longitude, p.latitude],
        itemStyle: i === index ? { color: '#ff4d4f' } : { color: '#1890ff' }
      }))
    }]
  });
};

const destroyChart = () => {
  if (chartInstance.value) {
    chartInstance.value.dispose();
    chartInstance.value = null;
  }
};

watch(visible, (val) => {
  if (val) {
    nextTick(() => {
      if (!chartInstance.value && mapContainer.value) {
        initMap();
      } else {
        updateChart();
      }
    });
  } else {
    destroyChart();
    activeIndex.value = -1;
  }
}, { immediate: true });

watch(() => props.points, () => {
  if (props.visible) {
    updateChart();
  }
}, { deep: true });

let resizeObserver: ResizeObserver | null = null;
watch(visible, (val) => {
  if (val) {
    nextTick(() => {
      resizeObserver = new ResizeObserver(() => {
        chartInstance.value?.resize();
      });
      if (mapContainer.value) {
        resizeObserver.observe(mapContainer.value);
      }
    });
  } else {
    if (resizeObserver && mapContainer.value) {
      resizeObserver.unobserve(mapContainer.value);
      resizeObserver.disconnect();
      resizeObserver = null;
    }
  }
});

defineExpose({
  focusPoint,
});
</script>

<style scoped>
.trajectory-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.map-container {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  background: var(--color-fill-1);
}

.timeline {
  background: var(--color-fill-1);
  border-radius: 8px;
  padding: 12px 16px;
  max-height: 200px;
  overflow-y: auto;
}

.timeline-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-2);
  margin-bottom: 12px;
}

.timeline-list {
  display: flex;
  flex-direction: column;
}

.timeline-item {
  display: flex;
  gap: 12px;
  cursor: pointer;
  padding: 6px 0;
}

.timeline-item.active .timeline-address {
  color: rgb(var(--arcoblue-6));
  font-weight: 500;
}

.timeline-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 16px;
}

.marker-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgb(var(--arcoblue-6));
  border: 2px solid #fff;
  box-shadow: 0 0 4px rgba(var(--arcoblue-6), 0.4);
  flex-shrink: 0;
}

.marker-dot.start {
  background: rgb(var(--green-6));
  box-shadow: 0 0 4px rgba(var(--green-6), 0.4);
}

.marker-dot.end {
  background: rgb(var(--red-6));
  box-shadow: 0 0 4px rgba(var(--red-6), 0.4);
}

.marker-line {
  width: 2px;
  flex: 1;
  min-height: 20px;
  background: linear-gradient(to bottom, rgb(var(--arcoblue-6)), transparent);
  margin-top: 4px;
}

.timeline-content {
  flex: 1;
  padding-bottom: 12px;
}

.timeline-address {
  font-size: 14px;
  color: var(--color-text-1);
}

.timeline-time {
  font-size: 12px;
  color: var(--color-text-3);
  margin-top: 2px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--color-text-3);
  font-size: 14px;
}
</style>