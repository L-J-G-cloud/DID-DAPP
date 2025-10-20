<template>
  <div class="Maintenance_box">
    <van-dialog 
      v-model:show="show" 
      class="dialog-box pb-18 flex justify-between flex-col" 
      :closeOnClickOverlay="false"
      :showConfirmButton="false"
      :showCancelButton="false"
      :beforeClose="() => false"
      :lockScroll="true"
      :closeOnPopstate="false"
    >
        <img src="@/assets/imgs/home/Maintenance.png" alt="" srcset="" class="w-40 mb-3">
        <p class="text-sm leading-4 text-center">{{t('SystemMaintenance')}}</p>
        <template #footer> </template>
    </van-dialog>
  </div>
</template>

<script setup lang='ts'>
import {reactive,ref} from 'vue'
import { useI18n } from "vue-i18n";
const {t} = useI18n();
const show = ref(false);
const showDialog = ()=>{
    show.value = true
}
const close = ()=>{
    show.value = false
}
defineExpose({
    showDialog
})
</script>
<style scoped lang='scss'>
.Maintenance_box {
  :deep(.dialog-box) {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-height: 85vh;
    overflow-y: scroll;
    padding: 30px 10px 20px;
    width: 70%;
    background: #090909;
    border-radius: 0.75rem;
    border: 0.06rem solid #2a2d33;
    max-width: 370px;
    // padding-top: 30px;
    .van-dialog__content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
  }
}
</style>