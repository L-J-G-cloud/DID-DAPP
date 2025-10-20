<template>
    <div class="current-compute-container">
        <div class="title">
            <span class="left-icon"></span>
            <span class="F-Bold">{{ t("time_machine") }}</span>
        </div>
        <div class="data-box">
            <div v-for="(infoArray, key) in computeInfo" :key="key"
                :class="['info-section', key === 'twoInfo' ? 'border-box' : 'oneInfo']">
                <div v-for="(item, index) in infoArray" :key="index" class="info-item">
                    <div class="name">{{ t(item.name) }}</div>
                    <div :class="['value F-Bold']">{{ item.value }}<span class="unit">{{ item.unit }}</span></div>
                    <div class="symbol F-Bold">{{ item.symbol }}</div>
                </div>
            </div>
        </div>
        <div class="border-box">
            <div class="data-box">
                <div class="info-section mb-2">
                    <div v-for="(item, index) in threeInfo" :key="index" class="info-item py-2">
                        <div class="name">{{ t(item.name) }}</div>
                        <div class="value F-Bold">{{ item.value  }} <span class="unit">{{ item.unit }}</span></div>
                        <div class="symbol F-Bold">{{ item.symbol }}</div>
                    </div>
                </div>
            </div>
            <div class="plr" v-if="isNode">
                <div class="progress-box">
                    <span class="progress-text">{{ progressPre }}%</span>
                    <ProgressBar :progress="progressPre"/>
                </div>
                <div v-if="progressPre >= 5" class="progress-box-item-text">
                    <img src="@/assets/imgs/home/Accelerating.png" alt="">
                    <span>{{ t("computing_power_accelerating") }}</span>
                </div>
            </div>
            
            <div class="condition-list">
                <div class="condition-list-title" v-if="progressPre < 5">
                    <img src="@/assets/imgs/home/fail.png" alt="">
                    <span>{{ isNode ? t("invalid_Value") : t("invalid_node_tip") }}</span>
                </div>
                <div class="condition-list-item" v-for="item in conditionList" :key="item.title">
                    <img :src="item.isSatisfied ? active : disActive" alt="">
                    <span>{{ t(item.title) }}</span>
                </div>
            </div>
        </div>
        <!-- <ProgressBar :progress="progress"/> -->
    </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import active from '@/assets/imgs/home/active.png';
import disActive from '@/assets/imgs/home/dis_active.png';
import { getSystemStatics, getUserBalance, getUserData } from '@/api';
import { getKMG, clearZoo ,formatDecimal} from '@/utils';
import { decimalParseToBigNumber, decimalParseToNumber ,getTokenBalance,getPayTokenAddress} from '@/api/mapcontract'
import ProgressBar from "@/components/ProgressBar.vue";
import { useStore } from '@/store/store';
const store = useStore();
const progressPre = ref(0);
const { t } = useI18n();
const isNode = ref(false);
const conditionList = computed(() => reactive([
    {
        title: 'hold_ftd_requirement',
        isSatisfied: false,
    },
    {
        title: 'hold_blc_requirement',
        isSatisfied: false,
    }
]))

const computeInfo = computed(() => reactive({
    oneInfo: [
        {
            name: 'issued_amount',
            value: '--',
            unit:'',
            symbol: 'FC',
        },
        {
            name: 'circulating_amount',
            value: '--',
            unit:'',
            symbol: 'FC',
        },
        {
            name: 'destroyed_amount',
            value: '--',
            unit:'',
            symbol: 'FC',
        }
    ],
    twoInfo: [
        {
            name: 'total_computing_power',
            value: '--',
            unit:'',
            symbol: 'BLC',
        },
        {
            name: 'yesterday_airdrop',
            value: '--',
            unit:'',
            symbol: 'FC',
        }
    ],

}))
const threeInfo = computed(() => reactive([
    {
        name: 'base_computing_power',
        value: '--',
        unit:'',
        symbol: 'BLC',
    },
    {
        name: 'compensation_computing_power',
        value: '--',
        unit:'',
        symbol: 'BLC',
    },
    {
        name: 'max_computing_power',
        value: '--',
        unit:'',
        symbol: 'BLC',
    }
]))
onMounted(async () => {
    getTokenBalanceData();
    getSystemStaticsData();
    getUserBalanceData();
    getUserDataData();
})

