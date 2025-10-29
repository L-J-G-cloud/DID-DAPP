<template>
    <div class="content-box">
        <div class="title-container">
            <div class="title F-Bold">
                验证者贡献
            </div>
            <img src="@/assets/imgs/identitycasting/tips.png" alt="" class="tips-icon" @click="openTipsDialog">
        </div>
        <div class="node-box"  v-if="!store.userInfo.user_data.node_type">
            <div class="title-box">
                <span>节点释放</span>
                <img src="@/assets/imgs/identitycasting/recoder.png" alt="" class="recoder-icon" @click="showRecoderType(1)">
            </div>
            <div class="node-content-box">
                <div class="content-item">
                    <div class="content-item-left">
                        <p>待释放 DID</p>
                        <p class="F-Bold text-white">{{ nodeInfo.unlock_did }}</p>
                    </div>
                    <div class="content-item-right">
                        <p>已释放 DID</p>
                        <p class="F-Bold text-white">{{ nodeInfo.release_did }}</p>
                    </div>
                </div>
                <div class="progress-box">
                    <div class="progress-bar">
                        <div class="progress-fill" :style="{ width: nodeInfo.progress + '%' }">
                            <div class="light-bar" :class="{ 'animate': isLightBarActive }"></div>
                        </div>
                    </div>
                    <p class="progress-text">释放进度 <span>{{nodeInfo.progress}}%</span></p>
                </div>
            </div>
            <p class="tips-text">注：新增个人验证贡献 100 ，解锁1个DID</p>
        </div>
        <div class="verify-box">
            <div class="title-box">
                <span>个人验证贡献奖励</span>
                <img src="@/assets/imgs/identitycasting/recoder.png" alt="" class="recoder-icon" @click="showRecoderType(2)">
            </div>
            <div class="verify-content-box">
                <span class="verify-amount-text F-Bold">{{formatDecimal(decimalParseToNumber(store.powerDetailData.dynamic_income, 18),4)}} DID</span>
                <span class="verify-detail-text" @click="router.push('/valcontribution-details')">验证详情</span>
            </div>
            <p class="tips-text">注：验证数据统计为近{{store.powerDetailData.dynamic_statics_day}}天</p>
        </div>

        <div class="verify-box">
            <div class="title-box">
                <span>个人验证贡献加成奖励</span>
                <img src="@/assets/imgs/identitycasting/recoder.png" alt="" class="recoder-icon" @click="showRecoderType(3)">
            </div>
            <div class="verify-content-box">
                <span class="verify-amount-text F-Bold">{{formatDecimal(decimalParseToNumber(store.powerDetailData.ref_usdt_income, 18),4)}} DID | {{formatDecimal(decimalParseToNumber(store.powerDetailData.ref_usdid_income, 18),4)}} USDID</span>
                <span class="verify-detail-text" @click="router.push('/valcontribution-plusedetails')">验证详情</span>
            </div>
            <p class="tips-text">注：验证数据统计为{{store.lang === 'en' ? getdata(store.powerDetailData.ref_reward_end_time*10001).timeDetail : getdata(store.powerDetailData.ref_reward_end_time*1000).time}}至今</p>
        </div>
    </div>
    <TipsDialog ref="tipsDialog" :tipsContent="tipsContent" />
    <RecordDialog v-model:show="showRecordDialog" :info="verifyRecordInfo" />
</template>

<script setup lang="ts">
import { getdata } from '@/utils';
import TipsDialog from '@/view/identitycasting/components/TipsDialog.vue';
import RecordDialog from '@/view/identitycasting/components/RecordDialog.vue';
import { onMounted, ref } from "vue";
import Decimal from 'decimal.js';
import { powerList,getRecordList} from "@/api";
import { useRouter } from 'vue-router';
import { useStore } from '@/store/store';
import { decimalParseToNumber, formatDecimal } from '@/utils';
const router = useRouter();
const store = useStore();
const tipsDialog = ref<InstanceType<typeof TipsDialog>>();
const showRecordDialog = ref(false);
const verifyRecordInfo = ref({
  title: '验证贡献记录',
  api: getRecordList,
  params: {
    limit: 10,
    module: '',
    symbol: 'DID,USDID',
  }
});
const tipsContent = ref({
  title: '验证贡献',
  content: [
    {
      content: '验证者通过邀请更多身份加入 DID 网络，提供验证支持，稳固数字身份并维护网络安全。贡献越高，空投奖励越丰厚，实现安全与激励的正向循环。',
    },
  ]
});

const nodeInfo = ref({
  total_lock_did: 0,
  unlock_did: 0,
  release_did: 0,
  progress: 0
});

const showRecoderType = (type: number) => {
  if(type === 1) {
    verifyRecordInfo.value.title = '节点释放记录';
    verifyRecordInfo.value.params.module = 'Unlock';
    verifyRecordInfo.value.params.symbol = 'DID';
  } else if(type === 2) {
    verifyRecordInfo.value.title = '贡献奖励记录';
    verifyRecordInfo.value.params.module = 'DynamicIncome';
    verifyRecordInfo.value.params.symbol = 'DID';
  } else {
    verifyRecordInfo.value.title = '加成奖励记录';
    verifyRecordInfo.value.params.module = 'RefIncome';
    verifyRecordInfo.value.params.symbol = 'DID,USDID';
  }
  console.log(verifyRecordInfo.value.params);
  showRecordDialog.value = true;
}

const openTipsDialog = () => {
  tipsDialog.value?.open();
}
// 进度条宽度控制
const progressWidth = ref(0);
const targetProgress = 33; // 目标进度33%
const isLightBarActive = ref(false); // 控制光条动画

