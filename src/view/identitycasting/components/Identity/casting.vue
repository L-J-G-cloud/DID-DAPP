<template>
  <div class="pledge-container">
    <div class="header">
      <div class="title-line d-flex justify-content-center">
        <div class="title">
          <span>{{ '身份铸造' }}</span>
          <img src="@/assets/imgs/identitycasting/back.png" alt="" class="back-icon" @click="router.back()">
        </div>
      </div>
    </div>

    <div class="tab-box">
      <div class="tab-item" v-for="item in tabList" :key="item.name" :class="['tab-item']" @click="changeTab(item)">
        <p :class="['tab-item-text', item.active ? 'active' : '']">
          {{ item.name }}
        </p>
      </div>
    </div>

    <!-- 铸造身份 -->
    <div v-if="tabList[0].active" class="casting_box">

      <div class="casting_title">
        铸造金额
      </div>
      <van-field v-model="info.Amount" center clearable class="ftd-num-field F-Bold field-box" type="number"
        :placeholder="t('PleaseEnter')" @input="changeAmount">
      </van-field>
      <p v-if="errorMessage" class="error_message">{{ errorMessage }}</p>
      <div class="line"></div>
      <div class="fast_casting_title">
        快捷铸造
      </div>
      <div class="fast_casting_box">
        <div :class="['fast_casting_item', item.active ? 'active' : '']" v-for="item in fastCastingList"
          :key="item.value" @click="changeFastCasting(item)">
          <span :class="['fast_casting_item_text F-Bold']">{{ item.name }}</span>
        </div>
      </div>
      <div class="line"></div>
      <div class="fast_casting_title">
        支付方式
      </div>
      <div class="pay_box">
        <div :class="['pay_item']" @click="changePayType(1)">
          <span :class="['radio', payType === 1 ? 'radio_active' : '']">
            <i class="radio_icon"></i>
          </span> {{ info.allUSDT }} USDT
        </div>
        <div :class="['pay_item']" @click="changePayType(2)">
          <span :class="['radio', payType === 2 ? 'radio_active' : '']">
            <i class="radio_icon"></i>
          </span> {{ info.USDT }} USDT + {{ info.USDID }} USDID
        </div>
      </div>
      <p class="balance_box_title">钱包余额</p>
      <div class="balance_box">
        <div class="item-info">
          <p>
            <img src="@/assets/imgs/identitycasting/blc.png" alt=""> {{ formatDecimal(info.balanceUSDT, 2) }}
            <span>USDT</span>
          </p>
          <p v-if="payType === 2">
            <img src="@/assets/imgs/identitycasting/ftd.png" alt=""> {{ formatDecimal(info.balanceUSDID, 2) }}
            <span>USDID</span>
          </p>
        </div>
      </div>
      <div v-if="!isBalance" class="balance_tip">
        <p>
          {{ balanceTips }}
        </p>
      </div>
      <div class="footer-box">
        <van-button :class="['btn-item F-Bold', Number(info.Amount) && isBalance ? 'confirm' : 'dis']"
          :disabled="!Number(info.Amount) || !isBalance" @click="handleButtonClick">
          {{ info.isApprove ? approvalText : t("confirm") }}
        </van-button>
      </div>
    </div>

    <!-- 激活身份 -->
    <div v-if="tabList[1].active" class="activate_box">
      <div class="activate_title">
        兑换码
      </div>
      <van-field v-model="info.exchangeCode" center clearable class="ftd-num-field F-Bold field-box" type="text"
        :placeholder="t('PleaseEnter')">
      </van-field>
      <van-button class="activate_btn F-Bold" @click="handleActivate">
        兑换
      </van-button>
    </div>


    <div class="default-box">
      <div class="record-title">
        铸造记录
      </div>
      <!-- 记录列表 -->
      <van-list v-if="recordList.length" v-model:loading="loading" :finished="finished" :finished-text="t('NoMore')"
        :loading-text="t('loading')" @load="getPowerListData" :offset="30" class="current-pledge-list-box">
        <div v-if="recordList.length > 0" class="record-list">
          <div class="record-item" v-for="(item, index) in recordList" :key="index">
            <div class="money-box">
              <span class="F-Bold">
                <i>{{ formatDecimal(item.total_usd, 4) }} USDT</i>  <i v-if="item.usdid.greaterThan(0)"> | {{ formatDecimal(item.usdid, 4) }} USDID</i> 
              </span>
              <span class="status-text">
                {{ item.status === 0 ? '区块链确认中' : '铸造成功' }}
              </span>
            </div>
            <div class="hash-box">Hash: <span class="hash-text">{{ getStr(item.trx_id, 4, 8) }}</span> <img
                src="@/assets/imgs/identitycasting/copy.png" alt="" class="copy-icon" @click="copyHash(item.trx_id)">
            </div>
            <div class="time-box">铸造时间: {{ item.create_time ? store.lang === 'en'
              ? getdata(item.create_time * 1000).langEnStr : getdata(item.create_time * 1000).timeDetail : '---' }}
            </div>
          </div>
        </div>
      </van-list>

      <!-- 无记录 -->
      <div class="no-record" v-if="!recordList.length && finished">
        <img class="empty-img" src="@/assets/imgs/identitycasting/empty-record.png" alt="" />
        <div class="empty-text">{{ t('NoContent') }}</div>
      </div>

      <div v-if="!recordList.length && !finished" class="no-record loading_text">
        <p>{{ t('loading') }}</p>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import {
  showLoadingToast,
  closeToast,
  showToast,
} from "vant";
import Head from '@/view/identitycasting/components/Head.vue';
import { vailNum, showLoading, getStr, closeToastLoading, formatDecimal, clearZoo, getdata, showToastIcon } from "@/utils";
import success from "@/assets/imgs/identitycasting/success.png";
import fail from "@/assets/imgs/identitycasting/fail.png";
import {
  getTokenBalance,
  getTokenAllowBalance,
  approval,
  decimalParseToBigNumber,
  decimalParseToNumber,
  getContractAddress,
  buyPower
} from "@/api/mapcontract";
import { buyDIDPower, buyPowerRecord ,exchange,exchangeList} from "@/api";
import Decimal from "decimal.js";
import { useStore } from "@/store/store";
import { useI18n } from "vue-i18n";
import i18n from '@/plugin/i18n'
import CopyToClipBoard from "copy-to-clipboard";
const store = useStore();
const { t } = useI18n();
const router = useRouter();
const emit = defineEmits(["pledgeFinish"]);
const approvalText = ref(t('authorize'));
const confirmText = ref(t('confirm'));
const isBalance = ref(true);
const fastCastingList = ref([
  {
    name: '100',
    value: 100,
    active: false,
  },
  {
    name: '500',
    value: 500,
    active: false,
  },
  {
    name: '1,000',
    value: 1000,
    active: false,
  },
  {
    name: '5,000',
    value: 5000,
    active: false,
  },
]);
const tabList = ref([
  {
    name: '铸造身份',
    active: true,
  },
  {
    name: ' 激活身份',
    active: false,
  }
]);
const errorMessage = ref('*请输入整百的数值');
const info = reactive({
  Amount: "",
  isSatisfy: false,
  isApprove: true,
  DEPINPrice: "",
  totalValue: "",
  DPINScale: "",
  BLC_U: "0",
  DPEN_U: "0",
  aeLeast_DPIN: "--",
  balanceUSDID: "0",
  allowbalanceUSDID: "",
  balanceUSDT: '',
  allowbalanceUSDT: '',
  balanceFC: '0',
  allowBalanceFC: '',
  alDespUSDT: '',
  USDID: '0',
  fcNums: '0',
  blcNums: '0',
  remainingNodes: 0,
  payTokenPrice: '',
  is_buy: false,
  USDT: '0',
  allUSDT: '0',
  exchangeCode: '',
});
const payType = ref(1);
const isFlexible = ref(false);
onMounted(async () => {
  confirmText.value = t("Confirm");
  approvalText.value = t("AuthorizationTo");
  await init();
  await getPowerListData();
});

