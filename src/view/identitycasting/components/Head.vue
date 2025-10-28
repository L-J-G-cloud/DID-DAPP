<template>
  <div class="container-fluid text-center top">
    <div class="d-flex justify-content-between align-items-center head_box">
      <div class="text-start">
        <img src="../../../assets/imgs/header/top_logo.png" alt="" class="logo" @click="backHome" />
      </div>

      <div class="text-end d-flex head">
        <div class="lang_box" @click="langShow = true">
          <img src="@/assets/imgs/identitycasting/lang.png" alt="">
        </div>
        <!-- 语言弹窗 -->
        <langs-dialog v-model:visible="langShow"></langs-dialog>
        <button type="button" :class="['btn d-flex align-items-centerl']">

          <img :src="!store.account ? wallet : people" alt="" class="left_img">
          <span @click="walletChooseConnet" class="text_conet" v-if="!store.account">
            {{ t('ConnectWallet') }}
          </span>


          <div v-else class="wallet-dropdown-container">
            <p class="d-flex align-items-center" @click="toggleWalletDropdown">
              <span class="text_conet">{{ getStr(store.account, 4, 4) }}</span>
              <img src="@/assets/imgs/header/select_down.png" alt="" class="select_down"
                :class="{ 'rotate': showWalletDropdown }">
            </p>

            <!-- 钱包下拉菜单 -->
            <div v-if="showWalletDropdown" class="wallet-dropdown">
              <div class="dropdown-item" @click="logout">
                <img src="@/assets/imgs/header/exit.png" alt="" class="logout-icon">
                <span>{{ t('Logout') }}</span>
              </div>
            </div>
          </div>
        </button>
        <div class="menu-item" @click="showMenuPopup = true">
          <img src="@/assets/imgs/header/menu.png" alt="" class="menu_img">
        </div>
      </div>
    </div>
  </div>

  <div class="warp" v-if="connetDialogShow">
    <div class="dialog">
      <slot>
        <div class="d-flex flex-column">
          <img src="@/assets/imgs/identitycasting/close.png" alt="" class="close" @click="connetDialogShow = false" />
          <div class="d-flex flex-column align-items-center connet-box">
            <img src="@/assets/imgs/identitycasting/connet_logo.png" alt="" class="logo_img">
            <p>{{ t('ConnectBNBChain') }}</p>
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


  <!-- 左侧菜单 -->
  <van-popup v-model:show="showMenuPopup" position="left" :style="{ width: '70%', height: '100%' }">
    <div>
      <div class="top_logo_box">
        <img src="@/assets/imgs/header/top_logo.png" alt="">
      </div>
      <div class="menu_list">
        <div class="menu_item" v-for="(item, index) in menuList" :key="index" @click="activeMenu(item)">
          <img :src="getMenuImage(item.icon)" alt="" class="menu_img" />
          <span>{{ item.name }}</span>
        </div>
      </div>
    </div>
    <div class="menu_item_box">
      <a :href="item" target="_blank" v-for="(item, index) in menuFooterList" :key="index">
        <img :src="getMenuImage(`menu_footer_${index}`)" alt="" class="footer_menu_img" />
      </a>
    </div>
  </van-popup>

  <van-dialog v-model:show="show" title="" show-cancel-button class="dialog-confirm-box" @confirm="confirmExit"
    :confirmButtonText="t('OK1')" :cancelButtonText="t('Cancel')">
    <h4 class="title_dia F-Bold">{{ t('tip') }}</h4>
    <p class="des"> {{ t('areYouOut') }} {{ getStr(store.account, 8, 4) }} {{ t('mei') }}</p>
  </van-dialog>

  <Dialog ref="productDialog">
    <template #default>
      <div class="product-dialog-content">
        <h4>产品中心温馨提示</h4>
        <p>消耗 100 身份积分 完成数字身份铸造，即刻开启 DID 联盟全系能力与服务。</p>
        <p class="F-Bold btns" @click="handleClickBtns()">{{ isIntegral ? '立即前往' : '获取身份积分' }}</p>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang='ts'>
