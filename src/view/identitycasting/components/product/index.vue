<template>
    <div class="product-container">
        <Head />
        <div class="product-content">
            <div class="ID-card">
                <div class="ID-card-title">
                    <h4>Global Digital Identity Alliance</h4>
                    <p>Identity Card</p>
                </div>
                <img src="@/assets/imgs/product/did-logo.png" alt="" class="did-logo">
                <div class="ID-card-content">
                    <img src="@/assets/imgs/product/people.png" alt="" class="people-icon">
                    <div class="center-content">
                        <p>
                            <span>LN: <i class="text-white">--</i></span>
                            <span>FN: <i class="text-white">--</i></span>
                        </p>
                        <p>
                            <span>SEX: <i class="text-white">--</i></span>
                            <span>DOB: <i class="text-white">----/----</i></span>
                        </p>
                        <p>
                            <span>ISS: <i class="text-white">----/----</i></span>
                            <span>EXP: <i class="text-white">----/----</i></span>
                        </p>
                        <p><span>ID# <i class="text-white">---------</i></span></p>
                    </div>
                    <div class="unlink-content">
                        身份未上链
                    </div>
                </div>
            </div>

            <div class="product-tips">
                <h4>Global Digital Identity Alliance </h4>
                <p class="product-tips-text"> 产品展示中心</p>
            </div>
            <div class="product-item-box">
                <div class="product-item">
                    <img src="@/assets/imgs/product/product_did.png" alt="" class="product-item-icon">
                    <div class="product-item-text">
                        <p class="product-item-text-title F-Bold">DID产品</p>
                        <p class="product-item-text-content">-- <span>积分</span></p>
                    </div>
                    <div class="product-item-btns">
                        <div class="btns">立即兑换</div>
                    </div>
                    <div class="product-item-btns-box">
                         <p class="F-Bold">即将上线</p>
                    </div>
                </div>
                <div class="product-item">
                    <img src="@/assets/imgs/product/product_did.png" alt="" class="product-item-icon">
                    <div class="product-item-text">
                        <p class="product-item-text-title F-Bold">DID产品</p>
                        <p class="product-item-text-content">-- <span>积分</span></p>
                    </div>
                    <div class="product-item-btns">
                        <div class="btns">立即兑换</div>
                    </div>
                    <div class="product-item-btns-box">
                         <p class="F-Bold">即将上线</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import Head from '@/view/identitycasting/components/Head.vue';
import { ref } from 'vue';
const productDialog = ref();
</script>
<style scoped lang="scss">
.product-container {
    width: 100%;
    height: 100%;
    padding: 0 .75rem;
    max-width: 500px;
    margin: 0 auto;
    
    // PC端适配
    @media (min-width: 768px) {
      padding: 6rem 1.2rem 0;
    }

    .product-content {
        width: 100%;
        height: 100%;
        padding: 4.5rem 1rem 0;
        border-radius: .38rem;

        .ID-card {
            width: 100%;
            height: auto;
            padding: .8rem 0 2rem;
            border-radius: .38rem;
            // min-height: 11rem;
            margin-bottom: 1rem;
            background: url('@/assets/imgs/product/Id_bg.png') no-repeat center center;
            background-size: 100% 100%;
            .did-logo {
                width: 100%;
            }
            .ID-card-title {
               padding: 0 .8rem;
            }
        }

        .ID-card-content {
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            display: flex;
            justify-content: space-between;
            margin-top: -.5rem;
            padding: 0 .8rem;
            .people-icon {
                width: 4rem;
                height: 4rem;
                margin-right: 1rem;
            }

            .center-content {
                width: 100%;
                height: 100%;

                p {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: .5rem;

                    &:last-child {
                        margin-bottom: 0;
                    }

                    span {
                        display: inline-block;
                        width: 78px;
                        text-align: left;
                        font-size: .75rem;
                        line-height: 1.006rem;
                        color: #CCF296;
                    }
                }
            }

            .unlink-content {
                height: 1.2rem;
                line-height: 1.1rem;
                background-color: rgba(255, 213, 135, 0.16);
                border: 1px solid #FFD587;
                border-radius: .13rem;
                color: #FFD587;
                font-size: .75rem;
                white-space: nowrap;
                align-self: flex-end;
                margin-bottom: -1.5rem;
                padding: 0 .2rem;
            }
        }
    }

    .product-tips {
        width: 100%;
        height: auto;
        padding: .8rem .8rem 1.4rem;
        border-radius: .38rem;
        margin-bottom: .5rem;
        background: url('@/assets/imgs/product/sbu_bg.png') no-repeat;
        background-size: 100% 100%;
        h4 {
            font-size: 1rem;
            line-height: 1.38rem;
            font-weight: 600;
            width: 60%;
        }

        .product-tips-text {
            font-size: .88rem;
            line-height: 1.25rem;
            color: #BAF296;
            position: relative;

            &::after {
                position: absolute;
                bottom: -.5rem;
                left: 0;
                content: '';
                display: inline-block;
                width: 20%;
                height: 4px;
                background-color: #1DCC89;
            }
        }
    }

    .product-item-box {
        width: 100%;
        height: auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;

        .product-item {
            width: 48%;
            height: auto;
            border-radius: .38rem;
            background-color: #272830;
            position: relative;
            .product-item-icon {
                width: 100%;
                height: 10rem;
            }

            .product-item-text {
                padding: .63rem .75rem;
                font-size: .88rem;
                line-height: 1.25rem;
                color: #828592;

                .product-item-text-title {
                    font-size: 1rem;
                    line-height: 1.38rem;
                    color: #fff;
                    margin-bottom: .5rem;
                }

                .product-item-text-content {
                    font-size: .88rem;
                    line-height: 1.25rem;
                    color: #fff;

                    span {
                        font-size: .88rem;
                        line-height: 1.25rem;
                        color: #828592;
                    }
                }
            }

            .product-item-btns {
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                padding: 0 .5rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: .75rem;
                
                .btns {
                    width: 100%;
                    height: 100%;
                    box-sizing: border-box;
                    background-color: #1DCC89;
                    border-radius: .38rem;
                    text-align: center;
                    line-height: 1.25rem;
                    color: #1E2741;
                    font-size: .88rem;
                    font-weight: bold;
                    padding: .5rem 0;
                }
            }

        }
    }
    .product-item-btns-box {
        position: absolute;
        z-index: 2;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100%;
        height: 100%;
        background: url('@/assets/imgs/product/mask.png') no-repeat center center;
        background-size: 100% 100%;
        p {
            font-size: 1.13rem;
            line-height: 1.19rem;
            width: 40px;
            color: #fff;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
    }
}
</style>