const recordList = ref<any[]>([]);
const loading = ref(false);
const finished = ref(false);
const params = reactive({
  start: 0,
  limit: 10,
  address: store.account,
});

const copyHash = (hash: string) => {
  CopyToClipBoard(hash);
  showToastIcon(t("copied"), "success");
}

const getPowerListData = async (type = 1) => {
  const tempApi = type === 1 ? buyPowerRecord : exchangeList;
  const { code, data, total } = await tempApi({ ...params });
  if (!code && data) {
    loading.value = false;
    data.forEach((item: any) => {
      item.total_usd = decimalParseToNumber(item.total_usd, 18);
      item.usd = decimalParseToNumber(item.usd, 18);
      item.usdid = new Decimal(item.total_usd).sub(new Decimal(item.usd));
    });
    recordList.value = [...recordList.value, ...data];
    params.start = recordList.value.length;
    // 数据全部加载完成
    if (recordList.value.length >= total) {
      finished.value = true;
    }
  } else {
    loading.value = false;
    finished.value = true;
  }
}

const changeFastCasting = (item: any) => {
  fastCastingList.value.forEach(item => {
    item.active = false;
  });
  item.active = true;
  info.Amount = item.value;
  changeAmount(info.Amount);
}

// const getContract = async () => {
//   const { code, data } = await getSystemConfig();
//   if (!code) {
//     store.contractInfo.FTDAddress = '0x653062e37D7A52d465A8570a5daA46cA4e0Bd3d9'
//     store.contractInfo.BLCAddress = '0x5343b4586a3f2a3365df92Ee705c3BF446C54668'
//     data.map((item: { name: any; address: string; }) => {
//       switch (item.name) {
//         case "FTD":
//           store.contractInfo.FTDAddress = item.address;
//           break;
//         case "BLC":
//           store.contractInfo.BLCAddress = item.address;
//           break;
//         case "Deposit":
//           store.contractInfo.DepositAddress = item.address;
//           break;
//         default:
//           break;
//       }
//     });
//   }
// };


