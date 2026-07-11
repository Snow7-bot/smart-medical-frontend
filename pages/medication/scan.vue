<template>
<view class="page">
  <view class="status-bar-fill"></view>
  <view class="nav"><view class="back" @click="uni.navigateBack()">‹</view><text class="nav-t">扫描药盒</text></view>
  <view class="scan-zone">
    <view class="frame"><view class="corner tl"></view><view class="corner tr"></view><view class="corner bl"></view><view class="corner br"></view><text class="hint">正在启动摄像头...</text></view>
  </view>
  <view class="manual" @click="nav('/pages/medication/add')"><text>手动输入药品信息 →</text></view>
</view>
</template>

<script setup>
import { onMounted } from "vue";
import { medApi } from "@/api/medication.js";

function nav(u){uni.navigateTo({url:u});}

function startScan() {
  uni.scanCode({
    scanType: ["barCode","qrCode"],
    success: (res) => {
      uni.showLoading({title:"识别中..."});
      medApi.scanDrug(res.result).then(resp => {
        uni.hideLoading();
        const drug = resp.data || resp;
        if (drug && drug.name) {
          uni.showModal({
            title:"识别结果",
            content:`药品：${drug.name}\n规格：${drug.spec || "暂无"}`,
            success:() => uni.navigateTo({url:"/pages/medication/add"})
          });
        } else {
          uni.showModal({
            title:"识别结果",
            content:`条码：${res.result}\n未找到对应药品信息，请手动输入`,
            success:() => uni.navigateTo({url:"/pages/medication/add"})
          });
        }
      }).catch(() => {
        uni.hideLoading();
        uni.showModal({
          title:"识别结果",
          content:`条码：${res.result}\n请手动输入药品信息`,
          success:() => uni.navigateTo({url:"/pages/medication/add"})
        });
      });
    },
    fail: () => {
      uni.showToast({title:"扫码取消或失败",icon:"none"});
    }
  });
}

onMounted(() => {
  setTimeout(startScan, 300);
});
</script>

<style lang="scss" scoped>
.page { min-height:100vh; background:#0a0a1a; }
.status-bar-fill { height:var(--status-bar-height); }
.nav { display:flex; align-items:center; padding:8px 20px 14px; }
.back { font-size:24px; color:#667eea; margin-right:12px; }
.nav-t { font-size:17px; font-weight:700; color:#fff; }
.scan-zone { height:60vh; display:flex; align-items:center; justify-content:center; }
.frame { width:260px; height:200px; position:relative; }
.corner { position:absolute; width:28px; height:28px; border-color:rgba(102,126,234,0.8); }
.tl { top:0; left:0; border-top:3px solid; border-left:3px solid; border-radius:6px 0 0 0; }
.tr { top:0; right:0; border-top:3px solid; border-right:3px solid; border-radius:0 6px 0 0; }
.bl { bottom:0; left:0; border-bottom:3px solid; border-left:3px solid; border-radius:0 0 0 6px; }
.br { bottom:0; right:0; border-bottom:3px solid; border-right:3px solid; border-radius:0 0 6px 0; }
.hint { position:absolute; bottom:-40px; left:0; right:0; text-align:center; color:rgba(255,255,255,0.5); font-size:14px; }
.manual { text-align:center; padding:30px; }
.manual text { color:#667eea; font-size:15px; }
</style>

