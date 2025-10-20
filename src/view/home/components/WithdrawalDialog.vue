<template>
  <div class="withdrawal-container" v-if="show">
    <van-dialog v-model:show="show" class="dialog-box">
      <!-- 弹窗内容 -->
      <template #default>
        <div class="default-box plr">
          <div class="header">
            <div class="title">
              <span class="left-icon"></span>
              <span>{{ t("withdraw") }}</span>
            </div>
            <img class="close-img" src="@/assets/imgs/home/close.png" alt="" @click="handleClickCancel" />
          </div>
          <div class="withdrawal-box">
            <p>
              <img src="@/assets/imgs/FC.png" alt="">
            </p>
            <p class="balance-title">{{ t("withdrawable_amount") }}</p>
            <p class="balance-amount F-Bold">{{ formatDecimal(info.balance,4) }} FC</p>
          </div>
          <div class="input-box ipt-block">
            <div class="ftd-num-field">
              <p>{{ t("withdraw_amount") }}</p>
              <van-field v-model="text" @input="changeFTD" center  :placeholder="t('enter_withdraw_amount')"
                class="ftd-num-field F-Bold field-box" type="number">
                <template #button>
                  <span class="all-btn" @click="handleClickAll">{{ t("all") }}</span> <img src="@/assets/imgs/fc_flag.png" alt="" class="all-img">
                </template>
              </van-field>
            </div>
            <div class="ecological-box">
              <p :class="[store.lang === 'tw' ? 'ecological-title' : '']">{{ t("ecological_construction") }}</p>
              <div class="ecological-content F-Bold">
                {{ formatDecimal(info.ecological_amount,4) }}
              </div>
            </div>
          </div>
          <div v-if="minWithdrawFlag" class="withdraw-error">
             {{t('withdraw_amount_error')}} {{info.min_withdraw_amount}} FC
          </div>
          <div class="ecological-info F-Bold">
            <p> {{ t("ecological_pool_amount") }} : {{ formatDecimal(info.ecological_pool_amount,4) }} BLC</p>
            <p  @click="show_ecological_pool = true" class="detail">{{ t('details') }} ></p>
          </div>
          <!-- <div class="ecological-info-tip">
            {{ t("ecological_pool_tip") }}
          </div> -->
          <div class="ipt-block">
            <!-- <van-cell-group inset> -->

            <!-- </van-cell-group> -->
          </div>

          <!-- <div class="ipt-block">
            <div class="label F-SemiBold">{{ t('WalletAddress') }}</div>
            <div class="field-box wallet-address-field F-Bold" style="color: #686868">
              {{ store.account }}
            </div>
          </div> -->
        </div>
      </template>

      <!-- 底部按钮 -->
      <template #footer>
        <div class="footer-wrapper plr">
          <div class="handling-fees-line F-SemiBold">
            <p class="get-text">{{ t("amount_received") }}</p>
            <p class="get-amount F-Bold">{{ formatDecimal(info.get_amount,4) }} FC</p>
          </div>
          <div class="footer-box">
            <!-- <van-button class="btn-item cancel-btn F-Bold" @click="handleClickCancel">{{ t('Cancel') }}</van-button> -->
            <van-button :class="['btn-item  F-Bold', isSatisfy ? 'withdrawal-btn' : 'dis']" @click="withdraw"
              :disabled="!isSatisfy">{{ t("withdraw") }}</van-button>
          </div>
        </div>
      </template>
    </van-dialog>
    <ecological-pool-dialog v-model:show="show_ecological_pool" />
  </div>
</template>

<script setup lang="ts">
import { Dialog, Button, Field, showToast } from "vant";
import { useStore } from "../../../store/store";
import { formatDecimal,clearZoo,showToastIcon} from "@/utils";
import { decimalParseToNumber } from "@/api/mapcontract";
import Decimal from "decimal.js";
import { withdrawal,getUserBalance } from "@/api";
import success from "@/assets/imgs/home/success.png";
import EcologicalPoolDialog from './EcologicalPoolDialog.vue';
import { useI18n } from "vue-i18n";
import { ref, onMounted, watch } from "vue";
const { t } = useI18n();
const show_ecological_pool = ref(false);
const show = defineModel<boolean>("visible");

// 监听show的变化，便于调试
watch(show, (newVal) => {
  console.log('WithdrawalDialog visible changed to:', newVal);
}, { immediate: true });

