<template>
    <div class="donor-container">
        <div class="donor-header F-Bold">
            <img src="@/assets/imgs/home/back.png" alt="" class="back-icon" @click="$router.back()">
            <span>{{ t('Donor') }}</span>
        </div>
        <div class="donor-content">
            <div class="donor-content-item F-Bold">
                <p>{{ t('PaymentAmount') }}</p>
                <p>{{ formatDecimal(donorInfo.fc, 4) }} FC</p>
                <p>= {{ formatDecimal(donorInfo.blc, 4) }}BLC</p>
            </div>
            <div class="item-bottom">
                <div>
                    <p class="item-title">{{ t('PurchaseAmount') }}</p>
                    <p class="item-value F-Bold">{{ formatDecimal(donorInfo.quota, 4) }} <span>BLC/{{ t('days') }}</span>
                    </p>
                </div>
                <div>
                    <p class="item-title">{{ t('PurchasedAmount') }}</p>
                    <p class="item-value F-Bold">{{ formatDecimal(donorInfo.use_quota, 4) }} <span>BLC</span></p>
                </div>
            </div>
            <div class="donor-action">
                <p class="donor-action-title">{{ t('PledgeCycle') }}：{{ t('PledgeCycleDesc') }}</p>
                <p class="nums-deposit">{{ t('PledgeAmount') }}</p>
                <div class="donor-action-field">
                    <van-field v-model="info.FC" center clearable class="ftd-num-field F-Bold field-box" type="number"
                        :placeholder="'0'">
                        <template #button>
                            <span class="SYS-BLC">FC</span>
                        </template>
                    </van-field>
                    <p class="blc-value F-Bold">= <span>{{ info.FCValue }}</span>BLC</p>
                </div>
                <p class="donor-action-tip" v-if="showTip">{{ t('PledgeAmountDesc') }} {{ info.min_deposit_blc }} ~ {{ info.max_deposit_blc }} BLC</p>
                <p class="balance F-Bold">{{ t('WalletBalance') }}：<span>{{ info.balanceFC }} </span> FC</p>
                <p class="donor-btn" :class="{ 'disabled': info.noBalance }" @click="stakeFC">{{ info.isApprove ?
                    t('Pledge') :
                    t('AuthorizationTo') }}</p>
            </div>
            <h4 class="donor-title" v-if="listInfo.list.length">{{ t('PledgeRecord') }}</h4>
            <van-list v-if="listInfo.list.length" v-model:loading="listInfo.loading" :loading-text="t('loading')"
                :finished="listInfo.finished" :finished-text="t('NoMore')" @load="getRecordList"
                class="current-pledge-list-box">
                <div class="record-list">
                    <div class="record-item F-Bold" v-for="item in listInfo.list" :key="item.id">
                        <div>
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <p>
                                    <span class="fc-num">{{ item.amount }} <i>FC</i></span> <span>= {{ item.blc }}BLC</span>
                                </p>
                                <p class="status-box"
                                    :class="item.status === 1 ? 'red' : item.status === 2 ? 'blue' : 'green'">
                                    {{ item.statusText }}</p>
                            </div>
                            <div class="time-box">
                                <p><span>{{ t('PledgeTime') }}：</span><span>{{ item.status === 0 ? '----' : item.startTime }}</span></p>
                                <p><span>{{ t('PledgeEndTime') }}：</span><span>{{ item.status === 0 ? '----' : item.endTime }}</span></p>
                            </div>
                        </div>{{ item.status }}
                        <div class="d-flex justify-content-center align-items-center arr-icon-box">
                            <img :src="arr_down" alt="" @click="item.showFlag = item.showFlag === 1 ? 2 : 1"
                                v-if="item.showFlag === 1 && item.status === 2" class="my-2">
                        </div>
                        <div class="record-item-btn" v-if="item.status === 2 && item.showFlag === 2">
                            <p class="btn-text" @click="handleClickRedemption(item)">{{ t('Redeem') }}</p>
                            <img :src="arr_up" alt="" @click="item.showFlag = 1">
                        </div>
                    </div>
                </div>
            </van-list>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useStore } from '@/store/store';
