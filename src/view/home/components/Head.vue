<template>
  <div class="container-fluid text-center top">
    <div class="d-flex justify-content-between align-items-center head_box">
      <div class="text-start">
        <img
          src="../../../assets/imgs/logo.png"
          alt=""
          class="logo"
          @click="backHome"
        />
      </div>
      
      

      <div class="text-end d-flex head">
        <div class="lang_box" @click="langShow=true">
          <img src="@/assets/imgs/home/lang.png" alt="">
        </div> 
         <!-- 语言弹窗 -->
        <langs-dialog
          v-model:visible="langShow"
        ></langs-dialog>
        <button type="button" :class="['btn d-flex align-items-centerl',!store.account?'bg_con':'dis_co']">
          <span v-if="!store.account" @click="walletChooseConnet" class="text_conet">
            {{ t('ConnectWallet') }}
          </span>
          <span v-else @click="exit">
            <img src="@/assets/imgs/home/exit.png" alt="" class="to_connet" />
            {{t('Exit') }}
          </span>
        </button>
      </div>
    </div>
  </div>
  <Draw
    :list="menuList"
    @active="go"
    @handleClose="handleClose"
    :drawer="drawer"
    @close="drawer = false"
    v-show="drawer"
  />

  <div class="warp" v-if="connetDialogShow">
    <div class="dialog">
      <slot>
        <div class="d-flex flex-column">
          <img
            src="@/assets/imgs/home/close.png"
            alt=""
            class="close"
            @click="connetDialogShow = false"
          />
          <div class="d-flex flex-column align-items-center connet-box">
             <img src="@/assets/imgs/home/connet_logo.png" alt="" class="logo_img">
             <p>{{t('ConnectBNBChain')}}</p>
          </div>

          <div class="connet_item d-flex align-items-center" @click="walletToConnet(1)">
             <p class="wrap_img">
              <img src="@/assets/imgs/home/meta_mask.png" alt="" class="meta">
             </p>
             <span>MetaMask</span>
          </div>

          <div class="connet_item d-flex align-items-center" @click="walletToConnet(2)">
            <p class="wrap_img">
              <img src="@/assets/imgs/home/wallet_connet.png" alt="" class="wallet">
            </p>
             <span>WalletConnect</span>
          </div>
        </div>
      </slot>
    </div>
  </div>

  <van-dialog v-model:show="show" title="" show-cancel-button class="dialog-confirm-box" @confirm="confirmExit" :confirmButtonText="t('OK1')" :cancelButtonText="t('Cancel')">
    <h4 class="title_dia F-Bold">{{t('tip')}}</h4>
    <p class="des"> {{t('areYouOut')}} {{getStr(store.account,8,4) }} {{t('mei')}}</p> 
  </van-dialog>
</template>

<script setup lang='ts'>
import { onMounted, reactive, ref, watch } from "vue";
import { connect,run} from "../../../plugin/metamask";
import detectEthereumProvider from "@metamask/detect-provider";
import { WalletConnet } from "../../../plugin/walletconnet";
import { showLoadingToast, closeToast } from "vant";
import { useRouter } from "vue-router";
import { useStore } from "../../../store/store";
import { storeToRefs } from "pinia";
import { getStr, isPc } from "../../../utils";
import { disconnect, resetApp } from "../../../plugin/walletconnet";
import { getSignData, isRegister ,register} from "@/api";
import useLocal from "@/plugin/useLocale";
import { useI18n } from "vue-i18n";
import { create } from "domain";
import noCheck from '@/assets/imgs/header/no_check.png'
import Checked from '@/assets/imgs/header/Checked.png'
import LangsDialog from "./langsDialog.vue";
const { t } = useI18n();
const {
  changeLocal,
} = useLocal();
const pc = isPc();
const router = useRouter();
const drawer = ref(false);
const showPopover = ref(false);
const store = useStore();
const dialog = ref();
const langShow = ref(false);
// const langs = reactive([
//   {
//     isChecked:true,
//     value:'en',
//     text:'English'
//   },
//   {
//     isChecked:false,
//     value:'tw',
//     text:'繁体中文'
//   }
// ])
const connetDialogShow = ref(false);
const { account, token, menuList } = storeToRefs(store);
const go = (item: any) => {
  if (item.router != "/" && account.value == "") {
    connetDialogShow.value = true;
    return;
  }
  if ((!account.value || !token.value) && item.router != "/") {
    return;
  }
  menuList.value.forEach((el) =>
    el.id === item.id ? (el.active = true) : (el.active = false)
  );
  router.push(item.router);
  handleClose();
};

const show = ref(false);

onMounted(() => {
  // if (window.location.href.includes("?address=")) {
  //   const codeAddress = window.location.href.split("?")[1];
  //   let address = ''
  //   if(codeAddress.includes('&')) {
  //     address = codeAddress.split('&')[0].split('=')[1];
  //   }else{
  //     address = codeAddress.split('=')[1];
  //   }
  //   store.referrer = address;
  // }
  if(window.location.href.includes('&&token=')){
    const info = window.location.href.split("?")[1].split('&&');
    let address = info[0].split('=')[1];
    let token = info[1].split('=')[1];
    let isWalletConnet = info[2].split('=')[1];
    store.isWalletConnet = isWalletConnet === '1' ? true : false;
    localStorage.isWalletConnet = isWalletConnet === '1' ? true : false;
    // console.log(info,address,token,'info')
    store.token = token;
    localStorage.blckToken = token;
    store.account = address;
    localStorage.blckAddress = address;
  }
  run();
  // console.log(store.lang)
  // if(store.lang){
  //   langs.forEach(item=>item.isChecked = item.value==store.lang?true:false);
  // }
 
});
const handleClose = () => {
  drawer.value = false;
};

