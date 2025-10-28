import erc20ABI from '../abi/erc20-token.json'
import { ethers, utils } from 'ethers'
import addressConfigData from '../abi/contract-address.json'
import DIDMiningPoolAbi from '../abi/DIDMiningPool.json'
import depositDIDAbi from '../abi/DepositDID.json'
import ForceAbi from '../abi/F_New_Force.json'
import stakingAbi from '../abi/Staking.json'
import badgeAbi from '../abi/comtyBadge.json'
import { getWalletProvider, getWalletProviderTest } from '../plugin/walletconnet/walletprovider'
import { useStore } from "../store/store"
import { showFailToast } from 'vant'
import { showLoadingToast, closeToast ,showToast} from 'vant'
import i18n from '../plugin/i18n';
import fail from "@/assets/imgs/identitycasting/fail.png";
declare global {
  interface Window {
    ethereum: any
  }
}

type AddressConfig = {
  [key: string]: string; // 定义索引签名
};

const addressConfig: { [key: string]: AddressConfig } = addressConfigData;

const DevChainId = import.meta.env.MODE == 'development' ? '97' : '56';
export async function getContractAddress(contractAddress: string) {
  if (typeof contractAddress === 'string' && contractAddress in addressConfig[DevChainId]) {
    return addressConfig[DevChainId][contractAddress as keyof AddressConfig];
  } else {
    throw new Error(`Invalid contract address: ${contractAddress}`);
  }
}

export async function getProvider() {
  const store = useStore();
  let tempProvider = null;
  if (store.isWalletConnet) { //判断是哪种链接方式 返回不同的provider
    const { WalletProvider } =  import.meta.env.MODE == 'development' ? await getWalletProviderTest() : await getWalletProvider();
    tempProvider = WalletProvider;
  } else {
    tempProvider = new ethers.providers.Web3Provider(window.ethereum);
  }
  return tempProvider;
}

async function getContract(address: string, abi: any) {
  const store = useStore();
  const walletprovider = await getProvider();
  const signer = walletprovider?.getSigner()
  return new ethers.Contract(address, abi, signer)
}

//授权usdt
export async function approval(contrctAddress: string, from: string, to: string, value: string, decimal: number, successCb: () => void, errorCB: () => void, symbol?: string) {
  try {
    // let to = getContractAddress('IDO')
    let tempAddress = '';
    // if(symbol){
    tempAddress = symbol ? await getContractAddress(symbol) : contrctAddress;
    // }
    const tokenContract = await getContract(tempAddress, erc20ABI)
    // let decimal = 6
    // value = '9999999999999999';
    // let valueStr = tofixedWithEndPad(value, decimal)
    console.log(contrctAddress,from,to,value,decimal,'9999999999999999')
    let valueStr = decimalParseToBigNumber(value.toString(), decimal)
    console.log(
      '开始授权[参数debug] 002- >>',
      'to',
      to,
      'valueStr',
      valueStr,
      'from',
      from,
      'decimal',
      decimal
    )
    console.log('start auth！！！！！！！！！！！')
    let res = await tokenContract.approve(to, valueStr, {
      from: from,
      gasLimit: '1000000',
    })
    await res.wait()
    if (successCb) {
      successCb()
    }
    console.log('auth finish！！！！！！！！！！！ ')
    console.log('授权 执行完毕', res)
    //contractListener(tokenContract, res, successCb)
    return res
  } catch (e) {
    console.warn('合约报错辣！！！', e)
    if (errorCB) {
      errorCB()
    }
  }
}

/*RWA Asset 合约相关*/
export async function erc20transfer(actionAddress: string, to: string, amount: string) {
  const store = useStore();
  try {
    store.isLoad = false;
    const hashList = ref<string[]>([]);
    showLoadingToast({
      message: i18n.global.t('loading'),
      forbidClick: true,
      loadingType: 'spinner',
      duration: 0
    });
    const walletprovider = await getProvider();
    // let valueStr = decimalParseToBigNumber(effective(amount), 18)
    const contract = await getContract(actionAddress, erc20ABI);
    // 获取预测的 gas price
    const signer = walletprovider.getSigner();
    const gasPrice = await walletprovider.getGasPrice();
    const gasLimit = ethers.BigNumber.from("60000");
    const nonce = await walletprovider.getTransactionCount(await signer.getAddress());
    const chainId = await walletprovider.getNetwork().then(net => net.chainId);
     // 转换 amount 为大数（假设代币有 18 位小数）
    const parsedAmount = ethers.utils.parseUnits(amount, 18);  // 转换为最小单位（18位小数）
    const tx = await contract.populateTransaction.transfer(to, parsedAmount)
    const value = ethers.BigNumber.from("0");
    // 构造交易对象
    const txData = {
      to: actionAddress, //合约地址
      data: tx.data,
      gasPrice: gasPrice,
      gasLimit: gasLimit,
      nonce: nonce,
      chainId: chainId,
      value: value
    };
    let flag = false;
    const txResponse = await signer.sendTransaction(txData)
    await txResponse.wait();
    closeToast();
    store.isLoad = true;
    return true;
  } catch (error: any) {
    console.log(error, 'error')
    store.isLoad = true;
    errorTips(error);
    return false;
  }
}


