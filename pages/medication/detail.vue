<template>
<view class="page">
  <view class="status-bar-fill"></view>
  <view class="nav"><view class="back" @click="uni.navigateBack()">&#x2039;</view><text class="nav-t">药品详情</text></view>
  <view class="content">
    <view class="hero-card">
      <image class="hc-icon" src="/static/icon_capsule.png"></image>
      <text class="hc-name">阿莫西林胶囊</text>
      <text class="hc-spec">0.5g x 24粒</text>
    </view>
    <view class="card">
      <view class="dr"><text class="dk">服用方式</text><text class="dv">口服</text></view>
      <view class="dr"><text class="dk">服用频率</text><text class="dv">每日3次</text></view>
      <view class="dr"><text class="dk">每次用量</text><text class="dv">每次1粒</text></view>
      <view class="dr"><text class="dk">用药人</text><text class="dv">本人</text></view>
    </view>
    <view class="risk-bar"><image class="rb-icon" src="/static/icon_warning.png"></image><view class="rb-body"><text class="rb-title">潜在药物冲突</text><text class="rb-desc">与布洛芬间隔2小时服用</text></view></view>
    <view class="reminder" @click="toggleReminder"><image class="rm-icon" src="/static/icon_bell.png"></image><text class="rm-label">服药提醒</text><switch :checked="remind" color="#667eea"/></view>
    <view class="del-btn" @click="del">删除药品记录</view>
  </view>
</view>
</template>

<script setup>
import { ref } from "vue";
import { medApi } from "@/api/medication.js";
const remind=ref(true);
function toggleReminder(){remind.value=!remind.value;}
async function del(){
  uni.showModal({
    title:"确认删除",
    content:"确定删除此药品记录？",
    async success(r){
      if(r.confirm){
        try {
          await medApi.deleteDrug(id);
          uni.$emit("medicationUpdated");
          uni.showToast({title:"已删除",icon:"success"});
        } catch(e) {
          // 本地降级删除
          try {
            const saved = uni.getStorageSync("medication_list");
            if (saved) {
              let list = JSON.parse(saved);
              list = list.filter(d => d.id != id);
              uni.setStorageSync("medication_list", JSON.stringify(list));
            }
          } catch(e2) {}
          uni.showToast({title:"已删除",icon:"success"});
        }
        setTimeout(()=>uni.navigateBack(),1200);
      }
    }
  });
}
const id = ref(Date.now());
</script>

<style lang="scss" scoped>
.page { min-height:100vh; background:#F5F5FA; }
.status-bar-fill { height:var(--status-bar-height); background:#fff; }
.nav { display:flex; align-items:center; padding:8px 20px 14px; background:#fff; }
.back { font-size:24px; color:#667eea; margin-right:12px; }
.nav-t { font-size:17px; font-weight:700; color:#1A1A2E; }
.content { padding:16px 20px; }
.hero-card { background:linear-gradient(165deg,#667eea,#764ba2); border-radius:20px; padding:28px; text-align:center; margin-bottom:12px; position:relative; overflow:hidden; }
.hero-card::after { content:""; position:absolute; top:-30px; right:-20px; width:100px; height:100px; border-radius:50%; background:rgba(255,255,255,0.1); }
.hc-icon { width:48px; height:48px; display:block; margin:0 auto 10px; border-radius:12px; }
.hc-name { font-size:20px; font-weight:800; color:#fff; display:block; }
.hc-spec { font-size:14px; color:rgba(255,255,255,0.7); margin-top:4px; display:block; }
.card { background:#fff; border-radius:18px; padding:6px 20px; margin-bottom:12px; }
.dr { display:flex; justify-content:space-between; padding:14px 0; border-bottom:1px solid rgba(0,0,0,0.04); }
.dr:last-child { border:none; }
.dk { font-size:14px; color:#6B7280; }
.dv { font-size:15px; color:#1A1A2E; font-weight:500; }
.risk-bar { display:flex; align-items:center; padding:14px 18px; background:rgba(250,112,154,0.1); border-radius:16px; margin-bottom:12px; }
.rb-icon { width:20px; height:20px; margin-right:12px; display:block; }
.rb-title { font-size:14px; font-weight:600; color:#fa709a; display:block; }
.rb-desc { font-size:12px; color:#6B7280; margin-top:2px; display:block; }
.reminder { display:flex; align-items:center; padding:16px 20px; background:#fff; border-radius:18px; margin-bottom:20px; }
.rm-icon { width:28px; height:28px; margin-right:12px; display:block; }
.rm-label { flex:1; font-size:15px; color:#1A1A2E; }
.del-btn { text-align:center; padding:16px; color:#fa709a; font-size:15px; font-weight:600; }
</style>
