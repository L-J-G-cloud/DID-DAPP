
import detectEthereumProvider from '@metamask/detect-provider'
import { storeToRefs } from 'pinia';
import { showLoadingToast, closeDialog, closeToast, showDialog } from 'vant';
import 'vant/es/dialog/style';
import { login, getSignData, isRegister, register, getUserData } from '@/api'
import { getProvider } from '@/api/mapcontract'
declare const window: Window & { ethereum: any };
import i18n from './i18n';
import { useStore } from '../store/store'
import router from '@/router';
import {isBSC} from '@/utils'
//入口功能
export async function run() {
  // this returns the provider, or null if it wasn't detected
  //环境监测
  function isMobileMetaMask() {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      console.log(userAgent,'userAgent')
      return /android|iphone|ipad|ipod/i.test(userAgent) && window.ethereum && window.ethereum.isMetaMask && window.ethereum.isMobile;
  }
  const provider = await detectEthereumProvider()
  if (provider) {
    startApp(provider) // Initialize your app
    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('chainChanged', handleChainChanged)
    const store = useStore();
    // 只有在用户已经连接过钱包的情况下才自动检查账户
    if (store.account && store.token) {
      window.ethereum //为什么要加这个因为Tp钱包切换账号后会刷新页面，不会触发accountsChanged事件
        .request({
          method: 'eth_requestAccounts',
        }).then((res:any)=>{
          if(store.account&&res[0].toLowerCase()!=store.account.toLowerCase()){
            store.exit();
            store.changeload();
          }else{
            store.account = res[0];
            if(store.is_exit_flag){
              store.account = '';
              router.push('/');
              return;
            }
            if(!isMobileMetaMask()&&!store.token){
              isRegisterFn(res[0]);
            }
          }
        })
    }
    return true;
  } else {
    console.log('Please install MetaMask!')
  }
}

// run()

function startApp(provider: any) {
  // If the provider returned by detectEthereumProvider is not the same as
  // window.ethereum, something is overwriting it, perhaps another wallet.
  if (provider !== window.ethereum) {
    console.error('Do you have multiple wallets installed?')
  }
  // Access the decentralized web!
}

/**********************************************************/
/* Handle chain (network) and chainChanged (per EIP-1193) */
/**********************************************************/
async function handleChainChanged() {
  const store = useStore()
  const { account, banlance, allowBalance } = storeToRefs(store)
  const _chainId = await window.ethereum.request({
    method: 'eth_chainId',
  })
  const flag = isBSC(_chainId);
  console.log(_chainId,'_chainId')
  if (flag) {
    closeDialog();
    return true;
  }
  else {
    closeToast();
    account.value = '';
    showDialog({
      title: i18n.global.t('tip'),
      message: i18n.global.t('okchian'),
      theme: 'round-button',
      messageAlign: 'center',
      confirmButtonColor: '#1DCC89',
      confirmButtonText: i18n.global.t('Ok'),
      className:'chian_tip'
    }).then(() => {
      closeDialog();
      return false
    });
  }
}
/***********************************************************/
/* Handle user accounts and accountsChanged (per EIP-1193) */
/**************************************************** *******/

// For now, 'eth_accounts' will continue to always return an array
async function handleAccountsChanged(accounts: string | any[]) {
  const store = useStore()
  // const { account } = storeToRefs(store)
  // store.account = '';
  // store.userInfo = { account: '', id: 0, token: '' };
  // store.token = '';
  // localStorage.removeItem('store');
  // localStorage.removeItem('blockAddress');
  // localStorage.removeItem('blockToken');
  // store.exit();
  // console.log('account change')
  // store.changeload();
  // getSignature(accounts[0]);
  // if (accounts.length === 0) {
  //   // MetaMask is locked or the user has not connected any accounts
  //   console.log('Please connect to MetaMask.');
  //   // store.commit('setAccount', '');
  //   store.token = '';
  //   account.value = '';
  //   return;
  // }
  // if (!account.value && !store.token) {
  //   handleChainChanged()
  // }
  if (localStorage.blckAddress&&accounts[0].toLowerCase() !== localStorage.blckAddress.toLowerCase()) {
    store.account = '';
    store.userInfo = { account: '', id: 0, token: '', user_data: { pool_id: 0, node_type: 0 } };
    store.token = '';
    localStorage.removeItem('store');
    localStorage.removeItem('blockAddress');
    localStorage.removeItem('blockToken');
    store.exit();
    store.changeload();
  }
  closeToast();
}

// 签名防抖标志
let isSigning = false;

