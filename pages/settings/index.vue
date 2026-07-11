<template>
<view class="page">
  <view class="status-bar-fill"></view>
  <view class="nav"><view class="back" @click="uni.navigateBack()">&#x2190;</view><text class="nav-t">通用设置</text></view>
  <view class="section-label">通知设置</view>
  <view class="list-group">
    <view class="li"><text class="lil">用药提醒</text><switch :checked="notify.med" @change="(e) => notify.med = e.detail.value" color="#667eea"/></view>
    <view class="li"><text class="lil">健康报告通知</text><switch :checked="notify.report" @change="(e) => notify.report = e.detail.value" color="#667eea"/></view>
  </view>
  <view class="section-label">关于</view>
  <view class="list-group">
    <view class="li" @click="about"><text class="lil">版本信息</text><text class="liv">v1.0 &#x2192;</text></view>
    <view class="li" @click="tap"><text class="lil">用户协议</text><text class="liv">查看</text></view>
  </view>
  <view class="section-label">数据管理</view>
  <view class="list-group">
    <view class="li" @click="checkConnection"><text class="lil">API连接状态</text><text class="liv" :style="{color: apiConnected ? '#43e97b' : '#fa709a'}">{{ apiStatus }}</text></view>
  </view>
</view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { userApi } from "@/api/user.js";
import { healthApi } from "@/api/health.js";
import { useAppStore } from "@/store";
import env from "@/env.js";
const store = useAppStore();

const notify = ref({ med: true, report: true });
const apiStatus = ref("检测中...");
const apiConnected = ref(false);

function about() {
  uni.showModal({
    title:"智能医疗助手",
    content:"版本 v1.0.0\n基于 uni-app + Vue 3\n(c) 2026",
    showCancel:false
  });
}

function tap() {
  uni.showToast({title:"开发中",icon:"none"});
}

function checkConnection() {
  uni.showModal({
    title: "API 连接状态",
    content: `状态: ${apiStatus.value}\n后端地址: ${env.API_BASE_URL}\n认证: ${store.isLoggedIn ? "已登录" : "未登录"}`,
    showCancel: false
  });
}

onMounted(async () => {
  try {
    if (store.isLoggedIn) {
      await userApi.getCurrentUser();
    } else {
      await healthApi.getRecords({ page: 0, size: 1 });
    }
    apiStatus.value = "已连接";
    apiConnected.value = true;
  } catch(e) {
    apiStatus.value = "API 服务不可用（检查网络或后端）";
    apiConnected.value = false;
  }
});
</script>

<style lang="scss" scoped>
.page { min-height:100vh; background:#F5F5FA; }
.status-bar-fill { height:var(--status-bar-height); background:#fff; }
.nav { display:flex; align-items:center; padding:8px 20px 14px; background:#fff; }
.back { font-size:24px; color:#667eea; margin-right:12px; }
.nav-t { font-size:17px; font-weight:700; color:#1A1A2E; }
.section-label { font-size:12px; color:#9CA3AF; padding:20px 24px 8px; letter-spacing:0.5px; }
.list-group { background:#fff; border-radius:16px; margin:0 20px; overflow:hidden; }
.li { display:flex; align-items:center; justify-content:space-between; padding:16px 20px; border-bottom:1px solid rgba(0,0,0,0.04); }
.li:last-child { border-bottom:none; }
.lil { font-size:15px; color:#1A1A2E; }
.liv { font-size:13px; color:#9CA3AF; }
</style>
