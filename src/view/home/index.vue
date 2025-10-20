<template>
  <div class="home-container">
    <!-- 头部 -->

    <Head />
    <!-- 内容 -->
    <Content v-if="store.account && store.token" />
    <no-con v-if="!store.account" />
    <!-- 系统维修 -->
    <maintenance-dialog ref="RefMaintenanceDialog" />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import Head from '@/view/home/components/Head.vue'
import Content from '@/view/home/components/Content.vue'
import NoCon from '@/view/home/components/NoCon.vue'
import { useStore } from '@/store/store'
import { getUserData, getSystemStatus ,getAddressWhiteList} from '@/api'
import useLocal from "@/plugin/useLocale";
const store = useStore()
const {
  changeLocal,
} = useLocal();
const token = ref('')
// var storeLocal = require('store')
const RefMaintenanceDialog = ref();
onMounted(async () => {
  // store.lang = 'en'
  // RefMaintenanceDialog.value.showDialog();
  changeLocal(store.lang);
})

watch(() => store.account, async () => {
  if (!store.account) { return }
  const { code, data } = await getSystemStatus({ address: store.account });
  if (!code) {
    if (!code) {
      if (data.system_status) {
        const { code: code2, data: data2 } = await getAddressWhiteList({ address: store.account });
        if (!code2) {
          store.system_status = data.system_status && !data2.is_white_list;
          if (store.system_status) {
            RefMaintenanceDialog.value.showDialog();
          }
        }
      }
    }
  }
}, { deep: true, immediate: true })

</script>

<style scoped lang="scss">
.home-content-container {
  max-width: 500px;
  margin: auto;
}
</style>
