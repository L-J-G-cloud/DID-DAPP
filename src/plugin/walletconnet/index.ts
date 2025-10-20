// import { ethers } from "ethers";
import { getWalletProvider, getWalletProviderTest } from './walletprovider'
// import {checkIsBsc} from '../bsc'
import { closeToast, showDialog ,showLoadingToast} from "vant";
import 'vant/es/dialog/style';
// import WalletConnectproviderr from "@walletconnect/web3-provider";
import { JsonRpcSigner } from '@ethersproject/providers';
// import {getRandomStr16} from '@/utils'
// import {login,isRegister} from '@/api/user'
// import i18n from '@/plugins/i18n'
import i18n from '../i18n';
import { useStore } from "../../store/store"
// import { getTokenBalance } from '../../api/mapcontract'
import {isRegisterFn} from '@/plugin/metamask'
// console.log(store.account,'store.state.value.account')
export async function WalletConnet(call?:any) {
    console.log(process.env.NODE_ENV)
    const store = useStore();
    
    try {
        const { provider, WalletProvider } = process.env.NODE_ENV == 'development' ? await getWalletProviderTest() : await getWalletProvider();
        if(call) {call()};
        await provider.enable();
        if (String(provider.chainId)) {
            store.isWalletConnet = true;
            console.log(provider.accounts)
            store.account = provider.accounts[0];
            subscribe(provider)
            if(!store.userInfo.token){
                await isRegisterFn(store.account);
            }
            store.isLoad = true;
            // return {
            //     account,data,signature,isregister
            // }
        } else {
            closeToast();
            disconnect();
        }
       
    } catch (error) {
        console.log(error, 'error')
        closeToast();
    }
}


export async function disconnect() {
    const { provider } = process.env.NODE_ENV == 'development' ? await getWalletProviderTest() : await getWalletProvider();
    await provider.disconnect()
    resetApp()
}

async function getSigner(account: string, signer: JsonRpcSigner) {
    // const data = getRandomStr16()
    // const signature = await signer!.signMessage(data)
    return {
        // data,signature
    }

    // sessionStorage.signature = signature;
}

function subscribe(provider: any) {
    const store = useStore();
    // Subscribe to accounts change
    provider.on("accountsChanged", (accounts: Array<string>) => {
        // console.log(accounts);
    });

    // Subscribe to chainId change
    provider.on("chainChanged", (chainId: number) => {
        // console.log(chainId);
        if (chainId !== 97 && chainId !== 56) {
            disconnect();
            showDialog({
                // title: i18n.global.t('Reminder'),
                // message: i18n.global.t('Please-select-correct-chain'),
                theme: 'round-button',
                messageAlign: 'center',
                confirmButtonColor: 'linear-gradient(to right, #EA7C7C, #712AE1)',
                // confirmButtonText: i18n.global.t('Yes-I-know'),
            }).then(() => {
                closeToast();
                // on close
            });
        } else {
            // Store.state.chainId = chainId;
        }
    });

    // Subscribe to session disconnection
    provider.on("disconnect", (code: any, reason: any) => {
        console.log('断开')

        // Store.dispatch("LogOut");
        resetApp();
    });
}

window.addEventListener("load", async () => {
    const store = useStore();
    const { provider } = 'development' ? await getWalletProviderTest() : await getWalletProvider();
    if (store.account && provider && !provider.accounts[0] && store.isWalletConnet) { //解决链上进程中，用户断开连接
        resetApp();
        return;
    }

    if (store.account && store.isWalletConnet) { //用户刷新，保证当前连接的provider是最新的监听用户的断开操作
        WalletConnet();
    }
})
export function resetApp() {
    const store = useStore();
    store.banlance = '0';
    store.allowBalance = 0;
    store.account = '';
    store.token = '';
    store.isWalletConnet = false;
}
