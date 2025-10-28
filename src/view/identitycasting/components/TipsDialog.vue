<template>      
    <Dialog ref="dialogRef">
        <div class="default-box">
           <p class="title-box">
               <span class="F-Bold">{{ tipsContent.title }}</span>
               <img src="@/assets/imgs/identitycasting/close_icon.png" alt="" class="close-icon" @click="close">
           </p>
           <div class="content-box">
              <div class="content-item" v-for="(item,index) in tipsContent.content" :key="index">
                    <p v-if="item.subtitle">{{ item.subtitle }}</p>
                    <p>{{ item.content }}</p>
                </div>
            </div>
        </div>
    </Dialog>
</template>

<script setup lang="ts">
import Dialog from '@/components/Dialog.vue';
import { ref, toRefs } from 'vue';
const dialogRef = ref<InstanceType<typeof Dialog>>();
const props = defineProps<{
    tipsContent: any;
}>();
const { tipsContent } = toRefs(props);
const open = () => {
    dialogRef.value?.open();
}
const close = () => {
    dialogRef.value?.close();
}
defineExpose({
    open
});
</script>

<style scoped lang="scss">

.title-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: .75rem;
    border-bottom: 1px solid #2C3436;
    padding: 0 .75rem .5rem;
    font-size: 1rem;
}
.content-box {
    padding: 0 .56rem 0 .94rem;
    color: #828592;
    font-size: .88rem;
    line-height: 1.19rem;
    .content-item {
        margin-bottom: 1.5rem;
        &:last-child {
            margin-bottom: 1rem;
        }
    }
}
.close-icon {
    width: 1.6rem;
    height: 1.6rem;
}
</style>