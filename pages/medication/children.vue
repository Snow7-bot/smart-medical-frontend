<template>
<view class="page">
  <view class="status-bar-fill"></view>
  <view class="nav"><view class="back" @click="uni.navigateBack()">&#x2039;</view><text class="nav-t">儿童用药换算</text></view>
  <view class="content">
    <view class="disclaimer"><text class="dii-icon">&#x26A0;&#xFE0F;</text><text class="dii-text">儿童用药需遵医嘱，以下结果仅供参考。</text></view>
    <view class="card">
      <view class="fg"><text class="fl">药品</text><picker :value="di" :range="drugs" @change="e=>di=e.detail.value"><text class="fpv">{{drugs[di]}} &#x25BE;</text></picker></view>
      <view class="fg"><text class="fl">年龄</text><view class="fi-row"><input class="fi" type="number" v-model="age" placeholder="请输入"/><text class="fu">岁</text></view></view>
      <view class="fg" style="margin-bottom:0"><text class="fl">体重</text><view class="fi-row"><input class="fi" type="digit" v-model="wt" placeholder="请输入"/><text class="fu">kg</text></view></view>
    </view>
    <view class="btn-grad" @click="calc">计算安全剂量</view>
    <view class="result" v-if="showRes">
      <text class="res-title">推荐剂量</text>
      <text class="res-val">{{ resultDose }}</text><text class="res-unit">{{ resultUnit }}</text>
      <text class="res-desc">按体重计算 · 成人剂量 x (儿童体重/70) x 0.7</text>
      <view class="res-warn"><text class="rw-icon">&#x1F4E2;</text><text class="rw-text">首次使用建议咨询医生或药师</text></view>
    </view>
  </view>
</view>
</template>

<script setup>
import { ref } from "vue";
import { medApi } from "@/api/medication.js";
const drugs=ref([]);
const di=ref(0),age=ref(""),wt=ref(""),showRes=ref(false),resultDose=ref(""),resultUnit=ref("");
async function calc(){
  if(!age.value||!wt.value){uni.showToast({title:"请输入年龄和体重",icon:"none"});return;}
  try {
    const dName = drugs.value[di.value] || "";
    const res = await medApi.calcDosage({ drugName: dName, age: age.value, weight: wt.value });
    const data = res.data || res;
    resultDose.value = data.recommendedDose || data.dosage || "--";
    resultUnit.value = data.unit || "mg/每次";
  } catch(e) {
    resultDose.value = "--";
    resultUnit.value = "mg/每次";
  }
  showRes.value = true;
}

import { onMounted } from "vue";
onMounted(async () => {
  try {
    const list = await medApi.getList();
    if (list && list.length > 0) {
      drugs.value = list.map(d => d.name);
    } else {
      drugs.value = ["阿莫西林胶囊","布洛芬混悬液","头孢克肟颗粒"];
    }
  } catch(e) {
    drugs.value = ["阿莫西林胶囊","布洛芬混悬液","头孢克肟颗粒"];
  }
});
</script>

<style lang="scss" scoped>
.page { min-height:100vh; background:#F5F5FA; }
.status-bar-fill { height:var(--status-bar-height); background:#fff; }
.nav { display:flex; align-items:center; padding:8px 20px 14px; background:#fff; }
.back { font-size:24px; color:#667eea; margin-right:12px; }
.nav-t { font-size:17px; font-weight:700; color:#1A1A2E; }
.content { padding:16px 20px; }
.disclaimer { display:flex; align-items:flex-start; padding:12px 16px; margin-bottom:12px; background:rgba(246,211,101,0.15); border-radius:14px; }
.dii-icon { font-size:16px; margin-right:8px; }
.dii-text { font-size:12px; color:#6B7280; flex:1; line-height:1.5; }
.card { background:#fff; border-radius:18px; padding:20px; margin-bottom:16px; }
.fg { margin-bottom:18px; }
.fl { font-size:14px; font-weight:600; color:#1A1A2E; margin-bottom:8px; display:block; }
.fpv { font-size:15px; color:#667eea; background:#F5F5FA; padding:14px 16px; border-radius:14px; display:block; }
.fi-row { display:flex; align-items:center; gap:8px; }
.fi { flex:1; padding:14px 16px; background:#F5F5FA; border-radius:14px; font-size:16px; border:none; outline:none; }
.fu { font-size:13px; color:#9CA3AF; min-width:30px; }
.btn-grad { padding:16px; border-radius:14px; background:linear-gradient(135deg,#667eea,#764ba2); color:#fff; font-size:17px; font-weight:700; text-align:center; }
.result { margin-top:20px; padding:24px; background:#fff; border-radius:20px; text-align:center; }
.res-title { font-size:14px; color:#6B7280; display:block; margin-bottom:8px; }
.res-val { font-size:36px; font-weight:800; color:#667eea; }
.res-unit { font-size:16px; color:#6B7280; margin-left:4px; }
.res-desc { font-size:12px; color:#9CA3AF; display:block; margin:8px 0 14px; }
.res-warn { display:flex; align-items:center; justify-content:center; padding:10px 14px; background:rgba(246,211,101,0.15); border-radius:12px; }
.rw-icon { font-size:14px; margin-right:6px; }
.rw-text { font-size:12px; color:#e6a800; }
</style>
