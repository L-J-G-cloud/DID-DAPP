<template>
  <div class="empty">
    <img :src="empty" alt="">
    <p v-text="'No Content'"></p>
  </div>
</template>

<script setup lang='ts'>
import empty from '@/assets/imgs/home/empty-record.png'
import {reactive,ref} from 'vue'

</script>
<style scoped lang='scss'>
.empty {
    width: 100%;
    font-size: 14px;
    padding-top: 20vh;
    text-align: center;
    color: #fff;
    img {
        width: 77px;
        height: 81px;
        margin-bottom: 20px;
    }
}
</style>