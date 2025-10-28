<template>
  <div class="pledge-container" v-if="show">
    <van-dialog v-model:show="show" class="dialog-box" :z-index="100" :closeOnClickOverlay="true"
      @close="handleClickCancel">
      <!-- 弹窗内容 -->
      <template #default>
        <div class="header">
          <div class="title-line d-flex justify-content-between align-items-center">
            <div class="title">
              <span class="left-icon"></span>
              <span>{{ t("node_subscription") }}</span>
            </div>
            <img class="close-img" src="@/assets/imgs/identitycasting/close.png" alt="" @click="handleClickCancel" />
          </div>
        </div>
        <div class="con_box">
          <div class="card_con">
            <div class="card_top F-Bold">
              <van-field v-model="info.BLC" center clearable class="ftd-num-field F-Bold field-box" type="number"
                :placeholder="t('PleaseEnter')">
                <template #button>
                  <span class="SYS">BLC</span>
                </template>
              </van-field>
            </div>
            <div class="bal_box">
              = <i>{{ info.blcNums }} BLC</i> <i v-if="payType === 1">+ {{ info.ftdNums }} FTD</i> <i
                v-if="payType === 2">+
                {{
                  info.fcNums }} FC</i>
            </div>
          </div>
        </div>
        <!-- <div class="pay_title">
          {{ t("PaymentToken") }}
        </div> -->
        <div class="pay_box">
          <!-- <div :class="['pay_item']" @click="changePayType(1)">
            <span :class="['radio', payType === 1 ? 'radio_active' : '']">
              <i class="radio_icon"></i>
            </span> BLC + FTD
          </div> -->
          <!-- <div :class="['pay_item']" @click="changePayType(3)">
            <span :class="['radio', payType === 3 ? 'radio_active' : '']">
              <i class="radio_icon"></i>
            </span> BLC
          </div> -->

          <!-- <div :class="['pay_item']" @click="changePayType(2)">
            <span :class="['radio', payType === 2 ? 'radio_active' : '']">
              <i class="radio_icon"></i>
            </span> BLC + FC
          </div> -->

        </div>

        <div class="balance_box">
          <p class="amount_item" v-if="store.isDonor">
            <img src="@/assets/imgs/identitycasting/amout_icon.png" alt="">
            <span>{{ t('DonorAmount') }}: <i class="F-Bold text-white">{{ donorInfo.remainingQuota }} </i> BLC</span>
          </p>

          <div class="item-info">
            <p>
              <img src="@/assets/imgs/identitycasting/blc.png" alt=""> {{ formatDecimal(info.balanceBLC, 2) }} <span>BLC</span>
            </p>
            <p v-if="payType === 1">
              <img src="@/assets/imgs/identitycasting/ftd.png" alt=""> {{ formatDecimal(info.balanceFTD, 2) }} <span>FTD</span>
            </p>
            <p v-if="payType === 2" class="fc">
              <img src="@/assets/imgs/identitycasting/fc.png" alt=""> {{ formatDecimal(info.balanceFC, 2) }} <span>FC</span>
            </p>
          </div>
        </div>


        <div v-if="!isBalance" class="balance_tip">
          <p>
            {{ balanceTips }}
          </p>
        </div>
      </template>
      <!-- 底部按钮 -->
      <template #footer>
        <div class="footer-box">
          <van-button :class="['btn-item F-Bold', info.isApprove && Number(info.BLC) ? 'confirm' : 'dis']"
            :disabled="!info.isApprove || !Number(info.BLC)" @click="approvalAction">{{ approvalText }}</van-button>
          <van-button :class="['btn-item F-Bold', !info.isApprove ? 'confirm' : 'dis']" :disabled="info.isApprove"
            @click="toBuy">{{ t("confirm") }}</van-button>
        </div>
      </template>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import {
  showLoadingToast,
  closeToast,
  showToast,
} from "vant";
import { useStore } from "../../../store/store";
import { vailNum, showLoading, closeToastLoading, formatDecimal, clearZoo } from "@/utils";
import success from "@/assets/imgs/identitycasting/success.png";
import fail from "@/assets/imgs/identitycasting/fail.png";
import {
  getTokenBalance,
  getTokenAllowBalance,
  approval,
  decimalParseToBigNumber,
  decimalParseToNumber,
  getPayTokenAddress,
  getBLCAddress,
  getContractAddress,
  buyPower,
  getPayTokenPrice,
  getPayRatioListLength,
  getPayRatios
} from "@/api/mapcontract";
import { getSystemConfig, deposit, withdraw, buyNode, getNodeData, getUserData, businessDetail } from "@/api";
import Decimal from "decimal.js";
import { useI18n } from "vue-i18n";
import i18n from '@/plugin/i18n'
const { t } = useI18n();

