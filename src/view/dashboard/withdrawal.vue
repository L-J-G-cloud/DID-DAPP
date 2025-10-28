<template>
  <div class="content-box">
    <div class="header">
      <div class="title-line d-flex justify-content-center">
        <div class="title">
          <span>{{ '奖励提现' }}</span>
          <img src="@/assets/imgs/identitycasting/back.png" alt="" class="back-icon" @click="router.back()">
        </div>
      </div>
    </div>
    <div class="withdrawal-content">
      <!-- 货币选择标签页 -->
      <div class="currency-tabs">
        <div class="tab-item" :class="{ active: selectedCurrency === currency.value }"
          v-for="currency in currencyOptions" :key="currency.value" @click="selectCurrency(currency.value)">
          {{ currency.label }}
        </div>
      </div>

      <!-- 提现金额输入 -->
      <div class="amount-input-section">
        <div class="input-container">
          <input type="number" v-model="withdrawalAmount" placeholder="0" class="amount-input"
            @input="calculateWithdrawal">
          <button class="all-btn" @click="setAllAmount">全部</button>
        </div>
        <div class="balance-display">
          {{ selectedCurrency }}数量: <span class="text-white">{{ formatNumber(getCurrentBalance()) }}</span>
        </div>
      </div>

      <!-- 提现摘要 -->
      <div class="withdrawal-summary">
        <div class="summary-left">
          <div class="amount-to-receive">
            <p class="label">到账数量</p>
            <p class="amount">{{ actualAmount }} {{ selectedCurrency }}</p>
          </div>
          <div class="fee-info">
            手续费: <span class="text-white">{{ fee }} {{ selectedCurrency }}</span>
          </div>
        </div>
        <button class="withdraw-btn" @click="handleWithdraw" :disabled="!canWithdraw">
          提现
        </button>
      </div>
    </div>


    <!-- 提现记录 -->
    <div class="withdrawal-records">
      <div class="records-title">
        <div class="title-icon"></div>
        <span>提现记录</span>
      </div>

       <div class="records-list">
         <van-list 
           v-model:loading="loading" 
           :finished="finished" 
           :finished-text="t('NoMore')"
           :loading-text="t('loading')" 
           @load="getRecordList" 
           :offset="30"
         >
           <div class="record-item" v-for="(record, index) in withdrawalRecords" :key="index">
             <div class="record-left">
               <div class="record-amount">- {{ record.amount }} {{ record.currency }}</div>
               <div class="record-time">{{ record.time }}</div>
             </div>
             <div class="record-status">提现</div>
           </div>
         </van-list>
       </div>

       <!-- 无记录 -->
       <div class="no-record" v-if="!withdrawalRecords.length && finished">
         <img class="empty-img" src="@/assets/imgs/identitycasting/empty-record.png" alt="" />
         <div class="empty-text">{{ t('NoContent') }}</div>
       </div>

       <div v-if="!withdrawalRecords.length && !finished" class="no-record loading_text">
         <p>{{ t('loading') }}</p>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import CopyToClipBoard from "copy-to-clipboard";
import { showToastIcon } from '@/utils';
import { useI18n } from "vue-i18n";
import { ref, reactive, onMounted, nextTick } from 'vue';
const { t } = useI18n();
const router = useRouter();

// 提现记录数据
const loading = ref(false);
const finished = ref(false);

// 分页参数
const params = reactive({
  limit: 10,
  start: 0,
});

// 货币选项数据类型定义
interface CurrencyOption {
  value: string;
  label: string;
  balance: number;
  feeRate: number;
}

// 货币选项数据 根据后端接口返回
const currencyOptions = ref<CurrencyOption[]>([]);

// 响应式数据
const selectedCurrency = ref('DID');
const withdrawalAmount = ref('');
const actualAmount = ref(0);
const fee = ref(1);
const canWithdraw = ref(false);

// 提现记录数据
const withdrawalRecords = ref([
  {
    amount: '5',
    currency: 'DID',
    time: '2025-08-09 10:20:10'
  },
  {
    amount: '5',
    currency: 'DID',
    time: '2025-08-09 10:20:10'
  },
  {
    amount: '5',
    currency: 'DID',
    time: '2025-08-09 10:20:10'
  },
  {
    amount: '5',
    currency: 'DID',
    time: '2025-08-09 10:20:10'
  },
  {
    amount: '5',
    currency: 'DID',
    time: '2025-08-09 10:20:10'
  },
  {
    amount: '5',
    currency: 'DID',
    time: '2025-08-09 10:20:10'
  }
]);
  
