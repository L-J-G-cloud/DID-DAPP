import { createPinia } from 'pinia'

const store = createPinia()
// 使用该插件
// store.use(createPersistedState())

import piniaPersist from 'pinia-plugin-persist'

store.use(piniaPersist)

//导出
export default store
