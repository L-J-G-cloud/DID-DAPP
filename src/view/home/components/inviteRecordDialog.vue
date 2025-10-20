<template>
  <div class="invite-record-dialog-container">
    <van-dialog v-model:show="show" class="dialog-box" :closeOnClickOverlay="true">
      <!-- 弹窗内容 -->
      <template #default>
        <div class="default-box">
          <div class="title-box">
            <div class="title F-Bold">
              <span class="left-icon"></span>
              <span>{{ t("InviteRecord") }}</span>
              <!-- <span class="line">｜</span>
              <span class="performance" @click="showPerformance = true">{{ t('performance') }}</span> -->
            </div>
            <!-- 关闭图标 -->
            <div class="title-line">
              <img class="close-img" src="@/assets/imgs/home/close.png" alt="" @click="handleClickClose" />
            </div>
          </div>


          <!-- 总邀请统计数 -->
          <div class="statistic">
            <data class="statistic-item">
              <img src="@/assets/imgs/home/user.png" alt="" class="user-icon" />
              <div class="label">{{ t("InvitedUsers") }}</div>
              <div class="value F-SemiBold">{{ userInviteInfo.total_num }}</div>
            </data>
            <data class="statistic-item">
              <img src="@/assets/imgs/home/effect-user.png" alt="" class="user-icon" />
              <div class="label">{{ t("ActiveUsers") }}</div>
              <div class="value F-SemiBold">{{ userInviteInfo.valid_num }}</div>
            </data>
          </div>

          <!-- 邀请记录列表 -->
          <van-list v-if="recordList.length" v-model:loading="loading" :loading-text="t('loading')" :finished="finished"
            :finished-text="t('NoMore')" @load="getRecordList" :offset="30" class="current-pledge-list-box">
            <div v-if="recordList.length > 0" class="record-table-box">
              <div class="header">
                <div class="first-line th F-SemiBold">
                  {{ t("WalletAddress") }}
                </div>
                <div class="second-line th F-SemiBold">
                  {{ t("RegistrationDate") }}
                </div>
              </div>
              <div class="record-list">
                <div class="record-item F-Bold" v-for="(item, index) in recordList" :key="index">
                  <div class="first-line wallet-address-column">
                    <div>
                      <img class="user-icon" v-if="item.is_valid" src="@/assets/imgs/home/user-avatar.png" alt="" />
                      <img class="user-icon" v-else src="@/assets/imgs/home/effect-user-avatar.png" alt="" />
                    </div>
                    <div class="address">{{ getStr(item.address, 4, 4) }}</div>
                    <img class="copy-icon" src="@/assets/imgs/home/copy.png" @click="handleClickCopy(item.address)" />
                  </div>

                  <div class="second-line date-time F-SemiBold">
                    <span>
                      {{
                        item.create_time
                          ? store.lang === "en"
                            ? `${getdata(item.create_time * 1000).timeXie} ${getdata(item.create_time * 1000).HM}`
                            : getdata(item.create_time * 1000).timeYMDHM
                          : "---"
                      }}
                    </span>
                    <!-- <p class="performance text-sm" @click="showPerformance = true">
                      {{ t('performance') }}
                    </p> -->
                  </div>


                </div>
              </div>
            </div>
          </van-list>

          <!-- 无邀请记录 -->
          <div v-if="!recordList.length && finished" class="no-record">
            <img class="empty-img" src="@/assets/imgs/home/empty-record.png" alt="" />
            <div class="empty-text">{{ t("NoContent") }}</div>
          </div>

          <div v-if="!recordList.length && !finished" class="no-record loading_text">
            <p>{{ t('loading') }}</p>
          </div>

        </div>
      </template>
      <template #footer> </template>
    </van-dialog>

    <van-dialog v-model:show="showPerformance" class="performance-dialog-box dialog-box" :closeOnClickOverlay="true"
      :closeOnPopstate="true">
      <template #default>
        <div class="default-box">
          <div class="title-box">
            <div class="title F-Bold">
              <span class="left-icon"></span>
              <span>{{ t("performance") }}</span>
            </div>
            <!-- 关闭图标 -->
            <div class="title-line">
              <img class="close-img" src="@/assets/imgs/home/close.png" alt="" @click="showPerformance=false" />
            </div>
          </div>
        </div>
        <div class="performance-content">
            <div class="performance-item" v-for="(value, key) in performanceInfo" :key="key">
              <img :src="getPerformanceImg(key)" alt="" class="performance-item-icon">
              <div class="performance-item-title">
                  <p>{{ t(`performance_${key}`) }}</p>
                  <p class="performance-item-value F-Bold">{{ value }}</p>
                  <p>BLC</p>
              </div>
            </div>
        </div>
      </template>
      <template #footer> </template>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { Dialog, showSuccessToast, showToast } from "vant";
