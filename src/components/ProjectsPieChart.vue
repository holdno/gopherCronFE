<template>
  <div ref="box" class="tw-h-full tw-w-full"></div>
</template>

<script setup lang="ts">
  import { onMounted, ref, PropType, computed, watchEffect, toRaw } from 'vue';
  import * as echarts from 'echarts/core';
  import { PieChart } from 'echarts/charts';
  import {
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
  } from 'echarts/components';
  import { LabelLayout, UniversalTransition } from 'echarts/features';
  import { CanvasRenderer } from 'echarts/renderers';
  import { Project } from '@/request';

  const props = defineProps({
    projects: {
      type: Object as PropType<Project[]>,
      required: true,
    },
  });

  const box = ref<HTMLElement>();
  const options = computed(() => {
    return {
      // backgroundColor: '#2c343c',
      title: {
        text: '项目任务占比图',
        left: 10,
        top: 0,
        textStyle: {
          color: '#fff',
        },
      },

      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)',
        backgroundColor: 'rgba(0,0,0,1)',
        textStyle: {
          color: 'rgba(153, 246, 228, 1)',
        },
      },

      series: [
        {
          name: '任务数',
          type: 'pie',
          radius: '55%',
          center: ['50%', '50%'],
          data: props.projects
            .map((v) => ({
              value: v.taskCount,
              name: v.title,
            }))
            .sort((a, b) => a.value - b.value),
          roseType: 'radius',
          label: {
            textStyle: {
              color: 'rgba(255, 255, 255, 0.3)',
            },
          },
          labelLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)',
            },
            smooth: 0.2,
            length: 10,
            length2: 20,
          },
          itemStyle: {
            color: 'rgba(153, 246, 228, 1)',
          },

          animationType: 'scale',
          animationEasing: 'elasticOut',
          animationDelay: function () {
            return Math.random() * 200;
          },
        },
      ],
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
      PieChart,
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
