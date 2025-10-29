<template>
  <div class="home-container">
    <!-- 头部 -->

    <Head />
    <div class="content-container">
      <Identity />
      <DIDPledge />
      <ValContribution />
      <Invite />
    </div>
    <!-- 系统维修 -->
    <maintenance-dialog ref="RefMaintenanceDialog" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Head from '@/view/identitycasting/components/Head.vue'
import Identity from '@/view/identitycasting/components/Identity/index.vue'
import DIDPledge from '@/view/identitycasting/components/didpledge/index.vue'
import ValContribution from '@/view/identitycasting/components/valcontribution/index.vue'
import Invite from '@/view/identitycasting/components/invite/index.vue'
import { useStore } from '@/store/store'
import useLocal from "@/plugin/useLocale";
import { getSystemStatus, getAddressWhiteList } from '@/api'
const store = useStore()
const {
  changeLocal,
} = useLocal();
const RefMaintenanceDialog = ref();
onMounted(async () => {
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
.home-container {
  max-width: 500px;
  margin: auto;

  .content-container {
    padding: 5rem .75rem 0;
  }

  :deep(.title-container) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-right: .56rem;
    .tips-icon {
      width: 1rem;
      height: 1rem;
    }

    .title {
      font-size: 1rem;
      line-height: 1rem;
      color: #fff;
      position: relative;
      padding-left: 0.7rem;

      &::before {
        position: absolute;
        left: 0;
        top: 0;
        content: '';
        display: inline-block;
        width: 0.25rem;
        height: 100%;
        background-color: #1DCC89;
        margin-right: 0.2rem;
      }
    }
  }
}
</style>
