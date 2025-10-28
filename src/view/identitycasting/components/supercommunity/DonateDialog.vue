<template>
    <div class="donate-container" v-if="show">
        <van-dialog v-model:show="show" class="dialog-box" :closeOnClickOverlay="true">
            <!-- 弹窗内容 -->
            <template #default>
                <!-- 关闭图标 -->
                <div class="default-box">
                    <div class="title-line d-flex justify-content-between align-items-center">
                        <div class="title">
                            <span class="left-icon"></span>
                            <span>{{ t('transfer_badge') }}</span>
                        </div>
                        <img class="close-img" src="@/assets/imgs/identitycasting/close.png" alt="" @click="show = false" />
                    </div>
                    <div class="donate-box">
                        <div class="header-box">
                            <p v-for="item in tabList" :key="item.value"
                                :class="['tab-item', item.active ? 'active' : '']" @click="handleTabClick(item.value)">
                                {{ item.name }}</p>
                        </div>
                        <div class="content-scroll-wrapper">
                            <div class="content-box" ref="scrollBox" @scroll="handleScroll"
                                v-if="currentBadge.length > 0">
                                <div class="content-item" v-for="item in currentBadge" :key="item.type"
                                    :class="{ selected: selectedBadgeId === item.type }" @click="selectBadge(item.type)">
                                    <img :src="getBadgeImg(item.type)" alt="">
                                    <p class="badge-name">{{getBadgeName(item.type) }}</p>
                                    <p class="F-num F-Bold"> <span>X</span> {{ item.num }} </p>
                                </div>
                            </div>
                            <div v-else>
                                <p class="no-data">{{ t('no_badge') }}</p>
                            </div>
                            <div v-if="showLeftShadow" class="scroll-shadow left"></div>
                            <div v-if="showRightShadow" class="scroll-shadow right"></div>
                        </div>

                        <div class="input-box">
                            <p>{{ t('transfer_address') }}</p>
                            <van-field v-model="info.address" center clearable class="ftd-num-field F-Bold field-box"
                                type="text" :placeholder="t('PleaseEnterTransfer')">
                            </van-field>
                        </div>
                        <div class="input-box">
                            <p>{{ t('transfer_num') }}</p>
                            <div class="field-box num-box">
                                <van-icon name="minus" @click="handleNumChange(-1)" />
                                <van-field v-model="info.num" center class="field-input F-Bold" type="text"
                                    :placeholder="t('PleaseEnterTransferNum')">
                                </van-field>
                                <van-icon name="plus" @click="handleNumChange(1)" />
                            </div>
                        </div>
                        <div :class="['confirm-btn',isActiveBtn ? 'activeBtn' : '']" @click="handleConfirm">
                            {{ t('confirm_transfer') }}
                        </div>
                        <div class="confirm-cancel-btn" @click="showDonateRecoder=true">
                            {{ t('transfer_record') }}
                        </div>
                    </div>

                </div>
            </template>
            <template #footer> </template>
        </van-dialog>
        <DonateRecoder v-model:show="showDonateRecoder" />
    </div>
</template>

<script setup lang="ts">
import { transferBadge } from "@/api";
import { useI18n } from "vue-i18n";
import { showToastIcon ,getBadgeName} from '@/utils'
import DonateRecoder from './DonateRecoder.vue';
const { t } = useI18n();
const show = defineModel<boolean>("show");
const showDonateRecoder = ref(false);
const isActiveBtn = ref(false);
const currentBadge = ref<any[]>([])
const info = ref({
    address: '',
    num: 1,
})
const props = defineProps({
    continent_badge: {
        type: Array,
        default: () => []
    },
    country_badge: {
        type: Array,
        default: () => []
    }
})

const tabList = computed(() => reactive([
    {
        name: t('country_badge'),
        active: true,
        value: 0
    },
    {
        name: t('continent_badge'),
        active: false,
        value: 1
    }
]))

const selectedBadgeId = ref<number | null>(null);
const scrollBox = ref<HTMLElement | null>(null);
const showLeftShadow = ref(false);
const showRightShadow = ref(false);

