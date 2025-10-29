<template>
    <div class="content-box">
        <div class="title-container">
            <div class="title F-Bold">
                DID质押
            </div>
            <img src="@/assets/imgs/identitycasting/tips.png" alt="" class="tips-icon" @click="openTipsDialog">
        </div>
        <div class="info-box">
            <div class="top">
                <p class="title-text">个人质押</p>
                <p class="F-Bold text-white">200 DID</p>
            </div>
            <div class="bottom">
                <p class="info-item">质押权重 <span class="F-Bold text-white">100</span></p>
                <p class="info-item">个人权重占比 <span class="F-Bold text-white">2%</span></p>
            </div>
        </div>
        <div class="action-box">
            <div class="action-left"  @click="showRecordDialog=true">
                <p>质押奖励</p>
                <p class="F-Bold reward-box">100 DID  <img src="@/assets/imgs/identitycasting/arr_right.png" alt="" class=""></p>
            </div>
            <div class="action-right F-Bold" @click="router.push('/pledge-did')">
                质押
            </div>
        </div>
    </div>
    <TipsDialog ref="tipsDialog" :tipsContent="tipsContent" />
    <RecordDialog v-model:show="showRecordDialog" :info="recordInfo" />
</template>

<script setup lang="ts">
import TipsDialog from '@/view/identitycasting/components/TipsDialog.vue';
import { onMounted ,ref} from "vue";
import RecordDialog from '@/view/identitycasting/components/RecordDialog.vue';
import { powerList ,getRecordList} from "@/api";
import { useRouter } from 'vue-router';
const router = useRouter();
const tipsDialog = ref<InstanceType<typeof TipsDialog>>();
const showRecordDialog = ref(false);
const recordInfo = ref({
  title: '质押奖励记录',
  api: getRecordList,
  params: {
    limit: 10,
    module: 'DepositIncome',
    symbol: 'DID',
  }
});
const tipsContent = ref({
  title: 'DID质押',
  content: [
    {
      content: '每次质押都会触发收益分配。',
    },
    {
      content: '您的质押奖励取决于三个因素：投入金额、质押时间、算力大小',
    },
    {
      content: '质押权重 = 个人算力 × 金额系数 × 时间系数',
    },
    {
      content: '金额系数：您的质押金额 ÷ 所有用户质押金额中位数',
    },
    {
      content: '时间系数：您的质押周期 ÷ 所有用户质押周期中位数',
    },
    {
      content: '每日奖励：您的权重 ÷ 质押加速池权重 × 质押池奖励',
    },
    {
      content: '质押奖励 ： 质押池权重 / 全网质押池权重 * 全网质押池奖励',
    }
  ]
});
const openTipsDialog = () => {
  tipsDialog.value?.open();
}
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
    .info-box {
        border: 1px solid #34353E;
        border-radius: .38rem;
        padding: .5rem 0 0;
        margin: 0 .75rem .75rem;
        color:#828592;
        
        .top {
           padding: 0 .56rem;
           margin-bottom: .44rem;
           .text-white {
            line-height: 1.38rem;
           }
        }
        .bottom {
            border-top: 1px solid #34353E;
            display: flex;
            justify-content: space-between;
            align-items: center;
            .info-item {
                width: 50%;
                border-right: 1px solid #34353E;
                padding: .56rem;
                &:last-child {
                    border-right: none;
                }
            }
        }
    }
    .action-box {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 .75rem .75rem;
        font-size: .88rem;
        line-height: 1.25rem;
        color: #828592;
        .action-left {
            width: 80%;
            .reward-box {
                display: flex;
                align-items: center;
                line-height: 1.25rem;
                color: #fff;
            }
            img {
                width: .5rem;
                margin-left: .5rem;
            }
        }
        .action-right {
            width: 20%;
            text-align: center;
            padding: .5rem 0;
            background-color: #1DCC89;
            border-radius: .38rem;
            color: #1E2741;
        }
    }
}
</style>