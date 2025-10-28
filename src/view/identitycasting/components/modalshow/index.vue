<template>
    <div class="langs-container">
        <van-dialog v-model:show="show" class="dialog-box" :z-index="100" :showConfirmButton="false"
            :closeOnClickOverlay="true">
            <!-- 弹窗内容 -->
            <template #default>
                <div class="header plr-1">
                    <div class="title-line d-flex justify-content-between align-items-center">
                        <div class="title">
                            <span class="left-icon"></span>
                            <span class="mr-2">{{ t('IgnitionProgram') }}</span>
                            <img src="@/assets/imgs/identitycasting/tip.png" alt="" srcset="" @click="showTips = true">
                        </div>
                        <img class="close-img" src="@/assets/imgs/identitycasting/close.png" alt="" @click="handleClickCancel" />
                    </div>
                </div>
                <div class="content plr-1">   
                    <h4>{{ t('Dashboard') }}</h4>
                    <div class="content-box">
                        <div class="box-item">
                            <span>{{ t('TotalValidNodeExpansion') }}</span>
                            <span class="num">{{ sparkStaticsData.node_num }}</span>
                        </div>
                        <div class="box-item">
                            <span>{{ t('TotalAirdropReward') }}</span>
                            <span class="num"> {{ getResultData(sparkStaticsData.reward) }} <i class="F-Bold">FC</i></span>
                        </div>
                    </div>
                </div>
                <div class="time-box plr-1">
                    {{ t('ActivityTime') }}
                </div>
                <div class="bottom-img">
                    <img :src="store.lang === 'tw' ? bottomImg_tw : bottomImg_en" alt="" srcset="">
                </div>
            </template>
        </van-dialog>
        <van-dialog v-model:show="showTips" class="dialog-box-tips" :z-index="100" :showConfirmButton="false"
            :closeOnClickOverlay="true">
            <!-- 弹窗内容 -->
            <template #default>
                <div class="header plr-1">
                    <div class="title-line d-flex justify-content-between align-items-center">
                        <div class="title">
                            <span class="left-icon"></span>
                            <span class="mr-2">{{ t('IgnitionProgram') }}</span>
                        </div>
                        <img class="close-img" src="@/assets/imgs/identitycasting/close.png" alt="" @click="showTips = false" />
                    </div>
                </div>
                <div class="rules-box plr-1">  
                    <div class="rules-item">
                        <h4>{{ t('RewardRules') }}</h4>
                        <p v-html="t('RewardRulesDesc1')"></p>
                        <p v-html="t('RewardRulesDesc2')"></p>
                        <p v-html="t('RewardRulesDesc3')"></p>
                    </div>
                    <div class="rules-item">
                        <h4>{{ t('Notice') }}</h4>
                        <p v-html="t('RewardRulesDesc4')"></p>
                        <p v-html="t('RewardRulesDesc5')"></p>
                    </div>
                    <div class="rules-item">
                        <h4>{{ t('RewardDetails') }}</h4>
                        <p v-html="t('RewardRulesDesc6')"></p>
                    </div>
                </div>
            </template>
        </van-dialog>
    </div>
</template>

<script setup lang='ts'>
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n';
import bottomImg_tw from '@/assets/imgs/identitycasting/model_bottom.png'
import bottomImg_en from '@/assets/imgs/identitycasting/model_bottom_en.png'
import { useStore } from '@/store/store'
import { getResultData } from '@/utils'
import { sparkStatics } from '@/api'
const store = useStore()
const {
    t
} = useI18n();
const show = defineModel<boolean>("visible");
const sparkStaticsData = ref({
    node_num: 0,
    reward:'0'
})
const showTips = ref(false);

const handleClickCancel = () => {
    show.value = false;
}

const getSparkStatics = async () => {
    const {code,data} = await sparkStatics({})
    if(!code) {
        console.log(data)
        sparkStaticsData.value = data;
    }
}

watch(show, (newVal) => {
    if(newVal) {
        getSparkStatics()
    }
}, {immediate: true})

</script>
<style scoped lang='scss'>
:deep(.van-dialog, .dialog-box-tips) {
    padding:  .7rem .5rem 0;
    width: 94%;
    top: 50%;
    max-height: 90vh;
    overflow-y: scroll;
    max-width: 400px;
    border-radius: .38rem;
    border: 1px solid #2C3436;
    background-color: #090909;
}
.plr-1 {
    padding: 0 .5rem;
}
.mr-2 {
    margin-right: .5rem;
}
.header {
    // text-align: center;
    font-size: 1rem;
    margin-bottom: 1rem;
    padding: 0 0 .56rem;
    border-bottom: 1px solid #2C3436;

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

    img {
        width: 1rem;
        height: 1rem;
    }
}
.content {
    h4 {
        font-size: 1rem;
        margin-bottom: .5rem;
    }
    .content-box {
        display: flex;
        flex-direction: column;
        border-radius: .36rem;
        border: 1px solid #2C3436;
        gap: .63rem;
        padding: .75rem .44rem;
        color: #B2B2B2;
        .box-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            span {
                font-size: 1rem;
            }
            .num {
                color: #fff;
            }
        }
            
    }
}
.time-box {
    font-size: .75rem;
    color: #B2B2B2;
    margin-top: .5rem;
}

.rules-item {
    padding-bottom: .8rem;
    border-bottom: 1px solid #2C3436;
    margin-bottom: .8rem;
    :deep(span) {
        color: #FF3F3F;
    }
    &:last-child {
        border-bottom: none;
        margin-bottom: 0;
    }
    h4 {
        font-size: 1rem;
        margin-bottom: .5rem;
    }
    p {
        font-size: .88rem;
        line-height: 1rem;
        color: #B2B2B2;
    }
}
.bottom-img {
    margin-top: .5rem;
    img {
        width: 100%;
        height: auto;
    }
}
</style>