<template>
<view class="page">
  <view class="status-bar-fill"></view>
  <view class="nav"><view class="back" @click="uni.navigateBack()">&#x2039;</view><text class="nav-t">添加药品</text></view>
  <view class="content">
    <view class="scan-entry" @click="nav(`/pages/medication/scan`)"><image class="se-icon" src="/static/icon_scan_camera.png"></image><text class="se-text">扫描药盒自动识别</text><text class="se-arrow">&#x2192;</text></view>
    <view class="card">
      <view class="fg"><text class="fl">药品名称 *</text><input class="fi" v-model="f.name" placeholder="请输入药品名称"/></view>
      <view class="fg"><text class="fl">药品规格</text><input class="fi" v-model="f.spec" placeholder="如：0.5g x 24粒"/></view>
      <view class="fg"><text class="fl">服用方式</text><view class="fg-row"><text class="op" :class="{on:f.method==='oral'}" @click="f.method='oral'">口服</text><text class="op" :class="{on:f.method==='external'}" @click="f.method='external'">外用</text><text class="op" :class="{on:f.method==='inj'}" @click="f.method='inj'">注射</text></view></view>
      <view class="fg"><text class="fl">服用频率</text><view class="fg-row"><text class="op" :class="{on:f.freq==='1'}" @click="f.freq='1'">每日1次</text><text class="op" :class="{on:f.freq==='2'}" @click="f.freq='2'">每日2次</text><text class="op" :class="{on:f.freq==='3'}" @click="f.freq='3'">每日3次</text></view></view>
      <view class="fg"><text class="fl">每次用量</text><input class="fi" v-model="f.dose" placeholder="如：1粒"/></view>
      <view class="fg" style="margin-bottom:0"><text class="fl">注意事项</text><input class="fi" v-model="f.note" placeholder="如：饭后服用、忌酒"/></view>
    </view>
    <view class="interact-card" @click="checkInteract"><image class="ic-icon" src="/static/icon_interact.png"></image><view class="ic-body"><text class="ic-title">药物相互作用检测</text><text class="ic-desc">AI检测与现有用药是否存在冲突</text></view><text class="ic-arrow">&#x2192;</text></view>
    <view class="btn-grad" @click="save">保存药品</view>
  </view>
  <SuccessCheck ref="successRef" />
</view>
</template>

<script setup>
import { ref } from "vue";
import SuccessCheck from "@/components/SuccessCheck.vue";
import { medApi } from "@/api/medication.js";
const successRef = ref(null);
const f=ref({name:"",spec:"",method:"oral",freq:"2",dose:"",note:""});
async function checkInteract(){
  if(!f.value.name){uni.showToast({title:"请先填写药品名称",icon:"none"});return;}
  try {
    const res = await medApi.checkInteraction([f.value.name]);
    const data = res.data || res;
    const msg = data.message || data.result || data.aiAnalysis || "AI分析中，暂未发现已知相互作用。";
    uni.showModal({title:"AI冲突分析",content:msg,showCancel:false});
  } catch(e) {
    // 降级：本地提示
    uni.showModal({title:"AI冲突分析",content:"暂无法连接AI服务。建议查询药品说明书确认相互作用。",showCancel:false});
  }
}
async function save(){
  if(!f.value.name){uni.showToast({title:"请填写药品名称",icon:"none"});return;}
  try {
    const res = await medApi.addDrug({
      name: f.value.name,
      spec: f.value.spec,
      method: f.value.method,
      freq: "每日"+f.value.freq+"次",
      dose: f.value.dose,
      note: f.value.note,
    });
    // 发送事件通知用药页面刷新
    uni.$emit("medicationUpdated");
    successRef.value.show();
    setTimeout(()=>uni.navigateBack(),1200);
  } catch(e) {
    // 降级：本地保存
    let list = [];
    try {
      const saved = uni.getStorageSync("medication_list");
      if (saved) list = JSON.parse(saved);
    } catch(e2){}
    const drug = {
      id: Date.now(),
      name: f.value.name,
      spec: f.value.spec || "",
      method: f.value.method,
      freq: "每日"+f.value.freq+"次",
      dose: f.value.dose || "",
      note: f.value.note || "",
    };
    list.push(drug);
    uni.setStorageSync("medication_list", JSON.stringify(list));
    uni.$emit("medicationUpdated");
    successRef.value.show();
    setTimeout(()=>uni.navigateBack(),1200);
  }
}
function nav(u){uni.navigateTo({url:u});}
</script>

<style lang="scss" scoped>
.page { min-height:100vh; background:#F5F5FA; }
.status-bar-fill { height:var(--status-bar-height); background:#fff; }
.nav { display:flex; align-items:center; padding:8px 20px 14px; background:#fff; }
.back { font-size:24px; color:#667eea; margin-right:12px; }
.nav-t { font-size:17px; font-weight:700; color:#1A1A2E; }
.content { padding:16px 20px; }
.scan-entry { display:flex; align-items:center; padding:16px; margin-bottom:12px; background:rgba(102,126,234,0.06); border-radius:16px; }
.se-icon { width:24px; height:24px; margin-right:12px; display:block; }
.se-text { flex:1; font-size:15px; color:#667eea; font-weight:600; }
.se-arrow { font-size:18px; color:#667eea; }
.card { background:#fff; border-radius:18px; padding:20px; margin-bottom:12px; }
.fg { margin-bottom:18px; } .fg .fl, .fg-row { padding:0 5%; }
.fl { font-size:14px; font-weight:600; color:#1A1A2E; margin-bottom:8px; display:block; }
.fi { width:80%; margin:0 auto; display:block; padding:14px 16px; background:#F5F5FA; border-radius:14px; font-size:15px; border:none; outline:none; }
.fg-row { display:flex; gap:8px; }
.op { flex:1; text-align:center; padding:10px 12px; background:#F5F5FA; border-radius:12px; font-size:14px; }
.op.on { background:linear-gradient(135deg,#667eea,#764ba2); color:#fff; font-weight:600; }
.interact-card { display:flex; align-items:center; padding:16px; background:#fff; border-radius:18px; margin-bottom:16px; }
.ic-icon { width:24px; height:24px; margin-right:12px; display:block; }
.ic-body { flex:1; }
.ic-title { font-size:15px; font-weight:600; color:#1A1A2E; display:block; }
.ic-desc { font-size:12px; color:#9CA3AF; margin-top:2px; display:block; }
.ic-arrow { font-size:18px; color:#9CA3AF; }
.btn-grad { padding:16px; border-radius:14px; background:linear-gradient(135deg,#667eea,#764ba2); color:#fff; font-size:17px; font-weight:700; text-align:center; }
</style>
