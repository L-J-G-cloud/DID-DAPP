<template>
  <div class="home-content-container">
    <!-- <div class="banner">
      <van-swipe :autoplay="3000">
        <van-swipe-item v-for="(item, index) in bannerList" :key="index">
          <p class="banner-title">An <span>Alliance</span> Beyond Borders.</p>
          <p class="banner-content">A <span>Force</span> Beyond Limits.</p>
        </van-swipe-item>
      </van-swipe>
    </div> -->
    <div class="banner">
      <van-swipe :autoplay="5000">
        <van-swipe-item v-for="(item, index) in bannerList" :key="index">
            <img :src="item.src" alt="" @click="handleBannerClick(item.link,item.type)">
        </van-swipe-item>
      </van-swipe>
    </div>
    <CurrentCompute id="scrollToToken" ref="currentComputeRef"/>
    <!-- 超级奖励 -->
    <div class="bottom-box F-Bold">
      <div class="super-reward-box">
        <div class="left">
          <p><span class="red">{{ t("SuperNode") }}</span></p>
          <p>{{ t("super_node_reward_pool") }}</p>
          <p class="text-14">{{ t("coming_soon") }}</p>
        </div>
        <div class="right">
          <p>{{ SuperNodeNums }}</p>
          <p>{{ t("fc") }}</p>
        </div>
      </div>
    </div>
    <div class="bottom-box F-Bold">
      <div class="super-reward-box">
        <div class="left">
          <p><span class="red">{{ t("SuperCommunity") }}</span></p>
          <p>{{ t("super_node_reward_pool") }}</p>
          <p class="text-14">{{ t("coming_soon") }}</p>
        </div>
        <div class="right">
          <p>{{ SuperCommunityNums }}</p>
          <p>{{ t("fc") }}</p>
        </div>
      </div>
    </div>
    <!-- <div class="bottom-box F-Bold">
      <div class="super-reward-box">
        <div class="left">
          <p><span class="red">{{ t("SmartRiskControlPool") }}</span></p>
          <p class="text-14">{{ t("coming_soon") }}</p>
        </div>
        <div class="right">
          <p>{{ SmartRiskControlPoolNums }}</p>
          <p>BLC </p>
        </div>
      </div>
    </div> -->

    <div class="airdrop-box">
      <div class="airdrop-box-title">
        <div class="title">
          <span class="left-icon"></span>
          <span class="F-Bold">{{ t("airdrop") }}</span>
        </div>
        <div class="airdrop-box-title-right" @click="showAirportRecordDialog = true">
          {{ t("details") }}>
        </div>
      </div>
      <div class="airdrop-box-content">
        <img src="@/assets/imgs/home/FC.png" alt="">
        <span>{{ t("fc_balance") }}</span>
      </div>
      <div class="airdrop-box-content-bottom">
        <p class="F-Bold">{{ formatDecimal(store.banlance, 4) }}</p>
        <p class="btn" @click="showWithdrawalDialog = true">{{ t("withdraw") }}</p>
      </div>
    </div>

    <div class="buy-list-container" id="scrollToNode">
      <div class="buy-list-content">
        <div class="buy-list-header">
          <div class="title">
            <span class="left-icon"></span>
            <span class="F-Bold">{{ t("purchased_nodes") }}</span>
          </div>
          <div class="right-title" v-if="listInfo.list.length" @click="showBuyDialog = true">
            {{ t("subscribe") }}>
          </div>
        </div>
        <van-list v-if="listInfo.list.length" v-model:loading="listInfo.loading" :finished="listInfo.finished"
          :offset="10" :loading-text="t('loading')" :finished-text="''" @load="getAirdropList"
          class="current-pledge-list-box">
          <div class="buy-item" v-for="(item, index) in listInfo.list" :key="index"
            :style="{ borderBottom: index === listInfo.list.length - 1 ? 'none' : '1px solid #1D1F22' }">
            <div class="buy-item-left">
              <img src="@/assets/imgs/home/node.png" alt="">
              <div class="buy-item-left-content">
                <p class="blc-text F-Bold"><span class="">{{formatDecimal(String(Number(decimalParseToNumber(item.amount, 18))* item.multiple),2) 
                    }}</span> <span>{{ t("blc") }}</span></p>
                <p class="multiple-text"><span class="F-Bold" style="color: #999999;">{{
                  formatDecimal(decimalParseToNumber(item.amount, 18), 2) }} BLC</span><span class="multiple">X{{
                      item.multiple }}</span></p>
              </div>
            </div>
            <div :class="{ 'buy-item-right': item.status == 0 }">
              <p>
                {{ store.lang === 'tw' ? getdata(item.create_time * 1000).timeXie : getdata(item.create_time *
                  1000).langEnYMS
                }}
              </p>
              <p v-if="item.status == 0">
                <span class="dot"></span> {{ t('confirming_block') }}
              </p>
            </div>
          </div>
        </van-list>
        <div class="buy-item-empty" v-if="!listInfo.list.length && !listInfo.loading">
          <p class="btn" @click="showBuyDialog = true">{{ t("subscribe") }}</p>
        </div>
        <van-skeleton title :row="3" v-if="listInfo.loading&&!listInfo.list.length" class="list-box_lading" />
      </div>
    </div>
    <InventoryNode ref="inventoryNodeRef" @openAction="openAction" />
    <!-- <SuperNode /> -->
    <SuperCommunity />
    <!-- 我要推广 -->
    <div class="base-card promote-card">
      <div class="title-line plr1">
        <img class="share-img" src="@/assets/imgs/home/share.png" alt="" />
        <div class="text">
          <p class="F-Bold">{{ t("Participate") }}</p>
          <p class="user_text">{{ t('NumberUsers') }} <i class="white F-Bold">{{ store.invite_total_num }}</i></p>
        </div>
        <img src="@/assets/imgs/home/arr-r.png" alt="" @click="handleViewInviteRecord" class="arrow-icon">
      </div>
      <div class="value-line">
        <p>
          <span>{{ t('InvitationAddress') }}</span>
          <span class="address">{{ getStr(store.account, 4, 4) }}</span>
        </p>
        <img src="@/assets/imgs/home/copy.png" alt="" @click="copy(store.account)">
      </div>
    </div>

    <!-- 卡片列表 -->
    <div class="card-top-list">
      <div class="card-top-item" v-for="(item, index) in cardTopList" :key="index"
        @click="handleCardTopItemClick(item.link)">
        <img :src="item.src" alt="">
        <div class="card-top-item-title" v-if="index !== 2">
          {{ item.title }}
        </div>
        <div class="card-top-item-title" v-if="index === 2">
          <div class="mb1">
            {{ item.title }}
          </div>
          <div class="flex">
            <span>{{ getStr('0x000000000000000000000000000000000000dEaD', 4, 4) }}</span>
            <img src="@/assets/imgs/home/copy.png" alt="" @click="copy('0x000000000000000000000000000000000000dEaD')"
              class="copy-icon">
          </div>
        </div>
      </div>
    </div>
    <div class="bottom-box F-Bold">
       <h4>{{ t('quick_entry') }}</h4>
       <div class="item-box">
           <p :class="['flex-between']">
                <span @click="optionShow(1)" :class="store.lang === 'tw' ? 'left-30' : 'left-10'">{{t('FateRoad')}}</span>
                <span @click="optionShow(2)" :class="store.lang === 'tw' ? '' : 'left-0'">{{t('subscribe')}}</span>
           </p>
           <p :class="['flex-between']">
                <span @click="optionShow(3)" :class="store.lang === 'tw' ? 'left-30' : 'left-10'">{{t('PurchasedNodes')}}</span>
                <span @click="$router.push('/donor')" :class="store.lang === 'tw' ? '' : 'left-0'">{{store.isDonor ? t('Donor') : t('BecomeDonor')}}</span>
           </p>
        
       </div>
    </div>
    <Footer />
    <AirportRecordDialog v-model:visible="showAirportRecordDialog" />
    <WithdrawalDialog v-model:visible="showWithdrawalDialog" v-if="showWithdrawalDialog"
      @finishWithdraw="finishWithdraw" />
    <BuyDialog v-model:visible="showBuyDialog" v-if="showBuyDialog" @pledgeFinish="getFinish" />
    <InviteRecordDialog v-model:visible="inviteRecordDialogVisible" />
    <SuccessDialog v-model:visible="showSuccessDialog" :multiple="multiple" />
    <ModalShow v-model:visible="showModalShow" /> 
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from "vue";
import banner from '@/assets/imgs/home/banner.png';
import blc_card from '@/assets/imgs/home/blc_card.png';
import swap_card from '@/assets/imgs/home/swap_card.png';
import cess_card from '@/assets/imgs/home/cess_card.png';
import CurrentCompute from './CurrentCompute.vue';
import BaseList from '@/components/BaseList.vue';
import { getNodeList, getUserBalance, getSystemAddressBalance } from '@/api';
import { decimalParseToNumber } from '@/api/mapcontract';
import Footer from './Footer.vue';
import AirportRecordDialog from './AirportRecordDialog.vue';
import WithdrawalDialog from './WithdrawalDialog.vue';
import BuyDialog from './BuyDialog.vue';
import CopyToClipBoard from "copy-to-clipboard";
import { useI18n } from 'vue-i18n';
import { useStore } from '@/store/store';
import { getStr, showToastIcon, formatDecimal, getdata ,addThousandthSign} from '@/utils';
import success from '@/assets/imgs/home/success.png';
import InviteRecordDialog from './inviteRecordDialog.vue';
import SuccessDialog from '@/components/SuccessDialog.vue';
import ModalShow from './modalshow/index.vue';
import banner_1 from '@/assets/imgs/banner/banner_1.png';
import banner_1_tw from '@/assets/imgs/banner/banner_1_tw.png';
import banner_2_en from '@/assets/imgs/banner/banner_2_en.png';
import banner_2_tw from '@/assets/imgs/banner/banner_2_tw.png';
import banner_3_tw from '@/assets/imgs/banner/banner_3_tw.jpg';
import banner_3_en from '@/assets/imgs/banner/banner_3_en.png';
import InventoryNode from './InventoryNode/index.vue';
import SuperCommunity from './supercommunity/index.vue';
import SuperNode from './supernode/index.vue';

