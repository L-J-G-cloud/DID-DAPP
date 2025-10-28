<template>
    <div class="content-box">
        <div class="header">
            <div class="title-line d-flex justify-content-center">
                <div class="title">
                    <span>{{ 'GAS费用支付' }}</span>
                    <img src="@/assets/imgs/identitycasting/back.png" alt="" class="back-icon" @click="router.back()">
                </div>
            </div>
        </div>
        <div class="gas-tip-box">
            <p>即将到期的算力</p>
            <p class="hash-text F-Bold"><span>0xa7...69d2fe0d</span> <img :src="copy" alt="" class="copy-icon"
                    @click="handleCopyHash('0xa7...69d2fe0d')"></p>
            <p class="time-text">剩余支付时间 <span class="F-Bold text-white">265天</span></p>
            <div class="progress-box">
                <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: progressWidth + '%' }">
                        <div class="light-bar" :class="{ 'animate': isLightBarActive }"></div>
                    </div>
                </div>
            </div>
            <p class="gas-tip-text">激活时间补偿算力，提升收益 </p>
        </div>
        <div class="gas-detail-box">
            <div class="detail-title">
                费用明细
            </div>
            <div class="list-box">
                <p class="header-title">
                    <span>身份算力列表</span>
                    <span class="d-flex align-items-center" @click="handleSelectAll"> <i class="text-white">全选</i> <img
                            :src="allSelected ? selected : select" alt="" class="selected-icon"></span>
                </p>
                <div class="list-item" v-for="(item, index) in powerList" :key="index">
                    <div class="d-flex align-items-center justify-content-between">
                        <p class="power-text">算力 ：<span class="power-value F-Bold">{{ item.power }}</span></p>
                        <img :src="item.isSelected ? selected : select" alt="" class="selected-icon"
                            @click="handleSelect(item)">
                    </div>
                    <div>
                        <p class="hash-text">Hash: <span class="">{{ item.hash }}</span> <img :src="copy" alt=""
                                class="copy-icon" @click="handleCopyHash(item.hash)"></p>
                    </div>
                    <div class="d-flex align-items-center justify-content-between">
                        <p class="time-text">铸造时间: <span class="">{{ item.time }}</span></p>
                        <p class="gas-text">GAS: <span class="text-white">{{ item.GAS }}</span></p>
                    </div>
                </div>
            </div>
            <!-- 数据摘要组件 -->
            <div class="data-summary">
                <div class="summary-item">
                    <span class="summary-label">原有身份算力</span>
                    <span class="summary-value">{{ originalHashrate }}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">时间算力补偿</span>
                    <span class="summary-value">{{ timeCompensation }}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">支付比例</span>
                    <span class="summary-value">{{ paymentRatio }}%</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label text-white">实际支付金额</span>
                    <span class="summary-value highlight">{{ actualPayment }} USDT</span>
                </div>
            </div>
        </div>

         <div class="pay-box">
             <div class="detail-title">
                 支付方式
             </div>
             <div class="payment-content">
                 <!-- 货币选择 -->
                 <div class="currency-selection">
                     <div class="currency-btn" :class="{ active: selectedCurrency === 'USDT' }" @click="selectCurrency('USDT')">
                         <div class="currency-icon usdt-icon">T</div>
                         <span>USDT</span>
                     </div>
                     <div class="currency-btn" :class="{ active: selectedCurrency === 'DID' }" @click="selectCurrency('DID')">
                         <div class="currency-icon did-icon">
                            <img src="@/assets/imgs/header/logo.png" alt="" class="did-icon-img">
                         </div>
                         <span>DID</span>
                     </div>
                 </div>
                 
                 <!-- 钱包余额 -->
                 <div class="wallet-balance">
                     钱包余额: {{ walletBalance }} <span class="text-white">{{ selectedCurrency }}</span>
                 </div>
                 
                 <!-- 重要提醒 -->
                 <div class="important-reminder">
                     <div class="reminder-header">
                         <div class="warning-icon">
                            <img src="@/assets/imgs/identitycasting/warning.png" alt="" class="warning-icon-img">
                         </div>
                         <span class="reminder-title">重要提醒</span>
                     </div>
                     <div class="reminder-text">
                         个人算力超过 365 天未支付将清零。系统提供 7 天缓冲期, 及时支付可激活最新时间算力补偿。
                     </div>
                 </div>
                 
                 <!-- 支付授权按钮 -->
                 <div class="payment-button" @click="handlePayment">
                     支付授权
                 </div>
             </div>
         </div>

          <div class="tips-box">
              <div class="tips-content">
                  <div class="tip-item" v-for="(tip, index) in tipsData" :key="index">
                      <div class="tip-title">
                          <div class="tip-icon"></div>
                          <span>{{ tip.title }}</span>
                      </div>
                      <div class="tip-text" v-html="tip.content"></div>
                  </div>
              </div>
          </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import selected from '@/assets/imgs/identitycasting/selected.png';
