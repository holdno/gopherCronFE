<template>
  <div ref="box" class="tw-h-full tw-w-full"></div>
</template>

<script setup lang="ts">
  import { BarChart } from 'echarts/charts';
  import {
    DatasetComponent,
    GridComponent,
    TitleComponent,
    TooltipComponent,
    TransformComponent,
  } from 'echarts/components';
  import * as echarts from 'echarts/core';
  import { LabelLayout, UniversalTransition } from 'echarts/features';
  import { CanvasRenderer } from 'echarts/renderers';
  import { PropType, computed, onMounted, ref, toRaw, watchEffect } from 'vue';

  import { RecentLogCount } from '@/api/request';

  const props = defineProps({
    records: {
      type: Object as PropType<RecentLogCount[]>,
      required: true,
    },
  });

  const box = ref<HTMLElement>();
  const options = computed(() => {
    const xAxis = {
      type: 'category',
      data: props.records.map((v) => v.date),
      name: '日期',
      axisLine: {
        show: false,
      },
    };
    const series = [
      {
        name: 'success',
        type: 'bar',
        backgroundStyle: {
          color: 'rgba(153, 246, 228, 1)',
        },
        data: props.records.map((v) => v.success),
        itemStyle: {
          borderRadius: [10, 10, 10, 10],
          color: 'rgba(153, 246, 228,1)',
        },
      },
      {
        name: 'error',
        type: 'bar',
        itemStyle: {
          borderRadius: [10, 10, 10, 10],
          color: 'red',
        },
        data: props.records.map((v) => v.error),
      },
    ];

    return {
      grid: {
        left: 60,
      },
      xAxis,
      yAxis: {
        type: 'value',
        splitLine: {
          show: false,
        },
      },
      series,
      title: {
        text: '任务执行概况',
        subtext: '定时任务每日调度成功/失败数量',
        textStyle: {
          color: '#fff',
        },
        subtextStyle: {
          color: 'rgba(82, 82, 91, 1)',
        },
        left: 10,
      },
      tooltip: {
        show: true,
        trigger: 'item',
        backgroundColor: 'rgba(0,0,0,1)',
        textStyle: {
          color: 'rgba(153, 246, 228, 1)',
        },
      },
    };
  });

  const chart = ref<echarts.ECharts>();
  onMounted(async () => {
    if (box.value === undefined) throw new Error('box missing');
    echarts.use([
      TitleComponent,
      TooltipComponent,
      GridComponent,
      DatasetComponent,
      TransformComponent,
      BarChart,
      LabelLayout,
      UniversalTransition,
      CanvasRenderer,
    ]);
    chart.value = echarts.init(box.value);
  });
  watchEffect(() => {
    if (chart.value && options.value) {
      const raw = toRaw(chart.value);
      raw.setOption(options.value);
    }
  });
</script>