// 缓动动画函数
const easeOutCubic = (t: number): number => {
    return 1 - Math.pow(1 - t, 3);
};

// 启动进度条动画
const startProgressAnimation = () => {
    const duration = 2000; // 2秒动画时长
    const startTime = Date.now();

    const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // 使用缓动函数
        const easedProgress = easeOutCubic(progress);
        progressWidth.value = easedProgress * targetProgress;

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // 进度条增长完成后，延迟500ms启动光条动画
            setTimeout(() => {
                isLightBarActive.value = true;
            }, 500);
        }
    };

    requestAnimationFrame(animate);
};

onMounted(() => {
    // 延迟500ms后开始动画，让页面先渲染
    setTimeout(() => {
        startProgressAnimation();
    }, 500);

    nodeInfo.value = {
        unlock_did: Number(decimalParseToNumber(store.identityData.wait_release_did,18)),
        total_lock_did:  Number(decimalParseToNumber(store.identityData.total_lock_did,18)),
        release_did:  Number(decimalParseToNumber(store.identityData.release_did,18)),
        progress: 0
    }
    if(new Decimal(nodeInfo.value.total_lock_did).gt(0)) {
        nodeInfo.value.progress = Number(new Decimal(nodeInfo.value.release_did).div(nodeInfo.value.total_lock_did).mul(100).toNumber().toFixed(2));
    }
});
</script>
<style scoped lang="scss">
.content-box {
    padding: 1rem 0 .75rem;
    background-color: #272830;
    border-radius: .38rem;
    margin-bottom: .69rem;

    .recoder-icon {
        width: .75rem;
        height: .84rem;
    }

    .node-box {
        border: 1px solid #34353E;
        border-radius: .38rem;
        margin: 0 .69rem .56rem;

        .title-box {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.44rem .63rem;
            font-size: .88rem;
            line-height: 1.25rem;
            color: #fff;
            border-bottom: 1px solid #34353E;
        }

        .node-content-box {
            font-size: .88rem;
            line-height: 1.25rem;
            color: #fff;
            border-bottom: 1px solid #34353E;
        }

        .content-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.44rem .63rem;
            font-size: .88rem;
            line-height: 1.25rem;
            color: #828592;

            .content-item-left,
            .content-item-right {
                width: 50%;
                text-align: left;
            }

            .text-white {
                font-size: 1rem;
                margin-top: .4rem;
            }
        }

        .progress-box {
            padding: 0 .88rem;

            .progress-bar {
                width: 100%;
                height: 0.75rem;
                background-color: rgba(60, 60, 60, 0.3);
                border-radius: 0.375rem;
                position: relative;
                margin-bottom: 0.5rem;
                overflow: visible;

                .progress-fill {
                    height: 100%;
                    width: 33%;
                    background: linear-gradient(180deg, #50FFBC 0%, #1DCC89 100%);
                    border-radius: 0.375rem;
                    position: relative;
                    transition: width 0.1s ease-out;
                    overflow: hidden;

                    // 光条动画元素
                    .light-bar {
                        position: absolute;
                        top: 0;
                        left: -100%;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(90deg,
                                transparent 0%,
                                rgba(255, 255, 255, 0.4) 20%,
                                rgba(255, 255, 255, 0.8) 50%,
                                rgba(255, 255, 255, 0.4) 80%,
                                transparent 100%);
                        border-radius: 0.375rem;
                        opacity: 0;
                        transition: opacity 0.3s ease-in-out;

                        &.animate {
                            opacity: 1;
                            animation: lightSweep 2s ease-in-out infinite;
                        }
                    }

                    // 右侧发光圆盘
                    &::after {
                        content: '';
                        position: absolute;
                        right: -0.2rem;
                        top: 50%;
                        transform: translateY(-50%);
                        width: 0.8rem;
                        height: 0.8rem;
                        background: radial-gradient(circle, #FFFFFF 0%, #FFFFFF 60%, transparent 100%);
                        border-radius: 50%;
                        box-shadow:
                            0 0 0.5rem rgba(255, 255, 255, 0.9),
                            0 0 1rem rgba(80, 255, 188, 0.7),
                            0 0 1.5rem rgba(80, 255, 188, 0.5),
                            0 0 2rem rgba(80, 255, 188, 0.3);
                        z-index: 2;
                        transition: all 0.1s ease-out;
                    }
                }
            }

            .progress-text {
                color: #828592;
                font-size: .88rem;
                line-height: 1.25rem;
                margin-bottom: .69rem;

                span {
                    color: #1DCC89;
                }
            }
        }
    }

    .verify-box {
        border: 1px solid #34353E;
        border-radius: .38rem;
        margin: 0 .69rem .56rem;
        .title-box {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.44rem .63rem;
            font-size: .88rem;
            line-height: 1.25rem;
            color: #84889C;
            margin-bottom: .56rem;
        }
        .verify-content-box {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.44rem .63rem;
            font-size: .88rem;
            line-height: 1.25rem;
            border-bottom: 1px solid #34353E;
            .verify-amount-text {
                font-size: 1rem;
                line-height: 1.25rem;
                color: #fff;
            }
            .verify-detail-text {
                font-size: .75rem;
                color: #1DCC89;
            }
        }
    }
}

.tips-text {
    color: #828592;
    font-size: .75rem;
    line-height: 1.06rem;
    padding: .44rem .75rem;
}

// 光条扫过动画
@keyframes lightSweep {
    0% {
        left: -100%;
    }

    100% {
        left: 100%;
    }
}
</style>