const getContract = async () => {
  // store.contractInfo.PayTokenAddress = await getPayTokenAddress('0');
  // store.contractInfo.PayTokenAddress2 = await getPayTokenAddress('1');
  // store.contractInfo.BLCAddress = await getBLCAddress();
}

const init = async () => {
  try {
    if (!store.account) {
      return;  // 如果钱包未连接，直接返回
    }
    showLoadingToast({
      message: i18n.global.t('loading'),
      forbidClick: true,
      duration: 0,
      wordBreak: 'break-word',
    })
    changePayType(1);
    await getContract();
    await getBalance();
    // getDonorInfo()

  } catch (error) {
    console.error('初始化错误:', error);
  } finally {
    closeToastLoading();
  }
};


const currrentPayTokenIndex = ref(2) // 当前的索引列表的index


const toAddress = ref('');
const getBalance = async () => {
  toAddress.value = await getContractAddress('DIDPool');
  console.log(toAddress.value, 'toAddress.value')

  store.contractInfo.USDID = await getContractAddress('USDID');
  store.contractInfo.USDT = await getContractAddress('USDT');
  info.balanceUSDID = await getTokenBalance(
    store.contractInfo.USDID,

    store.account,
    18
  );
  info.allowbalanceUSDID = await getTokenAllowBalance(
    store.contractInfo.USDID,
    store.account,
    18,
    toAddress.value
  );
  info.balanceUSDT = await getTokenBalance(
    store.contractInfo.USDT,
    store.account,
    18
  );
  info.allowbalanceUSDT = await getTokenAllowBalance(
    store.contractInfo.USDT,
    store.account,
    18,
    toAddress.value
  );
  console.log(info.balanceUSDID, info.allowbalanceUSDID, info.balanceUSDT, info.allowbalanceUSDT, 'info.info.balanceUSDID')
  checkBalance();
};
const balanceTips = ref('');
const checkBalance = () => {
  // 重置余额提示
  balanceTips.value = '';

  // 如果金额为0或空，不显示余额不足提示，但需要检查授权状态
  if (Number(info.Amount) <= 0) {
    // 清空授权相关状态
    info.isApprove = false;
    isBalance.value = false;
    approvalText.value = t("AuthorizationTo");
    return;
  }

  // 重置余额状态为true，然后检查具体余额
  isBalance.value = true;

  // 检查余额是否充足
  if (payType.value === 2 && new Decimal(info.balanceUSDID).lessThan(info.USDID)) {
    balanceTips.value = t('insufficient_balance_current_USDID');
    isBalance.value = false;
    return;
  }

  if (payType.value === 1 && new Decimal(info.balanceUSDT).lessThan(info.Amount)) {
    balanceTips.value = t('insufficient_balance_current_USDT');
    isBalance.value = false;
    return;
  }

  if (payType.value === 1) {
    // 支付方式1：只检查USDT授权
    if (new Decimal(info.allowbalanceUSDT).lessThan(info.allUSDT)) {
      info.isApprove = true;
      approvalText.value = `USDT ${t("AuthorizationTo")}`;
    } else {
      info.isApprove = false;
      approvalText.value = t("AuthorizationTo");
    }
  } else if (payType.value === 2) {
    console.log(info.allowbalanceUSDT, info.USDT, info.allowbalanceUSDID, info.USDID, 'info.allowbalanceUSDT, info.USDT, info.allowbalanceUSDID, info.USDID')
    // 支付方式2：先检查USDT授权，再检查USDID授权
    if (new Decimal(info.allowbalanceUSDT).lessThan(info.USDT)) {
      info.isApprove = true;
      approvalText.value = `USDT ${t("AuthorizationTo")}`;
    } else if (new Decimal(info.allowbalanceUSDID).lessThan(info.USDID)) {
      info.isApprove = true;
      approvalText.value = `USDID ${t("AuthorizationTo")}`;
    } else {
      info.isApprove = false;
      approvalText.value = t("AuthorizationTo");
    }
  } else {
    info.isApprove = false;
    approvalText.value = t("AuthorizationTo");
  }

  if ((payType.value === 1 && new Decimal(info.allowbalanceUSDT).greaterThanOrEqualTo(info.allUSDT)) || (payType.value === 2 && new Decimal(info.allowbalanceUSDT).greaterThanOrEqualTo(info.USDT) && new Decimal(info.allowbalanceUSDID).greaterThanOrEqualTo(info.USDID))) {
    info.isApprove = false;
  }
}

