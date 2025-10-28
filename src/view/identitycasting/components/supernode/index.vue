<template>
    <div class="super-community-container">
        <div class="super-community-title">
            <div class="title-line">
                <p>
                    <span class="left-icon"></span>
                    <span class="F-Bold title-text">{{ t('supernode_title') }}</span>
                </p>

                <img src="@/assets/imgs/identitycasting/tip.png" alt="" srcset="" @click="showRulesDialog = true"
                    class="right-icon">
            </div>
            <div class="super-community-content">
                <p class="sub-title">{{ t('supernode_community_contribution') }}</p>
                <ul class="community-list">
                    <li>
                        <p class="title">{{ t('supernode_main_community') }}</p>
                        <p class="num F-Bold">{{superNodeInfo.main_team_node_count}}</p>
                    </li>
                    <li>
                        <p class="title">{{ t('supernode_sub_community') }}</p>
                        <p class="num F-Bold">{{superNodeInfo.minor_team_node_count}}</p>
                    </li>
                </ul>
                <p class="sub-title info-title">{{ t('supernode_bonus_status') }}</p>
                <ul class="info-list">
                    <li class="community-item">
                        <span>{{ t('supernode_contribution_value') }}</span> <span>{{superNodeInfo.point}}</span>
                    </li>
                    <li class="community-item">
                        <span @click="showDestoryRecoder = true">{{ t('supernode_get_bonus_qualification') }} ></span> <span :class="isAggree ? 'btn-tips aggree' : 'btn-tips'" @click="isDestory ? showDestoryDialog = true : ''">{{ isAggree ? t('supernode_already_got') : t('supernode_need_destroy') }}</span>
                    </li>
                    <li class="community-item">
                        <span>{{ t('supernode_bonus_income') }}</span> <span>{{formatDecimal(decimalParseToNumber(superNodeInfo.super_node_income,18),4)}} FC</span>
                    </li>
                </ul>
                <p :class="['btn-destory',isDestory?'':'disabled-btn']" @click="isDestory ? showDestoryDialog = true : ''" v-if="!isAggree">{{ t('supernode_destroy') }}</p>
            </div>

        </div>
        <RulesDialog v-model:show="showRulesDialog" @update:visible="showRulesDialog = $event" />
        <DestoryDialog v-model:show="showDestoryDialog" @update:visible="showDestoryDialog = $event" @finish=" isDestory= false"/>
        <DestoryRecoder v-model:show="showDestoryRecoder" @update:visible="showDestoryRecoder = $event" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import RulesDialog from './RulesDialog.vue';
import { superNodeDetail} from '@/api';
import { decimalParseToNumber } from '@/api/mapcontract'
import { formatDecimal } from '@/utils';
import { useI18n } from "vue-i18n";
import DestoryDialog from './DestoryDialog.vue';
import DestoryRecoder from './DestoryRecoder.vue';
const { t } = useI18n();
const showRulesDialog = ref(false);
const showDestoryDialog = ref(false);
const showDestoryRecoder = ref(false);
const showBadgeDialog = ref(false);
const isAggree = ref(false);
const isDestory = ref(true);
const totalIncom = ref('0')
const badgeNum = ref(0);
const superNodeInfo = ref({
    is_super_node: 0,
    main_team_node_count: 0,
    minor_team_node_count: 0,
    point: 0,
    super_node_income: 0
});
onMounted(() => {
    getBadgeDetail()
})

const getBadgeDetail = async () => {
    const { code, data } = await superNodeDetail()
    if (!code) {
        console.log(data, 'data')
        superNodeInfo.value = { ...superNodeInfo.value, ...data };
        isAggree.value = data.is_super_node;
        // totalIncom.value = decimalParseToNumber(data.total_income, 18);
        // badgeNum.value = data.badge_num;
        // badgeInfo.value = { ...badgeInfo.value, ...data };
    }
}
</script>

<style scoped lang="scss">
.super-community-container {
    background-color: #1E1F25;
    border-radius: .38rem;
    border: 1px solid #353535;
    margin: 0.56rem 0.94rem;
    padding: 0.56rem 0.94rem;

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
        width: 100%;
        height: 2.5rem;
        font-size: 0.88rem;
        line-height: 1.88rem;
        background-color: #D01A1A;
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
        &.disabled-btn {
            background-color: #353535;
            color: #999999;
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

    .super-community-content {
        .sub-title {
            font-size: 0.88rem;
            color: #999999;
            margin-bottom: 0.4rem;
        }

        .community-list {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            border-bottom: 1px solid #212225;
            padding-bottom: 0.75rem;
            margin-bottom: 0.25rem;
            li {
                width: 48%;
                padding: .5rem .63rem;
                font-size: .88rem;
                color: #999999;
                border: 1px solid #353535;
                border-radius: .38rem;
                line-height: 1.25rem;

                .num {
                    margin-top: 0.2rem;
                    color: #fff;
                    font-size: 1rem;
                    line-height: 1.56rem;
                }
            }
        }

        .info-list {
            .info-title {
                margin-bottom: 0.88rem;
            }
            .community-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                border: none;
                width: 100%;
                color: #fff;
                font-size: .88rem;
                line-height: 1.19rem;
                margin-bottom: 0.63rem;
            }
        }
    }
    .btn-tips {
        color: #DA2424;
        font-size: .88rem;
        line-height: 1.19rem;
        padding: 0.1rem 0.2rem;
        background-color: #3F1313;
        border: 1px solid #DA2424;
        border-radius: 0.25rem;
        &.aggree {
            border: none;
            color:#27A620;
            border-color: #27A620;
            background-color: transparent;
        }
    }
}
</style>