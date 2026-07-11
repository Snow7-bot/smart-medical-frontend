<template>
<view class="page">
  <view class="status-bar-fill"></view>
  <view class="nav"><view class="back" @click="uni.navigateBack()">&#x2039;</view><text class="nav-t">记录指标</text></view>
  <view class="content">
    <scroll-view class="type-row" scroll-x show-scrollbar="false">
      <view class="type-item" v-for="t in types" :key="t.key" :class="{on:sel===t.key}" @click="sel=t.key">
        <image class="ti-img" :src="t.icon"></image><text class="ti-name">{{ t.label }}</text>
      </view>
    </scroll-view>
    <view class="card">
      <template v-if="sel==='bp'">
        <view class="fg"><text class="fl">收缩压(高压)</text><view class="fi-row"><input class="fi" type="number" v-model="bpSys" placeholder="90-180"/><text class="fu">mmHg</text></view></view>
        <view class="fg"><text class="fl">舒张压(低压)</text><view class="fi-row"><input class="fi" type="number" v-model="bpDia" placeholder="60-120"/><text class="fu">mmHg</text></view></view>
      </template>
      <template v-if="sel==='bs'">
        <view class="fg"><text class="fl">血糖值</text><view class="fi-row"><input class="fi" type="digit" v-model="bsVal" placeholder="3.0-15.0"/><text class="fu">mmol/L</text></view></view>
        <view class="fg"><text class="fl">时间</text><view class="fg-row"><text class="opt" :class="{on:bsTime==='fasting'}" @click="bsTime='fasting'">空腹</text><text class="opt" :class="{on:bsTime==='after'}" @click="bsTime='after'">餐后</text></view></view>
      </template>
      <template v-if="sel==='bo'"><view class="fg"><text class="fl">血氧</text><view class="fi-row"><input class="fi" type="number" v-model="boVal" placeholder="90-100"/><text class="fu">%</text></view></view></template>
      <template v-if="sel==='hr'"><view class="fg"><text class="fl">心率</text><view class="fi-row"><input class="fi" type="number" v-model="hrVal" placeholder="40-200"/><text class="fu">bpm</text></view></view></template>
      <template v-if="sel==='wt'"><view class="fg"><text class="fl">体重</text><view class="fi-row"><input class="fi" type="digit" v-model="wtVal" placeholder="30-200"/><text class="fu">kg</text></view></view></template>
      <view class="fg" style="margin-bottom:0"><text class="fl">备注</text><input class="fi" v-model="note" placeholder="可选"/></view>
    </view>
    <view class="btn-grad" @click="save">保存记录</view>
  <SuccessCheck ref="successRef" />
  </view>
</view>
</template>

