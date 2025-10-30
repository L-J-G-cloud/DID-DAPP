<template>
    <div class="content-box">
        <div class="header">
            <div class="title-line d-flex justify-content-center">
                <div class="title">
                    <span>{{ $t('pledge_title') }}</span>
                    <img src="@/assets/imgs/identitycasting/back.png" alt="" class="back-icon" @click="router.back()">
                </div>
            </div>
        </div>

        <!-- 质押输入区域 -->
        <div class="staking-input-section">
            <div class="section-title">{{ $t('pledge_amount') }}</div>

            <!-- 数量输入框 -->
            <div class="input-container">
                <input type="text" v-model="stakingAmount" :placeholder="$t('pledge_amount_placeholder')" class="amount-input"
                    @input="handleAmountInput">
                <button class="all-btn" @click="setAllAmount">{{ $t('pledge_all') }}</button>
            </div>

            <!-- 质押选项按钮 -->
            <div class="staking-options">
                <div class="option-btn" :class="{ active: selectedOption === option.value }"
                    v-for="option in stakingOptions" :key="option.value" @click="selectOption(option.value)">
                    <div class="checkbox-icon">
                        <img :src="selectedOption === option.value ? selected : select" alt="">
                    </div>
                    <span>{{ option.label }}</span>
                </div>
            </div>

            <!-- 锁仓时间选择 -->
            <div class="lockup-time-section">
                <div class="section-label">{{ $t('pledge_lock_time') }}</div>
                <div class="dropdown-container" :class="{ 'active': showDropdown }">
                    <input type="number" v-model="selectedLockupTime" :placeholder="$t('pledge_lock_time_placeholder')" class="lockup-input"
                        @input="handleLockupInput">
                    <span class="day-text" v-if="selectedLockupTime">{{ $t('pledge_day') }}</span>
                    <div class="dropdown-arrow-container" @click="toggleDropdown">
                        <img src="@/assets/imgs/identitycasting/arr_down.png" alt="" class="dropdown-arrow"
                        :class="{ 'rotated': showDropdown }">
                    </div>
                    

                    <!-- 下拉选项 -->
                    <div class="dropdown-options" :class="{ 'show': showDropdown }">
                        <div class="options-list">
                            <div class="option-item" v-for="day in lockupDays" :key="day" @click="selectDay(day)"
                                :class="{ 'selected': selectedLockupTime === day.toString() }" :data-day="day">
                                <span class="option-text">{{ day }}{{ $t('pledge_day') }}</span>
                                <img :src="selectedLockupTime === day.toString() ? selected : select" alt=""
                                    class="checkbox-icon">
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 质押详情 -->
            <div class="staking-details">
                <div class="detail-item">
                    <span class="label">{{ $t('pledge_rate') }}</span>
                    <span class="value">{{ doublingRate }}%</span>
                </div>
                <div class="detail-item">
                    <span class="label">{{ $t('pledge_did_balance') }}</span>
                    <span class="value">{{ formatDecimal(didBalance, 4) }}</span>
                </div>
            </div>

            <!-- 错误提示信息 -->
            <div class="error-message" v-if="errorMessage">
                {{ errorMessage }}
            </div>

            <!-- 授权按钮 -->
            <button class="authorize-btn" @click="handleAuthorize" :disabled="!canStake">
                {{ buttonText }}
            </button>
        </div>

        <!-- 质押记录 -->
        <div class="staking-records-section">
            <div class="records-title">
                <div class="title-icon"></div>
                <span>{{ $t('pledge_record') }}</span>
            </div>

            <div class="records-list">
                <van-list v-model:loading="loading" :finished="finished" :finished-text="t('NoMore')"
                    :loading-text="t('loading')" @load="getStakingRecords" :offset="30">
                    <div class="record-item" v-for="(record, index) in stakingRecords" :key="index">
                        <div class="record-header">
                            <div class="record-left">
                                <div class="record-amount">
                                    {{ record.amount }} DID
                                </div>
                                <div class="record-rate">{{ $t('pledge_record_rate') }} {{ record.rate }}%</div>
                            </div>
                             <div class="record-status" :class="getStatusClass(record.status)">
                                 <div class="status-dot"></div>
                                 {{ getStatusText(record.status) }}
                             </div>
                        </div>

                        <div class="record-details">
                            <div class="detail-row">
                                <span class="detail-label">{{ $t('pledge_record_cycle') }}</span>
                                <span class="detail-value">{{ record.lockupPeriod }}{{ $t('pledge_day') }}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">{{ $t('pledge_record_start') }}</span>
                                <span class="detail-value">{{ record.startTime }}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">{{ $t('pledge_record_end') }}</span>
                                <span class="detail-value">{{ record.endTime }}</span>
                            </div>
                        </div>

                         <div class="record-actions" v-if="record.status === 2">
                             <div>
                                 <button class="redeem-btn F-Bold" v-if="record.showRedeem" @click="handleRedeem(record)">
                                     {{ $t('pledge_redeem') }}
                                 </button>
                             </div>

                             <div class="expand-icon" @click="toggleDetails(index)">
                                 <img src="@/assets/imgs/identitycasting/arr_down.png" alt=""
                                     :class="{ 'rotated': record.showDetails }">
                             </div>
                         </div>
                    </div>
                </van-list>
            </div>

            <!-- 无记录 -->
            <div class="no-record" v-if="!stakingRecords.length && finished">
                <img class="empty-img" src="@/assets/imgs/identitycasting/empty-record.png" alt="" />
                <div class="empty-text">{{ t('NoContent') }}</div>
            </div>

            <div v-if="!stakingRecords.length && !finished" class="no-record loading_text">
                <p>{{ t('loading') }}</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue';
