import { defineStore } from 'pinia'
import { nextTick } from 'vue'
import router from '../router'
export const useStore = defineStore('counter', {
  state: () => {
    return {
      counter: 0,
      isReload: true,
      account: '',
      banlance: '0',
      withdraw_fee:'',
      allowBalance: 0,
      isWalletConnet: false,
      lang:'en',
      is_reg:false,
      buy_max_node:'0',
      today_buy:0,
      referrer:'',
      region: '',
      isLoad:true,
      isBlack:false,
      email: '',
      timeOut:false,
      invite_total_num:0,
      system_status:0,
      is_sign:false,
      is_exit_flag:0,
      usdtCount:'--',
      price:0,
      contractInfo:{
        FTDAddress:'',
        PayTokenAddress:'',
        PayTokenAddress2:'',
        BLCAddress:'',
        Deposit:'',
        DPINAddress:'',
        DepositAddress:'',
        DID:'',
        USDID:'',
        USDT:'',
        depositDID:'',
      },
      identityData:{
        did: '0',
        usdt: '0',
        usdid: '0',
        total_lock_did: '0',
        release_did: '0',
        wait_release_did: '0',
      },
      userData:{
        is_node:0,
        is_super_node:0,
        super_node_reward_ratio:0,
        is_admin:0
      },
      node_data:{
        deposit_dpin:'',
        deposit_dpin_blc:'',
        total_income:''
      },
      super_data:{
        deposit_dpin:'',
        deposit_dpin_blc:'',
        total_income:''
      },
      needAuthorized: true,
      isDonor: false,
      token: '',
      energy_token_name: '',
      abonus_identity: '',
      isPhoneLogin: true,
      is_special: 0,
      signature_data: '',
      vatContractAddress: '',
      proxyContractAddress: '',
      connetDialogShow: false,
      userInfo: {
        token:'',
        account: '',
        id: 0,
        user_data: {
          pool_id: 0,
          node_type: 0
        }
      },
      menuList: [
        {
          id: 0,
          name: 'Home',
          active: true,
          url: 'https://universal-stable-protocol.gitbook.io/universal-stable-protocol/',
          icon: 'icon-a-bianzu2',
          router: '/'
        },
        {
          id: 1,
          name: 'Borrow',
          active: false,
          url: '',
          icon: 'icon-a-bianzu5',
          router: '/borrow'
        },
        {
          id: 2,
          name: 'Portfolio',
          active: false,
          url: '',
          icon: 'icon-xingzhuangjiehe',
          router: '/portfolio'
        },
        {
          id: 3,
          name: 'Swap',
          active: false,
          url: '',
          icon: 'icon-a-bianzu3',
          router: '/swap',
        },
        {
          id: 4,
          name: 'Asset',
          active: false,
          url: '',
          icon: 'icon-bianzu',
          router: '/asset',
        }
      ]
    }
  },
  getters: {
    doubleCount: (state) => state.counter * 2
  },
  actions: {
    changeload() {
      let _this = this;
      _this.isReload = false;
      return nextTick(function () {
        _this.isReload = true;
      })
    },
    exit() {
      this.account = '';
      this.userInfo = { account: '', id: 0,token:'', user_data: { pool_id: 0 } as any};
      this.token = '';
      localStorage.removeItem('store');
      localStorage.removeItem('blockAddress');
      localStorage.removeItem('blockToken');
      this.identityData = {
        did: '0',
        usdt: '0',
        usdid: '0',
        total_lock_did: '0',
        release_did: '0',
        wait_release_did: '0',
      };
      console.log('exit',this.account)
      router.push('/connect');
    }
  },
  persist: {
    key: "store",
    storage: localStorage,
    paths:['isReload','buy_max_node','today_buy','price','usdtCount','contractInfo','account','is_exit_flag','banlance','allowBalance','token','isWalletConnet','vatContractAddress','proxyContractAddress','userInfo','lang','identityData']
  }
})