import { useI18n } from 'vue-i18n';
import { showToast, showConfirmDialog, showLoadingToast, closeToast } from 'vant';
import { depositList, businessDetail ,businessDeposit, withdraw} from '@/api';
import { getTokenBalance, getTokenAllowBalance, getContractAddress, getPayTokenAddress, approval, getFCPrice, stakingFC ,decimalParseToBigNumber, withdrawBack} from '@/api/mapcontract';
import Decimal from 'decimal.js';
import success from "@/assets/imgs/home/success.png";
import fail from "@/assets/imgs/home/fail.png";
import { clearZoo, decimalParseToNumber, showLoading, closeToastLoading, showToastIcon, getdata, formatDecimal } from '@/utils';
import arr_down from '@/assets/imgs/home/d_arr_down.png'
import arr_up from '@/assets/imgs/home/d_arr_up.png'
const store = useStore()
const account = ref(store.account)
const { t } = useI18n()
const info = ref({
    BLC: '',
    FC: '',
    FCPrice: '0',
    FCValue: '0',
    balanceFC: '0',
    allowBalanceFC: '0',
    isApprove: false,
    stakingAddress: '',
    noBalance: true,
    min_deposit_blc: '0',
    max_deposit_blc: '0',
})
const showTip = ref(false)
type listInfo = {
    id: number, // 质押ID
    amount: string, // 质押数量
    blc: string, // 价值blc
    status: number, // 质押状态
    statusText: string, // 质押状态文本
    startTime: string, // 质押开始时间
    endTime: string, // 质押结束时间
    showFlag: number, // 是否展开
}

const donorInfo = ref<{
    blc: string,
    fc: string,
    quota: string,
    use_quota: string,
}>({
    blc: '',
    fc: '',
    quota: '',
    use_quota: '',
})

const listInfo = ref<{
    list: listInfo[],
    loading: boolean,
    finished: boolean,
    showFlag: number,
    total: number
}>({
    list: [],
    loading: false,
    finished: false,
    showFlag: 1,
    total: 0,
})
const params = ref<any>({
    start: 0,
    limit: 10,
})

onMounted(() => {
    getRecordList()
    getDonorInfo()
    init()
})

const showToastTip = (type: string, message: string) => {
  const icon = type === "success" ? success : fail;
  showToast({
    duration: 3000,
    className: "success-toast-box",
    message,
    icon,
    overlay: false, // 是否显示背景遮罩层
    forbidClick: true, // 是否禁止点击
    closeOnClick: false, // 是否在点击后关闭
    closeOnClickOverlay: false, //是否在点击遮罩层后关闭
    wordBreak: "break-word",
  });
};

const init = async () => {
    showLoading()
    await getBalance()
    const res = await getFCPrice()
    info.value.FCPrice = clearZoo(decimalParseToNumber(res.toString(), 18))
    console.log(info.value.FCPrice, 'info.value.FCPrice')
    closeToastLoading()
}

const getDonorInfo = async () => {
    const { code, data } = await businessDetail()
    if (!code && data) {
        donorInfo.value.blc = decimalParseToNumber(data.blc, 18)
        donorInfo.value.fc = decimalParseToNumber(data.fc, 18)
        donorInfo.value.quota = decimalParseToNumber(data.quota, 18)
        donorInfo.value.use_quota = decimalParseToNumber(data.use_quota, 18)
        info.value.min_deposit_blc = formatDecimal(decimalParseToNumber(data.min_deposit_blc, 18), 2)
        info.value.max_deposit_blc = formatDecimal(decimalParseToNumber(data.max_deposit_blc, 18), 2)
    }
}

const getBalance = async () => {
    store.contractInfo.PayTokenAddress2 = await getPayTokenAddress('1');
    info.value.stakingAddress = await getContractAddress('Staking');
    info.value.balanceFC = await getTokenBalance(
        store.contractInfo.PayTokenAddress2,
        store.account,
        18
    );
    console.log(info.value.balanceFC, 'info.value.balanceFC')
    info.value.allowBalanceFC = await getTokenAllowBalance(
        store.contractInfo.PayTokenAddress2,
        store.account,
        18,
        info.value.stakingAddress
    );
    info.value.isApprove = Number(info.value.FC) > Number(info.value.allowBalanceFC)
}

const getBLCValue = () => {
    if (!Number(info.value.FC)) {
        showTip.value = false
        info.value.FCValue = '0'
        info.value.isApprove = false;
        info.value.noBalance = true;
        return;
    }
    info.value.noBalance = Number(info.value.FC) > Number(info.value.balanceFC)
    const blc = new Decimal(info.value.FC)
    const fc = new Decimal(info.value.FCPrice)
    const fcValue = blc.mul(fc).toString()
    info.value.FCValue = fcValue;
    if(Number(fcValue) < Number(info.value.min_deposit_blc) || Number(fcValue) > Number(info.value.max_deposit_blc)){
        showTip.value = true;
        info.value.noBalance = true;
        return;
    }else{
        showTip.value = false
    }
    info.value.isApprove = Number(info.value.allowBalanceFC) > Number(info.value.FC)
}

watch(() => info.value.FC, (newVal) => {
    getBLCValue()
}, { immediate: true, deep: true })