<script setup>
import { ref } from "vue";
import SuccessCheck from "@/components/SuccessCheck.vue";
import { healthApi } from "@/api/health.js";
import { useAppStore } from "@/store";
const store = useAppStore();
const successRef = ref(null);
const sel=ref("bp");
const types=[
  {key:"bp",icon:"/static/icon_bp.png",label:"血压"},
  {key:"bs",icon:"/static/icon_bs.png",label:"血糖"},
  {key:"bo",icon:"/static/icon_bo.png",label:"血氧"},
  {key:"hr",icon:"/static/icon_hr.png",label:"心率"},
  {key:"wt",icon:"/static/icon_wt.png",label:"体重"}
];
const bpSys=ref(""),bpDia=ref(""),bsVal=ref(""),bsTime=ref("fasting"),boVal=ref(""),hrVal=ref(""),wtVal=ref(""),note=ref("");
async function save(){
  const hasBp=bpSys.value!==""||bpDia.value!=="";
  const hasBs=bsVal.value!=="";
  const hasBo=boVal.value!=="";
  const hasHr=hrVal.value!=="";
  const hasWt=wtVal.value!=="";
  if(!hasBp&&!hasBs&&!hasBo&&!hasHr&&!hasWt){
    uni.showToast({title:"请至少填写一项指标",icon:"none"});
    return;
  }
  try {
    if (hasBp) {
      if (!bpSys.value) { uni.showToast({title:"请填写收缩压",icon:"none"}); return; }
      if (!bpDia.value) { uni.showToast({title:"请填写舒张压",icon:"none"}); return; }
      await healthApi.addRecord({ patientId: store.currentMember?.id || null,
        metricType: "bp",
        valueSys: bpSys.value,
        valueDia: bpDia.value,
        unit: "mmHg",
        note: note.value || "",
      });
    }
    if (hasBs) {
      if (!bsVal.value) { uni.showToast({title:"请填写血糖值",icon:"none"}); return; }
      await healthApi.addRecord({ patientId: store.currentMember?.id || null,
        metricType: "bs",
        valueStr: bsVal.value,
        unit: "mmol/L",
        timeLabel: bsTime.value,
        note: note.value || "",
      });
    }
    if (hasBo) {
      if (!boVal.value) { uni.showToast({title:"请填写血氧值",icon:"none"}); return; }
      await healthApi.addRecord({ patientId: store.currentMember?.id || null,
        metricType: "bo",
        valueStr: boVal.value,
        unit: "%",
        note: note.value || "",
      });
    }
    if (hasHr) {
      if (!hrVal.value) { uni.showToast({title:"请填写心率值",icon:"none"}); return; }
      await healthApi.addRecord({ patientId: store.currentMember?.id || null,
        metricType: "hr",
        valueStr: hrVal.value,
        unit: "bpm",
        note: note.value || "",
      });
    }
    if (hasWt) {
      if (!wtVal.value) { uni.showToast({title:"请填写体重值",icon:"none"}); return; }
      await healthApi.addRecord({ patientId: store.currentMember?.id || null,
        metricType: "wt",
        valueStr: wtVal.value,
        unit: "kg",
        note: note.value || "",
      });
    }
    successRef.value.show();
    setTimeout(()=>uni.navigateBack(),1200);
  } catch(e) {
    // 如果API失败，尝试本地保存
    try {
      const records = uni.getStorageSync("health_records") || "[]";
      const arr = JSON.parse(records);
      let entry = {};
      if (hasBp) entry = { metricType:"bp", valueSys:bpSys.value, valueDia:bpDia.value, unit:"mmHg", note:note.value, time:new Date().toISOString() };
      else if (hasBs) entry = { metricType:"bs", valueStr:bsVal.value, unit:"mmol/L", timeLabel:bsTime.value, note:note.value, time:new Date().toISOString() };
      else if (hasBo) entry = { metricType:"bo", valueStr:boVal.value, unit:"%", note:note.value, time:new Date().toISOString() };
      else if (hasHr) entry = { metricType:"hr", valueStr:hrVal.value, unit:"bpm", note:note.value, time:new Date().toISOString() };
      else if (hasWt) entry = { metricType:"wt", valueStr:wtVal.value, unit:"kg", note:note.value, time:new Date().toISOString() };
      arr.push(entry);
      uni.setStorageSync("health_records", JSON.stringify(arr));
      successRef.value.show();
      setTimeout(()=>uni.navigateBack(),1200);
    } catch(e2) {
      uni.showToast({title:"保存失败，请检查网络后重试",icon:"none"});
    }
  }
}
</script>

<style lang="scss" scoped>
.page { min-height:100vh; background:#F5F5FA; }
.status-bar-fill { height:var(--status-bar-height); background:#fff; }
.nav { display:flex; align-items:center; padding:8px 20px 14px; background:#fff; }
.back { font-size:24px; color:#667eea; margin-right:12px; }
.nav-t { font-size:17px; font-weight:700; color:#1A1A2E; }
.content { padding:16px 20px; }
.type-row { white-space:nowrap; margin-bottom:16px; }
.type-item { display:inline-flex; flex-direction:column; align-items:center; padding:12px 18px; margin-right:8px; background:#fff; border-radius:14px; min-width:62px; box-shadow:0 2px 6px rgba(0,0,0,0.03); }
.type-item.on { background:linear-gradient(135deg,#667eea,#764ba2); }
.type-item.on .ti-name { color:#fff; }
.ti-img { width:28px; height:28px; margin-bottom:4px; }
.ti-name { font-size:12px; color:#6B7280; }
.card { background:#fff; border-radius:18px; padding:20px; margin-bottom:16px; }
.fg { margin-bottom:18px; }
.fl { font-size:14px; font-weight:600; color:#1A1A2E; margin-bottom:8px; display:block; }
.fi-row { display:flex; align-items:center; gap:8px; }
.fi { flex:1; padding:14px 16px; background:#F5F5FA; border-radius:14px; font-size:16px; border:none; outline:none; }
.fu { font-size:13px; color:#9CA3AF; min-width:50px; }
.fg-row { display:flex; gap:8px; }
.opt { padding:10px 18px; background:#F5F5FA; border-radius:12px; font-size:14px; }
.opt.on { background:linear-gradient(135deg,#667eea,#764ba2); color:#fff; font-weight:600; }
.btn-grad { padding:16px; border-radius:14px; background:linear-gradient(135deg,#667eea,#764ba2); color:#fff; font-size:17px; font-weight:700; text-align:center; }
</style>