import success from "@/assets/imgs/home/success.png";
import { myInviteDetail, getDirectRecommendationUserList } from "@/api";
import { getdata, getStr, getResultData } from "@/utils";
import { useStore } from "../../../store/store";
import { useI18n } from "vue-i18n";
import CopyToClipBoard from "copy-to-clipboard";
const { t } = useI18n();
const store = useStore();
const show = defineModel<boolean>("visible");
const showPerformance = ref(false);
type item = {
  address: string;
  create_time: number;
  is_valid?: boolean;
};
// 邀请记录列表
const recordList = ref<item[]>([]);
const loading = ref(false);
const finished = ref(false);
const performanceInfo = ref({
  day: '0',
  week: '10',
  month: '0',
  total: '0',
});
onMounted(() => {
  // myInviteDetail
});

// 关闭弹窗
function handleClickClose() {
  show.value = false;
  store.isLoad = true;
}

const userInviteInfo = ref({
  total_num: 0,
  valid_num: 0,
});

const params = reactive({
  limit: 10,
  start: 0,
});

onMounted(() => {
  getDetail();
});

const performanceImgs = import.meta.glob('/src/assets/imgs/performance_*.png', { eager: true, import: 'default' });
function getPerformanceImg(type: string) {
    return performanceImgs[`/src/assets/imgs/performance_${type}.png`] as string;
}

const getDetail = async () => {
  const { code, data } = await myInviteDetail();
  userInviteInfo.value = { ...userInviteInfo.value, ...data };
  store.invite_total_num = data.total_num;

  // store.node_data.deposit_blc = getResultData(data.node_data.deposit_blc)
  // store.node_data.deposit_ftd = getResultData(data.node_data.deposit_ftd)
  // store.node_data.total_income = getResultData(data.node_data.total_income)
  // store.super_data.deposit_blc = getResultData(data.super_node_data.deposit_blc);
  // store.super_data.deposit_ftd = getResultData(data.super_node_data.deposit_ftd);
  // store.super_data.total_income = getResultData(data.super_node_data.total_income);
};

const getRecordList = async () => {
  const { code, data, total } = await getDirectRecommendationUserList({
    ...params,
  });
  if (!code && data) {
    loading.value = false;
    recordList.value = [...recordList.value, ...data];
    params.start = recordList.value.length;
    // 数据全部加载完成
    if (recordList.value.length >= total) {
      finished.value = true;
    }
  } else {
    finished.value = true;
  }
};
watch(
  () => show.value,
  async () => {
    if (show.value) {
      recordList.value = [];
      params.start = 0;
      finished.value = false;
      store.isLoad = false;
      await getDetail();
      await getRecordList();
    }
  },
  { deep: true, immediate: true }
);
// 点击复制
async function handleClickCopy(text: string) {
  CopyToClipBoard(text);
  showToast({
    className: "success-toast-box",
    message: t("copied"),
    icon: success,
    overlay: false, // 是否显示背景遮罩层
    forbidClick: false, // 是否禁止点击
    closeOnClick: false, // 是否在点击后关闭
    closeOnClickOverlay: false, //是否在点击遮罩层后关闭
  });
  // try {
  //   try {
  //     CopyToClipBoard(text);
  //       showToast({
  //         className: "success-toast-box",
  //         message: t('copied'),
  //         icon: success,
  //         overlay: false, // 是否显示背景遮罩层
  //         forbidClick: false, // 是否禁止点击
  //         closeOnClick: false, // 是否在点击后关闭
  //         closeOnClickOverlay: false, //是否在点击遮罩层后关闭
  //       });
  //     } catch (e) {
  //       console.error(e);
  //     }

  // } catch (error) {
  //   console.log(error);
  // }
}
</script>