const getBLCValue = async () => {
  info.Amount = vailNum(info.Amount);
  if (!Number(info.Amount)) {
    info.allUSDT = '0';
    info.USDID = '0';
    info.USDT = '0';
    balanceTips.value = '';
    return;
  }
};

const approvalAction = async () => {
  console.log(info.balanceUSDT, info.balanceUSDID, 'info.balanceUSDT, info.balanceUSDID')
  if (approvalText.value.includes('USDT') && !new Decimal(info.balanceUSDT).greaterThanOrEqualTo(info.balanceUSDT)) {
    showToastTip("fail", t("InsufficientUSDTbalance"));
    return;
  }
  console.log(info.balanceUSDID, info.USDID, 'info.balanceUSDID, info.USDID')
  if (approvalText.value.includes('USDID') && !new Decimal(info.balanceUSDID).greaterThanOrEqualTo(info.USDID)) {
    showToastTip("fail", t("InsufficientUSDIDbalance"));
    return;
  }
  console.log(info.allowbalanceUSDT, info.USDT, info.allowbalanceUSDID, info.USDID, 'info.allowbalanceUSDT, info.USDT, info.allowbalanceUSDID, info.USDID')
  console.log(info.isApprove, 'info.isApprove')
  if (!info.isApprove) { return };
  showLoadingToast({
    message: t("Authorization"),
    forbidClick: true,
    duration: 0,
    wordBreak: 'break-word',
  });

  let tempAddress = '';
  let tempAmount = '0';
  if (approvalText.value.includes('USDT')) {
    tempAddress = store.contractInfo.USDT;
    tempAmount = payType.value === 1 ? info.allUSDT : info.USDT;
  }
  if (approvalText.value.includes('USDID')) {
    tempAddress = store.contractInfo.USDID;
    tempAmount = info.USDID;
  }

  console.log(tempAddress, tempAmount, 'tempAddress, tempAmount')
  await approval(
    tempAddress,
    store.account,
    toAddress.value,
    tempAmount,
    18,
    () => {
      showToastTip("success", t("Authorizationsuccessful"));
      if (approvalText.value.includes('USDT')) {
        info.allowbalanceUSDT = payType.value === 1 ? info.allUSDT : info.USDT;
      } else if (approvalText.value.includes('USDID')) {
        info.allowbalanceUSDID = info.USDID;
      }
      checkBalance();
    },
    () => {
      showToastTip("fail", t("AuthorizationFail"));
    }
  );
  setTimeout(() => {
    closeToast();
  }, 2000);
}

