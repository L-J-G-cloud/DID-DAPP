<template>
  <div class="warp" v-if="showDialog" @click=close>
            <div class="dialog" @click.stop>
                <slot></slot>
            </div>    
        </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
const emit = defineEmits(['confirm'])
const suconfirm = ()=>{
    emit('confirm')
}
const open = ()=>{
    showDialog.value = true;
}
const close = ()=>{
    showDialog.value = false;
}

const showDialog = ref(false);
defineExpose({ open ,close});
</script>