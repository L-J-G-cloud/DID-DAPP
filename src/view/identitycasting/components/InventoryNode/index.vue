<template>
    <div class="buy-list-container">
        <div class="buy-list-content">
            <div class="buy-list-header">
                <div class="title">
                    <span class="left-icon"></span>
                    <span class="F-Bold">{{ t('InventoryNodes') }}</span>
                </div>
                <div class="right-title" @click="showTransferRecordDialog = true">
                    {{ t('TransferRecord') }}>
                </div>
            </div>
            <van-list v-if="listInfo.list.length" v-model:loading="listInfo.loading" :finished="listInfo.finished"
                :offset="10" :loading-text="t('loading')" :finished-text="''" @load="getInventoryList"
                class="current-pledge-list-box">
                <div class="buy-item-box" v-for="(item, index) in listInfo.list" :key="index"
                    :style="{ borderBottom: index === listInfo.list.length - 1 ? 'none' : '1px solid #1D1F22' }">
                    <div class="buy-item">
                        <div class="buy-item-left">
                            <img src="@/assets/imgs/identitycasting/node.png" alt="">
                            <div class="buy-item-left-content">
                                <p class="blc-text F-Bold"><span
                                        class="">{{ formatDecimal(decimalParseToNumber(item.amount, 18), 2) }}</span>
                                    <span> BLC</span></p>
                                <p class="multiple-text" v-if="item.transfer_from">
                                    {{ t('transfer_from') }}:  {{ getStr(item.transfer_from,4,4) }}
                                </p>
                            </div>
                        </div>
                        <div :class="{ 'buy-item-right': item.status == 0 }">
                            <p>
                                {{ store.lang === 'tw' ? getdata(item.create_time * 1000).timeDetail :
                                    getdata(item.create_time
                                        *
                                        1000).langEnYMS
                                }}
                            </p>
                            <p v-if="item.status == 0">
                                <span class="dot"></span> {{ t('confirming_block') }}
                            </p>
                        </div>
                    </div>
                    <div class="buy-item-bottom" v-if="item.status !== 0">
                        <p :class="store.isDonor ? 'left' : 'right'" @click="handleOpen(item)">{{t('open')}}</p>
                        <p class="right" @click="activeTransferDialog(item)" v-if="store.isDonor">{{t('Transfer')}}</p>
                    </div>
                </div>
            </van-list>
            <div class="no-record" v-if="!listInfo.list.length && !listInfo.loading">
                <!-- <img class="empty-img" src="@/assets/imgs/identitycasting/empty-record.png" alt="" /> -->
                <div class="empty-text">{{ t('NoContent') }}</div>
            </div>
            <van-skeleton title :row="3" v-if="listInfo.loading && !listInfo.list.length" class="list-box_lading" />
        </div>
        <TransferDialog v-model:show="showTransferDialog" :nodeId="nodeId" @transferFinish="handleTransferFinish" />
        <TransferRecordDialog v-model:show="showTransferRecordDialog" />
        
        <van-dialog v-model:show="showTip" title="" show-cancel-button class="dialog-confirm-box" @confirm="activeOpen" :confirmButtonText="t('OK1')" :cancelButtonText="t('Cancel')">
            <h4 class="title_dia F-Bold">{{t('tip')}}</h4>
            <p class="des">{{t('confirm_open')}}</p> 
        </van-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useStore } from '@/store/store';
import { useI18n } from 'vue-i18n';
import { getNodeInventory, openNode } from '@/api';
import { decimalParseToNumber, formatDecimal,getdata ,getStr} from '@/utils';
const store = useStore()
const { t } = useI18n()

const params = ref({
    start: 0,
    limit: 10,
})

const showTip = ref(false)
const showTransferDialog = ref(false)
const showTransferRecordDialog = ref(false)
const nodeId = ref('')
interface NodeItem {
    amount: string;
    multiple: number;
    create_time: number;
    status: number;
    transfer_from: string;
}

const listInfo = ref<{
    list: NodeItem[];
    total: number;
    loading: boolean;
    finished: boolean;
    status: number;
}>({
    list: [],
    total: 0,
    loading: false,
    finished: false,
    status: 0,
})

onMounted(() => {
    getInventoryList()
})

const handleTransferFinish = () => {
    showTransferDialog.value = false
    getInventoryList(1)
}

const activeTransferDialog = (item: any) => {
    nodeId.value = item.id
    showTransferDialog.value = true
}

