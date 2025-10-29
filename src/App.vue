<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from './store/store'
import useLocale from './plugin/useLocale'
const store = useStore()
const { changeLocal } = useLocale()
const currentVersion = ref(localStorage.getItem('app_version') || '')
async function checkForUpdates() {
  try {
    const res = await fetch('/version.json?' + Date.now()); // 避免缓存
    const data = await res.json();
    console.log(data, 'data')
    if (data.version !== currentVersion.value) {
      console.log('检测到新版本，刷新页面...')
      localStorage.setItem('app_version', data.version);
      if ('caches' in window) {
        caches.keys().then(async (cacheNames) => {
          console.log(cacheNames, 'cacheNames');
          // 等待所有缓存删除完成
          await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
          console.log('所有缓存已删除');
          // 重新加载页面，确保获取最新资源
          window.location.reload(true); // 强制刷新并跳过缓存
        });
      } else {
        window.location.reload(true); // 强制刷新并跳过缓存
        // parent.location.replace(parent.location.href) 
      }
    }
  } catch (error) {
    console.error('检查更新失败', error);
  }
}

onMounted(() => {
  let currentLang = navigator.language || navigator.language; // 获取用户语言
  if (currentLang.toLowerCase().includes('tw')) {
    currentLang = 'tw'
  } else {
    currentLang = 'en'
  }
  const setLang = store.lang || currentLang;
  changeLocal(setLang)
  checkForUpdates();
  setInterval(checkForUpdates, 10000); // 每 60 秒检查一次
})
</script>

<template>
  <div class="view">
    <RouterView> </RouterView>
  </div>
</template>

<style scoped lang="scss">
.view {
  width: 100vw;
  min-height: 100vh;
  background-color: #1E1F25;
  background-size: 100% 100%;
}
</style>
