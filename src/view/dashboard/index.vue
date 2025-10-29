<template>
    <div class="home-container">
        <!-- 头部 -->
        <Head />
        
        <!-- 身份仪表盘 内容 -->
        <div class="dashboard-content">
            <h2 class="title F-Bold"> 
                <img src="@/assets/imgs/identitycasting/data.png" alt="" class="data-icon">
                身份仪表盘 
            </h2>
            <div class="data-table-box">
                <div class="data-table">
                    <div class="data-table-item" v-for="item in dataTable" :key="item.id" @click="activeTable(item)">
                        <span :class="['F-Bold item-name', item.active ? 'active' : '']">{{ item.name }}</span>
                    </div>
                </div>
                <div class="swipe-container" 
                     @touchstart="handleTouchStart" 
                     @touchmove="handleTouchMove" 
                     @touchend="handleTouchEnd"
                     :style="{ transform: `translateX(${translateX}px)` }">
                    <div class="swipe-content" v-for="(table, index) in dataTable" :key="table.id" :class="{ 'active': table.active }">
                        <div class="data-table-item-content" v-for="item in table.data" :key="item.id">
                            <p class="F-Bold">{{ item.name }}</p>
                            <p class="value F-Bold">{{formatDecimal(item.value,4) }}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="award-box">
                <div class="award-top">
                    <img src="@/assets/imgs/identitycasting/award.png" alt="">
                    <p class="title F-Bold">奖励总揽</p>
                </div>
                <div class="award-content">
                    <div class="award-item" v-for="item in awardList" :key="item.id">
                        <p class="name">{{ item.name }}</p>
                        <p class="value F-Bold">{{formatDecimal(item.value,4) }}</p>
                    </div>
                </div>
                <div class="withdraw-btn F-Bold" @click="router.push('/withdrawal')">
                    提现
                </div>
            </div>
        </div>
        
        <!-- 图表组件 -->
        <Chart />
    </div>
</template>

<script setup lang="ts">
import Head from '@/view/identitycasting/components/Head.vue'
import Chart from './chart.vue'
import { useStore } from '@/store/store'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { ref, onMounted, nextTick } from 'vue'
import {powerDetail,getUserBalance} from '@/api/index'

import {decimalParseToNumber,formatDecimal} from '@/utils'
const router = useRouter()
const store = useStore()
const { account, token } = storeToRefs(store)
const dataTable = ref<any[]>([
    {
        name: '算力数据',
        active: true,
        id: 1,
        data: [
            {
                name: '全网身份算力',
                value: '1222',
            },
            {
                name: '身份算力池',
                value: '--',
            },
            {
                name: '身份算力',
                value: '--',
            },
        ],
    },
    {
        name: '质押数据',
        active: false,
        id: 2,
        data: [
            {
                name: '全网质押权重',
                value: '--',
            },
            {
                name: '质押池权重',
                value: '--',
            },
            {
                name: '个人质押权重',
                value: '--',
            },
        ],
    },
    {
        name: '验证数据',
        active: false,
        id: 3,
        data: [
            {
                name: '全网验证贡献',
                value: '--',
            },
            {
                name: '算力验证贡献',
                value: '--',
            },
            {
                name: '个人验证贡献',
                value: '--',
            },
        ],
    },
])
const awardList = ref<any[]>([
    {
        name: 'DID',
        value: '1000',
    },
    {
        name: 'USDT',
        value: '1000',
    },
    {
        name: 'USDID',
        value: '1000',
    },
])
const currentTable = ref<any[]>([]);
const translateX = ref(0);
const startX = ref(0);
const currentIndex = ref(0);
const containerWidth = ref(0);

// 数据映射配置
const DATA_MAPPING = [
    { tableIndex: 0, dataKey: 'identity_power_result', fields: ['total', 'pool', 'user'] }, // 算力数据
    { tableIndex: 1, dataKey: 'deposit_result', fields: ['total', 'pool', 'user'] },        // 质押数据
    { tableIndex: 2, dataKey: 'verify_power_result', fields: ['total', 'pool', 'user'] }     // 验证数据
] as const;

// 获取算力明细
const getPowerDetail = async () => {
    try {
        const { code, data } = await powerDetail();
        if (code) return;
        // 批量更新数据
        DATA_MAPPING.forEach(({ tableIndex, dataKey, fields }) => {
            const resultData = data[dataKey];
            if (resultData) {
                fields.forEach((field, fieldIndex) => {
                    dataTable.value[tableIndex].data[fieldIndex].value = decimalParseToNumber(resultData[field],18);
                });
            }
        });
    } catch (error) {
        console.error('获取算力明细失败:', error);
    }
}   

const getUserBalanceData = async () => {
    try {
        const { code, data } = await getUserBalance();
        if (!code){
            store.identityData = {...store.identityData, ...data};
            awardList.value[0].value = decimalParseToNumber(store.identityData.did,18);
            awardList.value[1].value = decimalParseToNumber(store.identityData.usdt,18);
            awardList.value[2].value = decimalParseToNumber(store.identityData.usdid,18);
        }
    } catch (error) {
        console.error('获取用户余额失败:', error);
    }
}

