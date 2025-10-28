<template>

  <Head />
  <div class="reg_box">
    <!-- <div class="top_box">
        <p><img src="@/assets/imgs/identitycasting/B.png" alt=""></p>
        <p><span>BLC</span> <span class="color_white"> STAKING</span></p>
    </div> -->
    <div>

      <div class="input_box">
        <p>{{ t('InviteWallAddre') }}</p>
        <div>
          <input type="text" :placeholder="t('EnterInviteWallAddre')" v-model="invite_address">
        </div>
      </div>
      <div class="btns">
        <p>{{ t('Cancel') }}</p>
        <p @click="goAction">{{ t('OK1') }}</p>
      </div>
    </div>
    <!-- 系统维修 -->
    <maintenance-dialog ref="RefMaintenanceDialog" />
  </div>
</template>

<script setup lang='ts'>
import Head from '@/view/identitycasting/components/Head.vue'
import { reactive, ref } from 'vue'
import { getSignature } from '@/plugin/metamask'
import { useStore } from "../../store/store";
import {
  showToast,
} from "vant";
import fail from "@/assets/imgs/identitycasting/fail.png";
import { isValidBEP20OrPolygonAddress } from '@/utils'
import { getSystemStatus, isRegister, getAddressWhiteList } from '@/api'
import { useI18n } from "vue-i18n";
import { useRouter } from 'vue-router';
const { t } = useI18n();
const store = useStore();
const router = useRouter();
const invite_address = ref('')
const goAction = () => {
  if (!isValidBEP20OrPolygonAddress(invite_address.value)) {
    showToastTip(t('AddressFormatError'))
    return;
  }
  if (invite_address.value) {
    store.referrer = invite_address.value;
    getSignature(store.account, false);
  } else {
    showToastTip(t('EnterInviteWallAddre'))
  }
}
const showToastTip = (message: string) => {
  showToast({
    className: "success-toast-box",
    message,
    icon: fail,
    duration: 2000,
    overlay: false, // 是否显示背景遮罩层
    forbidClick: false, // 是否禁止点击
    closeOnClick: false, // 是否在点击后关闭
    closeOnClickOverlay: false, //是否在点击遮罩层后关闭
    wordBreak: "break-word",
  });
};

const RefMaintenanceDialog = ref();
onMounted(async () => {
  init();
})

watch(() => store.account, async () => {
  if (!store.account) { return }
  const { code, data } = await getSystemStatus({ address: store.account });
  if (!code) {
    if (!code) {
      if (data.system_status) {
        const { code: code2, data: data2 } = await getAddressWhiteList({ address: store.account });
        if (!code2) {
          store.system_status = data.system_status && !data2.is_white_list;
          if (store.system_status) {
            RefMaintenanceDialog.value.showDialog();
          }
        }
      }
    }
  }
}, { deep: true, immediate: true })

const init = async () => {
  if (store.account) {
    const { code, data } = await isRegister({ address: store.account });
    if (!code) {
      if (data) {
        store.exit();
        store.changeload();
        router.push('/');
      }
    }
  }
}
</script>
<style scoped lang='scss'>
.reg_box {
  max-width: 430px;
  margin: auto;
  min-height: 100vh;
  width: 100%;
  padding: 8.75rem 1.69rem 0;
  // background: url('@/assets/imgs/identitycasting/no_con_bg.png') no-repeat;
  background-position: bottom center;
  background-size: 100%;
}

.top_box {
  font-size: 1.58rem;
  color: #1DCC89;
  margin-bottom: 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;

  img {
    width: 4.83rem;
    height: 4.83rem;
    margin-bottom: 1.31rem;
  }

  .color_white {
    color: #fff;
  }
}

.input_box {
  input {
    margin-top: 1rem;
    width: 100%;
    height: auto;
    padding-bottom: .81rem;
    background: transparent;
    border: none;
    line-height: 1.3rem;
    border-bottom: 1px solid #2B2D31;
    font-size: 1.2rem;

    &::placeholder {
      font-size: .88rem;
    }
  }
}

.btns {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.19rem .3rem;

  p {
    width: 48%;
    height: 2.81rem;
    background-color: #383B46;
    border-radius: .5rem;
    line-height: 2.81rem;
    text-align: center;

    &:nth-child(2) {
      background-color: #1DCC89;
      // color: #121212;
    }
  }
}
</style>