onMounted(() => {
    nextTick(() => handleScroll());
})
const badgeImgs = import.meta.glob('/src/assets/imgs/badges/badge_*.png', { eager: true, import: 'default' });
function getBadgeImg(type: number) {
    return badgeImgs[`/src/assets/imgs/badges/badge_${type}.png`] as string;
}

const handleTabClick = (value: number) => {
    tabList.value.forEach((item, index) => {
        item.active = item.value === value;
        currentBadge.value = [...(value === 0 ? props.country_badge : props.continent_badge)];
    })
    if (currentBadge.value && currentBadge.value.length > 0) {
        selectedBadgeId.value = currentBadge.value[0].type;
        isActiveBtn.value = true;
    } else {
        selectedBadgeId.value = null;
        isActiveBtn.value = false;
    }
}

function selectBadge(id: number) {
    if(id!==selectedBadgeId.value) {
        info.value.num = 1;
    }
    selectedBadgeId.value = id;
}

function handleNumChange(num: number) {
    console.log(currentBadge.value.find(item => item.type === selectedBadgeId.value)?.num, 'currentBadge.value.find(item => item.id === selectedBadgeId.value)?.num')
    if (Number(info.value.num) + Number(num) > 0 && Number(info.value.num) + Number(num) <= currentBadge.value.find(item => item.type === selectedBadgeId.value)?.num) {
        info.value.num = Number(info.value.num) + Number(num);
    }
}
const emit = defineEmits(['finishDonate']);
async function handleConfirm() {
    if(!isActiveBtn.value) {
        return;
    }
    if (info.value.address.trim() === '') {
        showToastIcon(t('PleaseEnterTransfer'), 'fail');
        return;
    }
    const {code,data} = await transferBadge({
        address: info.value.address,
        num: Number(info.value.num),
        badge_type: selectedBadgeId.value
    })
    if(!code) {
        showToastIcon(t('transfer_success'), 'success');
        setTimeout(() => {
            show.value = false;
            emit('finishDonate',1);
        }, 2000);
    }
}

watch(show, () => {
    currentBadge.value = JSON.parse(JSON.stringify(props.country_badge));
    if (currentBadge.value && currentBadge.value.length > 0) {
        selectedBadgeId.value = currentBadge.value[0].type;
        isActiveBtn.value = true;
    } else {
        selectedBadgeId.value = null;
        isActiveBtn.value = false;
    }
}, {
    immediate: true,
    deep: true
})

function handleScroll() {
    const el = scrollBox.value;
    if (!el) return;
    showLeftShadow.value = el.scrollLeft > 2;
    showRightShadow.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 2;
}

watch(currentBadge, () => nextTick(() => handleScroll()));

</script>