const show = defineModel<boolean>("visible");
const emit = defineEmits(["pledgeFinish"]);
const props = defineProps({
  pledgeInfo: {
    type: Object,
    default: () => {
      return {};
    },
  },
  isAgainPledge: {
    type: Boolean,
    default: () => {
      return false;
    },
  },
  DPINBalance: {
    type: String,
    default: () => {
      return '--';
    },
  }
});

const approvalText = ref(t('authorize'));
const confirmText = ref(t('confirm'));
const isBalance = ref(true);
const info = reactive({
  BLC: "",
  isSatisfy: false,
  isApprove: true,
  DEPINPrice: "",
  totalValue: "",
  DPINScale: "",
  BLC_U: "0",
  DPEN_U: "0",
  aeLeast_DPIN: "--",
  balanceFTD: "0",
  allowBalanceFTD: "",
  balanceBLC: '',
  allowBalanceBLC: '',
  balanceFC: '0',
  allowBalanceFC: '',
  alDespUSDT: '',
  ftdNums: '0',
  fcNums: '0',
  blcNums: '0',
  remainingNodes: 0,
  payTokenPrice: '',
  is_buy: false,
});
const payType = ref(3);
const isFlexible = ref(false);
onMounted(async () => {
  confirmText.value = t("Confirm");
  approvalText.value = t("AuthorizationTo");
  // getNodeInfo();
  // const isAgainPledgeBaseAmount = utils.formatUnits(props.pledgeInfo.blc, 18)
  // console.log(isAgainPledgeBaseAmount)
});

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

const getNodeInfo = async () => {
  const { code, data } = await getNodeData();
  if (!code) {
    console.log(data);
    // data.node_surplus = -1;
    info.remainingNodes = data.node_surplus <= 0 ? 0 : data.node_surplus;
    // info.remainingNodes = 0;
    info.is_buy = data.is_buy;
  }
}

const getContract = async () => {
  store.contractInfo.PayTokenAddress = await getPayTokenAddress('0');
  store.contractInfo.PayTokenAddress2 = await getPayTokenAddress('1');
  store.contractInfo.BLCAddress = await getBLCAddress();
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
    getPayRatioList();
    // changePayType();
    await getContract();
    await getBalance();
    getDonorInfo()

  } catch (error) {
    console.error('初始化错误:', error);
  } finally {
    closeToastLoading();
  }
};


