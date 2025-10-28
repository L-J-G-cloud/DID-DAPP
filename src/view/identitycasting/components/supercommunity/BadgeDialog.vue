<template>
    <div class="badge-dialog-container">
        <van-dialog v-model:show="show" class="dialog-box" :z-index="100" :showConfirmButton="false"
            :closeOnClickOverlay="true">
            <!-- 弹窗内容 -->
            <template #default>
                <div class="header plr-1">
                    <div class="title-line d-flex justify-content-between align-items-center">
                        <div class="title">
                            <span class="left-icon"></span>
                            <span class="mr-2">{{ t('badge') }}</span>
                        </div>
                        <img class="close-img" src="@/assets/imgs/identitycasting/close.png" alt="" @click="handleClickCancel" />
                    </div>
                </div>
                <div class="content plr-1">
                    <div class="global-badge d-flex justify-content-between ">
                        <div class="d-flex align-items-center">
                            <img :src="world_badge_num ? globalBadge : globalDisBadge" alt="">
                            <div>
                                <p>{{ t('badge_global') }}</p>
                                <p> <span class="nums-x">X</span> {{ world_badge_num }}</p>
                            </div>
                        </div>
                        <div class="d-flex align-items-center  donate-box" @click="activeDonate">
                            <img :src="donateImg" alt="">
                            <p>{{ t('transfer') }}</p>
                        </div>
                    </div>
                    <div class="country-badge">
                        <div class="country-badge-item-title-box">
                            <span class="country-badge-item-title">{{ t('badge_country') }}</span>
                            <span :class="is_country_badge_enough ? 'active-btn' : 'disabled-btn'"
                                @click="mergeConfig(1)">{{ t('merge') }}</span>
                        </div>
                        <div class="country-badge-item" v-for="item in country_badge_num_List" :key="item.type">
                            <img :src="getBadgeImg(item.type, item.num)" alt="">
                            <p>{{ t('badge_country_list.' + item.type) }} <span class="F-Bold nums-show">{{ item.num > 0 ? `X ${item.num}` : '' }} {{  }}</span></p>
                        </div>
                    </div>

                    <div class="country-badge continent-badge">
                        <div class="country-badge-item-title-box">
                            <span class="country-badge-item-title">{{ t('badge_continent') }}</span>
                            <span :class="is_continent_badge_enough ? 'active-btn' : 'disabled-btn'"
                                @click="mergeConfig(2)">{{ t('merge') }}</span>
                        </div>
                        <div class="country-badge-item" v-for="item in continent_badge_num_List" :key="item.type">
                            <img :src="getBadgeImg(item.type, item.num)" alt="">
                            <p>{{ t('badge_continent_list.' + item.type) }} <span class="F-Bold nums-show">{{ item.num > 0 ? `X ${item.num}` : '' }} {{  }}</span></p>
                        </div>
                    </div>
                </div>
            </template>
        </van-dialog>
        <van-dialog v-model:show="mergehow" class="dialog-box" :z-index="100" :showConfirmButton="false"
            :closeOnClickOverlay="true">
            <template #default>
                <div class="merge_header plr-1">
                    {{ t('merge_tip') }}
                </div>
                <div class="merge_content plr-1">
                    <p>{{ t('merge_confirm', { type: mergeType === 1 ? t('badge_type_country') : t('badge_type_continent'), target: mergeType === 1 ? t('badge_type_continent') : t('badge_type_global') }) }}</p>
                </div>
                <div class="btn-box">
                    <span class="btn-item" @click="mergehow = false;mergeType=0;">{{ t('cancel') }}</span>
                    <span class="btn-item" @click="handleClick">{{ t('merge') }}</span>
                </div>
            </template>
        </van-dialog>
        <DestoryDialog v-model:show="DestoryDialogShow" @update:visible="DestoryDialogShow = $event" :type="mergeType" @finishBuyBadge="getBadgeDetail"/>
        <DonateDialog v-model:show="donateShow" @update:visible="donateShow = $event" @finishDonate="getBadgeDetail" :continent_badge="continent_badge" :country_badge="country_badge"/>
    </div>