// 获取ERC20 代币余额
export async function getTokenBalance(contractAddress: string, account: string, decimals: number) {
  try {
    let balance = '';
    let s = ''
    console.log(contractAddress,account,decimals,'contractAddress,account,decimals')
    const WalletProvider = await getProvider()
    if (contractAddress.includes('0x000')) {
      let temp = await WalletProvider.getBalance(account);
      balance = decimalParseToNumber(temp, decimals);
      s = balance;
    } else {
      const tokenContract = await getContract(contractAddress, erc20ABI);
      balance = await tokenContract.balanceOf(account);
      s = decimalParseToNumber(balance, decimals)
      // s = s.substring(0, s.indexOf('.') + 3)
    }
    return s;
  } catch (error: any) {
    showFailToast({
      duration: 4000,
      message: error,
    })
    console.error(error)
    return '0'
  }
}

// 获取ERC20 代币可用余额
export async function getTokenAllowBalance(address: string, account: string, decimal: number, to: string) {
  if(address.includes('0x000')){
    return '99999999999999999999999';
  }
  try {
    const tokenContract = await getContract(address, erc20ABI);
    const balance = await tokenContract.allowance(account, to)
    let s = decimalParseToNumber(balance, decimal)
    // s = s.substring(0, s.indexOf('.') + 3)
    return s
  } catch (error) {
    console.error(error)
    return '0'
  }
}


// context Start 
//获取payToken地址
export async function getPayTokenAddress(index:string) {
  const contractAddress = await getContractAddress('Force');
  const contract = await getContract(contractAddress, ForceAbi);
  const res = await contract.payTokens(index);
  console.log(res,'res')
  return res
}

//获取BLC地址
export async function getBLCAddress() {
  const contractAddress = await getContractAddress('Force');
  const contract = await getContract(contractAddress, ForceAbi);
  const res = await contract.BLC();
  return res
}

//获取payToken价格
export async function getPayTokenPrice() {
  const contractAddress = await getContractAddress('Force');
  const contract = await getContract(contractAddress, ForceAbi);
  const res = await contract.payTokenPrice();
  return res
}

//  start ----- 

//购买算力
export async function buyPower(params: any) {
  const {usdt,poolId,type} = params;
  const contractAddress = await getContractAddress('DIDPool');
  const contract = await getContract(contractAddress, DIDMiningPoolAbi);
  const res = await contract.buyPower(usdt,poolId,type,{
    gasLimit: '500000',
  });
  const hash = res.hash;
  await res.wait();
  return hash;
}


// 质押DID到DepositDID合约
export async function depositDID(params: any) {
  let {amount,durationDays} = params;
  amount = decimalParseToBigNumber(amount, 18).toString();
  console.log(amount,durationDays,'amount,durationDays')
  const contractAddress = await getContractAddress('DepositDID');
  const contract = await getContract(contractAddress, depositDIDAbi);
  const res = await contract.deposit(amount,durationDays,{
    gasLimit: '1000000',
  });
  const hash = res.hash;
  await res.wait();
  return hash;
}

//end

export async function getPayRatioListLength() { 
  const contractAddress = await getContractAddress('Force');
  const contract = await getContract(contractAddress, ForceAbi);
  const res = await contract.payRatioListLength();
  return res
}

export async function getPayRatios(index:number) { 
  const contractAddress = await getContractAddress('Force');
  const contract = await getContract(contractAddress, ForceAbi);
  const res = await contract.getPayRatios(index);
  return res
}


//质押FC
  export async function stakingFC(amount: any) {
  const contractAddress = await getContractAddress('Staking');
  const contract = await getContract(contractAddress, stakingAbi);
  const amountStr = decimalParseToBigNumber(amount, 18).toString();
  const res = await contract.deposit(amountStr, {
    gasLimit: '300000',
  });
  const hash = res.hash;
  await res.wait();
  return hash;
}

// 赎回
export async function withdrawBack(DepositAddress: string, ID: string) {
  const contract = await getContract(DepositAddress, stakingAbi);
  console.log(ID,'ID')
  const res = await contract.withdraw(ID, {
    gasLimit: 1000000,
  });
  await res.wait();
}

//获取FC价格
export async function getFCPrice() {
  const contractAddress = await getContractAddress('Staking');
  const contract = await getContract(contractAddress, stakingAbi);
  const res = await contract.getFcPrice();
  return res
} 

//销毁FC获取徽章
export async function getBadge(type: number) {
  try {
    const contractAddress = await getContractAddress('Badge');
    const contract = await getContract(contractAddress, badgeAbi);
    const res = await contract.getBadge(type, {
      gasLimit: '300000',
    });
    const hash = res.hash;
    return hash;
  } catch (error) {
    console.log(error, 'error')
    return false
  }
}


// context End


const errorTips = (error: any) => {
  let message = '';
  if (JSON.stringify(error).includes('user rejected transaction')) {
    message = i18n.global.t('TransactionCancelled');
  } else if (error.code == 4001) {
    message = error.message;
  } else {
    message = JSON.stringify(error)
  }
  console.log(error, 'error')
  closeToast();
  showToast({
    duration: 3000,
    className: "success-toast-box",
    message,
    icon: fail,
    overlay: false, // 是否显示背景遮罩层
    forbidClick: false, // 是否禁止点击
    closeOnClick: false, // 是否在点击后关闭
    closeOnClickOverlay: false, //是否在点击遮罩层后关闭
  });
}

//转成bignumber
export function decimalParseToBigNumber(num: any, decimals: number) {
  return utils.parseUnits(num.toString(), decimals)
}
//bignumber转成普通
export function decimalParseToNumber(num: any, decimals: number, fixed = 6) {
  let numss = ethers.utils.formatUnits(num, decimals)
  return numss.includes('.')
    ? numss.split('.')[0] + '.' + numss.split('.')[1].substr(0, fixed)
    : numss
  // let toFixedNum = tofixedWithEndPad(num, decimals)
  // return utils.parseUnits(toFixedNum, decimals)
}
