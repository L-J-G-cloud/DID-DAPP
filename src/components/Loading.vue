<template>
  <div class="loading-box d-flex flex-column justify-content-center align-items-center">
        <img :src="img" alt="">
        <p v-text="loadingText"></p>
  </div>
</template>

<script setup lang='ts'>
import {reactive,ref} from 'vue'
const props = defineProps({
  // 
  img:{
    type:String,
  },
  loadingText:{
    type:String,
  }
})

// 定义变量和函数
//
</script>
<style scoped lang='scss'>
.loading-box{
 position: fixed;
 left: 50%;
 top: 50%;
 transform: translate(-50%,-50%);
 width:247px;
 height: 255px;
 background: rgba($color: #000000, $alpha: .7);
 border-radius: 8px;
 img {
    width: 116px;
    margin-bottom: 34px;
 }
}
</style>