import { useI18n } from "vue-i18n";
import { showToastIcon, formatDecimal,showLoading,closeToastLoading} from '@/utils';
import {getTokenBalance, getContractAddress,getTokenAllowBalance, decimalParseToNumber,approval,depositDID } from "@/api/mapcontract"
import { useStore } from '@/store/store';
import selected from '@/assets/imgs/identitycasting/selected.png';
import select from '@/assets/imgs/identitycasting/select.png';
const router = useRouter();
const { t } = useI18n();

// 质押输入相关数据
const store = useStore();
const stakingAmount = ref('');
const selectedOption = ref('');
const selectedLockupTime = ref('');
const showDropdown = ref(false);
const doublingRate = ref(5);
const didBalance = ref('--');
const canStake = ref(false);
const allowanceBalance = ref('0');
const buttonText = ref(t('pledge_action'));
const isApprovalNeeded = ref(false);
const errorMessage = ref('');

// 质押选项数据类型定义
interface StakingOption {
    value: string;
    label: string;
}

// 质押选项数据
const stakingOptions = ref<StakingOption[]>([
    { value: '100', label: '100 DID' },
    { value: '500', label: '500 DID' },
    { value: '1000', label: '1,000 DID' },
    { value: '5000', label: '5,000 DID' }
]);

// 生成1-360天的选项
const lockupDays = ref(Array.from({ length: 360 }, (_, i) => i + 1));

// 分页相关数据
const loading = ref(false);
const finished = ref(false);
const params = reactive({
    limit: 10,
    start: 0,
});

// 质押记录数据
const stakingRecords = ref([
    {
        amount: '300',
        rate: 5,
        status: 1, // 质押中
        lockupPeriod: 7,
        startTime: '2025/10/20 10:10',
        endTime: '2025/10/27 10:10',
        showDetails: false,
        showRedeem: false
    },
    {
        amount: '500',
        rate: 8,
        status: 2, // 已确认
        lockupPeriod: 30,
        startTime: '2025/11/01 12:00',
        endTime: '2025/12/01 12:00',
        showDetails: false,
        showRedeem: false
    },
    {
        amount: '200',
        rate: 6,
        status: 0, // 区块确认中
        lockupPeriod: 14,
        startTime: '2025/10/25 14:30',
        endTime: '2025/11/08 14:30',
        showDetails: false,
        showRedeem: false
    }
]);