import { onMounted, reactive, ref, watch } from "vue";
import { connect, run } from "../../../plugin/metamask";
import detectEthereumProvider from "@metamask/detect-provider";
import { WalletConnet } from "../../../plugin/walletconnet";
import { showLoadingToast, closeToast, Popup } from "vant";
import { useRouter } from "vue-router";
import { useStore } from "../../../store/store";
import { storeToRefs } from "pinia";
import { getStr, isPc } from "../../../utils";
import { disconnect, resetApp } from "../../../plugin/walletconnet";
import { getSignData, isRegister, register } from "@/api";
import useLocal from "@/plugin/useLocale";
import { useI18n } from "vue-i18n";
import { create } from "domain";
import noCheck from '@/assets/imgs/header/no_check.png'
import Checked from '@/assets/imgs/header/Checked.png'
import LangsDialog from '@/view/identitycasting/components/langsDialog.vue';
import wallet from '@/assets/imgs/header/wallet.png'
import people from '@/assets/imgs/header/people.png'
const { t } = useI18n();
const {
  changeLocal,
} = useLocal();
const pc = isPc();
const router = useRouter();
const drawer = ref(false);
const showPopover = ref(false);
const store = useStore();
const productDialog = ref();
const langShow = ref(false);
const showMenuPopup = ref(false);
const connetDialogShow = ref(false);
const showWalletDropdown = ref(false);
const { account, token } = storeToRefs(store);
const isIntegral = ref(true);
const isConsumeIntegral = ref(false);
const menuList = ref([
  {
    icon: 'menu_0',
    name: '身份仪表盘 ',
    router: '/dashboard'
  },
  {
    icon: 'menu_1',
    name: '身份铸造',
    router: '/identitycasting'
  },
  {
    icon: 'menu_2',
    name: '产品中心',
    router: '/product'
  },
  {
    icon: 'menu_3',
    name: '交易中心',
    router: '',
    link: 'https://swap.42x.finance'
  },
  {
    icon: 'menu_4',
    name: '知识中心',
    router: '/knowledge'
  }
])

const menuFooterList = ref(['https://x.com/didone_official', 'https://didone.gitbook.io/did/', 'https://linktr.ee/did_one', 'https://medium.com/@didone_official', 'https://didone.org/'])

const handleClickBtns = () => {
  productDialog.value.close();
  if (isIntegral.value) {
    router.push('/product');
  } else {
    router.push('/casting');
  }
}
const activeMenu = (item: any) => {
  if (item.router === '/product' && !isConsumeIntegral.value && router.currentRoute.value.path !== '/product') {
    showMenuPopup.value = false;
    productDialog.value.open();
    return;
  }
  if (item.link) {
    window.open(item.link, '_blank');
  } else {
    router.push(item.router);
  }
  showMenuPopup.value = false;
};

const getMenuImage = (iconName: string) => {
  return new URL(`/src/assets/imgs/header/${iconName}.png`, import.meta.url).href;
};

const show = ref(false);

onMounted(() => {
  if (window.location.href.includes('&&token=')) {
    const info = window.location.href.split("?")[1].split('&&');
    let address = info[0].split('=')[1];
    let token = info[1].split('=')[1];
    let isWalletConnet = info[2].split('=')[1];
    store.isWalletConnet = isWalletConnet === '1' ? true : false;
    localStorage.isWalletConnet = isWalletConnet === '1' ? true : false;
    store.token = token;
    localStorage.blckToken = token;
    store.account = address;
    localStorage.blckAddress = address;
  }
  run();
  // 点击外部区域关闭下拉菜单
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.wallet-dropdown-container')) {
      showWalletDropdown.value = false;
    }
  });

});
const handleClose = () => {
  drawer.value = false;
};

