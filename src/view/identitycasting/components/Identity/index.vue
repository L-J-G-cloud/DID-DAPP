<template>
  <div class="content-box">
    <div class="title-container">
      <div class="title F-Bold">
        身份铸造
      </div>
      <img src="@/assets/imgs/identitycasting/tips.png" alt="" class="tips-icon" @click="openTipsDialog">
    </div>
    <div class="info-box">
      <div class="left">
        <img src="@/assets/imgs/identitycasting/peo_logo.png" alt="" class="peo-logo">
        <div>
          <p class="info-item"><span class="title-text">身份算力</span> <span>{{formatDecimal(decimalParseToNumber(store.powerDetailData.user_identity_power, 18),4)}}</span></p>
          <p class="info-item"><span class="title-text">身份积分</span> <span>{{101}}</span></p>
        </div>
      </div>
      <div class="right">
        <img src="@/assets/imgs/identitycasting/recoder.png" alt="" class="recoder-icon" @click="handleClickRecord(1)">
      </div>
    </div>
    <div class="power-box">
      <p><span class="title-text">身份算力奖励</span> <span>{{formatDecimal(decimalParseToNumber(store.powerDetailData.base_income, 18),4)}}</span></p>
      <img src="@/assets/imgs/identitycasting/recoder.png" alt="" class="recoder-icon" @click="handleClickRecord(2)">
    </div>
    <div class="action-box">
      <p @click="router.push('/casting')">
        <span>身份铸造</span>
      </p>
      <p @click="router.push('/gas')">
        <span>GAS 支付</span>
      </p>
    </div>
  </div>
  <TipsDialog ref="tipsDialog" :tipsContent="tipsContent" />
  <RecordDialog v-model:show="showRecordDialog" :info="recordInfo" />
</template>

<script setup lang="ts">
import { onMounted ,ref} from "vue";
import { useRouter } from 'vue-router';
import TipsDialog from '@/view/identitycasting/components/TipsDialog.vue';
import RecordDialog from '@/view/identitycasting/components/RecordDialog.vue';
import { powerDetail, getRecordList } from "@/api";
import { useStore } from '@/store/store';
import { formatDecimal, decimalParseToNumber } from '@/utils';
import Decimal from "decimal.js";
const router = useRouter();
const store = useStore();
const tipsDialog = ref<InstanceType<typeof TipsDialog>>();
const showRecordDialog = ref(false);
const recordInfo = ref({
  title: '',
  api: (params: any) => (params),
  params: {
    limit: 10,
    module: '',
    symbol: '',
  }
});
const tipsContent = ref({
  title: '身份铸造',
  content: [
    {
      subtitle: '数字身份:',
      content: '完成 KYC 认证后，即可领取多国数字身份，并享受 DID 联盟提供的多种数字服务。',
    },
    {
      subtitle: '身份算力:',
      content: '身份算力可以获取DID奖励，身份算力越多，获取的奖励越多。',
    },
    {
      subtitle: '身份积分:',
      content: '铸造身份即可获得身份积分，积分可兑换 DID 联盟提供的数字身份权益或实体产品。',
    },
  ]
});
const openTipsDialog = () => {
  tipsDialog.value?.open();
}
const handleClickRecord = (type: number) => {
  if (type === 1) {
    recordInfo.value.title = '身份算力记录';
    recordInfo.value.params.module = '';
    recordInfo.value.params.symbol = '';
  } else if (type === 2) {
    recordInfo.value.api = getRecordList;
    recordInfo.value.params.module = 'BaseIncome';
    recordInfo.value.params.symbol = 'DID';
    recordInfo.value.title = '身份算力奖励记录';
  }
  showRecordDialog.value = true;
}

const getPowerDetailData = async () => {
  const { code, data } = await powerDetail();
  if (!code) {
    store.powerDetailData = {...store.powerDetailData, ...data.income_result};
    store.powerDetailData.user_deposit_did = data.deposit_result.user_deposit_did;
    store.powerDetailData.user_identity_power = data.identity_power_result.user;
    store.powerDetailData.deposit_result_user = data.deposit_result.user;
    const user = decimalParseToNumber(data.deposit_result.user, 18);
    const pool = decimalParseToNumber(data.deposit_result.pool, 18);
    if(pool > 0 && user > 0){
      store.powerDetailData.deposit_result_percent = new Decimal(user).div(new Decimal(pool)).mul(100).toString();
    } else {
      store.powerDetailData.deposit_result_percent = '0';
    }
  }
}

onMounted(() => {
  getPowerDetailData();
})
</script>
<style scoped lang="scss">
.content-box {
  padding-top: 1rem;
  background-color: #272830;
  border-radius: .38rem;
  margin-bottom: 1rem;
  .recoder-icon {
    width: .75rem;
    height: .84rem;
  }
}

.info-box {
  display: flex;
  justify-content: space-between;
  padding: 0 .56rem 0 .94rem;
  margin-bottom: .75rem;

  .left {
    display: flex;
    align-items: center;
    font-size: .88rem;
    line-height: 1.25rem;
    color: #fff;

    .peo-logo {
      width: 4rem;
      height: 4rem;
      margin-right: .69rem;
    }

    .title-text {
      color: #828592;
    }

    .info-item {
      margin-top: -.1rem;
      margin-bottom: .5rem;

    }
  }
}

.power-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 .56rem 0 .94rem;
  line-height: 1.25rem;
  font-size: .88rem;
  margin-bottom: .7rem;

  .title-text {
    color: #828592;
  }
}

.action-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: .88rem;
  border-top: 1px solid #30313A;
  p {
    width: 50%;
    text-align: center;
    padding: .5rem 0;
    span {
      color: #1DCC89;
    }
    &:nth-child(1) {
      border-right: 1px solid #30313A;
    }
  }
}
</style>