</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { badgeList } from '@/api';
import globalBadge from '@/assets/imgs/badges/global_badge.png'
import globalDisBadge from '@/assets/imgs/badges/global_badge.png'
import DestoryDialog from './DestoryDialog.vue';
import donateImg from '@/assets/imgs/badges/gift.png'
import donateDisImg from '@/assets/imgs/badges/gift_dis.png'
import DonateDialog from './DonateDialog.vue';
const {
    t
} = useI18n();
const country_badge_num_List = ref<any[]>([
    {
        nam: '印度',
        type: 1,
        num: 0,
    },
    {
        nam: '法国',
        type: 2,
        num: 0,
    },
    {
        nam: '南非',
        type: 3,
        num: 0,
    },
    {
        nam: '美国',
        type: 4,
        num: 0,
    },
    {
        nam: '巴西',
        type: 5,
        num: 0,
    },
    {
        nam: '新西兰',
        type: 6,
        num: 0,
    },
    {
        nam: '国际南极',
        type: 7,
        num: 0,
    }
]);
const continent_badge_num_List = ref<any[]>([
    {
        nam: '亚洲',
        type: 8,
        num: 0,
    },
    {
        nam: '欧洲',
        type: 9,
        num: 0,
    },
    {
        nam: '非洲',
        type: 10,
        num: 0,
    },
    {
        nam: '北美洲',
        type: 11,
        num: 0,
    },
    {
        nam: '南美洲',
        type: 12,
        num: 0,
    },
    {
        nam: '大洋洲',
        type: 13,
        num: 0,
    },
    {
        nam: '南极洲',
        type: 14,
        num: 0,
    }
]);
const country_badge = ref<any[]>([])
const continent_badge = ref<any[]>([])
const is_donate = ref(false)
const world_badge_num = ref(0)
const is_country_badge_enough = ref(false)
const is_continent_badge_enough = ref(false)
const show = defineModel<boolean>("show");
const mergehow = ref(false);
const DestoryDialogShow = ref(false);
const donateShow = ref(false);
const props = defineProps({
    badgeInfo: {
        type: Object,
        default: () => ({})
    }
})
const emit = defineEmits(['update:visible','mergeSuccess']);
const handleClickCancel = () => {
    emit('update:visible', false);
};
const mergeType = ref(0);
const badgeImgs = import.meta.glob('/src/assets/imgs/badges/badge_*.png', { eager: true, import: 'default' });
const badgeDisImgs = import.meta.glob('/src/assets/imgs/badges/badge_dis_*.png', { eager: true, import: 'default' });

function getBadgeImg(type: number, num: number): string {
    if (num > 0) {
        return badgeImgs[`/src/assets/imgs/badges/badge_${type}.png`] as string;
    } else {
        return badgeDisImgs[`/src/assets/imgs/badges/badge_dis_${type}.png`] as string;
    }
}

const getBadgeDetail = async (type=0) => {
    const { code, data } = await badgeList({ status: 1 })
    if (!code) {
        // country_badge_num_List.value = data.filter((item: any) => item.type >= 1 && item.type <= 7);
        // continent_badge_num_List.value = data.filter((item: any) => item.type >= 8 && item.type <= 14);
        world_badge_num.value = data.find((item: any) => item.type === 15)?.num || 0

        // 更新国家徽章数量
        country_badge_num_List.value.forEach(country => {
            const match = data.find((item: any) => item.type === country.type);
            country.num = match ? match.num : 0;
        });
        country_badge.value = country_badge_num_List.value.filter((item: any) => item.num > 0)
        // 更新洲徽章数量
        continent_badge_num_List.value.forEach(continent => {
            const match = data.find((item: any) => item.type === continent.type);
            continent.num = match ? match.num : 0;
        });
        continent_badge.value = continent_badge_num_List.value.filter((item: any) => item.num > 0)
        is_donate.value = data.find((item: any) => item.type !== 15)?.num > 0

        is_country_badge_enough.value = country_badge_num_List.value.every((item: any) => item.num > 0)
        is_continent_badge_enough.value = continent_badge_num_List.value.every((item: any) => item.num > 0)
        if(mergeType.value||type) {
            emit('mergeSuccess')
        }
    }
}