const toBuy = async () => {
  try {
    showLoadingToast({
      message: t("loading"),
      forbidClick: true,
      duration: 0,
      wordBreak: "break-word",
    });
    const buyParams = {
      usdt: decimalParseToBigNumber(info.Amount, 18).toString(),
      usdid: decimalParseToBigNumber(info.USDID, 18).toString(),
      trx_id: '',
    }
    const hash = await buyPower({
      usdt: decimalParseToBigNumber(info.Amount, 18).toString(),
      // poolId: store.userInfo.user_data.pool_id,
      poolId: 1,
      type: payType.value
    });
    buyParams.trx_id = hash;
    const { code } = await buyDIDPower(buyParams);
    if (!code) {
      showToastTip("success", '操作成功');
      checkBalance();
      setTimeout(() => {
        params.start = 0;
        getPowerListData();
        getBalance();
      }, 3000);
    }
  } catch (error) {
    showToastTip("fail", '操作失败');
    console.log(error)
    setTimeout(() => {
      closeToast();
    }, 2000);
  }
};


const reset = () => {
  info.Amount = "";
  info.USDID = "0";
  info.blcNums = "0";
  info.isSatisfy = false;
};
const text = ref("");

const changeConfirmText = () => {
  if (!new Decimal(info.allowbalanceUSDT).greaterThanOrEqualTo(info.blcNums)) {
    confirmText.value = t("AuthorizationTo");
  } else {
    confirmText.value = t("Stake");
  }
};

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

const changeAmount = (number: string) => {
  if (Number(info.Amount) <= 0) {
    info.allUSDT = '';
    info.USDID = '';
    info.USDT = '';
    checkBalance();
    return;
  }


  info.allUSDT = info.Amount;
  info.USDID = new Decimal(info.Amount).mul(0.3).toString();
  info.USDT = new Decimal(info.Amount).mul(0.7).toString();
  checkBalance();
}

const changePayType = (type: number) => {
  payType.value = type;
  currrentPayTokenIndex.value = type - 1;
  checkBalance();
}

const changeTab = (item: any) => {
  tabList.value.forEach(item => {
    item.active = false;
  });
  item.active = true;
  params.start = 0;
  finished.value = false;
  recordList.value = [];
  const type = tabList.value[0].active ? 1 : 2;
  getPowerListData(type);
}

const handleButtonClick = () => {
  if (info.isApprove) {
    approvalAction();
  } else {
    toBuy();
  }
}