const getUserDataData = async () => {
    const { code, data } = await getUserData();
    if (!code) {
        isNode.value = data.is_node;
        const wallet_balance = decimalParseToNumber(data.wallet_balance, 18);
        conditionList.value[0].isSatisfied = Number(wallet_balance) > 0.42 || conditionList.value[0].isSatisfied;
        store.today_buy = data.today_buy;
        console.log(data.today_buy,'data.today_buy')
        store.buy_max_node = decimalParseToNumber(data.buy_max_node,18); 
        store.isDonor = data.is_business;
    }
}

const getTokenBalanceData = async () => {
    const tokenAddress = await getPayTokenAddress('0');
    const balance = await getTokenBalance(tokenAddress, store.account,18);
    conditionList.value[0].isSatisfied = Number(balance) > 0.42 || conditionList.value[0].isSatisfied;
}

const getSystemStaticsData = async () => {
    const { code, data } = await getSystemStatics();
    if (!code) {
        computeInfo.value.oneInfo[0].value = getKMG(clearZoo(decimalParseToNumber(data.issuance, 18))).value;
        computeInfo.value.oneInfo[1].value = getKMG(clearZoo(decimalParseToNumber(data.circulation, 18))).value;
        computeInfo.value.oneInfo[2].value = getKMG(clearZoo(decimalParseToNumber(data.destroy, 18))).value;
        computeInfo.value.twoInfo[0].value = getKMG(clearZoo(decimalParseToNumber(data.total_power, 18))).value;
        computeInfo.value.twoInfo[1].value = getKMG(clearZoo(decimalParseToNumber(data.yesterday_airdrop, 18))).value;

        computeInfo.value.oneInfo[0].unit = getKMG(clearZoo(decimalParseToNumber(data.issuance, 18))).unit;
        computeInfo.value.oneInfo[1].unit = getKMG(clearZoo(decimalParseToNumber(data.circulation, 18))).unit;
        computeInfo.value.oneInfo[2].unit = getKMG(clearZoo(decimalParseToNumber(data.destroy, 18))).unit;
        computeInfo.value.twoInfo[0].unit = getKMG(clearZoo(decimalParseToNumber(data.total_power, 18))).unit;
        computeInfo.value.twoInfo[1].unit = getKMG(clearZoo(decimalParseToNumber(data.yesterday_airdrop, 18))).unit;

    }
}
const getUserBalanceData = async () => {
    const { code, data } = await getUserBalance();
    if (!code) {
        store.banlance = decimalParseToNumber(data.fc, 18);
        threeInfo.value[0].value = getKMG(clearZoo(decimalParseToNumber(data.power, 18))).value;
        threeInfo.value[1].value = getKMG(clearZoo(decimalParseToNumber(data.subsidy_power, 18))).value;

        threeInfo.value[0].unit = getKMG(clearZoo(decimalParseToNumber(data.power, 18))).unit;
        threeInfo.value[1].unit = getKMG(clearZoo(decimalParseToNumber(data.subsidy_power, 18))).unit;

        threeInfo.value[2].value = getKMG(clearZoo(decimalParseToNumber(data.max_node_power, 18))).value;
        threeInfo.value[2].unit = getKMG(clearZoo(decimalParseToNumber(data.max_node_power, 18))).unit;
        // data.power = '100000000000000000';
        // data.max_node_power = '100000000000000000'
        if (Number(decimalParseToNumber(data.power, 18))) {
            progressPre.value = Number(decimalParseToNumber(data.power, 18)) / Number(decimalParseToNumber(data.max_node_power, 18)) * 100;
        } else {
            progressPre.value = 0;
        }
        // progressPre.value = 22;
        conditionList.value[1].isSatisfied = progressPre.value >= 5;
        progressPre.value = Number(formatDecimal(progressPre.value.toString(),2));
        if(progressPre.value&&progressPre.value<0.01){
            progressPre.value = 0.01;
        }
    }
}

defineExpose({
    getUserBalanceData
})
</script>