// 处理金额输入
const handleAmountInput = () => {
    
    // 检查是否匹配预设选项
    const matchedOption = stakingOptions.value.find(option => option.value === stakingAmount.value);
    if (matchedOption) {
        selectedOption.value = stakingAmount.value;
    } else {
        selectedOption.value = '';
    }
    
    calculateStaking();
};

// 选择质押选项
const selectOption = (option: string) => {
    selectedOption.value = option;
    stakingAmount.value = option;
    calculateStaking();
};

// 切换下拉框显示
const toggleDropdown = () => {
    showDropdown.value = !showDropdown.value;
};

// 处理锁仓时间输入
const handleLockupInput = () => {
    
    // 确保输入值是字符串格式，以便与下拉选项匹配
    const inputValue = selectedLockupTime.value.toString();
    
    // 检查输入的值是否在有效范围内
    const numericValue = parseInt(inputValue);
    if (numericValue && numericValue >= 1 && numericValue <= 360) {
        selectDay(numericValue);
        // 输入值在有效范围内，可以继续
        calculateStaking();
        
        // 如果下拉框是打开的，滚动到对应选项
        if (showDropdown.value) {
            scrollToSelectedOption(numericValue);
        }
    } else if (inputValue === '') {
        // 清空输入
        calculateStaking();
    }
};

// 滚动到选中的选项
const scrollToSelectedOption = (day: number) => {
    nextTick(() => {
        const optionElement = document.querySelector(`[data-day="${day}"]`);
        if (optionElement) {
            optionElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });
};

// 选择天数
const selectDay = (day: number) => {
    selectedLockupTime.value = day.toString();
    showDropdown.value = false;
    calculateStaking();
};

// 关闭下拉框（点击外部）
const closeDropdown = () => {
    showDropdown.value = false;
};

// 点击遮罩层关闭弹窗
const handleModalClick = (e: Event) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('selection-modal')) {
        closeDropdown();
    }
};

// 设置全部金额
const setAllAmount = () => {
    stakingAmount.value = didBalance.value.toString();
    selectedOption.value = ''; // 清除预设选项选择
    calculateStaking();
};

// 计算质押状态
const calculateStaking = () => {
    const amount = parseFloat(stakingAmount.value) || 0;
    const balance = parseFloat(didBalance.value) || 0;
    const allowance = parseFloat(allowanceBalance.value) || 0;
    
    
    // 重置状态
    errorMessage.value = '';
    canStake.value = false;
    isApprovalNeeded.value = false;
    buttonText.value = t('pledge_action');
    
    // 基础验证
    if (Number(amount) <= 0 || !selectedLockupTime.value) {
        return;
    }
    
    // 余额检查
    if (Number(balance) < Number(amount)) {
        errorMessage.value = t('pledge_insufficient_balance');
        return;
    }
    
    // 授权检查
    if (Number(allowance) < Number(amount)) {
        canStake.value = true;
        buttonText.value = t('AuthorizationTo');
        isApprovalNeeded.value = true;
        return;
    }
    
    // 可以质押
    canStake.value = true;
};

// 格式化数字
const formatNumber = (num: number) => {
    return num.toLocaleString();
};

// 获取状态文本
const getStatusText = (status: number | string) => {
    const statusMap: { [key: string | number]: string } = {
        0: t('pledge_status_pending'),
        1: t('pledge_status_staking'),
        2: t('pledge_status_expired'),
    };
    return statusMap[status] || t('pledge_status_unknown');
};

// 获取状态样式类
const getStatusClass = (status: number | string) => {
    const classMap: { [key: string | number]: string } = {
        0: 'status-confirming',
        1: 'status-staking',
        2: 'status-expired',
    };
    return classMap[status] || 'status-unknown';
};

// 切换详情显示
const toggleDetails = (index: number) => {
    const record = stakingRecords.value[index];
    record.showDetails = !record.showDetails;
    record.showRedeem = !record.showRedeem;
};

