<template>
    <div class="content-box">
        <div class="header">
            <div class="title-line d-flex justify-content-center">
                <div class="title">
                    <span>{{ '验证详情' }}</span>
                    <img src="@/assets/imgs/identitycasting/back.png" alt="" class="back-icon" @click="router.back()">
                </div>
            </div>
        </div>

        <!-- 验证贡献数据部分 -->
        <div class="verification-data-section" v-if="!valAddress">
            <div class="section-title">
                <div class="d-flex align-items-center">
                    <div class="title-bar"></div>
                    <span class="F-Bold">验证贡献数据</span>
                </div>
                <img src="@/assets/imgs/identitycasting/tips.png" alt="" class="tips-icon" @click="openTipsDialog">
            </div>
            <div class="data-box">
                <p class="F-Bold">( 1000,<span class="personal-contribution">100</span> ) </p>
            </div>
        </div>

        <!-- 钱包列表部分 -->
        <div class="minting-record-section">
            <div class="section-title">
                <div class="title-bar"></div>
                <span>地址列表</span>
            </div>

            <div class="record-header">
                <div class="header-item">钱包地址</div>
                <div class="header-item"></div>
            </div>
            <div v-if="valRecords.length">
                <!-- 使用van-list实现分页 -->
                <van-list v-model:loading="loading" :finished="finished" loading-text="加载中..." finished-text="没有更多了"
                    @load="loadMoreRecords" class="record-list" :immediate-check="true">
                    <div v-for="(record, index) in valRecords" :key="index" class="record-item">
                        <div class="wallet-address">
                            <span class="address-text" @click="router.push(`/valcontribution-plusedetails/${record.address}`)">{{ getStr(record.address, 6, 6) }}</span>
                            <img src="@/assets/imgs/identitycasting/copy.png" alt="" class="copy-icon" @click="copyAddress(record.address)">
                        </div>
                        <p class="F-Bold contribution-value">( 1000,<span class="personal-contribution F-Bold">100</span> ) </p>
                    </div>
                </van-list>
            </div>


            <!-- 空状态 -->
            <div class="no-record" v-if="!valRecords.length && finished">
                <img class="empty-img" src="@/assets/imgs/identitycasting/empty-record.png" alt="" />
                <div class="empty-text">{{ t('NoContent') }}</div>
            </div>
        </div>
    </div>
    <TipsDialog ref="tipsDialog" :tipsContent="tipsContent" />
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useStore } from '@/store/store';
import { getStr,showToastIcon } from '@/utils';
import { useI18n } from 'vue-i18n';
import TipsDialog from '@/view/identitycasting/components/TipsDialog.vue';
import CopyToClipBoard from "copy-to-clipboard";
const router = useRouter();
const route = useRoute();
const store = useStore();
const { t } = useI18n();
const valAddress = ref(route.params.address);
const tipsDialog = ref<InstanceType<typeof TipsDialog>>();
const tipsContent = ref({
    title: '个人验证贡献奖励规则',
    content: [
        {
            content: '个人新增验证贡献总和 = 全节点新增贡献总额 — 最大节点新增贡献。',
        },
        {
            content: '算力池验证贡献 = 近100天算力池新增验证贡献总和',
        },
        {
            content: '每日验证贡献奖励 = （近100天个人新增验证贡献总和 ÷ 算力池验证贡献贡献） × 每日算力池验证贡献奖励',
        }
    ]
});

const openTipsDialog = () => {
    tipsDialog.value?.open();
};

// 验证贡献数据
const verificationData = reactive({
    personalContribution: 50,
    poolContribution: 100,
    poolReward: 800
});

// 记录相关
const valRecords = ref<any[]>([]);
const loading = ref(false);
const finished = ref(true);
const currentPage = ref(0);
const pageSize = ref(10);

// 模拟API数据
const mockRecords = Array.from({ length: 50 }, (_, index) => ({
    address: `0x2331${Math.random().toString(16).substring(2, 8).padEnd(6, '0')}ufasf`,
    contribution: 300
}));

// // 加载更多记录
const loadMoreRecords = () => {

    // 如果传参数就请求对应参数的记录 没有传参数就请求当前钱包连接的地址的记录
    //     console.log('loadMoreRecords called', { loading: loading.value, finished: finished.value, currentPage: currentPage.value });

    //     if (loading.value || finished.value) {
    //         return;
    //     }

    //     loading.value = true;
};



// 复制地址
const copyAddress = async (address: string) => {
    try {
        CopyToClipBoard(address);
        showToastIcon('地址已复制', 'success',1000);
    } catch (err) {
        console.error('复制失败:', err);
        showToastIcon('复制失败', 'fail',1000);
    }
};