const handleActivate = async () => {
  if (!info.exchangeCode) {
    showToastTip("fail", '请输入兑换码');
    return;
  }
  const { code } = await exchange({
    exchange_code: info.exchangeCode
  });
  if (!code) {
    showToastTip("success", '操作成功');
    setTimeout(() => {
      params.start = 0;
      getPowerListData(2);
      getBalance();
    }, 3000);
  } else {
    showToastTip("fail", '操作失败');
  }
  console.log('handleActivate')
}

</script>

<style scoped lang="scss">
:deep(.van-cell) {
  &::after {
    border: none !important;
  }
}

.text-white {
  color: #fff !important;
}

.title {
  display: flex;
  align-items: center;
}

.tab-box {
  display: flex;
  align-items: center;
  margin-bottom: 1.63rem;

  .tab-item {
    width: 50%;
    text-align: center;
    font-size: 1rem;
    line-height: 1.13rem;
    border-right: 1px solid #2C3436;
    color: #fff;

    .tab-item-text {
      width: 100%;
      text-align: center;

      &.active {
        color: #1DCC89;
        width: fit-content;
        margin: 0 auto;
        position: relative;
        font-size: 1rem;
        line-height: 1.13rem;

        &::after {
          content: '';
          position: absolute;
          bottom: -12px;
          left: 0;
          right: 0;
          height: .19rem;
          background-color: #1DCC89;
          width: 100%;
          margin: 0 auto;
        }
      }
    }

  }
}

.casting_box {
  background-color: #272830;
  border-radius: 0.38rem;
  margin: 1.88rem .94rem;
  padding: 1.25rem .88rem;

  .error_message {
    font-size: 0.75rem;
    color: #777777;
    line-height: 1.06rem;
    margin-top: 0.38rem;
  }

  .casting_title {
    font-size: 1rem;
    color: #fff;
    margin-bottom: 0.81rem;
  }

  .ftd-num-field {
    background-color: #1D1E24;
    border-radius: 0.38rem;
    border: 1px solid #34353E;
    padding: 0.63rem 1rem;
  }

  .SYS {
    font-size: 1rem;
    color: #999999;
  }

  .fast_casting_title {
    font-size: 0.88rem;
    color: #fff;
    margin-bottom: .6rem;
  }

  .fast_casting_box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    margin-bottom: 0.81rem;

    .fast_casting_item {
      width: 23%;
      font-size: 0.88rem;
      text-align: center;
      height: 2.2rem;
      line-height: 2.2rem;
      border-radius: 0.38rem;
      border: 1px solid #34353E;
      text-align: center;
      color: #fff;
      margin-bottom: 0.5rem;

      .fast_casting_item_icon {
        width: 1.06rem;
        height: 1.06rem;
      }

      .fast_casting_item_text {
        font-size: 0.88rem;
        color: #fff;
        font-weight: bold;
      }

      &.active {
        background-color: rgba(29, 204, 137, 0.16);
        border: 1px solid #1DCC89;

        .fast_casting_item_text {
          color: #1DCC89;
        }
      }
    }
  }
}

.hash-box {
  display: flex;
  align-items: center;

  .hash-text {
    margin: 0 .2rem;
  }

  .copy-icon {
    width: .44rem;
    height: .44rem;
    margin-left: .2rem;
  }
}

.money-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #fff;
  font-size: .88rem;
  line-height: 1.25rem;
  margin-bottom: .5rem;

  .status-text {
    font-size: .75rem;
  }

  .status-text {
    font-size: .75rem;
    color: #828592;
    line-height: 1rem;
    margin-left: .2rem;
  }
}

