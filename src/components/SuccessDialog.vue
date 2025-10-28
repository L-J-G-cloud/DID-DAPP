<template>
  <div class="modal-wrapper" v-if="visible" @click.self="handleClose">
    <div class="modal-content" :style="{ background: backgroundImage, backgroundSize: 'cover' }">
      <div class="success-dialog-content">
        <p class="title">{{ t("CongratulationsSign") }}</p>
        <p class="subtitle"> {{ t("earned") }} {{ multiple }}x {{ t("power_bonus") }}</p>
      </div>
      <div class="close-btn" @click="handleClose">
        <img src="@/assets/imgs/identitycasting/close.png" alt="">
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const props = defineProps<{
  visible: boolean,
  multiple: number
}>();


// 模拟 props

// 预加载图片
const images = import.meta.glob('@/assets/imgs/buy/X*.png', {
  eager: true,
  import: 'default',
});

// 动态获取图片路径
const backgroundImage = computed(() => {
  return `url('${images[`/src/assets/imgs/buy/X${props.multiple}.png`]}') no-repeat center center`;
});


const emit = defineEmits(['update:visible']);

const handleClose = () => {
  emit('update:visible', false);
};
</script>

<style scoped lang="scss">
.modal-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 10vh;
  z-index: 999;
}

.modal-content {
  position: relative;
  background: url('@/assets/imgs/buy/X2.png') no-repeat center center;
  background-size: cover;
  border: 1px solid #303134;
  border-radius: 0.75rem;
  padding: 0;
  width: 90%;
  height: 70%;
//   max-width: 20rem;
  min-height: 15rem;
  animation: slideIn 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.success-dialog-content {
  text-align: center;
  position: relative;
  z-index: 2;
  padding: 1rem;
  background: linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.8));
  border-radius: 0 0 0.75rem 0.75rem;
  
  .title {
    font-size: 1.5rem;
    color: #fff;  
    margin-bottom: 0.5rem;
    line-height: 1rem;
    font-weight: bold;
    margin-bottom: 0.75rem;
  }
  
  .subtitle {
    font-size: 1.06rem;
    color: #E1E1E1;
    margin-bottom: 0.5rem;
    line-height: 1rem;
  }
}

.close-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
 
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-size: 1.5rem;
  color: #666;
  z-index: 3;
  img {
    width: 1rem;
    height: 1rem;
  }
  
  &:hover {
    color: #fff;
  }
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style> 