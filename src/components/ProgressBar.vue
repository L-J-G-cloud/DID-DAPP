<template>
    <div class="progress-container">
      <div class="progress-bar" :style="progressStyle">
        <div class="glowing-dots"></div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from "vue";
  
  const props = defineProps({
    progress: { type: Number, required: true }, // 进度 (0-100)
    height: { type: String, default: "13px" }, // 进度条高度
    speed: { type: String, default: "2s" } // 动画速度
  });
  
  // 根据进度值切换渐变颜色
  const progressStyle = computed(() => {
    const colorLeft = "#E3D226";
    let colorRight = "#1BBB29"; // 默认的渐变色
  
    if (props.progress < 5) {
      colorRight = "#CF1B1C"; // 小于 5% 时的颜色
    }
  
    return {
      width: `${props.progress}%`,
      height: props.height,
      background: `linear-gradient(90deg, ${colorLeft}, ${colorRight})`,
      transition: "width 0.5s ease-in-out",
      position: "relative",
      overflow: "hidden",
      borderRadius: "10px",
      boxShadow: "0 0 10px rgba(27, 187, 41, 0.8)"
    };
  });
  </script>
  
  <style scoped>
  .progress-container {
    width: 100%;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    overflow: hidden;
    position: relative;
  }
  
  .progress-bar {
    border-radius: 10px;
    position: relative;
  }
  
  .glowing-dots {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 70%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.9) 10%, transparent 70%);
    animation: flicker-move 3s infinite ease-in-out;
  }
  
  @keyframes flicker-move {
    0% {
      opacity: 0.6;
      transform: translateX(-100%);
    }
    50% {
      opacity: 1;
      transform: translateX(50%);
    }
    100% {
      opacity: 0.6;
      transform: translateX(100%);
    }
  }
  </style>
  