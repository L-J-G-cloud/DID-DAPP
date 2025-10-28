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
                <div class="data-table-item-content" v-for="item in currentTable" :key="item.id">
                    <p class="F-Bold">{{ item.name }}</p>
                    <p class="value F-Bold">{{ item.value }}</p>
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
                        <p class="value F-Bold">{{ item.value }}</p>
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
const activeTable = (item: any) => {
    dataTable.value.forEach((item: any) => {
        item.active = false;
    });
    item.active = true;
    currentTable.value = item.data;
}
onMounted(() => {
    activeTable(dataTable.value[0]);
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