<template>
  <van-list
    v-model:loading="loading"
    :finished="finished"
    :loading-text="t('loading')"
    :finished-text="listData.length ? t('') : ''"
    @load="loadMore"
    :class="[className]"
    :offset="10"
  >
    <template v-if="listData.length"> 
      <slot :list="listData"></slot>
    </template>
    <slot name="empty" v-if="!listData.length&&!loading"></slot>
    <van-skeleton title :row="3" v-if="loading" class="list-box_lading"/>
  </van-list>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from '@/store/store';
import { closeToast } from 'vant';
const store = useStore();
const props = defineProps({
  // 父组件传递的请求 API 函数
  apiRequest: {
    type: Function,
    required: true,
  },
  className: {
    type: String,
    default: '',
  },
  // 可选参数：请求每页的数据条数
  pageSize: {
    type: Number,
    default: 10,
  },
  // 可选参数：请求的初始参数
  initParams: {
    type: Object,
    default: () => ({}),
  },
});

const { t } = useI18n();
const listData = ref([]);
const loading = ref(false);  
const finished = ref(false);
const start = ref(0);

// 加载更多数据函数
const loadMore = async (isRefresh = false) => {
  if(isRefresh){
    finished.value = false;
    start.value = 0;
  }
  if(!store.token){
    loading.value = false;
    return;
  } 
  // if (loading.value) return;
  loading.value = true;
  try {
    // 调用父组件传递的 API 请求函数
    const response = await props.apiRequest({
      start: start.value,
      limit: props.pageSize,
      ...props.initParams,
    });
    // 假设接口返回的数据结构为 { data: [], total: number }
    if (response && Array.isArray(response.data)) {
      if (start.value === 0) {
        // 如果是重新加载，重置数据
        listData.value = [];
      }
      listData.value.push(...response.data);
      // 判断是否加载完所有数据
      console.log(response.data.length, props.pageSize, 'response.data.length, props.pageSize');
      if (response.data.length < props.pageSize) {
        finished.value = true;
      } else {
        start.value += props.pageSize;
        finished.value = false;
      }
    }else{
      finished.value = true;
    }
  } catch (error) {
    console.error('加载数据出错:', error);
    closeToast()
    finished.value = true;
  } finally {
    loading.value = false;
  }
};

// 监听 initParams 变化，重新加载数据
watch(
  () => props.initParams,
  () => {
    // if(props.initParams.module||props.initParams.symbol || props.initParams.status){
      // 重置状态并重新加载数据
      listData.value = [];
      finished.value = false;
      start.value = 0;
      loadMore();
    // }
  },
  { deep: true } // 深度监听，确保嵌套对象变化也能触发
);

// 初始化加载数据
// onMounted(() => {
//   loadMore();
// });
watch(() => store.token, () => {
  if(store.token){  
    loadMore();
  }else{
    listData.value = [];
    finished.value = true;
  }
}, { immediate: true });

defineExpose({
  loadMore
})
</script>

<style scoped>
.not-list-box {
  text-align: center;
  padding: 20px 0;
}
.list-box_lading {
  text-align: center;
  padding: 20px;
}
.detail-title {
  font-size: 1rem;
  line-height: 1.38rem;
  margin: .88rem 0 .41rem;
}
.no-content{
  height: 100%;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
}
</style>