<style lang="scss" scoped>
.current-compute-container {
    padding: 0.62rem .94rem;
    margin: .56rem .94rem;
    border-radius: .38rem;
    position: relative;
    background-color: #0A0809;
    border: 1px solid #303134;
    .plr {
        padding: 0 .56rem;
    }
    .title {
        display: flex;
        align-items: center;
        border-bottom: 1px solid #1D1F22;
        padding-bottom: .56rem;
    }

    .left-icon {
        display: inline-block;
        width: .31rem;
        height: 1rem;
        margin-right: .44rem;
        background-color: #FF3F3F;
        border-radius: .19rem;
    }

    .progress-box {
        width: 100%;
        height: 1.33rem;
        position: relative;
        // background: linear-gradient(180deg, #323232 0%, #181818 100%);
        background-color: #181818;
        border-radius: 10px;
        border: 0.06rem solid #333333;
        // border-image: linear-gradient(180deg, rgba(57, 57, 57, 1), rgba(51, 51, 51, 1)) 0.06 0.06;
        margin-top: 1.31rem;
        margin-bottom: .56rem;
        padding: .38rem .24rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .progress-text {
            position: absolute;
            color: white;
            font-weight: bold;
            font-size: .75rem; /* 可以调整文字大小 */
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
        }

        .progress-box-item {
            position: absolute;
            z-index: 1;
            top: 50%;
            left: 0;
            transform: translateY(-50%);
            height: .88rem;

            &.active {
                /* 使用指定的颜色，同时保持3D凸起效果 */
                background: linear-gradient(to bottom,
                        #A5D9AA 0%,
                        #51C360 40%,
                        #19821A 60%,
                        #1ABA28 100%);
            }

            &.disActive {
                background: linear-gradient(to bottom,
                        #E37B7C 0%,
                        #CF1A1B 40%,
                        #9B1C0D 60%,
                        #C81A19 100%);
            }

            border-radius: 0.31rem 0 0 0.31rem;

            &.Roundactive {
                border-radius: 0.31rem;
            }
        }

        span {
            font-size: .75rem;
            color: #fff;
            position: absolute;
            left: 50%;
            top: 50%;
            z-index: 2;
            transform: translate(-50%, -50%);
        }
    }

    .progress-box-item-text {
        display: flex;
        // align-items: center;
        // justify-content: center;
        color: #29AE21;
        font-size: 0.88rem;
        line-height: .94rem;
        margin: .81rem 0 1rem;

        img {
            width: 1rem;
            height: 1rem;
            margin-right: .63rem;
        }
    }

    .condition-list {
        padding: .4rem 0 .44rem;
        border-top: 1px solid #1D1F22;
        // border: 1px solid #1D1F22;
        // border-radius: .38rem;
      
        .condition-list-title {
            padding: 0 .66rem .4rem;
            margin-bottom: .5rem;
            display: flex;
            align-items: start;
            // align-items: center;
            line-height: .94rem;
            img {
                width: .88rem;
                height: .88rem;
                margin-right: .63rem;
                // margin-top: .33rem;
            }

            span {
                font-size: .88rem;
                color: #FF3F3F;
               
            }

            border-bottom: 1px solid #2A2D33;
        }

        .condition-list-item {
            padding: 0 .66rem;
            display: flex;
            // align-items: center;
            margin-bottom: .36rem;
            font-size: .88rem;
            line-height: 1;
            img {
                width: .88rem;
                height: .88rem;
                margin-right: .63rem;
            }

            &:last-child {
                margin-bottom: 0;
            }
        }
    }
    .border-box {
            border: 1px solid #1D1F22;
            border-radius: .38rem;
        }
    .data-box {
        margin-top: .63rem;
        font-size: .75rem;
        color: #999;
       
        .info-section {
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            justify-content: space-between;

            .info-item {
                padding: 1rem;
                // border-radius: 0.5rem;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                width: 50%;
                text-align: center;
                .unit {
                    font-size: .88rem;
                    line-height: 1.63rem;
                }

                .name {
                    font-size: 0.75rem;
                    color: #999999;
                    line-height: 1rem;
                }

                .value {
                    font-size: 1.13rem;
                    color: #fff;
                    line-height: 1.63rem;
                }

                .symbol {
                    font-size: 0.75rem;
                    color: #575757;
                    line-height: .63rem;
                    margin-top: -.2rem;
                }

                &:nth-child(2) {
                    border-left: 1px solid #1D1E1F;
                }

                .title {
                    color: #B2B2B2;
                    font-size: 0.875rem;
                }

                .py-2 {
                    padding: .5rem 0;
                }
            }

            

            &:first-child {
                .info-item {

                    // width: 33.33%;
                    &:nth-child(2) {
                        border-left: 1px solid #1D1E1F;
                        border-right: 1px solid #1D1E1F;
                    }
                }
            }
            .mb-2 {
                margin-bottom: .63rem;
            }
        }
        .oneInfo {
            .info-item {
                padding: 0 .5rem;
                .name {
                    white-space: nowrap;
                }
            }
        }
    }
}
</style>