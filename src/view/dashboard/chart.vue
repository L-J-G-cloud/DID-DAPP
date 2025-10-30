<template>
    <div class="dashboard-container">
        <!-- 头部区域 -->
        <div class="header">
            <img src="@/assets/imgs/identitycasting/data.png" alt="">
            <span class="title F-Bold">{{ $t('dashboard_trend_title') }}</span>
        </div>

        <!-- 图表区域 -->
        <div class="charts-section">
            <!-- 全网身份算力图表 -->
            <div class="chart-section">
                <div class="chart-title">
                    ⚡ {{ $t('chart_identity_power') }}
                </div>
                <div class="chart-container" ref="identityPowerChartRef"></div>
            </div>

            <!-- 全网验证贡献图表 -->
            <div class="chart-section">
                <div class="chart-title">
                    🔍 {{ $t('chart_verification_contribution') }}
                </div>
                <div class="chart-container" ref="verificationContributionChartRef"></div>
            </div>

            <!-- 全网质押权重图表 -->
            <div class="chart-section">
                <div class="chart-title">
                    🔒 {{ $t('chart_staking_weight') }}
                </div>
                <div class="chart-container" ref="stakingWeightChartRef"></div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'

// 图表引用
const identityPowerChartRef = ref<HTMLElement>()
const verificationContributionChartRef = ref<HTMLElement>()
const stakingWeightChartRef = ref<HTMLElement>()

// 图表实例
let identityPowerChart: echarts.ECharts | null = null
let verificationContributionChart: echarts.ECharts | null = null
let stakingWeightChart: echarts.ECharts | null = null
const { t } = useI18n()

// 模拟数据生成函数
function generateData(days: number, baseValue: number, volatility: number) {
    const data: number[] = []
    const dates: string[] = []
    let currentValue = baseValue
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        dates.push(date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }))
        
        // 模拟数据波动
        const change = (Math.random() - 0.5) * volatility
        currentValue = Math.max(0, currentValue * (1 + change))
        data.push(Math.round(currentValue))
    }
    
    return { dates, data }
}

// 生成近100天的数据
const data100d = {
    identityPower: generateData(100, 9899345, 0.05),
    verificationContribution: generateData(100, 100345, 0.08),
    stakingWeight: generateData(100, 100345, 0.02)
}

// 通用图表配置函数
function createChartOption(data: number[], dates: string[], title: string, color: string) {
    return {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            textStyle: {
                color: '#fff'
            },
            formatter: function(params: any) {
                return params[0].axisValue + '<br/>' + 
                       `<span style="color:${params[0].color}">●</span> ${params[0].seriesName}: ${params[0].value.toLocaleString()}`
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: dates,
            axisLine: {
                lineStyle: {
                    color: 'rgba(255, 255, 255, 0.3)'
                }
            },
            axisLabel: {
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: 10
            }
        },
        yAxis: {
            type: 'value',
            axisLine: {
                lineStyle: {
                    color: 'rgba(255, 255, 255, 0.3)'
                }
            },
            axisLabel: {
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: 10,
                formatter: function(value: number) {
                    if (value >= 1000000) {
                        return (value / 1000000).toFixed(1) + 'M'
                    } else if (value >= 1000) {
                        return (value / 1000).toFixed(1) + 'K'
                    }
                    return value.toString()
                }
            },
            splitLine: {
                lineStyle: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            }
        },
        series: [{
            name: title,
            type: 'line',
            data: data,
            smooth: true,
            lineStyle: {
                color: color,
                width: 3
            },
            itemStyle: {
                color: color
            },
            areaStyle: {
                color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [{
                        offset: 0, color: color + '4D'
                    }, {
                        offset: 1, color: color + '0D'
                    }]
                }
            }
        }]
    }
}

// 初始化所有图表
function initAllCharts() {
    if (identityPowerChartRef.value) {
        identityPowerChart = echarts.init(identityPowerChartRef.value)
        const option1 = createChartOption(data100d.identityPower.data, data100d.identityPower.dates, t('chart_identity_power'), '#667eea')
        identityPowerChart.setOption(option1)
    }
    
    if (verificationContributionChartRef.value) {
        verificationContributionChart = echarts.init(verificationContributionChartRef.value)
        const option2 = createChartOption(data100d.verificationContribution.data, data100d.verificationContribution.dates, t('chart_verification_contribution'), '#26a17b')
        verificationContributionChart.setOption(option2)
    }
    
    if (stakingWeightChartRef.value) {
        stakingWeightChart = echarts.init(stakingWeightChartRef.value)
        const option3 = createChartOption(data100d.stakingWeight.data, data100d.stakingWeight.dates, t('chart_staking_weight'), '#ffd700')
        stakingWeightChart.setOption(option3)
    }
}

// 刷新数据
function refreshData() {
    // 重新生成数据
    const newData = {
        identityPower: generateData(100, 9899345, 0.05),
        verificationContribution: generateData(100, 100345, 0.08),
        stakingWeight: generateData(100, 100345, 0.02)
    }
    
    // 更新图表
    if (identityPowerChart) {
        const option1 = createChartOption(newData.identityPower.data, newData.identityPower.dates, t('chart_identity_power'), '#667eea')
        identityPowerChart.setOption(option1)
    }
    
    if (verificationContributionChart) {
        const option2 = createChartOption(newData.verificationContribution.data, newData.verificationContribution.dates, t('chart_verification_contribution'), '#26a17b')
        verificationContributionChart.setOption(option2)
    }
    
    if (stakingWeightChart) {
        const option3 = createChartOption(newData.stakingWeight.data, newData.stakingWeight.dates, t('chart_staking_weight'), '#ffd700')
        stakingWeightChart.setOption(option3)
    }
}

// 响应式调整
function handleResize() {
    identityPowerChart?.resize()
    verificationContributionChart?.resize()
    stakingWeightChart?.resize()
}

onMounted(() => {
    nextTick(() => {
        initAllCharts()
        window.addEventListener('resize', handleResize)
    })
})

onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    identityPowerChart?.dispose()
    verificationContributionChart?.dispose()
    stakingWeightChart?.dispose()
})
</script>

<style scoped lang="scss">
.dashboard-container {
    max-width: 1400px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    gap: 20px;
    grid-template-areas: 
        "header"
        "charts";
    padding: 20px;
}

/* 头部区域 */
.header {
    display: flex;
    align-items: center;
    img {
        width: 1.25rem;
        height: 1.25rem;
        margin-right: .5rem;
    }
    .title {
        font-size: 1.13rem;
        line-height: 1.56rem;
        margin: 0;
        color: #fff;
    }
}


/* 图表区域 */
.charts-section {
    grid-area: charts;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 20px;
}

.chart-section {
    background: #272830;
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 24px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    animation: fadeInUp 0.6s ease-out;
}

.chart-title {
    color: white;
    font-size: 18px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
}

.chart-container {
    height: 300px;
    width: 100%;
}

/* 响应式设计 */
@media (max-width: 1024px) {
    .charts-section {
        grid-template-columns: 1fr;
    }
}


/* 动画效果 */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.chart-section:nth-child(1) { animation-delay: 0.1s; }
.chart-section:nth-child(2) { animation-delay: 0.2s; }
.chart-section:nth-child(3) { animation-delay: 0.3s; }
</style>