const mergeConfig = (type: number) => {
    if(type === 1 && !is_country_badge_enough.value || !is_continent_badge_enough.value&&type === 2) {
        return
    }
    mergeType.value = type;
    mergehow.value = true;
}

const handleClick = () => {
    mergehow.value = false;
    DestoryDialogShow.value = true;
}

const activeDonate = () => {
    donateShow.value = true;
}

watch(show, async (newVal) => {
    if (newVal) {
        await getBadgeDetail()
    }
})
</script>

<style scoped lang="scss">
.badge-dialog-container {
    :deep(.van-dialog) {
        padding: 0rem 0.4rem;
        top: 50%;
        max-height: 90vh;
        overflow-y: scroll;
        width: 98%;
        background: #090909;
        border-radius: 0.75rem;
        border: 0.06rem solid #353535;
    }
}


.header {
    padding: 0.56rem 0.94rem;
}

.content {
    max-height: 70vh;
    overflow-y: scroll;
    padding: 0.56rem 0rem;
}

.close-img {
    width: 1rem;
    height: 1rem;
}

.left-icon {
    display: inline-block;
    width: .31rem;
    height: 1rem;
    margin-right: .44rem;
    background-color: #FF3F3F;
    border-radius: .19rem;
}
.pl-10 {
    padding-left: 10px;
}
.global-badge {
    padding: .88rem .81rem;
    background: url('@/assets/imgs/badges/global_bg.png') no-repeat center center;
    background-size: 100% 100%;
    border-radius: .25rem;
    align-items: flex-start;
    img {
        width: 4.44rem;
        height: 4.44rem;
        margin-right: .75rem;
    }
}

.title-line {
    padding-bottom: .8rem;
    border-bottom: 1px solid #212225;
    .title {
        display: flex;
        align-items: center;
    }
}

.country-badge {
    width: 100%;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    background: linear-gradient(180deg, #000000 0%, #464646 100%);
    border-radius: .38rem;
    padding-bottom: .56rem;
}

.continent-badge {
    margin-top: .38rem;
    border: 1px solid #212225;
    border-radius: .38rem;
    background: linear-gradient(180deg, #000000 0%, #D5A868 100%);
}

.country-badge-item {
    width: 25%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: .75rem;
    color: #fff;
    margin-bottom: .69rem;
    
    img {
        width: 2.5rem;
        height: 2.5rem;
    }
    p {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        span {
            display: inline-block;
            width: 1.5rem;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            text-align: center;
        }
    }
}

.country-badge-item-title-box {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: .38rem .69rem;
    border-bottom: 1px solid #212225;
    margin-bottom: 1.25rem;

    .country-badge-item-title {
        font-size: 1rem;
        color: #fff;
    }

    .active-btn {
        font-size: .75rem;
        background: #FF3F3F;
        border-radius: .25rem;
        padding: .19rem .88rem;
        color: #fff;
    }

    .disabled-btn {
        font-size: .75rem;
        background: #333333;
        border-radius: .25rem;
        padding: .19rem .88rem;
        color: #767676;
    }
}

.merge_header {
    text-align: center;
}

.merge_content {
    padding: 1rem;
    text-align: center;
    font-size: 1rem;
    color: #fff;
    margin-bottom: 1rem;
    line-height: 1.5;
}

.btn-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 0 1rem;
    .btn-item {
        display: inline-block;
        width: 47%;
        height: 2.25rem;
        background: #FF3F3F;
        border-radius: 0.25rem;
        color: #fff;
        text-align: center;
        line-height: 2.25rem;
        font-size: 1rem;
        &:first-child {
            background: #333333;
        }
    }
}
.nums-show {
    display: inline-block;
    font-size: .5rem;
    color: #fff;
    min-width: 2rem;
    height: 14px;
}
.nums-x {
    font-size:12px
}
.donate-box {
    padding: .3rem .44rem;
    background-color: #FF3F3F;
    border-radius: .25rem;
    font-size: .75rem;
    color: #fff;
    img {
        width: .75rem;
        height: .81rem;
        margin-right: .25rem;
    }
    &.disabled {
        background-color: #333333;
        color: #767676;
    }
}
</style>