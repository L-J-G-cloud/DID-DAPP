<template>
    <div class="destroy-container">
        <van-dialog v-model:show="show" class="dialog-box" :z-index="100" :showConfirmButton="false"
            :closeOnClickOverlay="true">
            <!-- 弹窗内容 -->
            <template #default>
                <div class="header plr-1">
                    <div class="title-line d-flex justify-content-between align-items-center">
                        <div class="title">
                            <span class="left-icon"></span>
                            <span class="mr-2">{{ t('destroy_fc_get', { type: typeText }) }}</span>
                        </div>
                        <img class="close-img" src="@/assets/imgs/home/close.png" alt="" @click="handleClickCancel" />
                    </div>
                </div>
                <div class="content plr-1">
                    <p class="d-flex justify-content-between align-items-center"><span class="text-label">{{
                        t('get_badge_num') }}</span><span>{{ info.badgeNum }}</span></p>
                    <p class="d-flex justify-content-between align-items-center"><span class="text-label">{{
                        t('destroy_fc_num') }}</span><span>{{ info.amount }} FC</span></p>
                    <p class="d-flex justify-content-between align-items-center"><span class="text-label">{{
                        t('fc_balance') }}</span><span>{{ formatDecimal(info.FCBalance, 6) }} FC</span></p>
                </div>
                <div :class="['btn-box btn-item', isBalance ? '' : 'disabled-btn']" @click="handleClick">
                    <p>{{ isAllowance ? `${info.type ? t('merge') : t('destroy_action')}` : t('approve_action') }}</p>
                </div>
            </template>
        </van-dialog>

        <van-dialog v-model:show="successShow" class="dialog-box" :z-index="100" :showConfirmButton="false"
            :closeOnClickOverlay="true">
            <!-- 弹窗内容 -->
            <template #default>
                <div class="content plr-1">
                    <h1 class="mb-1 text-header">{{ t('destroy_success') }}</h1>
                    <h4 class="mb-1 text-title">
                        {{ t('get_one_badge', { type: typeText }) }}
                    </h4>

                    <div class="badge-item">
                        <img :src="getBadgeImg(badgeType)" alt="" class="badge-img">
                        <p class="text-item">{{ getBadgeName(badgeType) }} </p>
                    </div>

                    <p class="btn-item" @click="confirmBadge">{{ t('confirm') }}</p>
                </div>
            </template>
        </van-dialog>
    </div>
</template>

<script setup lang='ts'>
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n';
import { useStore } from '@/store/store'
import { formatDecimal, showLoading, closeToastLoading, showToastIcon, getBadgeName } from '@/utils'
import { buyBadge, conflate } from '@/api'
import success from '@/assets/imgs/home/success.png'
import { approval, getTokenAllowBalance, getTokenBalance, getContractAddress, decimalParseToNumber, getBadge, decimalParseToBigNumber } from '@/api/mapcontract'
import { da } from 'element-plus/es/locale';
const store = useStore()
const {
    t
} = useI18n();
const info = reactive({
    FCBalance: '',
    FCAllowance: '',
    badgeNum: 1,
    amount: '7',
    type: 0,
})
const badgeType = ref(0)
const successShow = ref(false);
const props = defineProps({
    type: {
        type: Number,
        default: 0
    }
})
const typeText = ref('')

// const {t} = useI18n()
const isAllowance = ref(false);
const isBalance = ref(false);
const show = defineModel<boolean>("show");
const FCAddress = ref('');
const FCTokenAddress = ref('');
const emit = defineEmits(['update:visible', 'finishBuyBadge']);
const handleClickCancel = () => {
    closeToastLoading();
    emit('update:visible', false);
};
const sparkStaticsData = ref({
    node_num: 0,
    reward: '0'
})


const badgeImgs = import.meta.glob('/src/assets/imgs/badges/badge_*.png', { eager: true, import: 'default' });
function getBadgeImg(type: number) {
    return badgeImgs[`/src/assets/imgs/badges/badge_${type}.png`] as string;
}

const init = async () => {
    info.FCBalance = await getTokenBalance(FCAddress.value, store.account, 18)
    info.FCAllowance = await getTokenAllowBalance(FCAddress.value, store.account, 18, FCTokenAddress.value)
    isAllowance.value = Number(info.FCAllowance) >= Number(info.amount);
    isBalance.value = Number(info.FCBalance) >= Number(info.amount);
    console.log(info.FCBalance, info.FCAllowance, 'FCBalance, FCAllowance')
}


const approvalFC = async () => {
    await approval(FCAddress.value, store.account, FCTokenAddress.value, String(Number(info.amount)+0.01) , 18, () => {
        isAllowance.value = true
    }, () => {
        isAllowance.value = false
    })
}

const handleClick = async () => {
    if (!isBalance.value) {
        return
    }
    if (!isAllowance.value) {
        showLoading()
        await approvalFC()
        closeToastLoading()
    } else {
        showLoading()
        const hash = await getBadge(info.type)
        // const hash = '0x4d2f28a429209eb020be4eb2d3aaf6f68bc0b1f1eb8fe93ef61bd23f4486fb1b'
        console.log(hash, 'hash')
        if (!hash) {
            showToastIcon(t('destroy_fail'), 'fail')
            closeToastLoading()
            return
        }
        let resData: any = {};
        let code, data;
        if (info.type === 0) {
            resData = await buyBadge({
                trx_id: hash,
                num: info.badgeNum,
                amount: decimalParseToBigNumber(info.amount, 18).toString()
            });
            console.log(resData, 'resData');
            ({ code, data } = resData);
        } else if (info.type === 1 || info.type === 2) {
            resData = await conflate({ module: info.type, trx_id: hash });
            ({ code, data } = resData);
        }
        console.log(resData, 'resData');
        if (!code) {
            badgeType.value = data.type;
            show.value = false;
            successShow.value = true;
        } else {
            showToastIcon(t('fail'), '失败');
        }
        closeToastLoading();
    }
}
const confirmBadge = () => {
    successShow.value = false;
    emit('finishBuyBadge');
}