// 获取提现记录数据
const getRecordList = async () => {
  try {
    // 这里需要替换为实际的API调用
    // const { code, data, total } = await getRecordListApi({ ...params });
    
    // 模拟API调用 - 只在第一次加载时返回数据
    if (params.start === 0) {
      const mockData = {
        code: 0,
        data: [
          {
            amount: '5',
            currency: 'DID',
            time: '2025-08-09 10:20:10'
          },
          {
            amount: '10',
            currency: 'DID',
            time: '2025-08-08 15:30:25'
          },
          {
            amount: '3',
            currency: 'DID',
            time: '2025-08-07 09:15:40'
          }
        ],
        total: 3
      };
      
      const { code, data, total } = mockData;
      
      if (!code && data) {
        loading.value = false;
        withdrawalRecords.value = [...withdrawalRecords.value, ...data];
        params.start = withdrawalRecords.value.length;
        
        // 数据全部加载完成
        if (withdrawalRecords.value.length >= total) {
          finished.value = true;
        }
      } else {
        loading.value = false;
        finished.value = true;
      }
    } else {
      // 后续加载时直接标记为完成
      loading.value = false;
      finished.value = true;
    }
  } catch (error) {
    loading.value = false;
    finished.value = true;
    console.error('获取提现记录失败:', error);
  }
};

// 获取当前选中货币的余额
const getCurrentBalance = () => {
  const currentCurrency = currencyOptions.value.find(currency => currency.value === selectedCurrency.value);
  return currentCurrency ? currentCurrency.balance : 0;
};

// 选择货币
const selectCurrency = (currency: string) => {
  selectedCurrency.value = currency;
  withdrawalAmount.value = '';
  calculateWithdrawal();
};

// 设置全部金额
const setAllAmount = () => {
  withdrawalAmount.value = getCurrentBalance().toString();
  calculateWithdrawal();
};

// 计算提现金额
const calculateWithdrawal = () => {
  const amount = parseFloat(withdrawalAmount.value) || 0;
  const currentBalance = getCurrentBalance();

  if (amount > 0 && amount <= currentBalance) {
    // 计算手续费
    fee.value = 1;
    actualAmount.value = amount - fee.value;
    canWithdraw.value = true;
  } else {
    actualAmount.value = 0;
    fee.value = 0;
    canWithdraw.value = false;
  }
};

// 格式化数字
const formatNumber = (num: number) => {
  return num.toLocaleString();
};