const store = useStore();
const showAirportRecordDialog = ref(false);
const showWithdrawalDialog = ref(false);
const showBuyDialog = ref(false);
const inviteRecordDialogVisible = ref(false);
const showSuccessDialog = ref(false);
const showModalShow = ref(false);
const inventoryNodeRef = ref<any>(null);
const currentComputeRef = ref<any>(null);
const { t } = useI18n();

interface BannerItem {
  src: string;
  link: string;
  type: number;
}

const bannerEnList = ref([
  // {src:banner_3_en,link:'',type:1},
  {src:banner_1,link:'',type:2},
  {src:banner_2_en,link:'',type:3},
])

const bannertwList = ref([
  {src:banner_1_tw,link:'',type:1},
  {src:banner_1,link:'',type:2},
  {src:banner_2_tw,link:'',type:3},
])

const bannerList = ref<BannerItem[]>([]); // 指定类型为 BannerItem 数组
watch(()=>store.lang,(newVal)=>{
  switch (newVal) {
    case 'en':
      bannerList.value = bannerEnList.value;  
      break;
    case 'tw':
      bannerList.value = bannertwList.value;  
      break;
    default:
      bannerList.value = bannerEnList.value;  
      break;
  }
},{immediate:true})

const handleBannerClick = (path: string,type:number) => {
  if (path) {
    window.open(path, '_blank');
  }
  if(type===1){
    showModalShow.value = true;
  }
}
const balanceInfo = ref({
  FcBalance: '--',
})

