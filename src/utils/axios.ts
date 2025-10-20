
import axios, { AxiosRequestConfig } from 'axios'
import router from '../router'
import i18n from '../plugin/i18n'
import { useStore } from "../store/store"
import fail from "@/assets/imgs/home/fail.png";
import {showLoadingToast,showFailToast,closeToast} from 'vant'
import store from '@/store'
// 创建axios实例
const service = axios.create({
    // baseURL: '',
    baseURL: '/api',
    timeout: 10000, // 请求超时时间
})

// request拦截器
service.interceptors.request.use(
    (config:any) => {
        const store = useStore();
        if(store.isLoad) {
            showLoadingToast({
                message: i18n.global.t('loading'),
                forbidClick: true,
                loadingType: 'spinner',
                duration:0
            });
        }
        
        if (config && config?.headers) {
        //     console.log(config.headers)
            config.headers.Token = store.token ? store.token : '';
            config.headers.Wallet = store.account ? store.account : '';
            // startLoading();
        //     // config.method === 'post'
        //     //     ? config.data = config.data
        //     //     : config.params = { ...config.params };
            config.headers['Content-Type'] = 'application/json';
            config.headers['Accept-Language'] = store.lang
            config.headers['Language'] = store.lang
           
            if (config.method && config.method.toLowerCase() === 'post' && config.data) {
                config.data = config.data;
            }
            let url:any = config.url
            // get参数编码
            if (config.params) {
                url += '?'
                const keys = Object.keys(config.params)
                for (const key of keys) {
                    url += `${key}=${config.params[key]}&`
                }
                url = url.substring(0, url.length - 1)
                config.params = {}
            }
            config.url = url
            // config.data = qs.stringify(config.data)
        }
        return config
    },
    (    error: any) => {
        // Do something with request error
        Promise.reject(error)
    }
)

// response 拦截器
service.interceptors.response.use(
    (response: { data: any; }) => {
        const store = useStore();
        /**
         * code为非20000是抛错 可结合自己业务进行修改
         */
        // endLoading();
        if(store.isLoad) {
            closeToast();
        }
        const res = response.data
        if (res.code === 0) {
            return response.data
        } else if (res.code === 3) {
            showFailToast({
               icon:fail, 
               message:res.msg,
               wordBreak: 'break-word',
            })
            setTimeout(()=>{
                sessionStorage.removeItem('token');
                sessionStorage.flag = true;
                store.exit();
                router.push('/');
                return Promise.reject()
            },2000)
        } else if (res.code === 17 || res.code === 55) {
            showFailToast({
                icon:fail, 
                message:res.msg,
                wordBreak: 'break-word',
             })
            console.log('用户没注册')
            return Promise.reject()
        } else {
            showFailToast({
                icon:fail, 
                message:res.msg,
                wordBreak: 'break-word',
             })
            return Promise.resolve(res)
        }
    },
    (error: any) => {
        let msg = error;
        if(error.includes('timeout of')) {
            msg = i18n.global.t('timeout') 
        }
        showFailToast({
            icon:fail, 
            message:msg,
            wordBreak: 'break-word',
         })
        console.log('报错了 ==> ', msg)
        return Promise.reject(msg)
    }
)
export interface IResponse<R = any> {
[x: string]: any
    total: any;
    code: number,
    data: R,
    msg: string
}

export const request = (config: AxiosRequestConfig<any>) => {
    return service.request<any, IResponse, any>(config)
}

export default service