<style scoped lang="scss">
.donate-container {
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

    .loading_text {
        margin-top: 3rem;
        color: #ccc;
        font-size: .88rem;
    }

    .bottom-line {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 0.75rem;
        margin-bottom: .4rem;

        .date-time {
            margin-left: 0 !important;
        }

        .describe {
            font-size: 0.75rem;
            color: #B2B2B2;
        }
    }

    .badge-img {
        width: 1.5rem;
        height: 1.5rem;
    }

    :deep(.dialog-box) {
        top: 50%;
        max-height: 90vh;
        overflow-y: scroll;
        width: 92%;
        background: #090909;
        border-radius: 0.75rem;
        border: 0.06rem solid #2C3436;
        padding: 0rem;

        .current-pledge-list-box {
            height: 27.63rem;
            overflow: auto;
        }

        .van-icon {
            font-weight: 900;
            font-size: 1rem;
            color: #fff;
        }

        .van-icon-minus {
            color: #5F5F5F;
        }

        .field-box {
            background-color: #090909;
            border-radius: 0.5rem;
            border: 0.06rem solid #2C3436;
            padding: 0.63rem 1rem;

            .van-cell {
                padding: 0;
            }

            :deep(.van-field__control) {
                color: #5F5F5F;
            }

            .field-input {
                background-color: #090909;
            }
        }
        .ftd-num-field .van-field__control {
            font-size: 1rem;
            color: #fff;
        }
        .num-box {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: nowrap;
            width: 40%;

            .field-input {
                width: fit-content;

                .van-field__control {
                    text-align: center;
                    font-size: 1rem;
                    color: #fff;
                }
            }
        }


        .input-box {
            margin-top: 1.06rem;
            color: #999999;
            font-size: .88rem;
            margin-bottom: 1rem;

            p {
                margin-bottom: .38rem;
            }
        }

        /* 弹窗内容 */
        .default-box {
            margin: 1.13rem 0.75rem 1.06rem;

            .title-line {
                padding-right: 0.44rem;
                display: flex;
                justify-content: right;
                margin-bottom: 0.81rem;
                border-bottom: 0.06rem solid #212225;
                padding-bottom: 0.81rem;

                .title {
                    font-size: 1rem;
                    color: #fff;
                }

                .close-img {
                    width: 1rem;
                    height: 1rem;
                }
            }

            .header-box {
                display: flex;
                align-items: center;
                padding: 0.31rem 0;
                position: relative;
                border-bottom: 0.06rem solid #212225;

                .tab-item {
                    position: relative;
                    font-size: 1rem;
                    color: #fff;
                    margin-right: 0.81rem;

                    &.active {
                        color: #FF3F3F;

                        &::after {
                            content: '';
                            display: block;
                            width: 100%;
                            height: .19rem;
                            background-color: #FF3F3F;
                            border-radius: 0.03rem;
                            position: absolute;
                            bottom: -5px;
                            left: 0;
                        }
                    }
                }
            }
        }
    }
}

.content-scroll-wrapper {
    position: relative;

    .content-box {
        display: flex;
        overflow-x: auto;
        padding: 1rem 0;
        scrollbar-width: none;

        &::-webkit-scrollbar {
            display: none;
        }
    }

    .scroll-shadow {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 1.2rem;
        pointer-events: none;
        z-index: 2;

        &.left {
            left: 0;
            background: linear-gradient(to right, rgba(9, 9, 9, 0.7) 60%, rgba(9, 9, 9, 0));
        }

        &.right {
            right: 0;
            background: linear-gradient(to left, rgba(9, 9, 9, 0.7) 60%, rgba(9, 9, 9, 0));
        }
    }
}

.content-box {
    display: flex;
    overflow-x: auto;
    padding: 1rem 0;

    .content-item {
        flex: 0 0 auto;
        // width: 6.75rem;
        // height: 9rem;
        margin-right: .81rem;
        text-align: center;
        border-radius: 0.38rem;
        background: #090909;
        border: 0.06rem solid #2C3436;
        padding: .63rem 1rem;
        cursor: pointer;
        font-weight: 600;

        img {
            width: 4.75rem;
            height: 4.75rem;
            margin-bottom: .56rem;
        }

        &.selected {
            border: 1px solid #FF3F3F;
            background: linear-gradient(180deg, #161515 0%, #0F0E0E 56%, #A32929 100%);
        }

        .badge-name {
            font-size: 1rem;
            color: #fff;
        }

        .F-num {
            font-size: .88rem;
            color: #B2B2B2;
            margin-bottom: .28rem;

            span {
                font-size: .75rem;
            }
        }
    }
}

.confirm-btn {
    width: 100%;
    height: 3.13rem;
    text-align: center;
    line-height: 3.13rem;
    background: #181717;
    border-radius: 0.5rem;
    color: #5F5F5F;
    &.activeBtn {
        background: linear-gradient(180deg, #FF3F3F 0%, #A32929 100%);
        color: #fff;
    }
}

.no-data {
    width: 100%;
    height: 190px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    color: #5F5F5F;
    text-align: center;
    font-weight: 600;
}
.confirm-cancel-btn {
    width: 100%;
    height: 3.13rem;
    text-align: center;
    line-height: 3.13rem;
    border-radius: 0.5rem;
    color: #5F5F5F;
}
</style>