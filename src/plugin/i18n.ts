import langs from '../langs'
import { createI18n } from "vue-i18n";
// 默认读取本地存储语言设置
const i18n = createI18n({
  locale: 'en',// 默认语言
  fallbackLocale:'en',// 不存在默认则为英文
  allowComposition: true,// 允许组合式api
  messages: {
    'en': langs.en, // 标识:配置对象
    'tw': langs.tw, // 标识:配置对象
    'ko': langs.ko,
    'hi': langs.hi
  },
})
export default i18n