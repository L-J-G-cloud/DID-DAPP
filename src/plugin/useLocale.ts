import store from '@/store';
import {useI18n} from 'vue-i18n'
import { useStore } from "../store/store";

export default function useLocale(){
    const i18n = useI18n();
    const store = useStore()
    const curreentLocal = (value:string) =>{
        return i18n.locale.value
    }

    const changeLocal  = (value:string) => {
        console.log(value,'value')
        i18n.locale.value = value;
        store.lang = value;
    }
    return {
        i18n,
        curreentLocal,
        changeLocal
    }
}