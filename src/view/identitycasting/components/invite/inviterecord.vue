<template>
  <div class="content-box">
    <div class="header">
      <div class="title-line d-flex justify-content-center">
        <div class="title">
          <span>{{ currentserId ? '邀请记录' : '我的邀请' }}</span>
          <img src="@/assets/imgs/identitycasting/back.png" alt="" class="back-icon" @click="router.back()">
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section" v-if="!currentserId">
      <div class="stats-card">
        <div class="stats-icon">
          <img src="@/assets/imgs/identitycasting/effect-user-avatar.png" alt="" class="icon-img">
        </div>
        <div class="stats-text">已邀请用户</div>
        <div class="stats-number">{{ inviteStats.totalInvited || 0 }}</div>
      </div>
      <div class="stats-line"></div>
      <div class="stats-card">
        <div class="stats-icon">
          <img src="@/assets/imgs/identitycasting/effect-user.png" alt="" class="icon-img">
        </div>
        <div class="stats-text">有效用户</div>
        <div class="stats-number">{{ inviteStats.validUsers || 0 }}</div>
      </div>
    </div>

    <!-- 地址列表 -->
    <div class="address-section">
      <div class="section-title">
        <div class="title-bar"></div>
        <span>地址列表</span>
      </div>
      <!-- van-list 组件始终渲染，确保下拉加载功能正常 -->
      <van-list v-model:loading="loading" :finished="finished" :finished-text="t('NoMore')"
        :loading-text="t('loading')" @load="loadAddressList" :offset="30" :immediate-check="false" class="address-list">
        <div v-if="addressList.length > 0" class="address-items">
          <div class="address-item" v-for="(item, index) in addressList" :key="index">
              <div class="item-row">
                <span class="label">钱包地址</span>
                <div class="address-content">
                  <img :src="item.is_valid?selectedIcon:noVliadIcon" alt="" class="check-icon">
                  <span class="address-text" @click="router.push(`/inviterecord/${item.id}`)">{{ getStr(item.address, 6, 6) }}</span>
                  <img src="@/assets/imgs/identitycasting/copy.png" alt="" class="copy-icon"
                    @click="copyAddress(item.address)">
                </div>
              </div>

              <div class="item-row">
                <span class="label">注册时间</span>
                <span class="value">{{ item.create_time ? (store.lang === 'en'
                  ? getdata(item.create_time * 1000).langEnStr
                  : getdata(item.create_time * 1000).timeDetail) : '---' }}</span>
              </div>

              <div class="item-row">
                <span class="label">身份算力</span>
                <span class="value">{{ formatDecimal(decimalParseToNumber(item.power, 18),4) || '0' }}</span>
              </div>
            </div>
          </div>
        </van-list>


      <!-- 无数据状态 -->
      <div class="no-data" v-if="!addressList.length && finished">
        <img class="empty-img" src="@/assets/imgs/identitycasting/empty-record.png" alt="" />
        <div class="empty-text">{{ t('NoContent') }}</div>
      </div>

      <div v-if="!addressList.length && !finished" class="no-data loading_text">
        <p>{{ t('loading') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter ,useRoute} from 'vue-router';
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { getDirectRecommendationUserList,myInviteDetail } from '@/api';
import { getStr, getdata, formatDecimal, decimalParseToNumber } from '@/utils';
import { useStore } from '@/store/store';
import { showToastIcon } from '@/utils';
import CopyToClipBoard from "copy-to-clipboard";
import selectedIcon from '@/assets/imgs/identitycasting/selected.png';
import noVliadIcon from '@/assets/imgs/identitycasting/no_valid.png';

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const store = useStore();

// 邀请统计数据
const inviteStats = reactive({
  totalInvited: 0,
  validUsers: 0
});

// 地址列表相关
const loading = ref(false);
const finished = ref(false);
const addressList = ref<any[]>([]);
const currentserId = ref(route.params.id as string);
const params = reactive({
  limit: 10,
  start: 0,
  user_id:currentserId.value ? Number(currentserId.value) : store.userInfo.user_data.id
});

// 获取邀请统计数据
const getInviteStats = async () => {
  try {
    const { code, data } = await myInviteDetail();
    if (!code && data) {
      inviteStats.totalInvited = data.total_invite || 0;
      inviteStats.validUsers = data.valid_invite || 0;
    }
  } catch (error) {
    console.error('获取邀请统计失败:', error);
  }
};

// 加载地址列表
const loadAddressList = async () => {  
  try {
    const { code, data, total } = await getDirectRecommendationUserList({ ...params });
    if (!code && data) {
      addressList.value = [...addressList.value, ...data];
      // 更新下一页的起始位置
      params.start = addressList.value.length;
      // 数据全部加载完成
      if (addressList.value.length >= total) {
        finished.value = true;
      }
    } else {
      finished.value = true;
    }
  } catch (error) {
    finished.value = true;
  } finally {
    // 必须设置 loading 为 false，告诉 van-list 组件加载完成
    loading.value = false;
  }
};

// 复制地址
const copyAddress = (address: string) => {
  CopyToClipBoard(address);
  showToastIcon('地址已复制', 'success');
};

onMounted(() => {
  getInviteStats();
});

watch(() => route.path, (oldVal,newVal) => {
  addressList.value = [];
  finished.value = false;
  // 不手动设置 loading，让 van-list 组件自己管理
  params.start = 0;
  currentserId.value = route.params.id as string;
  params.user_id = currentserId.value ? Number(currentserId.value) : store.userInfo.user_data.id;
  loadAddressList()
},{deep:true,immediate:true});
</script>

<style scoped lang="scss">
.content-box {
  background-color: #1E1F25;
  border-radius: .38rem;
  min-height: 100vh;
  padding: 0 .75rem;
  max-width: 500px;
  margin: 0 auto;
  
  // PC端适配
  @media (min-width: 768px) {
    padding: 6rem 1.2rem 0;
  }

  .header {
    font-size: 1rem;
    margin-bottom: 1.88rem;
    padding: 1rem 0 0;
    position: relative;

    .back-icon {
      position: absolute;
      left: .5rem;
      top: 1.5rem;
      width: .48rem;
      height: .89rem;
    }
  }

  // 统计卡片区域
  .stats-section {
    display: flex;
    align-items: center;
    gap: .75rem;
    margin-bottom: 1.5rem;
    background: #272830;
    border-radius: .38rem;

    .stats-line {
      width: 1px;
      height: 80px;
      background: #30313C;
    }

    .stats-card {
      flex: 1;
      padding: 1rem;
      text-align: center;
      position: relative;

      .stats-icon {
        position: relative;
        display: inline-block;
        margin-bottom: .5rem;

        .icon-img {
          width: 2.45rem;
          height: 2.45rem;
        }

        .icon-badge {
          position: absolute;
          bottom: -.1rem;
          right: -.1rem;
          width: .4rem;
          height: .4rem;
          background: #1DCC89;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: .3rem;
          color: white;
          font-weight: bold;
        }
      }

      .stats-text {
        font-size: .75rem;
        color: #B2B2B2;
        margin-bottom: .5rem;
        line-height: 1rem;
      }

      .stats-number {
        font-size: 1.13rem;
        font-weight: bold;
        color: #FFFFFF;
        line-height: 1.8rem;
      }
    }
  }

  // 地址列表区域
  .address-section {
    .section-title {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
      font-size: 1rem;
      color: #FFFFFF;
      font-weight: bold;

      .title-bar {
        width: .25rem;
        height: 1rem;
        background: #1DCC89;
        border-radius: .19rem;
        margin-right: .5rem;
      }
    }

    .address-list {
      .address-items {
        .address-item {
          padding: .75rem;
          margin-bottom: .75rem;
          border-bottom: 1px solid #30313C;
          &:last-child {
            margin-bottom: 0;
          }

          .item-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: .5rem;
            color: #828592;
            font-size: .88rem;

            &:last-child {
              margin-bottom: 0;
            }

            .label {
              min-width: 2rem;
              margin-right: .5rem;
            }

            .value {
              color: #FFFFFF;
              font-weight: 500;
            }

            .address-content {
              display: flex;
              align-items: center;
             

              .check-icon {
                width: 1rem;
                height: 1rem;
                margin-right: .3rem;
              }

              .address-text {
                display: flex;
                align-items: center;
                font-size: .88rem;
                color: #1DCC89;
                text-decoration: underline;
                font-weight: 500;
                margin-right: .5rem;
                
              }

              .copy-icon {
                width: .8rem;
                height: .8rem;
                cursor: pointer;
                opacity: 0.7;
                transition: opacity 0.2s;

                &:hover {
                  opacity: 1;
                }
              }
            }
          }
        }
      }
    }

    // 无数据状态
    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 3rem 0;

      .empty-img {
        width: 3.63rem;
        height: 3.94rem;
        margin-bottom: 1rem;
      }

      .empty-text {
        font-size: .75rem;
        color: #B2B2B2;
        text-align: center;
      }

      &.loading_text {
        color: #ccc;
        font-size: .88rem;
      }
    }
  }
}

// 隐藏滚动条
.address-list::-webkit-scrollbar {
  display: none;
}
</style>