// 处理提现
const handleWithdraw = () => {
  if (!canWithdraw.value) return;

  // 这里可以添加提现逻辑
  console.log('提现', {
    currency: selectedCurrency.value,
    amount: withdrawalAmount.value,
    actualAmount: actualAmount.value,
    fee: fee.value
  });

  // 模拟提现成功
  showToastIcon('提现申请已提交', 'success');

  // 更新对应货币的余额
  const currentCurrency = currencyOptions.value.find(currency => currency.value === selectedCurrency.value);
  if (currentCurrency) {
    currentCurrency.balance -= parseFloat(withdrawalAmount.value);
  }

  // 添加到提现记录
  withdrawalRecords.value.unshift({
    amount: withdrawalAmount.value,
    currency: selectedCurrency.value,
    time: new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(/\//g, '-')
  });

  withdrawalAmount.value = '';
  calculateWithdrawal();
};

// 页面初始化
onMounted(() => {
  // 初始化货币选项数据
  currencyOptions.value = [
    {
      value: 'DID',
      label: 'DID',
      balance: 69320,
      feeRate: 0.02
    },
    {
      value: 'USDT',
      label: 'USDT',
      balance: 1000,
      feeRate: 0.02
    },
    {
      value: 'USDID',
      label: 'USDID',
      balance: 500,
      feeRate: 0.02
    }
  ];
  
  // 设置初始状态
  params.start = withdrawalRecords.value.length;
  finished.value = true; // 初始数据已加载完成
});

</script>

<style scoped lang="scss">
.content-box {
  background-color: #1E1F25;
  border-radius: .38rem;
  min-height: 100vh;

  .header {
    font-size: 1rem;
    margin-bottom: 1.88rem;
    padding: 1rem 0 0;
    position: relative;

    .back-icon {
      position: absolute;
      left: .8rem;
      top: 1.5rem;
      width: .48rem;
      height: .89rem;
    }

    .tips {
      font-size: .88rem;
      color: #B2B2B2;
    }

    img {
      width: 1rem;
      height: 1rem;
    }
  }

  .withdrawal-content {
    background-color: #272830;
    padding: 1.13rem 0.88rem;
    margin: 0 0.88rem 1rem;
    border-radius: 0.38rem;
  }
  // 货币选择标签页
  .currency-tabs {
    display: flex;
    justify-content: space-between;
    border-radius: 0.38rem;
    margin-bottom: 0.88rem;
    .tab-item {
      width: 32%;
      text-align: center;
      padding: 0.625rem 0;
      font-size: 0.88rem;
      color: #fff;
      border-radius: 0.38rem;
      cursor: pointer;
      transition: all 0.3s ease;
      background-color: #26272E;
      border: 1px solid #3D3D3D;
      &.active {
        background-color: rgba(29, 204, 137, 0.16);
        border: 1px solid #1DCC89;
        color: #1DCC89;
      }
    }
  }

  // 提现金额输入区域
  .amount-input-section {
    .input-container {
      display: flex;
      align-items: center;
      margin-bottom: 0.75rem;
      background-color: #1D1E24;
      border-radius: 0.25rem;
      border: 1px solid #34353E;
      height: 2.81rem;
      line-height: 2.81rem;
      padding: 0 0.88rem;
      box-sizing: border-box;
      .amount-input {
        flex: 1;
        background: none;
        border: none;
        outline: none;
        font-size: 1rem;
        color: #fff;
        padding: 0;

        &::placeholder {
          color: #828592;
        }
      }

      .all-btn {
        color: #1DCC89;
        font-size: 0.88rem;
        cursor: pointer;
        border: none;
        background: transparent;
      }
    }

    .balance-display {
      font-size: 0.88rem;
      color: #828592;
    }
  }

  // 提现摘要
  .withdrawal-summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.88rem;
    border-top: 1px solid #34353E;
    .summary-left {
      .amount-to-receive {
        padding: 0.5rem 0 0;
        .label {
          color: #828592;
          font-size: 0.88rem;
        }

        .amount {
          color: #fff;
          font-size: 1rem;
          font-weight: bold;
        }
      }

      .fee-info {
        color: #828592;
        font-size: 0.88rem;
      }
    }

    .withdraw-btn {
      background-color: #1DCC89;
      color: #1E2741;
      border: none;
      border-radius: 0.38rem;
      padding: 0.56rem 2.13rem;
      font-size: 1rem;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-top: 1rem;

      &:hover:not(:disabled) {
        background-color: #16b377;
        transform: translateY(-1px);
      }

      &:disabled {
        background-color: #34353E;
        color: #828592;
        cursor: not-allowed;
        transform: none;
      }
    }
  }

  // 提现记录
  .withdrawal-records {
    margin: 0 0.5rem;

    padding: 0.88rem 0;

    .records-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0 0.75rem 0.75rem;
      font-size: 1rem;
      color: #fff;
      font-weight: bold;

      .title-icon {
        width: 0.25rem;
        height: 1.06rem;
        background-color: #1DCC89;
        border-radius: 0.125rem;
      }
    }

    .records-list {
      .record-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem;
        border-top: 1px solid #34353E;

        &:first-child {
          border-top: none;
        }

        .record-left {
          .record-amount {
            color: #fff;
            font-size: 1rem;
            font-weight: bold;
            margin-bottom: 0.25rem;
          }

          .record-time {
            color: #828592;
            font-size: 0.75rem;
          }
        }

        .record-status {
          color: #828592;
          font-size: 0.88rem;
        }
      }
    }

    // 无记录状态
    .no-record {
      text-align: center;
      padding: 2rem 1rem;

      .empty-img {
        width: 4rem;
        height: 4rem;
        margin-bottom: 1rem;
      }

      .empty-text {
        color: #828592;
        font-size: 0.88rem;
      }

      &.loading_text {
        color: #828592;
        font-size: 0.88rem;
      }
    }
  }
}
</style>