<style scoped lang="scss">
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

.performance {
  color: #FF3F3F;
  font-size: 0.88rem;
  text-decoration: underline;
}

.performance-content {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  align-items: center;
  padding: 0 0.8rem;
  // margin-bottom: 1.38rem;
  width: 100%;
  .performance-item { 
    width: 48%;
    font-size: 0.75rem;
    margin-bottom: 0.8rem;
    color: #B2B2B2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    border-radius: 0.38rem;
    border: 0.06rem solid #2C3436;
    padding: 0.8rem 0rem .6rem;
    background: #090909;
    .performance-item-icon {
      width: 2.5rem;
      height: 2.5rem;
    }
    .performance-item-title {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      .performance-item-value {
        font-size: 1rem;
        color: #fff;
      }
    }
  }
}

.text-sm {
  font-size: 0.75rem;
}

.invite-record-dialog-container {
  :deep(.dialog-box) {
    width: 92%;
    background: #121212;
    border-radius: 0.38rem;
    border: 0.06rem solid #303134;
    // border: 0.06rem solid #2a2d33;
    max-width: 370px;

    .loading_text {
      margin-top: 3rem;
      color: #ccc;
      font-size: .88rem;
    }

    /* 弹窗内容 */
    .current-pledge-list-box {
      height: 19rem;
      overflow: auto;
    }

    .title-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.8rem 0rem .6rem;
      border-bottom: 0.06rem solid #303134;
      margin-bottom: .6rem;

      .title {
        font-size: 1rem;
        color: #fff;
      }

      .line {
        margin: 0 0.2rem;
        color: #212225;
      }

    }

    .default-box {
      margin: 0 0.75rem 1.06rem;

      // 关闭图标
      .title-line {
        // padding-right: 0.44rem;
        // display: flex;
        // justify-content: right;
        // margin-bottom: 0.81rem;

        .close-img {
          width: 1rem;
          height: 1rem;
        }
      }

      // 总邀请统计数
      .statistic {
        display: flex;
        // justify-content: center;
        align-items: center;
        margin-bottom: 1.56rem;

        .statistic-item {
          // margin-right: 6.5rem;
          width: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;

          &:last-child {
            border-left: 0.06rem solid #303134;
          }

          .user-icon {
            width: 2.74rem;
            // height: 2.45rem;
          }

          .label {
            margin: 0.53rem 0;
            font-weight: 500;
            font-size: 0.75rem;
            color: #B2B2B2;
            line-height: 1rem;
          }

          .value {
            margin-top: 0.1rem;
            font-weight: bold;
            font-size: 1.25rem;
            // color: #1dcc89;
            line-height: 1.31rem;
          }

          &:last-child {
            margin-right: 0;
          }
        }
      }

      // 邀请记录列表
      .record-table-box {
        .first-line {
          flex: 2.5;
        }

        .second-line {
          flex: 2;
        }

        .header {
          display: flex;
          margin-bottom: 0.25rem;
          padding: 0 0.88rem;

          .th {
            font-weight: 600;
            font-size: 0.75rem;
            color: #B2B2B2;
            line-height: 1.06rem;
            // text-align: right;
            // &:last-child {
            //   text-align: right;
            // }
          }
        }

        .record-list {
          .record-item {
            display: flex;
            align-items: center;
            padding: 0.81rem 0.88rem;
            border-bottom: 0.06rem solid #2b2d31;

            .wallet-address-column {
              display: flex;
              align-items: center;

              .user-icon {
                width: .76rem;
                height: .76rem;
                margin-right: 0.69rem;
              }

              .address {
                font-weight: bold;
                font-size: 0.88rem;
                color: #ffffff;
                line-height: 1rem;
                margin-right: 0.51rem;
              }

              .copy-icon {
                width: 0.75rem;
                height: 0.75rem;
              }
            }

            .date-time {
              font-weight: bold;
              font-size: 0.75rem;
              color: #B2B2B2;
              line-height: 1rem;
              // text-align: right;
            }
          }
        }

        .record-list::-webkit-scrollbar {
          display: none;
          /*隐藏滚动条*/
        }
      }

      // 无邀请记录
      .no-record {
        height: 20.31rem;
        display: flex;
        flex-direction: column;
        align-items: center;

        .empty-img {
          margin-top: 4rem;
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