const emit = defineEmits(['openAction'])

const handleOpen = (item: any) => {
    nodeId.value = item.id
    showTip.value = true
}

const activeOpen = async () => {
    showTip.value = false
    const { code ,data} = await openNode({node_id:nodeId.value})
    if (!code) {
        emit('openAction',data.multiple)
    }
    // emit('openAction',2)
}

const getInventoryList = async (type:number = 0) => {
    listInfo.value.loading = true;
    if(type) {
        params.value.start = 0;
        listInfo.value.list = [];
        listInfo.value.finished = false;
    }
    const { code, data, total } = await getNodeInventory(params.value);
    if (!code && data) {
        listInfo.value.loading = false;
        if (data.length) {
            listInfo.value.list = [...listInfo.value.list, ...data];
            params.value.start = listInfo.value.list.length;
            if (listInfo.value.list.length >= total) {
                listInfo.value.finished = true;
            }
        } else {
            listInfo.value.finished = true;
        }
        listInfo.value.total = total;
    } else {
        listInfo.value.loading = false;
        listInfo.value.list = [];
    }
}
defineExpose({
    getInventoryList
})
</script>

<style lang="scss" scoped>
.title {
    display: flex;
    align-items: center;
}

.title_dia {
  font-size: 1rem;
  text-align: center;
}
.des {
  width: 100%;
  text-align: center;
  font-size: .88rem;
  margin: 1.5rem 0 2rem;
}

.left-icon {
    display: inline-block;
    width: .31rem;
    height: 1rem;
    margin-right: .44rem;
    background-color: #FF3F3F;
    border-radius: .19rem;
}

.no-record {
    height: 3rem;
    display: flex;
    flex-direction: column;
    align-items: center;

    .empty-img {
        margin-top: 1.5rem;
        width: 2.63rem;
        // height: 3.94rem;
    }

    .empty-text {
        margin-top: 1.31rem;
        font-weight: 500;
        font-size: 0.75rem;
        color: #B2B2B2;
        line-height: 1.06rem;
    }
}

.buy-list-container {
    margin: .56rem .94rem;
    position: relative;
    border-radius: .38rem;
    padding: 0.75rem .94rem;
    border: 1px solid #353535;

    .buy-list-content {
        position: relative;
        z-index: 2;
    }

    .buy-list-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #1D1F22;
        padding-bottom: .56rem;
    }

    .right-title {
        color: #FF3F3F;
        font-size: .88rem;
    }

    .buy-item {
        padding: .56rem 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: .75rem;
        color: #606060;

        &:last-of-type {
            border-bottom: none;
        }

        img {
            width: 3.19rem;
            height: 3.19rem;
            margin-right: .56rem;
        }

        .buy-item-left {
            display: flex;
            align-items: center;
            justify-content: space-between;

            .multiple {
                color: #636363;
                font-size: .75rem;
                background-color: #202020;
                text-align: center;
                padding: 0 .25rem;
                border-radius: .13rem;
                margin-left: .25rem;
            }

            .blc-text {
                font-size: 1rem;
                line-height: 1.19rem;
                color: #fff;
            }

            .multiple-text {
                font-size: .75rem;
                line-height: .94rem;
                color: #999999;
            }
        }

        .buy-item-right {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            justify-content: center;

            .dot {
                display: inline-block;
                width: .5rem;
                height: .5rem;
                background-color: rgb(227, 210, 38);
                border-radius: 50%;
            }
        }
    }

    .buy-item-bottom {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding-bottom: .81rem;

        p {
            // padding: 0.38rem 3.8rem;
            width: 40%;
            height: 1.88rem;
            border-radius: .3rem;
            text-align: center;
            line-height: 1.88rem;
        }

        .left {
            background-color: #202020;
            color: #fff;
            margin-right: .56rem;
        }

        .right {
            background: linear-gradient(to right, #CD1B1C, #D21919);
            color: #fff;
        }
    }
}

.current-pledge-list-box {
    max-height: 17rem;
    overflow-y: scroll;

    /* 隐藏滚动条 - Webkit浏览器 (Chrome, Safari) */
    &::-webkit-scrollbar {
        width: 0;
        display: none;
    }

    /* 隐藏滚动条 - Firefox */
    scrollbar-width: none;

    /* 隐藏滚动条 - IE/Edge */
    -ms-overflow-style: none;
}
</style>