// 监听生态池弹窗的状态变化
watch(show_ecological_pool, (newVal) => {
  console.log('EcologicalPoolDialog visible changed to:', newVal);
}, { immediate: true });

// 显示生态池弹窗
function showEcologicalPool() {
  console.log('尝试显示生态池弹窗');
  // show_ecological_pool.value = true;
}

// 取消
function handleClickCancel() {
  show.value = false;
}
const info = ref({
  balance: '--',
  ecological_amount: '0',
  ecological_pool_amount: '0',
  get_amount: '0',
  min_withdraw_amount: '0',
})
const store = useStore();
const text = ref("");
const isSatisfy = ref(false);
onMounted(() => {
  info.value.balance = store.banlance;
  text.value = '';
  getBalance();
  
  // 测试：自动打开生态池弹窗
  setTimeout(() => {
    console.log('自动打开生态池弹窗测试');
    showEcologicalPool();
  }, 1000);
})
const minWithdrawFlag = ref(0);
const changeFTD = () => {
  if (!Number(text.value)||!info.value.balance) {
    info.value.ecological_amount = '0';
    info.value.get_amount = '0';
    isSatisfy.value = false;
    return;
  }
  info.value.ecological_amount = (Number(text.value) * 0.1).toString();
  info.value.get_amount = (Number(text.value) - Number(info.value.ecological_amount)).toString();
  if (Number(text.value) <= Number(info.value.balance) && Number(text.value) >= Number(info.value.min_withdraw_amount)) {
    isSatisfy.value = true;
  } else {
    isSatisfy.value = false;
  }
  if (Number(text.value)&&(Number(text.value) < Number(info.value.min_withdraw_amount))) {
    minWithdrawFlag.value = 1;
  } else {
    minWithdrawFlag.value = 0;
  }
};

const handleClickAll = () => {
  text.value = clearZoo(store.banlance);
  changeFTD();
}
const emit = defineEmits(['finishWithdraw'])
const withdraw = async () => {
  if (Number(text.value) < Number(info.value.min_withdraw_amount)) {
    showToastIcon(`${t('withdraw_amount_error')} ${info.value.min_withdraw_amount} FC`, 'error')
    return;
  }
  const params = {
    value: Number(text.value) * Math.pow(10, 18),
    address: store.account,
    token_type: "FC",
    chain_type: "BSC",
  };
  const { code, data } = await withdrawal(params);
  if (!code) {
    showToast({
      className: "success-toast-box",
      message: t('WithdrawSuccessful'),
      icon: success,
      overlay: false, // 是否显示背景遮罩层
      forbidClick: false, // 是否禁止点击
      closeOnClick: false, // 是否在点击后关闭
      closeOnClickOverlay: false, //是否在点击遮罩层后关闭
    });
    setTimeout(() => {
      text.value = '';
      info.value.ecological_amount = '0';
      show.value = false;
      isSatisfy.value = false;
      emit('finishWithdraw')
    // getBalance();
    }, 2000)
  }

  
};
const getBalance = async () => {
  const { code, data } = await getUserBalance();
  if (!code) {
    info.value.ecological_pool_amount = (Number(data.cess_value) / 1e18).toString();
    info.value.min_withdraw_amount = decimalParseToNumber(data.min_withdraw_value, 18);
    console.log(info.value.min_withdraw_amount,'  min_withdraw_amount')
  }
};
</script>

<style scoped lang="scss">
.title {
  display: flex;
  align-items: center;
}
.withdraw-error {
  color: #FF3F3F;
  font-size: 0.75rem;
  line-height: 1rem;
  margin-bottom: 0.44rem;
}
.left-icon {
  display: inline-block;
  width: .31rem;
  height: 1rem;
  margin-right: .44rem;
  background-color: #FF3F3F;
  border-radius: .19rem;
}
.plr {
      padding: 0 .63rem;
    }