import select from '@/assets/imgs/identitycasting/select.png';
import copy from '@/assets/imgs/identitycasting/copy.png';
import CopyToClipBoard from "copy-to-clipboard";
import { showToastIcon } from '@/utils';
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const router = useRouter();
const allSelected = ref(false);
const handleSelectAll = () => {
    powerList.value.forEach(item => {
        item.isSelected = !item.isSelected;
    });
    allSelected.value = !allSelected.value;
};

const handleSelect = (item: any) => {
    item.isSelected = !item.isSelected;
    allSelected.value = powerList.value.every(item => item.isSelected);
};

const handleCopyHash = (hash: string) => {
    CopyToClipBoard(hash);
    showToastIcon(t("copied"), "success");
};

const powerList = ref([
    {
        isSelected: false,
        power: '100',
        hash: '0xa7...69d2fe0d',
        time: '2025-01-01 12:00:00',
        GAS: '100',
    },
    {
        isSelected: false,
        power: '100',
        hash: '0xa7...69d2fe0d',
        time: '2025-01-01 12:00:00',
        GAS: '100',
    },
]);

// 数据摘要相关数据
const originalHashrate = ref('1,500');
const timeCompensation = ref('100');
const paymentRatio = ref('27.4');
const actualPayment = ref('150');

// 计算实际支付金额
const calculateActualPayment = () => {
    const selectedItems = powerList.value.filter(item => item.isSelected);
    const totalGas = selectedItems.reduce((sum, item) => sum + parseInt(item.GAS), 0);
    const ratio = parseFloat(paymentRatio.value) / 100;
    actualPayment.value = Math.round(totalGas * ratio).toString();
};

// 监听选择变化，重新计算支付金额
watch(powerList, () => {
    calculateActualPayment();
}, { deep: true });

// 支付方式相关数据
const selectedCurrency = ref('USDT');
const walletBalance = ref('200');

// 选择货币
const selectCurrency = (currency: string) => {
    selectedCurrency.value = currency;
};

// 处理支付授权
const handlePayment = () => {
    // 这里可以添加支付逻辑
    console.log('支付授权', {
        currency: selectedCurrency.value,
        amount: actualPayment.value,
        selectedItems: powerList.value.filter(item => item.isSelected)
    });
};

// 提示信息数据
const tipsData = ref([
    {
        title: '为什么需要支付Gas费用?',
        content: '支付 Gas 费用用于维持身份算力池的持续运作及网络算力维护,及时支付可在365天内保留算力,并激活最新时间算力补偿。'
    },
    {
        title: '支付比例计算公式',
        content: '支付比例=铸造数字身份的36.5%÷365×支付当天的天数越早支付→支付比例低;越晚支付→支付比例高。 <br>提前支付可及时激活时间算力补偿,按支付当天算力增加个人算力值。'
    },
    {
        title: '时间算力补偿',
        content: '时间算力补偿=基础算力×铸造身份当天系统运行天数×0.1% <br>时间算力补偿更新: <br>支付 Gas 费用后,系统会按支付当天计算时间补偿算力,并自动更新您的算力,让您获得更高的个人算力值。'
    }
]);


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
});
</script>

