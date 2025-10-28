<template>
    <div class="rules-dialog-container">
        <van-dialog v-model:show="show" class="dialog-box" :z-index="100" :showConfirmButton="false"
            :closeOnClickOverlay="true">
            <!-- 弹窗内容 -->
            <template #default>
                <div class="header plr-1">
                    <div class="title-line d-flex justify-content-between align-items-center">
                        <div class="title">
                            <span class="left-icon"></span>
                            <span class="mr-2">{{ t('supernode_rules_title') }}</span>
                        </div>
                        <img class="close-img" src="@/assets/imgs/identitycasting/close.png" alt="" @click="handleClickCancel" />
                    </div>
                </div>
                <div class="content plr-1">
                    <div class="content-box">
                        <ul>
                            <li class="content-box-item">
                                <h4>{{ t('supernode_rules_incentive_governance') }}</h4>
                                <p>{{ t('supernode_rules_start_condition') }}<br>{{ t('supernode_rules_incentive_qualification') }}<br>{{ t('supernode_rules_daily_airdrop') }}</p>
                            </li>
                            <li class="content-box-item">
                                <h4>{{ t('supernode_rules_contribution_acquire') }}</h4>
                                <p>{{ t('supernode_rules_main_community') }}<br>{{ t('supernode_rules_sub_community') }}</p>
                            </li>
                            <li class="content-box-item">
                                <h4>DAO{{ t('supernode_rules_governance') }}</h4>
                                <p>{{ t('supernode_rules_dao_desc') }}</p>
                            </li>
                        </ul>
                    </div>
                </div>
            </template>
        </van-dialog>
    </div>


</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from '@/store/store'
const store = useStore()
    const {
    t
} = useI18n();
const show = defineModel<boolean>("show");

const emit = defineEmits(['update:visible']);
const handleClickCancel = () => {
    emit('update:visible', false);
};
</script>

<style scoped lang="scss">
.rules-dialog-container {
    :deep(.van-dialog) {
        padding: .7rem .5rem 0;
        width: 95%;
        top: 50%;
        max-height: 90vh;
        overflow-y: scroll;
        max-width: 400px;
        border-radius: .38rem;
        border: 1px solid #2C3436;
        background-color: #090909;
    }
}


.header {
    padding: 0;
    border-bottom: 1px solid #212225;
    padding-bottom: 0.5rem;
}

.content {
    padding: 0.56rem 0;
    font-size: .88rem;
    color: #B2B2B2;
}

.close-img {
    width: 1rem;
    height: 1rem;
}
.title {
    display: flex;
    align-items: center;
    justify-content: center;
}
.left-icon {
    display: inline-block;
    width: .31rem;
    height: 1rem;
    margin-right: .44rem;
    background-color: #FF3F3F;
    border-radius: .19rem;
}

.content-box-item {
    display: flex;
    flex-direction: column;
    padding: 0 1rem;
    margin-bottom: 1.3rem;
    h4 {
        font-size: 1rem;
        color: #FF3F3F;
        margin-bottom: 0.5rem;
    }
    p {
        font-size: 0.88rem;
        line-height: 1rem;
        color: #B2B2B2;
    }
    div {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    img {
        width: 1.88rem;
        height: 1.88rem;
    }

    .arr-img {
        width: 1.15rem;
        height: 1.15rem;
    }

}
.en-box-item {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    p {
        text-align: center;
    }
}

.content-box {
    .detail-text {
        position: relative;
        padding-left: .8rem;
        line-height: 1.2rem;

        &::before {
            content: '';
            position: absolute;
            left: 0.2rem;
            top: .4rem;
            width: .3rem;
            height: .3rem;
            background-color: #FF3F3F;
            border-radius: 50%;
        }
    }
}
</style>