.withdrawal-container {
  .footer-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #212225;
    padding-top: .81rem;
    .get-text {
      font-size: 0.75rem;
      color: #999999;
    }
    .get-amount {
      font-size: 1.13rem;
      color: #fff;
    }
  }
  .ecological-info {
    font-size: 0.75rem;
    line-height: 1.25rem;
    margin: 0.44rem 0 .81rem;
    display: flex;
    justify-content: space-between;
    .detail {
      color: #D11A1A;
      white-space:nowrap;
      margin-left: 10px;
    }
  }

  .ecological-info-tip {
    font-size: 0.75rem;
    line-height: 1rem;
    margin-bottom: 0.44rem;
    color: #6F6F6F;
    padding: .56rem;
    background-color: #1A1A1A;
    border-radius: 0.5rem;
  }

  .withdrawal-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1.38rem 0 .94rem;
    font-size: 0.88rem;
    color: #B2B2B2;

    img {
      width: 3.13rem;
      height: 3.13rem;
    }

    .balance-amount {
      font-size: 1.68rem;
      color: #fff;
      line-height: 2rem;
    }

    .balance-title {
      line-height: 1.25rem;
      margin-top: 0.5rem;
    }
  }

  :deep(.dialog-box) {
    width: 92%;
    max-width: 370px;
    background: #090909;
    border-radius: 0.75rem;
    border: 0.06rem solid #2C3436;
    box-sizing: border-box;
    padding: 1rem 0rem;
    
    .dis {
      color: #7C7C7C;
      // border: 1px solid #3b3b3b !important;
      background: #202020;
    }

    /* 弹窗内容 */
    .default-box {
      margin-bottom: .69rem;

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #212225;
        padding-bottom: .81rem;
        .close-img {
          width: 1.19rem;
          height: 1.19rem;
        }

        .title-line {
          display: flex;
          align-items: center;
          margin-bottom: 0.44rem;

          .text {
            font-weight: 500;
            font-size: 0.88rem;
            color: #ffffff;
            line-height: 1.13rem;
          }
        }

        .ftd-balance {
          font-weight: bold;
          color: #ffffff;

          .value {
            font-size: 1.88rem;
            line-height: 2.44rem;
            margin-right: 0.13rem;
          }

          .unit {
            font-size: 0.75rem;
            line-height: 1rem;
          }
        }
      }

      .ipt-block {
        margin-bottom: .38rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: .56rem;
        .ecological-box {
          width: 40%;
          p {
            color: #999999;
            font-size: 0.88rem;
            line-height: 1.25rem;
            white-space: nowrap;
            margin-left: -70px;
            margin-bottom: 0.5rem;
            &.ecological-title {
              margin-left: 0;
            }
          }
        }

        .ecological-content {
          width: 100%;
          font-size: 0.88rem;
          color: #fff;
          line-height: 1.13rem;
          height: 2.81rem;
          border-radius: 0.5rem;
          border: 0.06rem solid #212225;
          display: flex;
          align-items: center;
          text-align: left;
          padding-left: 0.5rem;
        }

        &:last-child {
          margin-bottom: 0;
        }

        .label {
          font-weight: 600;
          font-size: 0.88rem;
          color: #7c7c7c;
          line-height: 1.13rem;
          margin-bottom: 0.44rem;
        }

        .field-box {
          background-color: #090909;
          border-radius: 0.5rem;
          border: 0.06rem solid #2C3436;
        }

        /* FTD数量输入框 */
        .ftd-num-field {

          // width: 90%;
          p {
            color: #999999;
            font-size: 0.88rem;
            line-height: 1.25rem;
            margin-bottom: 0.5rem;
          }

          .van-field__control {
            font-weight: bold;
            font-size: .88rem;
            color: #fff;
            line-height: 1.31rem;

            &::placeholder {
              font-weight: 400;
              color: #686868;
            }
          }

          .van-field__button {
            display: flex;
            align-items: center;
          }

          .all-btn {
            font-size: 0.88rem;
            color: #D11A1A;
            line-height: 1.25rem;
          }

          .all-img {
            width: 1.88rem;
            height: 1rem;
          }
        }

        /* 钱包地址输入框 */
        .wallet-address-field {
          word-break: break-word;
          font-weight: 600;
          font-size: 0.88rem;
          color: #686868;
          line-height: 1.25rem;
          padding: 0.3rem;
          box-sizing: border-box;
        }
      }

      .handling-fees-line {
        font-weight: 600;
        font-size: 0.75rem;
        color: #999999;
        line-height: 1.06rem;

        .value {
          color: #FFF;
        }
      }
    }

    /* 底部按钮 */
    .footer-box {
      display: flex;
      align-items: center;
      justify-content: center;

      .btn-item {
        // width: 5.69rem;
        height: 2.5rem;
        font-weight: bold;
        font-size: 0.88rem;
        line-height: 1.19rem;
        border-radius: 0.5rem;
        border: none;
      }

      .cancel-btn {
        background: #2f3339;
        color: #aeaeae;
      }

      .withdrawal-btn {
        background: #D11A1A;
        color: #ffffff;
      }
    }
  }
}
</style>
