<template>
    <div class="transfer-dialog">
        <van-dialog v-model:show="show" class="dialog-box" :z-index="100" :closeOnClickOverlay="true"
            @close="handleClickCancel">
            <!-- 弹窗内容 -->
            <template #default>
                <div class="header">
                    <div class="title-line d-flex justify-content-between align-items-center">
                        <div class="title">
                            <span class="left-icon"></span>
                            <span>{{ t('Transfer') }}</span>
                        </div>
                        <img class="close-img" src="@/assets/imgs/home/close.png" alt="" @click="handleClickCancel" />
                    </div>
                </div>
                <div class="transfer-address">
                    <p class="transfer-address-title">{{t('TransferAddress')}}</p>
                    <div class="con_box">
                        <div class="card_con">
                            <div class="card_top F-Bold">
                                <van-cell-group inset>
                                    <van-field v-model="info.address" rows="2" autosize label="" type="textarea"
                                        :placeholder="t('PleaseEnter')" class="address-field" />
                                </van-cell-group>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
            <!-- 底部按钮 -->
            <template #footer>
                <div class="footer-box">
                    <van-button :class="['btn-item F-Bold dis']" @click="handleClickCancel">{{ t("Cancel")
                        }}</van-button>
                    <van-button :class="['btn-item F-Bold', 'confirm']" @click="handleClickConfirm">{{ t("confirm")
                        }}</van-button>
                </div>
            </template>
        </van-dialog>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { showToastIcon } from '@/utils'
import { transferNode } from '@/api'
const { t } = useI18n()
const show = defineModel<boolean>("show");
const emit = defineEmits(["transferFinish"]);

const props = defineProps({
    nodeId: {
        type: String,
        default: ''
    }
})

const info = ref({
    address: '',
})

const isBscAddress = (address: string) => /^0x[a-fA-F0-9]{40}$/.test(address)

const handleClickCancel = () => {
    info.value.address = '';
    show.value = false
}
const handleClickConfirm = async () => {
    if (!info.value.address.trim()) {
        showToastIcon(t('PleaseEnterTransferAddress'), 'fail')
        return
    }
    if (!isBscAddress(info.value.address.trim())) {
        showToastIcon(t('AddressFormatError'), 'fail')
        return
    }
    const { code } = await transferNode({node_id:props.nodeId,address:info.value.address})
    if (!code) {
        showToastIcon(t('TransferSuccess'), 'success')
        setTimeout(() => {
            info.value.address = '';
            show.value = false
            emit('transferFinish')
        }, 3000)
    }

}
</script>

<style lang="scss" scoped>
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

.transfer-dialog {

    .line {
        width: 100%;
        height: 1px;
        margin: .3rem 0;
    }

    :deep(.dialog-box) {
        width: 90%;
        max-width: 370px;
        background-color: #090909;
        border-radius: 0.75rem;
        border: 1px solid #2C3436;
        box-sizing: border-box;
        padding: 1rem .9rem 1.56rem;

        /* 弹窗内容 */
        .header {
            // text-align: center;
            font-size: 1rem;
            margin-bottom: .5rem;
            padding: 0 0 .56rem;
            border-bottom: 1px solid #2C3436;

            .tips {
                font-size: .88rem;
                color: #B2B2B2;
            }

            img {
                width: 1rem;
                height: 1rem;
            }
        }


        /* 底部按钮 */
        .footer-box {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 1rem;

            .btn-item {
                width: 47%;
                height: 2.5rem;
                font-weight: bold;
                font-size: 0.8rem;
                line-height: 1.19rem;
                border-radius: 0.25rem;
                border: none;
                color: #fff;
                background-color: #FF3F3F;
                padding-left: 0;
                padding-right: 0;
            }

            .dis {
                color: #7C7C7C;
                border: none;
                background-color: #202020;
            }
        }
    }

    .transfer-address-title {
        font-size: .75rem;
        color: #B2B2B2;
        line-height: 1.06rem;
        margin-bottom: .5rem;
    }

    .van-cell-group {
        background-color: #090909;
        border-radius: 0.5rem;
        border: 1px solid #2C3436;

        margin: 0;

        .van-cell {
            background-color: #090909;
            padding: 0.5rem;
        }
    }

    /* FTD数量输入框 */
    // .van-cell-group {
    ::deep(.van-field__control) {
        font-weight: bold;
        font-size: 1rem !important;
        color: #fff;
        line-height: 1.38rem !important;
        font-family: 'F-Bold';

        &::placeholder {
            font-weight: 400;
            color: #5F5F5F;
            font-size: 1rem !important;
            line-height: 1.38rem !important;
        }
    }

    // }
}
</style>

<style lang="scss">
.address-field {
    .van-field__control {
        font-weight: bold;
        font-size: 1rem;
        color: #fff;
        line-height: 1.38rem;
        font-family: 'F-MontserratBold';
        font-weight: bold;
        font-style: normal;
        font-display: swap;

        &::placeholder {
            font-weight: 400;
            color: #535353;
            font-size: 16px;
        }
    }

    .van-field__control {
        height: 2.5rem;
    }
}
</style>