const multiple = ref(2);

interface NodeItem {
  amount: string;
  multiple: number;
  create_time: number;
  status: number;
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

const cardTopList = computed(() => reactive([
  {
    src: blc_card,
    title: t("blc_mint_exchange"),
    link: 'https://minting.42dao.org'
  },
  {
    src: swap_card,
    title: t("swap_exchange"),
    link: 'https://swap.42dao.org'
  },
  {
    src: cess_card,
    title: t("burn_pool"),
    link: ''
  }
]));

const SuperNodeNums = ref('');
const SuperCommunityNums = ref('');
const SmartRiskControlPoolNums = ref('9,135');
onMounted(() => {
  // getUserBalanceData();
  getSystemBalance();
  getAirdropList();
})

const getSystemBalance = async () => {
  const { code, data } = await getSystemAddressBalance();
  if (!code) {
    SuperNodeNums.value = addThousandthSign(Number(decimalParseToNumber(data.super_node_value, 18)).toFixed(0))
    SuperCommunityNums.value = addThousandthSign(Number(decimalParseToNumber(data.community_value, 18)).toFixed(0))
    SmartRiskControlPoolNums.value = addThousandthSign(Number(decimalParseToNumber(data.brain_power_pool, 18)).toFixed(0))
  }
}

const finishWithdraw = async () => {
  const { code, data } = await getUserBalance();
  if (!code) {
    store.banlance = decimalParseToNumber(data.fc, 18);
  }
}
const getFinish = (multiples: number) => {
  multiple.value = multiples;
  showBuyDialog.value = false;
  if (!store.isDonor) {
    showSuccessDialog.value = true;
    getAirdropList(1)
  }else{
    inventoryNodeRef.value.getInventoryList(1)
  }
}

const openAction = (multiples:number) => {
  showSuccessDialog.value = true;
  multiple.value = multiples;
  inventoryNodeRef.value.getInventoryList(1)
  getAirdropList(1)
  currentComputeRef.value.getUserBalanceData()
}

const handleCardTopItemClick = (link: string) => {
  if (link) {
    window.open(link, '_blank');
  }
}

const params = ref({
  start: 0,
  limit: 10,
})

// const getUserBalanceData = async () => {
//   const { code, data } = await getUserBalance();
//   if (!code) {
//     balanceInfo.value.FcBalance = decimalParseToNumber(data.fc, 18);
//     store.banlance = data.fc;
//   }
// }

const isList = ref(false);
const getAirdropList = async (type:number = 0) => {
  if(type){
    params.value.start = 0;
    listInfo.value.list = [];
    listInfo.value.finished = false;
  }
  listInfo.value.loading = true;
  const { code, data, total } = await getNodeList(params.value);
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
    // listInfo.value.list.forEach(item=>{item.amount='5400000000000000000000';item.multiple=7})
  }
}