// 处理授权/质押
const handleAuthorize = async () => {
    if (!canStake.value) return;

    showLoading();
    try {
        if (isApprovalNeeded.value) {
            await approval(
                didAddress.value, 
                store.account, 
                depositDIDAddress.value, 
                stakingAmount.value, 
                18, 
                () => {
                    showToastIcon(t('Authorizationsuccessful'), 'success');
                    allowanceBalance.value = stakingAmount.value;
                    calculateStaking();
                }, 
                () => {
                    showToastIcon(t('AuthorizationFail'), 'fail');
                    setTimeout(() => {
                        checkBalance();
                    }, 2000);
                }
            );
        } else {
            const hash = await depositDID({
                amount: stakingAmount.value,
                durationDays: selectedLockupTime.value,
            });
            showToastIcon(t('pledge_success'), 'success');
            setTimeout(() => {
                checkBalance();
                resetForm();
            }, 2000)
        }
    } catch (error) {
        showToastIcon(t('pledge_fail'), 'fail');
    } finally {
        setTimeout(() => {
            closeToastLoading();
        }, 2000);
    }
};

// 重置表单
const resetForm = () => {
    stakingAmount.value = '';
    selectedLockupTime.value = '';
    canStake.value = false;
    buttonText.value = '质押';
    isApprovalNeeded.value = false;
    errorMessage.value = '';
};

// 处理赎回
const handleRedeem = (record: any) => {
    showToastIcon(t('pledge_redeem_submitted'), 'success');
};

// 获取质押记录
const getStakingRecords = async () => {
    try {
        // 模拟API调用
        const mockData = {
            code: 0,
            data: [],
            total: 3
        };

        const { code, data, total } = mockData;

        if (!code && data) {
            loading.value = false;
            stakingRecords.value = [...stakingRecords.value, ...data];
            params.start = stakingRecords.value.length;

            if (stakingRecords.value.length >= total) {
                finished.value = true;
            }
        } else {
            loading.value = false;
            finished.value = true;
        }
    } catch (error) {
        loading.value = false;
        finished.value = true;
        // 获取质押记录失败
    }
};

// 获取DID 和 DepositDID合约地址
const didAddress = ref('');
const depositDIDAddress = ref('');


// 检查余额和授权
const checkBalance = async () => {
    try {
        showLoading();
        // 获取合约地址
        if (!didAddress.value) {
            didAddress.value = await getContractAddress('DID');
        }
        if (!depositDIDAddress.value) {
            depositDIDAddress.value = await getContractAddress('DepositDID');
        }

        // 获取DID余额
        const balance = await getTokenBalance(didAddress.value, store.account, 18);
        if (Number(balance) > 0) {
            didBalance.value = balance || '0';
        } else {
            didBalance.value = '0';
        }

        // 获取授权额度
        const allowBalance = await getTokenAllowBalance(didAddress.value, store.account, 18, depositDIDAddress.value);
        if (Number(allowBalance) > 0) {
            allowanceBalance.value = allowBalance || '0';
        } else {
            allowanceBalance.value = '0';
        }

        // 重新计算质押状态
        calculateStaking();
    } catch (error) {
        didBalance.value = '0';
        allowanceBalance.value = '0';
    }
    finally {
        closeToastLoading();
    }
};


// 页面初始化
onMounted(async () => {
   
    // 设置初始状态
    params.start = stakingRecords.value.length;
    finished.value = true;

    // 添加点击外部关闭下拉框的事件监听
    document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.dropdown-container')) {
            closeDropdown();
        }
    });
   await checkBalance();
});

