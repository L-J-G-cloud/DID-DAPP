<template>

    <div class="footer-box">
        <div class="icon-box">
            <a href="mailto:help@42force.org" target="_blank">
                <img src="@/assets/imgs/home/email.png" alt="">
            </a>
            <a href="https://medium.com/@42force42force" target="_blank">
                <img src="@/assets/imgs/home/media.png" alt="">
            </a>
            <a href="https://x.com/42force42force?s=11" target="_blank">
                <img src="@/assets/imgs/home/x.png" alt="">
            </a>
        </div>
        <div>
            {{ t("force_alliance") }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { t } = useI18n();
</script>

<style lang="scss" scoped>
.footer-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: .88rem;
    color: #666;
    margin-top: 1.13rem;
    background: url('@/assets/imgs/footer_bg.png') no-repeat bottom right;
    background-size: auto 100%;
    padding-bottom: 2rem;

    .icon-box {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1.58rem;

        a {
            margin-right: .94rem;
            img {
                width: 2.63rem;
                height: 2.63rem;
                &:last-child {
                    margin-right: 0;
                }
            }
        }
    }
}
</style>