const payTokenRadio = ref<any[][]>([]); // 二维数组
const payTokenList = ref<number[]>([]); // 索引列表
const payTokenPrice = ref<any>([]) // 代币的价格数组
const currrentPayTokenIndex = ref(2) // 当前的索引列表的index
const getPayRatioList = async () => {
  const dataList = await getPayRatioListLength();
  for (let index = 0; index < dataList; index++) {
    payTokenList.value.push(index);
    // 初始化子数组，防止 undefined
    payTokenRadio.value[index] = [];
    const resVal = await getPayRatios(index);
    resVal.forEach((item: any) => {
      const val = item.toString();
      payTokenRadio.value[index].push(val);
    });
    const ratios = payTokenRadio.value[index].map(v => {
      const total = payTokenRadio.value[index].reduce((sum, val) => sum + Number(val), 0);
      return (Number(v) / total) // 保留两位小数
    });
    payTokenRadio.value[index] = ratios;
  }
  // payTokenRadio.value[0] = 1;

  // payTokenRadio.value = [[0.9,0.1,0],[0.5,0,0.5]]

  console.log(payTokenRadio.value, 'payTokenRadio.value')
  const resArr = await getPayTokenPrice();
  resArr.forEach((item: any) => {
    payTokenPrice.value.push(clearZoo(decimalParseToNumber(item.toString(), 18)))
  })
  payTokenPrice.value[0] = 1; //固定为1
  console.log(payTokenPrice.value, 'payTokenPrice.value')
  // payTokenPrice.value = ['0.39']
  // blcRadio.value = payTokenRadio.value[currrentPayTokenIndex.value][0] || 0;
  // ftdRadio.value = payTokenRadio.value[currrentPayTokenIndex.value][1] || 0;
  // fcRadio.value =  payTokenRadio.value[currrentPayTokenIndex.value][1] || 0;
  await getPayTokenPr();
};

const donorInfo = reactive({
  remainingQuota: '0',
  isInBalance: false,
})

const getDonorInfo = async () => {
  const { code, data } = await businessDetail()
  if (!code && data) {
    const quota = decimalParseToNumber(data.quota, 18)
    const use_quota = decimalParseToNumber(data.use_quota, 18)
    donorInfo.remainingQuota = formatDecimal((Number(quota) - Number(use_quota)).toString(), 4)
    Number(donorInfo.remainingQuota) > 0 ? Number(donorInfo.remainingQuota) : 0;
  }
  {
    const { code, data } = await getUserData();
    if (!code) {
      store.today_buy = data.today_buy;
      store.buy_max_node = decimalParseToNumber(data.buy_max_node, 18);
      store.isDonor = data.is_business;
    }
  }
}

const blcRadio = ref(0)
const ftdRadio = ref(0);
const fcRadio = ref(0);
const getPayTokenPr = async () => {
  if (!Number(info.BLC)) { return }

  blcRadio.value = payTokenRadio.value[currrentPayTokenIndex.value][0] || 0;
  ftdRadio.value = payTokenRadio.value[currrentPayTokenIndex.value][1] || 0;
  fcRadio.value = payTokenRadio.value[currrentPayTokenIndex.value][2] || 0;

  console.log(blcRadio.value, ftdRadio.value, fcRadio.value, 'blcRadio.value, ftdRadio.value, fcRadio.value')

  const ftdNumsValue = formatDecimal(new Decimal(info.BLC).mul(ftdRadio.value).toString(), 6, false);
  const fcNumsValue = formatDecimal(new Decimal(info.BLC).mul(fcRadio.value).toString(), 6, false);
  info.blcNums = formatDecimal(new Decimal(info.BLC).mul(blcRadio.value).toString(), 6, false);
  info.ftdNums = new Decimal(ftdNumsValue).div(payTokenPrice.value[0]).toString();
  if (payTokenPrice.value[1]) {
    info.fcNums = formatDecimal(new Decimal(fcNumsValue).div(payTokenPrice.value[1]).toString(), 4, false);
  }
  info.ftdNums = formatDecimal((new Decimal(info.ftdNums).add(0.01)).toString(), 2, false);
  if (payType.value === 1) {
    info.fcNums = '0';
  }
  if (payType.value === 2) {
    info.ftdNums = '0';
  }
  checkBalance();
}