const activeTable = (item: any) => {
    dataTable.value.forEach((item: any) => {
        item.active = false;
    });
    item.active = true;
    currentTable.value = item.data;
    
    // 更新当前索引和位置
    const index = dataTable.value.findIndex(table => table.id === item.id);
    currentIndex.value = index;
    translateX.value = -index * containerWidth.value;
}

// 触摸事件处理
const handleTouchStart = (e: TouchEvent) => {
    startX.value = e.touches[0].clientX;
}

const handleTouchMove = (e: TouchEvent) => {
    const currentX = e.touches[0].clientX;
    const diffX = currentX - startX.value;
    const baseTranslate = -currentIndex.value * containerWidth.value;
    translateX.value = baseTranslate + diffX;
}

const handleTouchEnd = (e: TouchEvent) => {
    const currentX = e.changedTouches[0].clientX;
    const diffX = currentX - startX.value;
    const threshold = containerWidth.value * 0.3; // 滑动阈值
    
    if (Math.abs(diffX) > threshold) {
        if (diffX > 0 && currentIndex.value > 0) {
            // 向右滑动，切换到上一个tab
            currentIndex.value--;
        } else if (diffX < 0 && currentIndex.value < dataTable.value.length - 1) {
            // 向左滑动，切换到下一个tab
            currentIndex.value++;
        }
    }
    
    // 激活对应的tab
    activeTable(dataTable.value[currentIndex.value]);
}

onMounted(() => {
    activeTable(dataTable.value[0]);
    // 获取容器宽度
    nextTick(() => {
        const container = document.querySelector('.data-table-box');
        if (container) {
            containerWidth.value = container.clientWidth;
        }
    });
    getPowerDetail();
    getUserBalanceData();
})
</script>
<style scoped lang="scss">
.dashboard-content {
    padding: 6rem 1.2rem 0;

    .title {
        font-size: 1.13rem;
        margin-bottom: 1rem;
        .data-icon {
            width: 1.25rem;
            height: 1.25rem;
        }
    }

    .data-table-box {
        overflow: hidden;
    }

    .data-table {
        display: flex;
        margin-bottom: 1.2rem;



        .data-table-item {
            width: 100%;
            font-size: 1rem;
            color: #828592;

            .item-name {
                position: relative;
                z-index: 1;

                &::after {
                    content: '';
                    display: block;
                    position: absolute;
                    bottom: -8px;
                    left: 0;
                    width: 0;
                    height: .19rem;
                    background-color: #1DCC89;
                    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }

                &.active {
                    color: #fff;

                    &::after {
                        width: 100%;
                    }
                }
            }
        }
    }

    .swipe-container {
        display: flex;
        transition: transform 0.3s ease;
        width: 300%; // 3个tab的总宽度
        
        .swipe-content {
            width: 33.33%; // 每个tab占1/3宽度
            flex-shrink: 0;
            
            .data-table-item-content {
                text-align: center;
                height: 4rem;
                box-sizing: border-box;
                background-color: #272830;
                border-radius: .38rem;
                padding: .75rem 0;
                margin-bottom: .5rem;
                font-size: .75rem;
                line-height: 1rem;
                color: #828592;

                .value {
                    font-size: 1rem;
                    line-height: 1.38rem;
                    color: #fff;
                }
            }
        }
    }

    .award-box {
        padding: .63rem;
        background-color: #272830;
        border-radius: .38rem;
        margin-top: 1rem;

        .award-top {
            display: flex;
            align-items: center;
            margin-bottom: .69rem;

            .title {
                font-size: 1rem;
                margin: 0;
            }

            img {
                width: 1.25rem;
                height: 1.25rem;
                margin-right: .5rem;
            }
        }

        .award-content {
            display: flex;
            align-items: center;
            border: 1px solid #34353E;
            background-color: #26272E;
            padding: 1.2rem 0;

            .award-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 33.33%;

                &:nth-child(2) {
                    border-left: 1px solid #34353E;
                    border-right: 1px solid #34353E;
                }

                .name {
                    font-size: .88rem;
                    color: #828592;
                    line-height: 1.25rem;
                }

                .value {
                    font-size: .88rem;
                    line-height: 1.25rem;
                    color: #fff;
                }
            }
        }

        .withdraw-btn {
            width: 100%;
            height: 2.75rem;
            background-color: #1DCC89;
            border-radius: .38rem;
            font-size: .88rem;
            line-height: 1.25rem;
            color: #1E2741;
            text-align: center;
            line-height: 2.75rem;
            margin-top: 1.2rem;
            cursor: pointer;
            margin-bottom: .69rem;
            &:hover {
                background-color: #1DCC89;
                opacity: 0.8;
                transition: all 0.3s ease;
            }
        }
    }
}
</style>