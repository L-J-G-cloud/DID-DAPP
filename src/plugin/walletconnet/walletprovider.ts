import { EthereumProvider } from '@walletconnect/ethereum-provider'
import {ethers } from "ethers";

export async function getWalletProviderTest() {
    
    const provider = await EthereumProvider.init({
        projectId: 'c45c72189ab8cff2c9b1dc103bd3455d', // required
        chains: [97],
        showQrModal: true ,
    });
    // await provider.enable()
    // const result = await provider.request({ method: 'eth_requestAccounts' })
    const WalletProvider = new ethers.providers.Web3Provider(provider)
    return {
        WalletProvider,
        provider
    };
}

export async function getWalletProvider() {
    const provider = await EthereumProvider.init({
        projectId: 'c45c72189ab8cff2c9b1dc103bd3455d', // required
        chains: [56],
        showQrModal: true ,
    });
    // await provider.enable()
    // const result = await provider.request({ method: 'eth_requestAccounts' })
    const WalletProvider = new ethers.providers.Web3Provider(provider)
    return {
        WalletProvider,
        provider
    };
}