const toAddress = ref('');
const getBalance = async () => {
  toAddress.value = await getContractAddress('Force');
  info.balanceBLC = await getTokenBalance(
    store.contractInfo.BLCAddress,
    store.account,
    18
  );
  info.allowBalanceBLC = await getTokenAllowBalance(
    store.contractInfo.BLCAddress,
    store.account,
    18,
    toAddress.value
  );

  info.balanceFTD = await getTokenBalance(
    store.contractInfo.PayTokenAddress,
    store.account,
    18
  );
  info.allowBalanceFTD = await getTokenAllowBalance(
    store.contractInfo.PayTokenAddress,
    store.account,
    18,
    toAddress.value
  );

  info.balanceFC = await getTokenBalance(
    store.contractInfo.PayTokenAddress2,
    store.account,
    18
  );
  info.allowBalanceFC = await getTokenAllowBalance(
    store.contractInfo.PayTokenAddress2,
    store.account,
    18,
    toAddress.value
  );
  checkBalance();
};
const balanceTips = ref('');
const checkBalance = () => {
  if (Number(info.BLC) <= 0) { return }
  console.log(info, 'info.allowBalanceFC,info.fcNums')
  if (new Decimal(info.allowBalanceFC).lessThan(info.fcNums)) {
    info.isApprove = true;
    approvalText.value = `FC ${t("AuthorizationTo")}`;
  }

  if (new Decimal(info.allowBalanceFTD).lessThan(info.ftdNums)) {
    info.isApprove = true;
    approvalText.value = `FTD ${t("AuthorizationTo")}`;
  }

  if (new Decimal(info.allowBalanceBLC).lessThan(info.blcNums)) {
    info.isApprove = true;
    approvalText.value = `BLC ${t("AuthorizationTo")}`;
  }

  if (new Decimal(info.balanceFC).lessThan(info.fcNums)) {
    balanceTips.value = t('insufficient_balance_current_fc');
  }

  if (new Decimal(info.balanceFTD).lessThan(info.ftdNums)) {
    balanceTips.value = t('insufficient_balance_current_ftd');
  }

  if (new Decimal(info.balanceBLC).lessThan(info.blcNums)) {
    balanceTips.value = t('insufficient_balance_current_blc');
  }

  if (new Decimal(info.balanceFTD).lessThan(info.ftdNums) || new Decimal(info.balanceBLC).lessThan(info.blcNums) || new Decimal(info.balanceFC).lessThan(info.fcNums)) {
    isBalance.value = false;
  } else {
    isBalance.value = true;
  }
  if (new Decimal(info.allowBalanceBLC).greaterThanOrEqualTo(info.blcNums) && new Decimal(info.allowBalanceFTD).greaterThanOrEqualTo(info.ftdNums) && new Decimal(info.allowBalanceFC).greaterThanOrEqualTo(info.fcNums)) {
    info.isApprove = false;
  }
}

const getBLCValue = async () => {
  info.BLC = vailNum(info.BLC);
  if (!Number(info.BLC)) {
    info.ftdNums = '0';
    info.blcNums = '0';
    info.fcNums = '0'
    balanceTips.value = '';
    return;
  }
  getPayTokenPr()
};


watch(() => info.BLC, (newVal) => {
  getBLCValue()
}, { immediate: true, deep: true })

const isCanBuy = ref(true);
const checkIsCanBuy = () => {
  if (Number(info.BLC) < 14 || Number(info.BLC) > 20000) {
      showToastTip("fail", t("subscription_range"));
      isCanBuy.value = false;
      return;
  }
  if (store.isDonor) {
    if (Number(donorInfo.remainingQuota) < Number(info.BLC)) {
      showToastTip("fail", t('DonorAmountNotEnough'));
      isCanBuy.value = false;
      return;
    }
  } else {
    if (store.today_buy) {
      isCanBuy.value = false;
      showToastTip("fail", t("subscribeOnce"));
      return
    }
    if (Number(info.BLC) < Number(store.buy_max_node)) {
      isCanBuy.value = false;
      showToastTip("fail", t("NodeHigher"));
      return
    }
  }
  isCanBuy.value = true;
}

