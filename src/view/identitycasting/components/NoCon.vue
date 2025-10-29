<template>
  <div class="no_con_box">
    <Head />
      <div class="con_box">
        <img src="@/assets/imgs/header/to_connet.png" alt="">
        <div class="text">{{t('connectyourwallet')}}</div>
        <div class="btns" @click="walletChooseConnet">{{t('ConnectWallet')}}</div>
      </div>
      <div class="warp" v-if="connetDialogShow">
        <div class="dialog">
          <slot>
            <div class="d-flex flex-column">
              <img
                src="@/assets/imgs/identitycasting/close.png"
                alt=""
                class="close"
                @click="connetDialogShow = false"
              />
              <div class="d-flex flex-column align-items-center connet-box">
                <img src="@/assets/imgs/identitycasting/connet_logo.png" alt="" class="logo_img">
                <p>{{t('ConnectBNBChain')}}</p>
              </div>

              <div class="connet_item d-flex align-items-center" @click="walletToConnet(1)">
                <p class="wrap_img">
                  <img src="@/assets/imgs/identitycasting/meta_mask.png" alt="" class="meta">
                </p>
                <span>MetaMask</span>
              </div>

              <div class="connet_item d-flex align-items-center" @click="walletToConnet(2)">
                <p class="wrap_img">
                  <img src="@/assets/imgs/identitycasting/wallet_connet.png" alt="" class="wallet">
                </p>
                <span>WalletConnect</span>
              </div>
            </div>
          </slot>
        </div>
      </div>
  </div>
</template>

<script setup lang='ts'>
import {reactive,ref} from 'vue'
import { connect,run } from "@/plugin/metamask";
import { WalletConnet,disconnect } from "@/plugin/walletconnet";
import { showLoadingToast, closeToast } from "vant";
import detectEthereumProvider from "@metamask/detect-provider";
import { storeToRefs } from "pinia";
import { useStore } from "../../../store/store";
import { useI18n } from "vue-i18n";
import Head from '@/view/identitycasting/components/Head.vue'
const store = useStore();
const { t } = useI18n();
const { account, token, menuList, connetDialogShow } = storeToRefs(store);

const provider = ref(null);
const walletChooseConnet = async () => {
  showLoadingToast({
    message: t('loading'),
    forbidClick: true,
    duration: 0,
  });
  provider.value = await detectEthereumProvider()
  closeToast();
  if(provider.value) {
    walletToConnet(1)
  }else{
    connetDialogShow.value = true;
  }
}


const walletToConnet = async (type:number) => {
  store.is_exit_flag = 0;
  showLoadingToast({
      message: t('loading'),
      forbidClick: true,
      duration: 0,
    });
  if(type==1) {
    if (provider.value) {
      connect(()=>{
        connetDialogShow.value = false;
        // showPopover.value = false;
        closeToast();
			})
		}else{
			const dappUrl = location.origin;
			const metaMaskDeepLink = `https://metamask.app.link/dapp/${dappUrl}`;
			window.open(metaMaskDeepLink)
      closeToast();
		}
  }
  
  if(type==2) {
    connetDialogShow.value = false;
    WalletConnet(()=>{
      closeToast();
		});
  }


  // WalletConnet()
  // detectEthereumProvider()
  //   .then((provider) => {
  //     if (!provider) {
  //       WalletConnet();
  //     } else {
  //       connect();
  //     }
  //   })
  //   .catch((err) => {
  //     console.log(err, "err");
  //   })
  //   .finally(() => {
  //     showPopover.value = false;
  //     connetDialogShow.value = false;
  //     closeToast();
  //   });
};
</script>
<style scoped lang='scss'>
.no_con_box {
    // min-height: 100vh;
    // min-width: 100vw;
    max-width: 460px;
    margin: auto;
    background: url('@/assets/imgs/identitycasting/to_connet_bg.png') no-repeat bottom;
    background-size: contain;
    background-color: #1E1F25;
    .con_box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      img {
        width: 5.88rem;
        height: 6.6rem;
      }
      .text {
        text-align: center;
        margin: 1.06rem 0 1rem;
        color: #FFFFFF;
      }
      .btns {
        cursor: pointer;
        min-width: 7.5rem;
        padding:  0 1rem;
        height: 2.19rem;
        text-align: center;
        line-height: 2.19rem;
        background: #1DCC89;
        color: #1E2741;
        border-radius: .5rem;
      }
    }
}

.logo_img {
  width: 7.19rem;
  margin-bottom: .3rem;
}
.connet-box {
  padding: 2.4rem 2rem 1.2rem;

  .connet {
    width: 67px;
    cursor: pointer;
    margin-bottom: 26px;
  }
}
.connet_item {
  font-size: 1rem;
  color: #fff;
  width: 100%;
  padding: 1rem 1.44rem;
  border: 1px solid #2E2E2E;
  border-radius: 3rem;
  margin-bottom: .56rem;
  cursor: pointer;
  &:nth-last-child(1) {
    margin-bottom: 0;
  }
  
  .wrap_img {
    min-width: 3rem;
    text-align: center;
    margin-right: 1rem;
  }
  .meta {
    width: 1.78rem;
    height: 1.63rem;
  }
  .wallet {
    width: 2.89rem;
    height: 1.63rem;
  }
}
.close {
  align-self: flex-end;
  width: 16px;
  cursor: pointer;
}
</style>