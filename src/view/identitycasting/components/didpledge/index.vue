<template>
    <div class="content-box">
        <div class="title-container">
            <div class="title F-Bold">
                {{ $t('pledge_title') }}
            </div>
            <img src="@/assets/imgs/identitycasting/tips.png" alt="" class="tips-icon" @click="openTipsDialog">
        </div>
        <div class="info-box">
            <div class="top">
                <p class="title-text">{{ $t('pledge_personal') }}</p>
                <p class="F-Bold text-white">{{formatDecimal(decimalParseToNumber(store.powerDetailData.user_deposit_did, 18),4)}} DID</p>
            </div>
            <div class="bottom">
                <p class="info-item">{{ $t('pledge_weight') }} <span class="F-Bold text-white">{{formatDecimal(decimalParseToNumber(store.powerDetailData.deposit_result_user, 18),4)}}</span></p>
                <p class="info-item">{{ $t('pledge_weight_percent') }} <span class="F-Bold text-white">{{formatDecimal(store.powerDetailData.deposit_result_percent,2)}}%</span></p>
            </div>
        </div>
        <div class="action-box">
            <div class="action-left"  @click="showRecordDialog=true">
                <p>{{ $t('pledge_reward') }}</p>
                <p class="F-Bold reward-box">{{ formatDecimal(decimalParseToNumber(store.powerDetailData.deposit_income, 18),4) }} DID  <img src="@/assets/imgs/identitycasting/arr_right.png" alt="" class=""></p>
            </div>
            <div class="action-right F-Bold" @click="router.push('/pledge-did')">
                {{ $t('pledge_action') }}
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
import { useStore } from '@/store/store';
import { formatDecimal, decimalParseToNumber } from '@/utils';
import { useI18n } from 'vue-i18n';
const router = useRouter();
const { t } = useI18n();
const store = useStore();
const tipsDialog = ref<InstanceType<typeof TipsDialog>>();
const showRecordDialog = ref(false);
const recordInfo = computed(reactive(() => ({
  title: t('pledge_record_title'),
  api: getRecordList,
  params: {
    limit: 10,
    module: 'DepositIncome',
    symbol: 'DID',
  }
})));
const tipsContent = computed(reactive(() => ({
  title: t('pledge_title'),
  content: [
    {
      content: t('pledge_desc_1'),
    },
    {
      content: t('pledge_desc_2'),
    },
    {
      content: t('pledge_desc_3'),
    },
    {
      content: t('pledge_desc_4'),
    },
    {
      content: t('pledge_desc_5'),
    },
    {
      content: t('pledge_desc_6'),
    },
    {
      content: t('pledge_desc_7'),
    }
  ]
})));
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