const stakeFC = async () => {
    if (info.value.noBalance) {
        return;
    }
    if (info.value.isApprove) {
        try {
            showLoading()
            const hash = await stakingFC(info.value.FCValue);
            const res = await businessDeposit({
                fc: decimalParseToBigNumber(info.value.FC, 18).toString(),
                fc_price: decimalParseToBigNumber(info.value.FCPrice, 18).toString(),
                trx_id: hash
            })
            if(!res.code){
                closeToastLoading()
                showToastTip("success", t("staking_success"));
                setTimeout(() => {
                    getRecordList(1)
                    info.value.FC = ''
                    info.value.FCValue = '0'
                    info.value.noBalance = true;
                    info.value.isApprove = false;
                }, 3000)
            }else{
                closeToastLoading()
                showToastTip("fail", t("staking_fail"));
            }
        } catch (error) {
            console.log(error)
            closeToastLoading()
        }
    } else {
        approvalAction();
    }
}

const approvalAction = async () => {
    showLoading()
    await approval(
        store.contractInfo.PayTokenAddress2,
        store.account,
        info.value.stakingAddress,
        String(Number(info.value.FC) + 0.001),
        18,
        () => {
            showToastTip("success", t("Authorizationsuccessful"));
            info.value.allowBalanceFC = String(Number(info.value.allowBalanceFC) + 0.001);
            info.value.allowBalanceFC = info.value.FC;
            info.value.isApprove = true;
        },
        () => {
            showToastTip("fail", t("AuthorizationFail"));
        }
    );
    setTimeout(() => {
        closeToastLoading();
    }, 2000);
}

// 点击赎回
async function handleClickRedemption(obj:any) {
  try {
    await showConfirmDialog({
      className: "dialog-confirm-box", // confirm弹窗的类名
      message: t("surestake"),
      cancelButtonText: t("Cancel"), // 取消按钮文案
      confirmButtonText: t("Redeem"), // 确认按钮文案
    });
    // await getContract();
    showLoadingToast({
      message: t("Redeeming"),
      forbidClick: true,
      duration: 0,
    });
    try {
      await withdrawBack(info.value.stakingAddress, obj.dep_id);
      const { code } = await withdraw({
        id: obj.id,
        cid: obj.dep_id,
      });
      if (!code) {
        showToastTip("success", t("RedeemSuccessful"));
        setTimeout(() => {
          listInfo.value.list.splice(obj.id, 1);
          getBalance();
        }, 2000)
      }
    } catch (error) {
      closeToast();
      showToastTip('fail', error as string)
      // alert(JSON.stringify(error))
    }
  } catch (error) {
    // alert(JSON.stringify(error))
    // showToastTip('fail',error)
    console.log("Cancelled");
  }
}



const getRecordList = async (type=0) => {
    if(type){
        listInfo.value.list = [];
        params.value.start = 0;
        params.value.limit = 10;
        listInfo.value.finished = false;
    }
    listInfo.value.loading = true;
    let { code, data } = await depositList(params.value);
    if (!code && data) {
        listInfo.value.loading = false;
        if (data.length) {
            listInfo.value.list = [...listInfo.value.list, ...data];
            params.value.start = listInfo.value.list.length;

            listInfo.value.list.forEach((item: any) => {
                item.status = 2;
                if (item.status === 1) {
                    item.statusText = t('Pledgeing');
                } else if (item.status === 2) {
                    item.statusText = t('PledgeEnd');
                } else if (item.status === 0) {
                    item.statusText = t('ConfirmingBlock');
                }
                item.amount = decimalParseToNumber(item.fc, 18);
                item.blc = decimalParseToNumber(item.blc, 18);
                item.startTime = store.lang === 'tw' ? getdata(item.start_time * 1000).timeDetail : getdata(item.start_time * 1000).langEnStr;
                item.endTime = store.lang === 'tw' ? getdata(item.end_time * 1000).timeDetail : getdata(item.end_time * 1000).langEnStr;
                item.showFlag = 1;
            
            
            })
        } else {
            listInfo.value.finished = true;
        }
        // listInfo.value.total = total;
        listInfo.value.finished = true;
        // listInfo.value.list.forEach(item=>{item.amount='5400000000000000000000';item.multiple=7})
    }
}
</script>