const backHome = () => {
  if(store.account&&store.token){
    router.push('/');
  }else{
    router.push('/register');
  }
}

watch(
  () => store.account,
  (newVal) => {
    //监听钱包的链接
    if (newVal) {
    //   regLog(newVal);
    }
  }
);
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
  console.log(type,'type')
  store.is_exit_flag = 0;
  showLoadingToast({
      message: t('loading'),
      forbidClick: false,
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
      // showPopover.value = false;
      closeToast();
		});
  }
};

const exit = () => {
  show.value = true;
};

const confirmExit = ()=>{
  store.is_exit_flag = 1;
  if(store.isWalletConnet){
    disconnect();
  }else{
    store.account = "";
  }
  store.exit();
}
</script>
<style scoped lang='scss'>

.lang_box {
  img {
    width: 1.38rem;
    height: 1.38rem;
    margin-right: .5rem;
  }
 
}
.items_lang {
  padding: 1rem .94rem 0;
  width: 13rem;
  box-sizing: border-box;
  img {
    width: 1.19rem;
    height: 1.19rem;
  }
  &:last-child {
    margin-bottom: 1.19rem;
  }
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
.con-address {
  color: #fff;
  // padding-bottom: 1.2rem;
  // border-bottom: 1px solid #313131;
  img {
    width: 2.5rem;
  }
}
.logo_img {
  width: 7.19rem;
  margin-bottom: .3rem;
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

img {
  cursor: pointer;
}
.to_connet {
  width: 1.1875rem;
  margin-right: 5px;
  font-size: .75rem;
}
.text_conet {
  white-space: nowrap;
  color: #fff;
}
.lang {
  width: 2.38rem;
  margin-right: 10px;
}
.close {
  align-self: flex-end;
  width: 16px;
  cursor: pointer;
}
.connet-box {
  padding: 2.4rem 2rem 1.2rem;

  .connet {
    width: 67px;
    cursor: pointer;
    margin-bottom: 26px;
  }
}

.exit {
  padding-top: 0.5rem;
  color: #fff;
  cursor: pointer;

  img {
    margin-top: -4px;
    width: 14px;
    // vertical-align: baseline;
  }
}

.top {
  background-color: #0A0809;
  position: fixed;
  padding: 15px;
  padding-bottom: 10px;
  z-index: 99;
}

.logo {
  // max-width: 9.625rem;
  width: 10.06rem;
  // height: 2.13rem;
  margin-right: .75rem;
}
.head_box {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.head {
  display: flex;
  align-items: center;
  .walleted {
    display: flex;
    align-items: center;
    padding: 3px 12px 3px 0;
    background-color: #121212;
    border-radius: 20px;

    .xia {
      display: inline-block;
      transform: scale(0.6);
      color: #fff;
      font-size: 12px;
    }

    img {
      width: 33px;
      vertical-align: middle;
      margin-right: 10px;
    }
  }
}

.box {
  background-color: #121212;

  li {
    margin-right: 5.5625rem;
    position: relative;
    cursor: pointer;

    a {
      text-decoration: none;
      color: #fff;

      &.active::after {
        content: "";
        display: inline;
        width: 100%;
        height: 0.3125rem;
        background: linear-gradient(to right, #CD1B1C, #D21919);
        position: absolute;
        bottom: -1.125rem;
        left: 0;
        border-radius: 0.3125rem;
      }
    }

    @media screen and (max-width: 1245px) {
      margin-right: 2.5rem;
    }

    @media screen and (max-width: 820px) {
      margin-right: 1.3rem;
      font-size: 0.85rem;
    }

    @media screen and (max-width: 992px) {
      margin-right: 1.3rem;
      font-size: 0.9rem;
    }

    @media screen and (max-width: 768px) {
      margin-right: 1.3rem;
      font-size: 0.6rem;
    }
  }
}

.btn {
  height: 2.5rem;
  border-radius: 1.25rem;
  color: #1E2741;
  font-size: 1rem;
  border: 1px solid #2a2d33;
  padding: .38rem .88rem .38rem .69rem;
  &:hover,&:active {
    color: rgba(30, 39, 65, .8) !important;
    // background:linear-gradient(to right, #CD1B1C, #D21919) !important;
  }
  @media screen and (max-width: 992px) {
    font-size: 0.85rem;
  }
}
.bg_con {
  background-color: #CF1A1B !important;
}
.dis_co {
  background-color: #202328 !important;
  border: 1px solid #2A2D33 !important;
  color: #fff !important;
  &:hover,&:active {
    color: #fff !important;
    background-color: rgba(45, 48, 59, 1) !important;
  }
}

.menu {
  display: none;
}

@media screen and (max-width: 810px) {
  .btn {
    font-size: 12px;
    height: auto;
  }

  .box {
    display: none !important;
  }

  .menu {
    display: inline-block;
    font-size: 17px;
    margin-left: 1rem;
  }
}
</style>