// 页面卸载时移除事件监听
onUnmounted(() => {
    document.removeEventListener('click', closeDropdown);
});

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

    // 质押输入区域
    .staking-input-section {
        background-color: #272830;
        border-radius: 0.38rem;
        padding: 1.13rem 0.88rem;

        .section-title {
            color: #fff;
            font-size: 1rem;
            font-weight: 500;
            margin-bottom: 0.75rem;
        }

        // 输入框
        .input-container {
            background-color: #1D1E24;
            border: 1px solid #34353E;
            border-radius: 0.25rem;
            height: 2.81rem;
            margin-bottom: 0.75rem;
            padding: 0 0.88rem;
            display: flex;
            align-items: center;
            box-sizing: border-box;
            position: relative;
            z-index: 1;

            .amount-input {
                flex: 1;
                background: none;
                border: none;
                outline: none;
                font-size: 1rem;
                color: #fff;
                padding: 0;
                pointer-events: auto;
                user-select: text;
                -webkit-user-select: text;
                -moz-user-select: text;
                -ms-user-select: text;

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
                transition: color 0.3s ease;

                &:hover {
                    color: #16b377;
                }
            }
        }

        // 质押选项按钮
        .staking-options {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.5rem;
            margin-bottom: 1rem;
            font-size: 0.88rem;
            line-height: 1.25rem;

            .option-btn {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem;
                background-color: #26272E;
                border: 1px solid #3D3D3D;
                border-radius: 0.38rem;
                cursor: pointer;
                transition: all 0.3s ease;

                &:hover {
                    border-color: #1DCC89;
                }

                &.active {
                    background-color: rgba(29, 204, 137, 0.16);
                    border-color: #1DCC89;
                    color: #1DCC89;
                }

                .checkbox-icon {
                    img {
                        width: 1rem;
                        height: 1rem;
                    }
                }

                span {
                    color: #fff;
                    font-size: 0.88rem;
                }
            }
        }

        // 锁仓时间选择
        .lockup-time-section {
            margin-bottom: 1rem;
            position: relative;
            .dropdown-arrow-container {
               width: 20%;
               height: 100%;
               display: flex;
               align-items: center;
               justify-content: end;
               padding-right: 0.88rem;
            }

            .section-label {
                color: #fff;
                font-size: 0.88rem;
                margin-bottom: 0.5rem;
            }

            .dropdown-container {
                position: relative;
                background-color: #1D1E24;
                border: 1px solid #34353E;
                border-radius: 0.25rem;
                height: 2.81rem;
                display: flex;
                align-items: center;
                padding: 0 0 0 0.88rem;
                box-sizing: border-box;

                &.active {
                    border-color: #1DCC89;
                }

                .lockup-input {
                    flex: 1;
                    background: none;
                    border: none;
                    outline: none;
                    color: #fff;
                    font-size: 0.88rem;
                    cursor: text;
                    padding: 0;
                    pointer-events: auto;
                    user-select: text;
                    -webkit-user-select: text;
                    -moz-user-select: text;
                    -ms-user-select: text;

                    &::placeholder {
                        color: #828592;
                    }
                }

                .day-text {
                    color: #828592;
                    font-size: 0.88rem;
                    margin-right: 0.5rem;
                }

                .dropdown-arrow {
                    cursor: pointer;
                    transition: transform 0.3s ease;
                    width: .81rem;

                    &.rotated {
                        transform: rotate(180deg);
                    }

                    img {
                        width: .81rem;
                        transition: transform 0.3s ease;
                    }
                }

                // 下拉选项
                .dropdown-options {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background-color: #1D1E24;
                    border: 1px solid #34353E;
                    border-radius: 0.25rem;
                    margin-top: 0.25rem;
                    z-index: 1000;
                    overflow: hidden;
                    max-height: 0;
                    opacity: 0;
                    transform: translateY(-10px);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

                    &.show {
                        max-height: 20rem;
                        opacity: 1;
                        transform: translateY(0);
                    }

                    .options-list {
                        max-height: 20rem;
                        overflow-y: auto;

                        .option-item {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            padding: 0.5rem 0.88rem;
                            cursor: pointer;
                            transition: all 0.3s ease;

                            &:hover {
                                background-color: #34353E;
                            }

                            &.selected {
                                color: #1DCC89;

                                .option-text {
                                    color: #1DCC89;
                                }
                            }

                            .option-text {
                                color: #fff;
                                font-size: 0.88rem;
                            }

                            .checkbox-icon {
                                width: 1rem;
                                height: 1rem;
                                border-radius: 0.125rem;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                position: relative;

                                .checkmark {
                                    width: 0.5rem;
                                    height: 0.25rem;
                                    border-left: 2px solid #1DCC89;
                                    border-bottom: 2px solid #1DCC89;
                                    transform: rotate(-45deg);
                                }
                            }

                            &.selected .checkbox-icon {

                                .checkmark {
                                    border-left-color: #fff;
                                    border-bottom-color: #fff;
                                }
                            }
                        }
                    }
                }
            }
        }

        // 质押详情
        .staking-details {
            margin-bottom: 1rem;

            .detail-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.5rem 0;

                .label {
                    color: #828592;
                    font-size: 0.88rem;
                }

                .value {
                    color: #fff;
                    font-size: 0.88rem;
                    font-weight: 500;
                }
            }
        }

        // 错误提示信息
        .error-message {
            color: #ff4757;
            font-size: 0.75rem;
            margin-bottom: 0.5rem;
            text-align: left;
        }

        // 授权按钮
        .authorize-btn {
            width: 100%;
            background-color: #1DCC89;
            color: #1E2741;
            border: none;
            border-radius: 0.38rem;
            padding: 0.75rem 0;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;

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

    // 质押记录区域
    .staking-records-section {
        margin-top: 1rem;

        .records-title {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
            padding: 0 0.38rem;

            .title-icon {
                width: 0.25rem;
                height: 1.06rem;
                background-color: #1DCC89;
                border-radius: 0.125rem;
            }

            span {
                color: #fff;
                font-size: 1rem;
                font-weight: 500;
            }
        }

        .records-list {
            .record-item {
                background-color: #272830;
                border-radius: 0.38rem;
                padding: 1rem;
                margin-bottom: 0.5rem;

                .record-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 0.75rem;

                    .record-left {
                        .record-amount {
                            color: #1DCC89;
                            font-size: 1rem;
                            font-weight: bold;
                            margin-bottom: 0.25rem;

                            &.expired {
                                color: #1DCC89;
                            }
                        }

                        .record-rate {
                            color: #fff;
                            font-size: 0.88rem;
                        }
                    }

                    .record-status {
                        display: flex;
                        align-items: center;
                        height: 1.63rem;
                        line-height: 1.6rem;
                        padding: 0 0.6rem;
                        border-radius: 0.25rem;
                        font-size: 0.75rem;
                        font-weight: 500;
                        color: #fff;

                        .status-dot {
                            width: 0.38rem;
                            height: 0.38rem;
                            border-radius: 50%;
                            margin-right: 0.4rem;
                        }

                        // 区块确认中 (status: 0)
                        &.status-confirming {
                            border: 1px solid #E3AA69;
                            color: #E3AA69;
                            border-radius: 0.81rem;
                            .status-dot {
                                background-color: #E3AA69;
                            }
                        }

                        // 质押中 (status: 1)
                        &.status-staking {
                            border: 1px solid #1DCC89;
                            color: #1DCC89;
                            border-radius: 0.81rem;
                            .status-dot {
                                background-color: #1DCC89;
                            }
                        }

                        // 已到期 (status: 2)
                        &.status-expired {
                            border: 1px solid #3D474E;
                            color: #fff;
                            border-radius: 0.81rem;
                            .status-dot {
                                background-color: #3D474E;
                            }
                        }
                    }
                }

                .record-details {
                    border: 1px solid #34353E;
                    padding: .5rem .75rem;
                    margin: 0 0 .7rem;
                    border-radius: 0.38rem;
                    .detail-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 0.25rem 0;

                        .detail-label {
                            color: #828592;
                            font-size: 0.75rem;
                        }

                        .detail-value {
                            color: #fff;
                            font-size: 0.75rem;
                        }
                    }
                }

                .record-actions {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex-direction: column;
                    .redeem-btn {
                        border: 1px solid #1DCC89;
                        background-color: transparent;
                        color: #1DCC89;
                        border-radius: 0.38rem;
                        padding: 0.5rem 4rem;
                        font-size: 0.88rem;
                        margin: .7rem 0;
                        cursor: pointer;
                    }

                    .expand-icon {
                        width: 100%;
                        text-align: center;
                        cursor: pointer;
                        padding: 0.4rem;

                        img {
                            width: .81rem;
                            transition: transform 0.3s ease;

                            &.rotated {
                                transform: rotate(180deg);
                            }
                        }
                    }
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