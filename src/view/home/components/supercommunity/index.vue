<template>
    <div class="super-community-container">
        <div class="super-community-title">
            <div class="title-line">
                <p>
                    <span class="left-icon"></span>
                    <span class="F-Bold title-text">{{ t('super_community') }}</span>
                </p>
               
                <img src="@/assets/imgs/home/tip.png" alt="" srcset="" @click="showRulesDialog = true" class="right-icon">
            </div>
            <ul>
                <li @click="showBadgeDialog = true" class="badge-nums">
                    <img src="@/assets/imgs/badges/rules_badge.png" alt="" class="right-icon">
                    <div>
                        <p>{{ t('badge_num') }}</p>
                        <p class="F-Bold">{{ badgeNum }}</p>
                    </div>
                   
                </li>
                <li class="destroy-bottom">
                    <div>
                        <p><span @click="showDestoryRecoder = true">{{ t('destroy_fc_get_badge') }} ></span></p>
                        <p class="destroy-fc"> <span>{{ t('bonus_income') }}</span><span class="F-Bold line-height-1">{{formatDecimal(totalIncom,18)}} FC</span></p>
                    </div>
                    <div class="btn-destory" @click="showDestoryDialog = true">
                        {{ t('destroy') }} <img src="@/assets/imgs/badges/destory.png" alt="" srcset="">
                    </div>
                 
                </li>
                
            </ul>
        </div>
        <RulesDialog v-model:show="showRulesDialog" @update:visible="showRulesDialog = $event" />
        <DestoryDialog v-model:show="showDestoryDialog" @update:visible="showDestoryDialog = $event" @finishBuyBadge="getBadgeDetail"/>
        <DestoryRecoder v-model:show="showDestoryRecoder" @update:visible="showDestoryRecoder = $event" />
        <BadgeDialog v-model:show="showBadgeDialog" @update:visible="showBadgeDialog = $event" :badgeInfo="badgeInfo" @mergeSuccess="getBadgeDetail"/>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import RulesDialog from './RulesDialog.vue';
import DestoryDialog from './DestoryDialog.vue';
import DestoryRecoder from './DestoryRecoder.vue';
import BadgeDialog from './BadgeDialog.vue';
import { badgeDetail } from '@/api';
import {decimalParseToNumber} from '@/api/mapcontract'
import { formatDecimal } from '@/utils';
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const showRulesDialog = ref(false);
const showDestoryDialog = ref(false);
const showDestoryRecoder = ref(false);
const showBadgeDialog = ref(false);
const totalIncom = ref('0')
const badgeNum = ref(0);
const badgeInfo = ref({
    country_badge_num:0,
    continent_badge_num:0,
    world_badge_num:0,
});
onMounted(() => {
    getBadgeDetail()
})

const getBadgeDetail = async () => {
    const {code,data} = await badgeDetail()
    if(!code) {
        totalIncom.value = decimalParseToNumber(data.total_income,18);
        badgeNum.value = data.badge_num;
        badgeInfo.value = {...badgeInfo.value, ...data};
    }
}
</script>

<style scoped lang="scss">
.super-community-container {
    background-color: #0A0809;
    border-radius: .38rem;
    border: 1px solid #353535;
    margin: 0.56rem 0.94rem;
    padding: 0.56rem 0.94rem;
    .line-height-1 {
        line-height: 1;
    }
    .super-community-title {
        .title-line {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1rem;
            border-bottom: 1px solid #212225;
            padding-bottom: 0.5rem;
            p {
                display: flex;
                align-items: center;
            }
            .title-text {
                font-size: 1rem;
                color: #fff;
                margin-right: 0.44rem;
            }

            .left-icon {
                display: inline-block;
                width: 0.31rem;
                height: 1rem;
                margin-right: 0.44rem;
                background-color: #FF3F3F;
                border-radius: 0.19rem;
            }

        }
    }

    .right-icon {
        width: 1rem;
        height: 1rem;
    }
    .destroy-fc {
        display: flex;
        align-items: center;
        margin-top: 0.4rem;
        line-height: 1.4;
        .F-Bold {
            color: #FF3F3F;
            margin-left: 0.2rem;
        }
    }
    .btn-destory {
        width: 4.81rem;
        height: 1.88rem;
        font-size: 0.88rem;
        line-height: 1.88rem;
        background-color: #FF3F3F; 
        border-radius: 0.2rem;
        color: #fff;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        img {
            width: 0.75rem;
            height: .88rem;
            margin-left: 0.2rem;
        }
    }
    .destroy-bottom {
        font-size: .88rem;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-top: 1rem;
    }
    .badge-nums {
        display: flex;
        align-items: center;
        img {
            width: 3.75rem;
            height: 3.75rem;
            margin-right: .5rem;
        }
    }
}
</style>