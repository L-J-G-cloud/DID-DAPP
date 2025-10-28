<template>
    <div>
        <h1>Pledge DID</h1>
        <van-field v-model="info.Amount" center clearable class="num-field F-Bold field-box" type="number"
            :placeholder="t('PleaseEnter')" @input="checkBalance">
            <template #button>
                <span class="SYS">DID</span>
            </template>
        </van-field>

        <div>DID Balance: {{ info.DIDBalance }}</div>{{ info.isEnoughBalance }}
        <van-button type="primary" :disabled="!info.isEnoughBalance" @click="pledgeDID">{{ info.isApprove ? '授权' : '质押'
            }}</van-button>
    </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useI18n } from "vue-i18n";
import { getTokenBalance, getContractAddress, depositDID, decimalParseToBigNumber, getTokenAllowBalance, approval } from '@/api/mapcontract';
import { useStore } from '@/store/store';
import { showToastIcon, showLoading, closeToastLoading } from '@/utils';
const store = useStore();
const { t } = useI18n();
const info = reactive<any>({
    Amount: '',
    DIDBalance: '',
    allowBalanceDID: '',
    isApprove: true,
    isEnoughBalance: true,
});
onMounted(async () => {
    store.contractInfo.depositDID = await getContractAddress('DepositDID');
    store.contractInfo.DID = await getContractAddress('DID');
    checkBalance();
})

const checkBalance = async () => {
    info.DIDBalance = await getTokenBalance( store.contractInfo.DID, store.account, 18);
    if ( Number(info.Amount) <= 0) { return }
    info.isEnoughBalance = Number(info.DIDBalance) >= Number(info.Amount);
    console.log(info.isEnoughBalance, 'info.isEnoughBalance')
    info.allowBalanceDID = await getTokenAllowBalance( store.contractInfo.DID, store.account, 18, store.contractInfo.depositDID);
    console.log(info.DIDBalance, info.allowBalanceDID, 'info.DIDBalance, info.allowBalanceDID')
    info.isApprove = Number(info.allowBalanceDID) < Number(info.Amount);
}

const pledgeDID = async () => {
    showLoading();
    if (info.isApprove) {
        approvalAction();
        return;
    }
    const hash = await depositDID({
        amount: decimalParseToBigNumber(info.Amount, 18).toString(),
        durationDays: 1,
    });
    showToastIcon(t("StakeSuccessful"), 'success')
    closeToastLoading();
}

const approvalAction = async () => {
    // 对于 DID 质押，总是授权 DID 代币
    await approval(store.contractInfo.DID, store.account, store.contractInfo.depositDID, info.Amount, 18, () => {
        showToastIcon(t("Authorizationsuccessful"), 'success')
        checkBalance();
    }, () => {
        showToastIcon(t("AuthorizationFail"), 'fail')
    });
}

const changeAmount = (value: string) => {
    console.log(info.Amount, 'info.Amount')
}
</script>




<style scoped lang="scss">
.num-field {
    :deep(.van-field__control) {
        color: #000;
        background: transparent;
    }
}
</style>