const backHome = () => {
  if (store.account && store.token) {
    router.push('/');
  } else {
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
  if (provider.value) {
    walletToConnet(1)
  } else {
    connetDialogShow.value = true;
  }
}
const walletToConnet = async (type: number) => {
  console.log(type, 'type')
  store.is_exit_flag = 0;
  showLoadingToast({
    message: t('loading'),
    forbidClick: false,
    duration: 0,
  });
  if (type == 1) {
    if (provider.value) {
      connect(() => {
        connetDialogShow.value = false;
        // showPopover.value = false;
        closeToast();
      })
    } else {
      const dappUrl = location.origin;
      const metaMaskDeepLink = `https://metamask.app.link/dapp/${dappUrl}`;
      window.open(metaMaskDeepLink)
      closeToast();
    }
  }

  if (type == 2) {
    connetDialogShow.value = false;
    WalletConnet(() => {
      // showPopover.value = false;
      closeToast();
    });
  }
};

const exit = () => {
  show.value = true;
};

// 切换钱包下拉菜单
const toggleWalletDropdown = () => {
  showWalletDropdown.value = !showWalletDropdown.value;
};

// 登出功能
const logout = () => {
  showWalletDropdown.value = false;
  store.$patch({
    account: '',
    token: '',
    isWalletConnet: false
  });
  router.push('/');
};

const confirmExit = () => {
  store.is_exit_flag = 1;
  if (store.isWalletConnet) {
    disconnect();
  } else {
    store.account = "";
  }
  (store as any).exit();
}
</script>
<style scoped lang='scss'>
.van-popup {
  background-color: #1E1F25;
  color: #fff;
  padding: 1.44rem 1.2rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  .footer_menu_img {
    width: 2.13rem;
    height: 2.13rem;
    margin-right: .5rem;
  }

  .menu_item {
    display: flex;
    align-items: center;
    font-size: 1rem;
    color: #fff;
    padding: 0.5rem 0;
    margin-bottom: 1.38rem;
    line-height: 1rem;
  }

  .top_logo_box {
    margin-bottom: 2.7rem;

    img {
      width: 7.67rem;
    }
  }

  .menu_img {
    width: 1.25rem;
    margin-right: .31rem;
  }
}

.menu_img {
  width: 1.13rem;
  margin-left: .5rem;
}

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

.left_img {
  width: 1.38rem;
  margin-right: 0.5rem;
  vertical-align: middle;
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
  background-color: #1E1F25;
  position: fixed;
  padding: 15px;
  padding-bottom: 10px;
  z-index: 99;
}

.logo {
  // max-width: 9.625rem;
  width: 5.95rem;
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

  .select_down {
    width: .6rem;
    margin-left: 0.5rem;
    transition: transform 0.3s ease;

    &.rotate {
      transform: rotate(180deg);
    }
  }

  &:hover,
  &:active {
    color: rgba(30, 39, 65, .8) !important;
    border-color: #2A2D33 !important;
    // background:linear-gradient(to right, #CD1B1C, #D21919) !important;
  }

  @media screen and (max-width: 992px) {
    font-size: 0.85rem;
  }
}

.product-dialog-content {
  text-align: center;
  padding: .6rem 1rem .5rem;

  h4 {
    font-size: 1.13rem;
    line-height: 1.56rem;
    font-weight: 600;
    margin-bottom: .81rem;
  }

  p {
    font-size: .88rem;
    color: #828592;
    margin-bottom: 1rem;
  }

  .btns {
    font-size: 1rem;
    color: #fff;
    background-color: #1DCC89;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    margin-bottom: 0;
  }
}

.bg_con {
  background-color: #1DCC89 !important;
}

.dis_co {
  background-color: #202328 !important;
  border: 1px solid #2A2D33 !important;
  color: #fff !important;

  &:hover,
  &:active {
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

// 钱包下拉菜单样式
.wallet-dropdown-container {
  position: relative;
}

.wallet-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  // background: #1a1a1a;
  border: 1px solid #2C3436;
  border-radius: 0.5rem;
  min-width: 120px;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

  .dropdown-header {
    padding: 0.25rem;

    .dropdown-title {
      font-size: 0.75rem;
      color: #999999;
      font-weight: 400;
    }
  }

  .wallet-address {
    padding: 0 1rem 0.75rem;
    font-size: 0.88rem;
    color: #ffffff;
    font-weight: 500;
    word-break: break-all;
  }

  .dropdown-divider {
    height: 1px;
    background: #2C3436;
    margin: 0;
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    cursor: pointer;
    transition: background-color 0.2s ease;
    background-color: #1E1F25;

    &:hover {
      background-color: #2a2a2a;
    }

    .logout-icon {
      width: 1rem;
      height: 1rem;
      margin-right: 0.5rem;
    }

    span {
      font-size: 0.88rem;
      color: #ffffff;
    }
  }
}
</style>