<style scoped lang="scss">
.content-box {
    background-color: #1E1F25;
    border-radius: .38rem;


    .header {
        font-size: 1rem;
        margin-bottom: 1.88rem;
        padding: 1rem 0 0;
        position: relative;

        .back-icon {
            position: absolute;
            left: .8rem;
            top: 1.5rem;
            width: .48rem;
            height: .89rem;
        }

        .tips {
            font-size: .88rem;
            color: #B2B2B2;
        }

        img {
            width: 1rem;
            height: 1rem;
        }
    }

    .gas-tip-box {
        background-color: #272830;
        border-radius: 0.38rem;
        padding: 0.88rem;
        margin: 0 .88rem 1rem;
        color: #828592;
        font-size: 0.88rem;

        .hash-text {
            color: #fff;
            font-size: 1rem;
            line-height: 1.38rem;
            padding-bottom: .3rem;
            border-bottom: 1px solid #34353E;
            margin-bottom: .5rem;
        }

        .gas-tip-text {
            font-size: 0.75rem;
            color: #1DCC89;
            line-height: 1.06rem;
            background-color: rgba(29, 204, 137, 0.16);
            border-radius: 0.38rem;
            padding: 0.31rem 0.5rem;
            margin: .81rem 0 .5rem;
            border: 1px solid #1DCC89;
            width: fit-content;
        }

        .time-text {
            margin-bottom: .5rem;
        }
    }

    .detail-title {
        position: relative;
        font-size: 1rem;
        line-height: 1.38rem;
        color: #fff;
        margin-bottom: .88rem;
        padding-left: .75rem;

        &::before {
            position: absolute;
            content: '';
            left: 0;
            top: 0.2rem;
            width: .25rem;
            height: 1.06rem;
            background-color: #1DCC89;
        }
    }

    .gas-detail-box {
        margin: 0 .88rem 1rem;
        background-color: #272830;
        border-radius: 0.38rem;
        padding: 0.88rem 0;

        .list-box {
            padding: 0.75rem 0;
            background-color: #1F212A;
            border-radius: 0.25rem;
            border: 1px solid #34353E;
            margin: 0 .75rem .5rem;

            .header-title {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0 .75rem;
                font-size: 0.88rem;
                line-height: 1.25rem;
                color: #828592;
                border-bottom: 1px solid #34353E;
                padding-bottom: .75rem;

                .selected-icon {
                    width: 1.06rem;
                    height: 1.06rem;
                    margin-left: .5rem;
                }
            }

            .list-item {
                padding: .6rem .75rem;
                border-bottom: 1px solid #34353E;
                font-size: .75rem;
                line-height: 1rem;
                color: #828592;

                &:last-child {
                    border-bottom: none;
                }

                .selected-icon {
                    width: 1.06rem;
                    height: 1.06rem;
                    margin-left: .5rem;
                }

                .power-value {
                    color: #1DCC89 !important;
                    font-size: .88rem;
                    line-height: 1.25rem;
                }

                .power-text {
                    font-size: .88rem;
                    line-height: 1.25rem;
                    color: #fff;
                    margin-bottom: .4rem;
                }

                .hash-text {
                    font-size: .75rem;
                    line-height: 1.06rem;
                    color: #828592;
                    margin-bottom: .4rem;
                }

            }
        }

        // 数据摘要样式
        .data-summary {
            padding: 0 0.75rem;

            .summary-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.3rem 0;
                font-size: 0.88rem;

                .summary-label {
                    color: #84889C;
                    font-weight: 400;
                }

                .summary-value {
                    font-size: 0.88rem;
                    color: #fff;
                    font-weight: 500;

                    &.highlight {
                        color: #32CD32;
                        font-weight: 600;
                        font-size: 1rem;
                    }
                }

                &:last-child {
                    padding-bottom: 0;
                    font-size: 1rem;
                    line-height: 1.38rem;
                    color: #fff;
                    font-weight: 500;
                }
            }
        }
    }


     .pay-box {
         margin: 0 .88rem;
         background-color: #272830;
         border-radius: 0.38rem;
         padding: 0.88rem 0;

         .payment-content {
             padding: 0 0.75rem;

             // 货币选择样式
             .currency-selection {
                 display: flex;
                 gap: 0.5rem;
                 margin-bottom: 1rem;

                 .currency-btn {
                     flex: 1;
                     display: flex;
                     align-items: center;
                     justify-content: center;
                     gap: 0.5rem;
                     padding: 0.5rem 1rem;
                     background-color: #26272E;
                     border: 1px solid #34353E;
                     border-radius: 0.5rem;
                     cursor: pointer;
                     transition: all 0.3s ease;

                     &:hover {
                         background-color: #3a3b42;
                     }

                     &.active {
                         background-color: rgba(29, 204, 137, 0.16);
                         border-color: #1DCC89;

                         .currency-icon {
                             background-color: #fff;
                             color: #1DCC89;
                         }

                         span {
                             color: #fff;
                             font-weight: 600;
                         }
                     }

                     .currency-icon {
                         width: 1.5rem;
                         height: 1.5rem;
                         border-radius: 50%;
                         display: flex;
                         align-items: center;
                         justify-content: center;
                         font-weight: bold;
                         font-size: 0.88rem;

                         .did-icon-img {
                            width: 1.5rem;
                            height: 1.5rem;
                        }

                     }

                     span {
                         color: #fff;
                         font-size: 0.88rem;
                         font-weight: 500;
                     }
                 }
             }

             // 钱包余额样式
             .wallet-balance {
                 color: #84889C;
                 font-size: 0.88rem;
                 margin-bottom: .63rem;
                 padding: .38rem 0;
             }

             // 重要提醒样式
             .important-reminder {
                 background-color: #2B2E3A;
                 border-radius: 0.5rem;
                 padding: .56rem;
                 margin-bottom: 1.5rem;

                 .reminder-header {
                     display: flex;
                     align-items: center;
                     gap: 0.5rem;
                     margin-bottom: 0.75rem;

                     .warning-icon {
                         .warning-icon-img {
                            width: 1.09rem;
                        }
                     }

                     .reminder-title {
                         color: #fff;
                         font-size: 0.88rem;
                     }
                 }

                 .reminder-text {
                     color: #84889C;
                     font-size: 0.75rem;
                     line-height: 1.25rem;
                 }
             }

             // 支付授权按钮样式
             .payment-button {
                 width: 100%;
                 background-color: #1DCC89;
                 color: #1E2741;
                 font-size: 1rem;
                 font-weight: 600;
                 text-align: center;
                 padding: .85rem;
                 border-radius: 0.38rem;
                 cursor: pointer;
                 transition: all 0.3s ease;
                 border: none;

                 &:hover {
                     background-color: #16b377;
                     transform: translateY(-1px);
                 }

                 &:active {
                     transform: translateY(0);
                 }
             }
         }
     }

     // 提示框样式
     .tips-box {
         margin: 0 .5rem;
        
         border-radius: 0.38rem;
         padding: 0.88rem 0;

         .tips-content {
             padding: 0 0.75rem;

             .tip-item {
                 margin-bottom: 1.5rem;

                 &:last-child {
                     margin-bottom: 0;
                 }

                 .tip-title {
                     display: flex;
                     align-items: center;
                     gap: 0.5rem;
                     margin-bottom: 0.5rem;

                     .tip-icon {
                         width: 0.25rem;
                         height: 1.06rem;
                         background-color: #1DCC89;
                         border-radius: 0.125rem;
                     }

                     span {
                         color: #fff;
                         font-size: 1rem;
                         font-weight: 500;
                         line-height: 1.38rem;
                     }
                 }

                 .tip-text {
                     color: #84889C;
                     font-size: 0.88rem;
                     line-height: 1.5;
                     padding-left: 0.75rem;

                     .formula-symbol {
                         color: #1DCC89;
                         font-weight: 600;
                     }
                 }
             }
         }
     }

    .copy-icon {
        width: .75rem;
        height: .75rem;
        margin-left: .5rem;
    }

    .progress-box {
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
</style>