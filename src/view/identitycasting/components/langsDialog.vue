<template>
    <div class="langs-container">
      <van-dialog v-model:show="show" class="dialog-box" :z-index="100" :showConfirmButton="false" :closeOnClickOverlay="true">
        <!-- 弹窗内容 -->
        <template #default>
            <div class="head">
                <span></span>
                <img
                    src="@/assets/imgs/identitycasting/close.png"
                    alt=""
                    class="close"
                    @click="show = false"
                />
            </div>
            <div>
                <p v-for="(item,index) in langs" :key="index" class="items_lang d-flex justify-content-between align-items-center" @click="selectLang(index,item)">
                    <span>{{item.text}}</span>
                    <img :src="item.isChecked?Checked:noCheck" alt="">
                </p>
          </div>
        </template>
      </van-dialog>
    </div>
</template>

<script setup lang='ts'>
import {reactive,ref} from 'vue'
import noCheck from '@/assets/imgs/header/no_check.png'
import Checked from '@/assets/imgs/header/Checked.png'
import { useStore } from "../../../store/store";
import useLocal from "@/plugin/useLocale";
const {
  changeLocal,
} = useLocal();
const show = defineModel<boolean>("visible");
const store = useStore();

const langs = reactive([
  {
    isChecked:true,
    value:'en',
    text:'English'
  },
  {
    isChecked:false,
    value:'tw',
    text:'中文(繁体)'
  },
  {
    isChecked: false,
    value: "ko",
    text: "한국어"
  },
  {
    isChecked: false,
    value: "th",
    text: "ภาษาไทย"
  },
  {
    isChecked: false,
    value: "pt",
    text: "Português"
  },
  {
    isChecked: false,
    value: "ru",
    text: "Русский язык"
  },
  {
    isChecked: false,
    value: "hi",
    text: "हिन्दी"
  },
  {
    isChecked: false,
    value: "ms",
    text: "Bahasa Melayu"
  },
  {
    isChecked: false,
    value: "id",
    text: "Bahasa Indonesia"
  },
  {
    isChecked: false,
    value: "vi",
    text: "Tiếng Việt"
  },
  {
    isChecked: false,
    value: "ja",
    text: "にほんご"
  },
  {
    isChecked: false,
    value: "es",
    text: "Español"
  }
])


const selectLang = (index: number, info: { value: string; text: string }) => {
  langs.forEach(item => item.isChecked = false);
  langs[index].isChecked = true;
  show.value = false;
  store.lang = info.value;
  if(info.value==='en'||info.value==='tw') {
    changeLocal(info.value)
  }else{
    changeLocal('en')
  }
}

watch(()=>show.value,()=>{
   if(show.value) {
    langs.forEach(item=>item.isChecked = item.value===store.lang);
   }
})

</script>
<style scoped lang='scss'>
:deep(.van-dialog) {
    padding: 0 1rem;
    width: 94%;
    top: 50%;
    max-height: 90vh;
    overflow-y: scroll;
    max-width: 400px;
}
.items_lang {
  padding: .5rem 0;
  box-sizing: border-box;
  border-bottom: 1px solid #333333;
  font-size: .88rem;
  img {
    width: 1.19rem;
    height: 1.19rem;
  }
  &:last-child {
    margin-bottom: 1.19rem;
    border-bottom: none;
  }
}
.head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: .8rem 0 0;
    margin-bottom: 1rem;
    .close {
        width: .8rem;
    }
}
</style>