const approvalAction = async () => {
  checkIsCanBuy()
  if (!isCanBuy.value) { return }
  if (approvalText.value.includes('BLC') && !new Decimal(info.balanceBLC).greaterThanOrEqualTo(info.blcNums)) {
    showToastTip("fail", t("InsufficientBLCbalance"));
    return;
  }
  if (approvalText.value.includes('FTD') && !new Decimal(info.balanceFTD).greaterThanOrEqualTo(info.ftdNums)) {
    showToastTip("fail", t("InsufficientFTDbalance"));
    return;
  }
  if (approvalText.value.includes('FC') && !new Decimal(info.balanceFC).greaterThanOrEqualTo(info.fcNums)) {
    showToastTip("fail", t("insufficient_balance_current_fc"));
    return;
  }
  if (!info.isApprove) { return };
  showLoadingToast({
    message: t("Authorization"),
    forbidClick: true,
    duration: 0,
    wordBreak: 'break-word',
  });

  let tempAddress = '';
  let tempAmount = '0';
  if (approvalText.value.includes('BLC')) {
    tempAddress = store.contractInfo.BLCAddress;
    tempAmount = info.blcNums;
  }
  if (approvalText.value.includes('FTD')) {
    tempAddress = store.contractInfo.PayTokenAddress;
    tempAmount = String(Number(info.ftdNums) + 1);
  }

  if (approvalText.value.includes('FC')) {
    tempAddress = store.contractInfo.PayTokenAddress2;
    tempAmount = String(Number(info.fcNums) + 0.0001);
  }
  await approval(
    tempAddress,
    store.account,
    toAddress.value,
    tempAmount,
    18,
    () => {
      showToastTip("success", t("Authorizationsuccessful"));
      if (approvalText.value.includes('FTD')) {
        info.allowBalanceFTD = String(Number(info.ftdNums) + 1);
      } else if (approvalText.value.includes('BLC')) {
        info.allowBalanceBLC = info.blcNums;
      } else {
        info.allowBalanceFC = String(Number(info.fcNums) + 0.001);
      }
      getBLCValue();
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
  checkIsCanBuy()
  if (!isCanBuy.value) { return }
  if (!new Decimal(info.balanceFTD).greaterThanOrEqualTo(info.ftdNums)) {
    showToastTip("fail", t("InsufficientFTDbalance"));
    return;
  }
  if (!new Decimal(info.balanceBLC).greaterThanOrEqualTo(info.blcNums)) {
    showToastTip("fail", t("InsufficientBLCbalance"));
    return;
  }

  try {
    showLoadingToast({
      message: t("loading"),
      forbidClick: true,
      duration: 0,
      wordBreak: "break-word",
    });
    const params = {
      amount: decimalParseToBigNumber(info.BLC, 18).toString(),
      blc: decimalParseToBigNumber(info.blcNums, 18).toString(),
      type: payType.value,
      trx_id: '',
      ftd: payType.value === 1 ? decimalParseToBigNumber(info.ftdNums, 18).toString() : '0',
      ftd_price: payType.value === 1 ? decimalParseToBigNumber(payTokenPrice.value[0], 18).toString() : '0',
      fc: payType.value === 2 ? decimalParseToBigNumber(info.fcNums, 18).toString() : '0',
      fc_price: payType.value === 2 ? decimalParseToBigNumber(payTokenPrice.value[1], 18).toString() : '0',
    }
    const hash = await buyPower({
      address: store.account,
      blcAmount: decimalParseToBigNumber(info.BLC, 18).toString(),
      type: currrentPayTokenIndex.value
    });
    params.trx_id = hash;
    let multiple = 2;
    const { code, data } = await buyNode(params);
    if (!code) {
      showToastTip("success", t("StakeSuccessful"));
      info.is_buy = true;
      multiple = data.multiple;
    }
    if (!code) {
      if (store.isDonor) {
        setTimeout(() => {
          info.is_buy = true;
          emit("pledgeFinish", 2);
          show.value = false;
          handleClickCancel();
        }, 3000);
      } else {
        setTimeout(async () => {
          getBalance();
          const { code, data } = await getUserData();
          if (!code) {
            store.today_buy = data.today_buy;
            store.buy_max_node = decimalParseToNumber(data.buy_max_node, 18);
            store.isDonor = data.is_business;
          }
          emit("pledgeFinish", multiple);
          show.value = false;
          handleClickCancel();
          info.BLC = "";
          info.BLC = "";
          confirmText.value = t("Stake");
          info.isSatisfy = false;
          closeToast();
        }, 3000);
      }
    }


  } catch (error) {
    showToastTip("fail", t("StakeFailed"));
    console.log(error)
    setTimeout(() => {
      closeToast();
    }, 2000);
  }
};


function handleClickCancel() {
  show.value = false;
  // info.BLC = "";
}

const reset = () => {
  info.BLC = "";
  info.ftdNums = "0";
  info.blcNums = "0";
  info.isSatisfy = false;
};
const store = useStore();
const text = ref("");

const changeConfirmText = () => {
  if (!new Decimal(info.allowBalanceBLC).greaterThanOrEqualTo(info.blcNums)) {
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

const changePayType = (type: number) => {
  payType.value = type;
  currrentPayTokenIndex.value = type - 1;
  getPayTokenPr()
}

watch(
  () => show.value,
  async () => {
    if (show.value) {
      confirmText.value = t("Stake");
      info.BLC = "";
      // 等待钱包连接后再初始化
      if (store.account) {
        await init();
      }
    }
  },
  { deep: true, immediate: true }
);

// 监听钱包账户变化
watch(
  () => store.account,
  async (newAccount) => {
    if (show.value && newAccount) {
      await init();
    }
  }
);
</script>

<style scoped lang="scss">
.text-white {
  color: #fff !important;
}

.title {
  display: flex;
  align-items: center;
}

.left-icon {
  display: inline-block;
  width: .31rem;
  height: 1rem;
  margin-right: .44rem;
  background-color: #FF3F3F;
  border-radius: .19rem;
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
    height: 1px;
    margin: .3rem 0;
  }

  :deep(.dialog-box) {
    width: 90%;
    max-width: 370px;
    background-color: #090909;
    border-radius: 0.75rem;
    border: 1px solid #2C3436;
    box-sizing: border-box;
    padding: 1rem .9rem 1.56rem;

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
      margin-bottom: 1rem;
      padding: 0 0 .56rem;
      border-bottom: 1px solid #2C3436;

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
      justify-content: space-between;
      margin-top: 1rem;

      .btn-item {
        width: 47%;
        height: 2.5rem;
        font-weight: bold;
        font-size: 0.8rem;
        line-height: 1.19rem;
        border-radius: 0.25rem;
        border: none;
        color: #fff;
        background-color: #FF3F3F;
        padding-left: 0;
        padding-right: 0;
      }

      .dis {
        color: #7C7C7C;
        border: none;
        background-color: #202020;
      }
    }
  }

  .field-box {
    background-color: #090909;
    border-radius: 0.5rem;
  }

  /* FTD数量输入框 */
  // .ftd-num-field {
  //   ::deep(.van-field__control) {
  //     font-weight: bold;
  //     font-size: 1.31rem;
  //     color: #fff;
  //     line-height: 1.38rem;
  //     font-family: 'F-Bold';

  //     &::placeholder {
  //       font-weight: 400;
  //       color: #535353;
  //       font-size: 14px;
  //     }
  //   }
  // }
}

.pay_title {
  font-size: 0.88rem;
  margin: 5px 0 3px;
  color: #7C7C7C;
}

.pay_box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 0 8px;

  .pay_item {
    width: 47%;
    height: 2rem;
    border: 1px solid #2C3436;
    border-radius: 0.5rem;
    padding: 0 .5rem;
    font-size: 0.88rem;
    line-height: 2rem;
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
      color: #535353;
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