.default-box {
  padding: 0 .88rem;

  .record-title {
    position: relative;
    font-size: 1rem;
    color: #fff;
    line-height: 1.38rem;
    margin-bottom: .5rem;
    padding-left: .58rem;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 2px;
      width: .25rem;
      height: 1.06rem;
      background-color: #1DCC89;
    }
  }

  .no-record {
    display: flex;
    flex-direction: column;
    align-items: center;

    .empty-img {
      margin-top: 4.82rem;
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
}

.activate_box {
  background-color: #272830;
  border-radius: 0.38rem;
  margin: 1.88rem .94rem;
  padding: 1rem .88rem;

  .activate_title {
    font-size: 1rem;
    color: #fff;
    margin-bottom: 1.19rem;
  }

  .activate_btn {
    width: 100%;
    height: 2.75rem;
    background-color: #1DCC89;
    border-radius: 0.25rem;
    color: #1E2741;
    font-size: .88rem;
    line-height: 1.19rem;
    border: none;
    margin-top: 1.19rem;
  }
}




.record-item {
  padding: 0.88rem 0;
  border-bottom: 1px solid #282931;
  font-size: 0.75rem;
  color: #828592;
}

.time-box {
  font-size: .75rem;
  color: #828592;
  line-height: 1.06rem;
  margin-top: .5rem;
}

.balance_tip {
  font-size: .75rem;
  color: #CE1B1B;
  line-height: 1rem;
  margin-top: .5rem;
}

:deep(.van-dialog) {
  top: 50%;
  max-height: 90vh;
  overflow-y: scroll;
}

.mt-1 {
  margin-top: 1rem;
}

.mr-1 {
  margin-right: .2rem;
}

.balance_box_title {
  font-size: 0.75rem;
  color: #84889C;
  margin-bottom: 0.5rem;
}

.balance_box {

  font-size: .75rem;
  line-height: 1rem;
  width: 100%;
  border: 1px solid #2C3436;
  border-radius: .5rem;
  padding: .31rem 0;

  .amount_item {
    padding: 0 .5rem .31rem;
    display: flex;
    align-items: center;
    width: 100%;
    border-bottom: 1px solid #2C3436;
    font-size: .75rem;
    margin-bottom: .31rem;
    color: #7C7C7C;

    i {
      color: #fff;
      font-size: .75rem;
      line-height: 1rem;
    }

    img {
      width: 1.38rem;
      height: 1.38rem;
    }
  }

  .item-info {
    padding: 0rem .5rem 0;
    display: flex;
    align-items: center;
  }

  p {
    display: flex;
    align-items: center;

    span {
      color: #999999;
      margin-left: .2rem;
    }

    margin-right: 20%;

    &:nth-child(2n) {
      margin-right: 0;
    }

  }

  img {
    width: 1.38rem;
    height: 1.38rem;
    margin-right: .2rem;
  }

  .fc {
    img {
      width: 1rem;
      height: 1rem;
    }
  }
}

.node_left {
  font-size: .75rem;
  line-height: 1rem;
  color: #999999;
  margin: .38rem 0 .88rem;

  span {
    color: #fff;
  }
}

.pledge-container {

  .line {
    width: 100%;
    margin: .3rem 0;
    background-color: #2C3436;
    height: 1px;
  }

  .bal_box {
    color: #999999 !important;
    font-size: .75rem;
    line-height: 1rem;
    padding: .5rem .87rem;

    span {
      &:last-child {
        color: #fff;
      }
    }
  }

  .select_box {
    position: relative;
    width: 100%;
    box-sizing: border-box;
    margin-bottom: 0.96rem;
    margin-top: 0.04rem;

    .con_text {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 2.8rem;
      background-color: #191b1e;
      line-height: 2.8rem;
      border: 1px solid #292c2f;
      color: #fff;
      padding: 0 1.09rem;
      border-radius: 0.5rem;
      font-size: 0.88rem;

      img {
        width: 0.69rem;
        height: 0.44rem;
      }
    }

    .option_box {
      position: absolute;
      width: 91.8%;
      border: 1px solid #292c2f;
      z-index: 99;
      top: 39px;
      background-color: #191b1e;
      padding: 0.1rem 0.5rem 0 0.9rem;
      border-top: none;
      padding-top: 0.6rem;
      font-size: 0.88rem;
      margin-top: -5px;

      li {
        margin-bottom: 0.87rem;
      }
    }
  }

  .tabs {
    .apr {
      color: #1dd08b;
      font-size: 1rem;
      padding-left: 1.4rem;
      margin-bottom: 0.56rem;
    }

    .white {
      color: #fff;
    }

    ul {
      padding: 0.1rem 6.5rem 0 3.32rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      border-bottom: 1px solid #2b2d31;
    }

    .active {
      font-size: 1rem;
      color: #1dd08b;
      border-bottom: 1px solid #1dd08b;
      margin-bottom: -2px;
    }
  }

  /* 弹窗内容 */
  .header {
    // text-align: center;
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

  .plr_88 {
    padding-left: .88rem !important;
    padding-right: .88rem !important;
  }

  .con_box {
    position: relative;
    width: 100%;
    border: 1px solid #212225;
    border-radius: 0.38rem;
    font-size: 1.5rem;
    line-height: 1.81rem;

    .card_top {
      border-bottom: 1px solid #212225;
      // padding: 8px;
    }

    .flag_img {
      position: absolute;
      width: 1.5rem;
      height: 1.5rem;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .top {
      border-bottom: none !important;
    }
  }

  .price_box {
    font-size: 0.75rem;
    color: #B2B2B2;
    margin: 0.96rem 0 0;

    .price_name {
      display: inline-block;
      min-width: 46px;
      text-align: left;
      padding-left: .75rem;
    }

    .price_num {
      color: #B2B2B2;
      // font-weight: 700;
    }
  }

  /* 底部按钮 */
  .footer-box {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 1rem;

    .btn-item {
      width: 100%;
      height: 2.5rem;
      font-weight: bold;
      font-size: 0.88rem;
      line-height: 1.19rem;
      border-radius: 0.25rem;
      border: none;
      color: #1E2741;
      background-color: #1DCC89;
      padding-left: 0;
      padding-right: 0;
    }

    .dis {
      color: #7C7C7C;
      border: none;
      background-color: #202020;
    }
  }


  .field-box {
    background-color: #1D1E24;
    border-radius: 0.38rem;
    border: 1px solid #34353E;
    padding: 0.63rem 1rem;
  }
}

.pay_title {
  font-size: 0.88rem;
  margin: 5px 0 3px;
  color: #7C7C7C;
}

.pay_box {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  margin: 0 0 8px;

  .pay_item {
    width: 47%;
    border: 1px solid #2C3436;
    border-radius: 0.5rem;
    padding: .5rem;
    font-size: 0.88rem;
    line-height: 1.1;
    color: #fff;
    display: flex;
    align-items: center;

    &.pay_item_active {
      border: 1px solid #1DCC89;
    }

    // background-color: #191b1e;
    .radio {
      display: inline-block;
      width: .9rem;
      height: .9rem;
      border-radius: 50%;
      border: 1px solid #525252;
      margin-right: 10px;
      flex-shrink: 0;

      &.radio_active {
        padding: 2px;
        border: 1px solid #1DCC89;
        position: relative;

        .radio_icon {
          display: inline-block;
          width: .5rem;
          height: .5rem;
          border-radius: 50%;
          background-color: #1DCC89;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      }
    }
  }
}
</style>

<style lang="scss">
.ftd-num-field {
  .van-field__control {
    font-weight: bold;
    font-size: 1.31rem;
    color: #fff;
    line-height: 1.38rem;
    font-family: 'F-MontserratBold';
    font-weight: bold;
    font-style: normal;
    font-display: swap;

    &::placeholder {
      font-weight: 400;
      color: #535864;
      font-size: 16px;
    }
  }
}

.van-field__control:disabled {
  color: #fff !important;
  -webkit-text-fill-color: #fff !important;
}

.SYS {
  font-size: 1rem;
  color: #999999;
}
</style>