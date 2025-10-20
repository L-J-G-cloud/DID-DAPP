<template>
  <div class="wallet-record-dialog-container" v-if="show">
    <van-dialog v-model:show="show" class="dialog-box" :closeOnClickOverlay="true">
      <!-- 弹窗内容 -->
      <template #default>
        <!-- 关闭图标 -->
        <div class="default-box">
          <div class="title-line d-flex justify-content-between align-items-center">
            <div class="title">
              <span class="left-icon"></span>
              <span>{{t('AirportDetails')}}</span>
            </div>
            <img class="close-img" src="@/assets/imgs/home/close.png" alt="" @click="handleClickClose" />
          </div>
          <!-- 记录列表 -->
          <van-list v-if="recordList.length" v-model:loading="loading" :finished="finished" :finished-text="t('NoMore')"
            :loading-text="t('loading')" @load="getRecordListData" :offset="30" class="current-pledge-list-box">
            <div v-if="recordList.length > 0" class="record-list">
              <div class="record-item" v-for="(item, index) in recordList" :key="index">
                <div class="item-line">
                  <div class="money F-Bold">
                    <span class="value"><i v-if="walletRecordType !== 3">{{ item.type === 1 ? '+' : '-' }}</i>
                      {{ getResultData(item.amount) }}</span>
                    <span class="unit">&nbsp;FC</span>
                  </div>
                  <div class="describe F-Regular">{{ item.module }}</div>
                </div>
               
                <div class="bottom-line">
                    <div class="date-time F-SemiBold"> {{ item.create_time ? store.lang === 'en'
                  ? getdata(item.create_time * 1000).langEnStr : getdata(item.create_time * 1000).timeDetail :'---'}}</div>
                </div>

                <div class="describe F-Regular accelerate-address" v-if="item.from_address">
                     {{t('accelerate_address')}} : {{getStr(item.from_address, 6, 6) }}
                </div>
               
              </div>
            </div>
          </van-list>

          <!-- 无记录 -->
          <div class="no-record" v-if="!recordList.length && finished">
            <img class="empty-img" src="@/assets/imgs/home/empty-record.png" alt="" />
            <div class="empty-text">{{ t('NoContent') }}</div>
          </div>

          <div v-if="!recordList.length && !finished" class="no-record loading_text">
            <p>{{ t('loading') }}</p>
          </div>

        </div>
      </template>
      <template #footer> </template>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { Dialog } from "vant";
import { getRecordList, waitReleaseList } from "@/api";
import { useI18n } from "vue-i18n";
import { getdata, getResultData, getStr } from '@/utils'
import { useStore } from "../../../store/store";
const { t } = useI18n();
const show = defineModel<boolean>("visible");
const loading = ref(false);
const finished = ref(false);
const store = useStore();
const title = ref('');
const params = reactive({
  limit: 10,
  start: 0,
  module: "FC",
  symbol: "FC",
});

const props = defineProps({
  walletRecordType: {
    type: Number,
    default: () => {
      return 1
    }
  }
})

// 交易记录列表
const recordList = ref<any[]>([]);
onMounted(() => {
  // getRecordListData();
})
// 关闭弹窗
function handleClickClose() {
  show.value = false;
  store.isLoad = true;
}
const deletePropertyIfExists = (obj: any, prop: any) => {
  // 判断对象是否具有指定属性
  if (prop in obj) {  // 使用 'in' 操作符可以检查对象中是否存在该属性
    // 如果有该属性，则删除它
    delete obj[prop];
    // console.log(`属性 "${prop}" 已删除`);
  } else {
    // console.log(`属性 "${prop}" 不存在`);
  }
}
watch(() => show.value, async (value) => {
  if (value) {
    recordList.value = [];
    params.start = 0;
    finished.value = false;
    store.isLoad = false;
    await getRecordListData();
  }
})

const getRecordListData = async () => {
  const tempApi = props.walletRecordType === 3 ? waitReleaseList : getRecordList;
  const { code, data, total } = await tempApi({ ...params });
  if (!code && data) {
    loading.value = false;
    recordList.value = [...recordList.value, ...data];
    params.start = recordList.value.length;
    // 数据全部加载完成
    if (recordList.value.length >= total) {
      finished.value = true;
    }
  } else {
    loading.value = false;
    finished.value = true;
  }
}

</script>

<style scoped lang="scss">
.wallet-record-dialog-container {
  .title {
    display: flex;
    align-items: center;
  }

  .left-icon {
    display: inline-block;
    width: .31rem;
    height: 1rem;
    margin-right: .44rem;
    background-color: #FF3F3F;
    border-radius: .19rem;
  }

  .loading_text {
    margin-top: 3rem;
    color: #ccc;
    font-size: .88rem;
  }
  .bottom-line {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 0.75rem;
    margin-bottom: .4rem;
    .date-time {
      margin-left: 0 !important;
    }
    .describe {
      font-size: 0.75rem;
      color: #B2B2B2;
    }
  }

  :deep(.dialog-box) {
    top: 50%;
    max-height: 90vh;
    overflow-y: scroll;
    width: 92%;
    background: #090909;
    border-radius: 0.75rem;
    border: 0.06rem solid #2C3436;
    max-width: 370px;

    .current-pledge-list-box {
      height: 27.63rem;
      overflow: auto;
    }

    /* 弹窗内容 */
    .default-box {
      margin: 1.13rem 0.75rem 1.06rem;

      .title-line {
        padding-right: 0.44rem;
        display: flex;
        justify-content: right;
        margin-bottom: 0.81rem;

        .close-img {
          width: 1rem;
          height: 1rem;
        }
      }

      .record-list {

        // height: 27.63rem;
        // overflow: auto;
        .record-item {
          box-sizing: border-box;
          // height: 5rem;
          padding: 0.5rem 0 0;
          border-radius: 0.38rem;
          margin-bottom: 0.69rem;
          border: 0.06rem solid #2C3436;

          &:last-child {
            margin-bottom: 0;
          }

          .item-line {
            margin-bottom: .6rem;
            display: flex;
            align-items: center;
            font-weight: bold;
            justify-content: space-between;
            padding: 0 0.75rem;
            .money {
              .value {
                font-size: 1rem;
                color: #FFD87E;
                line-height: 1.5rem;
                // margin-right: .44rem;
              }

              .unit {
                font-size: 1rem;
                color: #ffffff;
                line-height: 1.5rem;
              }
            }

          }

          .describe {
            font-weight: 400;
            font-size: 0.75rem;
            color: #B2B2B2;
            line-height: 1rem;
          }
        }
        .accelerate-address {
          padding: .1rem .7rem;
          background: #202020;
          color: #B2B2B2;
          // border-radius: .19rem;
          // margin-top: .3rem;
        }
      }

      .date-time {
        margin-left: auto;
        font-size: 0.75rem;
        color: #B2B2B2;
        line-height: 1rem;
      }

      .record-list::-webkit-scrollbar {
        display: none;
        /*隐藏滚动条*/
      }

      .no-record {
        height: 27.63rem;
        display: flex;
        flex-direction: column;
        align-items: center;

        .empty-img {
          margin-top: 8.82rem;
          width: 3.63rem;
          height: 3.94rem;
        }

        .empty-text {
          margin-top: 1.31rem;
          font-weight: 500;
          font-size: 0.75rem;
          color: #B2B2B2;
          line-height: 1.06rem;
        }
      }
    }
  }
}
</style>