const typeAction = () => {
    if (info.type === 0) {
        info.amount = '7';
        typeText.value = t('badge_type_country')
    } else if (info.type === 1) {
        info.amount = '7';
        typeText.value = t('badge_type_continent')
    } else if (info.type === 2) {
        info.amount = '70';
        typeText.value = t('badge_type_global')
    }
}
watch(show, async (newVal) => {
    if (newVal) {
        info.type = props.type;
        // if (info.type === 0) {
        //     typeText.value = '国家',
        //         info.amount = '0.007'
        // } else if (info.type === 1) {
        //     typeText.value = '洲'
        //     info.amount = '0.007'
        // } else if (info.type === 2) {
        //     typeText.value = '全球',
        //         info.amount = '70'
        // }
        console.log(info.type, 'info.type')
        typeAction()
        showLoading()
        FCAddress.value = await getContractAddress('FC')
        FCTokenAddress.value = await getContractAddress('Badge')
        await init()
        closeToastLoading()

        // const data = {
        //     a:0,
        //     b:0,
        //     c:2,
        //     d:0,
        //     e:0,
        //     f:0,
        //     g:0,
        // }
        // // 遍历 badgeList，更新 num
        // Object.entries(data).forEach(([key, value]) => {
        //         if (value !== 0) {
        //             const badge = badgeList.value.find(item => item.flag === key)
        //             if (badge) {
        //                 badge.num = Number(value)
        //             }
        //         }
        //     })
        //     console.log(badgeList.value, 'badgeList')
    }
}, { immediate: true })

</script>
<style scoped lang='scss'>
.destroy-container {
    :deep(.van-dialog) {
        padding: .7rem .5rem 0;
        width: 95%;
        top: 50%;
        max-height: 90vh;
        overflow-y: scroll;
        max-width: 400px;
        border-radius: .38rem;
        border: 1px solid #2C3436;
        background-color: #090909;
    }
    // :deep(.van-dialog) {
    //     padding: 0.56rem 0.94rem;
    //     width: 95%;
    // }
}


.plr-1 {
    padding: 0 .5rem;
}

.mr-2 {
    margin-right: .5rem;
}

.text-title {
    margin-top: 1rem;
    font-size: 1.25rem;
    font-weight: 600;
    color: #fff;
    text-align: center;
    margin-bottom: 1rem;
}

.text-header {
    text-align: center;
    font-size: 1.38rem;
    margin-bottom: 1rem;
}

.header {
    // text-align: center;
    font-size: 1rem;
    margin-bottom: 1rem;
    padding: 0 0 .56rem;
    border-bottom: 1px solid #2C3436;

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

    img {
        width: 1rem;
        height: 1rem;
    }
}

.content {
    color: #fff;
    font-size: .88rem;

    .d-flex {
        margin-bottom: .75rem;
    }

    .text-label {
        color: #B2B2B2;
    }

    h4 {
        font-size: 1rem;
        margin-bottom: .5rem;
    }

    .content-box {
        display: flex;
        flex-direction: column;
        border-radius: .36rem;
        border: 1px solid #2C3436;
        gap: .63rem;
        padding: .75rem .44rem;
        color: #B2B2B2;

        .box-item {
            display: flex;
            justify-content: space-between;
            align-items: center;

            span {
                font-size: 1rem;
            }

            .num {
                color: #fff;
            }
        }

    }
}

.time-box {
    font-size: .75rem;
    color: #B2B2B2;
    margin-top: .5rem;
}

.rules-item {
    padding-bottom: .8rem;
    border-bottom: 1px solid #2C3436;
    margin-bottom: .8rem;

    :deep(span) {
        color: #FF3F3F;
    }

    &:last-child {
        border-bottom: none;
        margin-bottom: 0;
    }

    h4 {
        font-size: 1rem;
        margin-bottom: .5rem;
    }

    p {
        font-size: .88rem;
        line-height: 1rem;
        color: #B2B2B2;
    }
}

.bottom-img {
    margin-top: .5rem;

    img {
        width: 100%;
        height: auto;
    }
}

.btn-item {
    width: 90%;
    margin: 0 auto;
    height: 2.5rem;
    margin-bottom: 1rem;
    background-color: #FF3F3F;
    border-radius: .35rem;
    text-align: center;
    line-height: 2.5rem;
    color: #fff;
    font-size: 1rem;
}

.disabled-btn {
    background-color: #353535 !important;
}

.badge-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
    margin: 1rem 0;
}

.badge-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    min-width: 90px;
    box-sizing: border-box;
    padding: 0.5rem 0;
    margin-bottom: 1.25rem;
    transition: all 0.3s;
    background-image: url('@/assets/imgs/badges/conlesion_bg.png');
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-position: center;
}

.badge-img {
    width: 7.38rem;
    height: 7.38rem;
    margin-bottom: 0.5rem;
    transition: all 0.3s;
}

.badge-item p {
    font-size: 1rem;
    margin: 0;
    transition: all 0.3s;
}

.badge-list .badge-item {
    width: 40%;
}

.badge-list .badge-img {
    width: 3rem;
    height: 3rem;
}



.text-item {
    white-space: nowrap;

    .num {
        font-size: 10px;
        color: #B2B2B2;
    }
}

// @media (max-width: 500px) {
//     .badge-item {
//         width: 45%;
//         min-width: 70px;
//     }

//     .badge-list.few .badge-item {
//         width: 70%;
//     }
// }</style>