watch(() => route.path, () => {
    valAddress.value = route.params.address;
    window.scrollTo(0, 0);
}, {
    immediate: true,
});

// 初始化
onMounted(() => {
    console.log('Component mounted');
    // 重置状态
    // valRecords.value = [];
    valRecords.value = mockRecords;
    console.log(valAddress.value, 'valAddress');

    loading.value = false;
    finished.value = true;
});
</script>
<style scoped lang="scss">
.content-box {
    background-color: #1E1F25;
    border-radius: .38rem;
    min-height: 100vh;
    padding: 0 .75rem;
    max-width: 500px;
    margin: 0 auto;
    
    // PC端适配
    @media (min-width: 768px) {
      padding: 6rem 1.2rem 0;
    }


    .header {
        font-size: 1rem;
        margin-bottom: 1.88rem;
        padding: 1rem 0 0;
        position: relative;

        .title {
            color: #FFFFFF;
            font-size: 1rem;
            font-weight: 500;
            position: relative;
        }

        .back-icon {
            position: absolute;
            left: -9.5rem;
            top: 50%;
            transform: translateY(-50%);
            width: .48rem;
            height: .89rem;
            cursor: pointer;
        }
    }

    // 验证贡献数据部分
    .verification-data-section {
        margin-bottom: 1.4rem;
        background-color: #272830;
        border-radius: .38rem;
        padding: .88rem 0;

        .section-title {
            display: flex;
            align-items: center;
            margin-bottom: .7rem;
            position: relative;
            justify-content: space-between;

            .title-bar {
                width: 4px;
                height: 16px;
                background-color: #1DCC89;
                margin-right: .3rem;
            }

            span {
                color: #FFFFFF;
                font-size: 1rem;
                font-weight: 500;
            }

            .help-icon {
                margin-left: 8px;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background-color: rgba(0, 212, 170, 0.1);
                display: flex;
                align-items: center;
                justify-content: center;
            }
        }

        .data-list {
            padding: 0 .88rem;

            .data-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: .5rem 0;
                font-size: .88rem;
                line-height: 1.25rem;
                color: #828592;

                .value {
                    color: #FFFFFF;
                }
            }
        }

        .tips-icon {
            width: 1rem;
            height: 1rem;
            cursor: pointer;
            margin-right: .88rem;
        }
    }

    .data-box {
        font-size: .88rem;
        padding: 0 .5rem;

    }
    .contribution-value {
        font-size: .88rem;
        color: #FFFFFF;
    }
    .personal-contribution {
        font-size: .88rem;
        color: #1DCC89;
    }

    // 铸造记录部分
    .minting-record-section {
        .section-title {
            display: flex;
            align-items: center;
            margin-bottom: .6rem;

            .title-bar {
                width: 4px;
                height: 16px;
                background-color: #1DCC89;
                margin-right: .3rem;
            }

            span {
                color: #FFFFFF;
                font-size: 1rem;
                font-weight: 500;
            }
        }

        .record-header {
            display: flex;
            justify-content: space-between;
            padding: 12px 0 0 0;
            margin-right: .88rem;

            .header-item {
                color: #828592;
                font-size: 0.9rem;
                font-weight: 500;
            }
        }

        .record-list {
            .record-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 0;
                margin-right: .88rem;
                border-bottom: 1px solid #333333;

                .wallet-address {
                    color: #1DCC89;
                    font-size: 0.88rem;
                    text-decoration: underline;
                    cursor: pointer;
                    flex: 1;
                }

                .copy-icon {
                    width: .75rem;
                    height: .75rem;
                    margin-left: .88rem;
                    cursor: pointer;
                }
            }
        }

        .empty-state {
            text-align: center;
            padding: 2rem 0;

            .empty-text {
                color: #999999;
                font-size: 0.9rem;
            }
        }
    }
}

.no-record {
    height: 27.63rem;
    display: flex;
    flex-direction: column;
    align-items: center;

    .empty-img {
        margin-top: 8.82rem;
        width: 3.63rem;
        height: 3.94rem;
    }

    .empty-text {
        margin-top: 1.31rem;
        font-weight: 500;
        font-size: 0.75rem;
        color: #B2B2B2;
        line-height: 1.06rem;
    }
}

// vant-list 样式覆盖
:deep(.van-list) {
    .van-list__loading {
        color: #FFFFFF;
    }

    .van-list__finished-text {
        color: #999999;
        font-size: 0.8rem;
    }
}
</style>