<style scoped lang="scss">
.donor-container {
    padding: 70px 15px;
    width: 100%;
    height: 100%;
    background: url('@/assets/imgs/home/donor_bg.png') no-repeat center 100px;
    background-size: 100% auto;
    max-width: 500px;
    margin: 0 auto;

    .donor-header {
        position: relative;
        width: 100%;
        text-align: center;
        font-size: 18px;
        line-height: 24px;
        margin-bottom: 42px;
        margin-top: 10px;

        .back-icon {
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 8px;
        }
    }

    .donor-content {
        .donor-content-item {
            width: 100%;
            text-align: center;

            p {
                &:nth-child(1) {
                    font-size: 14px;
                    color: #999999;
                }

                &:nth-child(2) {
                    font-size: 24px;
                    color: #fff;
                    line-height: 26px;
                }

                &:nth-child(3) {
                    font-size: 12px;
                    color: #fff;
                }
            }
        }
    }

    .item-bottom {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 28px 0 7px;
        padding: 17px;
        background-color: #0A0809;
        border: 1px solid #1D1E1F;
        border-radius: 6px;

        .item-title {
            font-size: 14px;
            color: #999999;
        }

        .item-value {
            font-size: 14px;
            line-height: 26px;
            color: #fff;
        }
    }

    .donor-action {
        padding: 10px;
        background-color: #0A0809;
        border: 1px solid #1D1E1F;
        border-radius: 6px;

        .donor-action-title {
            position: relative;
            font-size: 16px;
            line-height: 16px;
            color: #fff;
            padding-left: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid #212225;
            margin-bottom: 10px;

            &::before {
                position: absolute;
                left: 0;
                top: 0;
                content: '';
                display: inline-block;
                width: 5px;
                height: 16px;
                border-radius: 5px;
                background-color: #FF3F3F;
            }
        }

        .nums-deposit {
            font-size: 12px;
            color: #B2B2B2;
            line-height: 17px;
            margin-bottom: 7px;
        }

        .donor-action-tip {
            font-size: 12px;
            color: red;
            margin-bottom: 7px;
        }

        .balance {
            font-size: 14px;
        }

        .donor-btn {
            width: 50%;
            height: 40px;
            margin: 10px auto;
            line-height: 40px;
            background-color: #FF3F3F;
            border-radius: 6px;
            color: #fff;
            text-align: center;
        }

        .disabled {
            color: #7C7C7C;
            border: none;
            background-color: #202020;
        }

        .balance {
            font-size: 12px;
            color: #7C7C7C;
            line-height: 17px;

            span {
                color: #fff;
            }
        }

    }

    .donor-title {
        font-size: 18px;
        margin: 10px 0;
    }

    .record-item {
        font-size: 12px;
        padding: 10px 14px;
        border: 1px solid #222222;
        border-radius: 10px;
        margin-bottom: 10px;
        color: #575757;

        .time-box {
            color: #B2B2B2;
        }

        .fc-num {
            font-size: 16px;
            color: #fff;
        }

        .status-box {
            color: #fff;
            padding: 2px 8px 2px 18px;
            border-radius: 20px;
            position: relative;

            &::before {
                position: absolute;
                top: 50%;
                left: 10px;
                transform: translate(-50%, -50%);
                content: '';
                display: inline-block;
                width: 4px;
                height: 4px;
                border-radius: 50%;
                margin-right: 5px;
            }

            &.red {
                color: #fff;
                border: 1px solid #FF3F3F;

                &::before {
                    background-color: #FF3F3F;
                }
            }

            &.green {
                color: #fff;
                border: 1px solid #008000;

                &::before {
                    background-color: #008000;
                }
            }

            &.blue {
                color: #fff;
                border: 1px solid #39415C;

                &::before {
                    background-color: #39415C;
                }
            }
        }

        .arr-icon-box {
            img {
                width: 15.65px;
                height: auto;
                margin: 10px auto;
            }
        }

        .record-item-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            margin-top: 15px;

            img {
                width: 15.65px;
                height: auto;
                margin: 15px 0 10px;
            }

            .btn-text {
                font-size: 14px;
                color: #fff;
                line-height: 19px;
                width: 100%;
                text-align: center;
                background-color: #FF3F3F;
                border-radius: 6px;
                padding: 10px 0;
            }
        }
    }

    .blc-value {
        font-size: 12px;
        color: #575757;
        margin-left: 14px;
        padding-bottom: 10px;
    }

}

.field-box {
    background-color: #090909;
}

.donor-action-field {
    background-color: #090909;
    border-radius: 6px;
    border: 1px solid #212225;
    margin-bottom: 10px;
}



.van-cell:after {
    border-bottom: none;
}
</style>

<style lang="scss">
/* FTD数量输入框 */
.ftd-num-field {
    margin: 10px 0;
    padding: 0 .69rem 30px;
    border-bottom: 1px solid #212225;

    .SYS-BLC {
        font-size: 16px;
        color: #fff;
    }

    .van-field__control {
        font-weight: bold;
        font-size: 1rem;
        color: #fff;
        line-height: 1.38rem;
        font-family: 'F-Bold';

        &::placeholder {
            font-weight: 800;
            color: #535353;
            font-size: 16px;
        }
    }

}
</style>
