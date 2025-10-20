<template>
    <div class="wrap" @touchmove.prevent @click="close">
        <transition name="fade" @enter="enter" @after-enter="afterEnter">
            <div class="draw" ref="draw" @click.stop="close" v-if="drawer">
                <ul>
                    <li v-for="(item, index) in list" :key="index" class="nav" @click="notify(item)">
                        <span :class="['iconfont', item.icon]"></span> <i v-text="item.name"
                            :class="[item.active ? 'active' : '']"></i>
                    </li>
                </ul>
            </div>
        </transition>
    </div>
</template>

<script setup lang='ts'>
import { reactive, ref, PropType } from 'vue'
import { getCurrentInstance } from '@vue/runtime-core';
import { showNotify } from 'vant';
import { useRouter } from 'vue-router'
const router = useRouter()
const currentInstance = getCurrentInstance()
type NavList = {
    id: number,
    name: string,
    active: boolean,
    url: string,
    icon: string
}
const props = defineProps({
    drawer: {
        type: Boolean,
        default: () => {
            return false
        },
    },
    list: {
        type: Array as PropType<NavList[]>,
        default: () => {
            return []
        }
    }
})
const notify = (item: any) => {
    emit('active', item)
}
const emit = defineEmits(['active', 'close'])
const active = (id: number) => {
    notify(false)
    emit('active', id)
}
const close = () => {
    emit('close')
}
const enter = (el: any, done: any) => {
    el.style.width = 0;
    el.style.opacity = 0;
    setTimeout(() => {
        el.style.transitionDuration = '.2s';
        el.style.opacity = 1;
        el.style.width = '80%';
    });
    setTimeout(done, 500)
}
const afterEnter = (el: any) => {
    el.style.removeProperty('width', 'opacity');
}
</script>
<style scoped lang='scss'>
.draw {
    position: absolute;
    top: 0;
    left: 0;
    width: 80%;
    height: calc(100vh);
    background: #1A1A1A;
    color: #fff;
    z-index: 100;

    .nav {
        display: flex;
        align-items: center;
        padding: 2rem 0 .2rem 2rem;

        .iconfont {
            font-size: 24px;
            margin-right: 10px;
            color: #FAB905;
        }
    }
}
.active {
    color: #FAB905;
}
</style>