export async function getSignature(address: string, isReg: Boolean) {
  // 防止重复签名
  if (isSigning) {
    console.log('正在签名中，请稍候...');
    return;
  }
  
  isSigning = true;
  const store = useStore()
  store.is_sign = true;
  try {
    showLoadingToast({
      duration: 0,
      message: i18n.global.t('Signatureinprogress'),
      forbidClick: false,
      wordBreak:'break-word'
    });
    setTimeout(()=>{
      closeToast();
      store.is_sign = false;
    },7000)
    const store = useStore()
    store.isLoad = false;
    const provider = await getProvider(); //获取当前环境的总数据对象
    const signer = provider.getSigner()//回去签名的handle
    const data = await getSignData();//获取签名数据
    const signature = await signer.signMessage(data.data.random);//获取签名后的数据
    let result = null;
    store.is_sign = false;
    isSigning = false;
    if (store.referrer && !isReg) {
      result = await register({ //拿签名数据去注册
        referrer: store.referrer,
        address,
        signature: signature,
        sign_data: data.data.random
      });
      if(!result.code) {
        store.token = result.data.token;
        store.userInfo = result.data;
        localStorage.blckToken = result.data.token;
      }
    } else {
      result = await login({
        address,
        signature: signature,
        sign_data: data.data.random
      });
      if(!result.code) {
        store.token = result.data.token;
        localStorage.blckToken = result.data.token;
        store.userInfo = result.data;
        store.is_exit_flag = 0;
      }
    }
    if(!result.code) {
      store.account = address;
      localStorage.blckAddress = address;
      const res = await getUserData();
      store.isLoad = true;
      if (!res.code) {
        console.log(res.data);
        store.userData = res.data;
        sessionStorage.userData = JSON.stringify(res.data);
        router.push('/')
      }
      router.push('/')
      store.changeload();
      closeToast();
    }
  } catch (error) {
    closeToast();
    isSigning = false;
    store.exit();
    console.log('获取签名失败',error)
  }

}

/*********************************************/
/* Access the user's accounts (per EIP-1102) */
/*********************************************/

// You should only attempt to request the user's accounts in response to user
// interaction, such as a button click.
// Otherwise, you popup-spam the user like it's 1999.
// If you fail to retrieve the user's account(s), you should encourage the user
// to initiate the attempt.

// While you are awaiting the call to eth_requestAccounts, you should disable
// any buttons the user can click to initiate the request.
// MetaMask will reject any additional requests while the first is still
// pending.
// 防抖标志
let isConnecting = false;

//连接钱包功能
export async function connect(call?:any) {
  // 防止重复连接
  if (isConnecting) {
    console.log('正在连接中，请稍候...');
    return;
  }
  
  isConnecting = true;
  
  const chainId = import.meta.env.MODE == 'development' ? '0x61' : '0x38';
  try {
    await window.ethereum.request({
      "method": "wallet_switchEthereumChain",
      "params": [
       {
         chainId: chainId
       }
     ],
    });
    console.log('切换链成功')
  } catch (error) {
    console.error('切换链失败', error);
    // 这里可以添加用户通知，比如弹出提示
  }

  
  
  const flag = await handleChainChanged();
  if (!flag) {
    isConnecting = false;
    return;
  }
  try {
    window.ethereum
      .request({
        method: 'eth_requestAccounts',
      })
      .then((data: any) => {
        // handleAccountsChanged(data)
        // alert(132);
        // getSignature(data[0])
        isRegisterFn(data[0])
        if(call) {
          call();
        }
        isConnecting = false;
      })
      .catch((err: { code: number }) => {
        closeToast();
        isConnecting = false;
        if (err.code === 4001) {
          // EIP-1193 userRejectedRequest error
          // If this happens, the user rejected the connection request.
          console.log('Please connect to MetaMask.')
        } else {
          console.error(err)
        }
      })
  } catch (e) {
    closeToast();
    isConnecting = false;
    console.log('连接钱包失败', e);
    // showFailToast(i18n.global.t('tip7'))
  }
}

export async function isRegisterFn(address: string) {
  if(!address) return;
  try {
    const store = useStore();
    const { code, data } = await isRegister({ address });
    store.is_reg = data;
    if (!code) {
      if (data) { //已经注册
        await getSignature(address, data) //去签名登录
      }
      if (!data) { //没有注册没有邀请链接
        store.account = address;
        router.push('/register');
      }
  
      // if (!data && store.referrer) { //没有注册有邀请链接
      //   getSignature(address, data) //去签名注册
      // }
  
    }
  } catch (error) {
    closeToast();
  }
 
}
