<template>
    <div class="content-box">
        <div class="invite-left-box">
            <img src="@/assets/imgs/identitycasting/share.png" alt="" class="share-icon">
            <div>
                <p class="F-Bold invite-text">我要邀请</p>
                <p class="invite-address-box" @click="handleCopy"><span class="invite-address-text">邀请地址</span> <span
                        class="invite-address-value">{{ getStr(store.account,6,6) }}</span> <img
                        src="@/assets/imgs/identitycasting/copy.png" alt="" class="copy-icon"></p>
            </div>
        </div>
        <img src="@/assets/imgs/identitycasting/invite_arr.png" alt="" class="invite-right-icon" @click="router.push('/inviterecord')">

    </div>
</template>

<script setup lang="ts">
import { getStr } from '@/utils';
import { useStore } from '@/store/store';
import CopyToClipBoard from "copy-to-clipboard";
import {showToastIcon} from '@/utils'
import { useRouter } from 'vue-router';
const router = useRouter();
const store = useStore();
const handleCopy = () => {
    CopyToClipBoard(store.account);
    showToastIcon('地址已复制', 'success',1000);
}
</script>
<style scoped lang="scss">
.content-box {
    display: flex;
    justify-content: space-between;
    padding: .75rem;
    background-color: #272830;
    border-radius: .38rem;
    margin-bottom: 1rem;

    .share-icon {
        width: 2.5rem;
        height: 2.5rem;
        margin-right: .56rem;
    }

    .invite-left-box {
        display: flex;
        align-items: center;
    }

    .invite-text {
        font-size: 1rem;
        line-height: 1.25rem;
        color: #fff;
    }

    .invite-address-box {
        display: flex;
        align-items: center;

        .invite-address-text {
            font-size: .88rem;
            line-height: 1.25rem;
            color: #828592;
        }

        .invite-address-value {
            font-size: .75rem;
            line-height: .94rem;
            color: #1DCC89;
            margin: 0 .4rem;
        }
    }

    .invite-right-icon {
        width: .88rem;
        height: .88rem;
    }

    .copy-icon {
        width: .63rem;
        height: .63rem;
    }
}
</style>