// 查看邀请记录
function handleViewInviteRecord() {
  inviteRecordDialogVisible.value = true;
}

const copy = (address: string) => {
  CopyToClipBoard(address);
  // 复制逻辑
  showToastIcon(t("copied"), 'success');
}




const scrollToSection = (sectionId:string)=>{
      const element = document.getElementById(sectionId);
      const offset = 70; // 固定导航栏的高度
      if (element) {
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - offset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
}

const optionShow = (typeVal:number)=>{
  switch (typeVal) {
    case 1:
      scrollToSection('scrollToToken');
      break;
    case 2:
      showBuyDialog.value = true;
      break;
    case 3:
      scrollToSection('scrollToNode');
      break;
    default:
      break;
  }
}


</script>

<style lang="scss" scoped>
.flex {
  display: flex;
  align-items: center;
}

.mb1 {
  margin-bottom: 4px;
}
.bottom-box {
  margin-bottom: 40px;
  h4{
    font-size: 16px;
    color: #fff;
    line-height: 18px;
    font-weight: 700;
    text-align: center;
    margin: 40px 0 20px;
  }
  .item-box{
    padding: 0 .94rem;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    gap: 10px;
  }
  .flex-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .flex-between span {
    // flex: 1;
    display: inline-block;
    min-width: 40%;
    text-align: left;
    display: block;
    color: #636363;
    font-size: 14px;
    padding-left: 50px;
    &.left-30{
      padding-left: 20px;
    }
    &.left-10{
      padding-left: 10px;
    }
    &.left-0{
      padding-left: 0;
    }
  }
}

.home-content-container {
  padding: 4rem 0 0;
  background: url('@/assets/imgs/home/top_bg.png') no-repeat top right;
  background-size: contain;
  background-position-y: 5%;

  .yel {
    color: #FFD87E;
  }

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

  :deep(.van-swipe__indicators) {
    .van-swipe__indicator {
      width: 1rem;
      /* 设置横杠的宽度 */
      height: 0.2rem;
      /* 设置横杠的高度 */
      background-color: white;
      /* 设置横杠的颜色为白色 */
      border-radius: 0;
      /* 取消圆角 */
      margin: 0 0.2rem;
      /* 设置横杠之间的间距 */
    }

    .van-swipe__indicator--active {
      background-color: white;
      /* 激活状态的横杠颜色 */
    }
  }

  .banner {
    width: 100%;
    height: 100%;
    font-size: 1.25rem;
    color: #fff;
    line-height: 1.38rem;
    margin-bottom: 1.13rem;
    img {
      width: 100%;
      height: 100%;
    }

    .banner-title,
    .banner-content {
      font-size: 1.25rem;

      span {
        color: #CF1A1B;
      }
    }
  }

  .card-top-list {
    margin: .56rem 0;
    padding: 0 .94rem;
    display: flex;
    align-items: stretch;
    justify-content: space-between;

    .card-top-item {
      width: 32%;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 1.1rem 1.5rem;
      position: relative;
      border: none;
      border-radius: .52rem;

      /* 添加背景色 */
      background: linear-gradient(to bottom,
          transparent 70%,
          rgba(206, 26, 27, 0.5) 100%);

      /* 确保内容在最上层 */
      &>* {
        position: relative;
        z-index: 2;
      }

      img {
        width: 3.75rem;
        height: 4.25rem;
        margin-bottom: 0.56rem;
      }

      .copy-icon {
        width: .75rem;
        height: .75rem;
        margin: 0 0 0 .5rem;
      }

      .card-top-item-title {
        font-size: .75rem;
        color: #fff;
        text-align: center;
        line-height: .88rem;
        // white-space: nowrap;
      }
    }
  }

  .airdrop-box {
    position: relative;
    margin: 0 .94rem;
    // height: 7.75rem;
    padding: .56rem;
    background-color: #0A0809;
    border: 1px solid #303134;
    border-radius: .38rem;

    .airdrop-box-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 1rem;
      margin-bottom: 1.2rem;
    }

    .airdrop-box-title-right {
      color: #FF3F3F;
      font-size: .88rem;
    }

    .airdrop-box-content {
      display: flex;
      align-items: center;
      margin-bottom: .6rem;

      img {
        width: 1.25rem;
        height: 1.25rem;
        margin-right: .56rem;
      }

      span {
        font-size: .88rem;
        color: #999;
      }
    }

    .airdrop-box-content-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 1.25rem;

      .btn {
        font-size: .75rem;
        color: #fff;
        padding: .63rem 1.55rem;
        background: linear-gradient(to bottom, #D21919, #CD1B1C);
        border-radius: .38rem;
        font-weight: 700;
        line-height: .94rem;
      }
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
      border-bottom: 1px solid #1D1F22;
      display: flex;
      justify-content: space-between;
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
  }

  .buy-item-empty {
    text-align: center;
    padding-top: 1.88rem;
    padding-bottom: .5rem;
  
    .btn {
      font-size: .88rem;
      line-height: 1.19rem;
      color: #fff;
      padding: .33rem 2rem;
      background: linear-gradient(to bottom, #D21919, #CD1B1C);
      border-radius: .25rem;
      font-weight: 700;
      min-width: 3rem;
    }
  }

  .bottom-box {
    padding: 0 .94rem;
    height: 5.63rem;
    margin-bottom: .63rem;
    .super-reward-box {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: url('@/assets/imgs/home/super_bg.png') no-repeat center center;
      background-size: 100% 100%;
      padding-left: 20px;
    }

    .left {
      p {
        font-size: 16px;
        color: #fff;
        line-height: 18px;
        font-weight: 700;

        .red {
          color: #FF3F3F;
        }
      }

      .text-14 {
        font-size: 14px;
        color: #898485;
      }
    }

    .right {
      padding: .65rem 1.3rem 0.2rem 1.5rem;
      border-radius: 5rem 0 0 5rem;
      background: linear-gradient(to right, #CE1A1B, #400D0E);
      // min-width: 115px;
      p {
        font-size: 1.6rem;
        line-height: 1;
        font-weight: 700;
        background: linear-gradient(to bottom, #EEEEEE, #E28C8C);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        text-align: center;

        &:last-child {
          font-size: .88rem;
        }
      }
    }

    // img {
    //   width: 100%;
    //   height: fit-content;
    //   margin-bottom: .56rem;
    // }
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

/* 我要推广和节点共有样式 */
.promote-card,
.node-card {
  position: relative;
  background-color: #0A0809;
  border: 1px solid #353535;
  border-radius: .38rem;
  margin: 1rem .94rem;

  .title-line {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.31rem;
    padding: 0 .94rem;

    .share-img {
      width: 2.5rem;
      height: 2.5rem;
      margin-right: 0.44rem;
    }

    .text {
      font-size: 1rem !important;
    }

    .white {
      color: #fff;
      font-size: 1rem;
    }


    .user_text {
      color: #B2B2B2;
      font-size: .88rem;
    }

    .arrow-icon {
      margin-left: auto;
      width: .88rem;
      height: .88rem;
    }
  }

  .value-line {
    // margin-top: 1.31rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    align-items: center;
    font-size: .75rem;
    background-color: #212225;
    padding: .63rem 1.19rem;
    border-radius: .25rem;
    color: #B2B2B2;

    img {
      width: .75rem;
      height: .75rem;
    }

    .address {
      color: #fff;
      margin-left: .5rem;
    }

    .label {
      font-weight: 500;
      font-size: 0.88rem;
      color: #7c7c7c;
      line-height: 1.19rem;
      margin-right: 1.19rem;
    }

    .value {
      font-weight: bold;
      font-size: 1rem;
      color: #1dcc89;
      line-height: 1.56rem;

      .arr-icon-img {
        margin-left: 0.44rem;
        width: 0.44rem;
        height: 0.63rem;
      }
    }
  }
}

/* 我要推广 */
.promote-card {
  // padding: 1rem 1rem 0.5rem 1rem;
  padding-top: 1rem;
  margin-bottom: 0.88rem;
}
</style>