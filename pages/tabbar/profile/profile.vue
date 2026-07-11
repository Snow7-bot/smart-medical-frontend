<template>
<view class="page">
  <view class="status-bar-fill"></view>

  <view class="profile-hero">
    <view class="hero-avatar" @click="store.isLoggedIn ? nav(`/pages/profile/edit`) : void 0">
      <image class="avatar-inner" src="/static/icon_avatar_default.png"></image>
    </view>
    <text class="hero-name">{{ store.user?.name || "未登录" }}</text>
    <text class="hero-phone" v-if="store.user">{{ store.user.phone }}</text>
    <view class="hero-btn" @click="nav(`/pages/login/login`)" v-if="!store.isLoggedIn">点击登录</view>
  </view>

  <view class="section-label">健康档案</view>
  <view class="list-group">
    <view class="li" @click="nav(`/pages/family/list`)">
      <image class="li-icon" src="/static/icon_family_profile.png"></image><text class="li-label">家庭成员</text><text class="li-arrow">&#x2192;</text>
    </view>
    <view class="li" @click="nav(`/pages/consultation/history`)">
      <image class="li-icon" src="/static/icon_record.png"></image><text class="li-label">问诊记录</text><text class="li-arrow">&#x2192;</text>
    </view>
    <view class="li" @click="nav(`/pages/health/report`)">
      <image class="li-icon" src="/static/icon_report.png"></image><text class="li-label">健康报告</text><text class="li-arrow">&#x2192;</text>
    </view>
  </view>

  <view class="section-label">设置</view>
  <view class="list-group">
    <view class="li" @click="nav(`/pages/settings/index`)">
      <image class="li-icon" src="/static/icon_settings.png"></image><text class="li-label">通用设置</text><text class="li-arrow">&#x2192;</text>
    </view>
  </view>

  <view class="logout" v-if="store.isLoggedIn" @click="handleLogout">退出登录</view>
  <SuccessCheck ref="logoutSuccessRef" />
  <view class="safe-bottom"></view>
</view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import SuccessCheck from "@/components/SuccessCheck.vue";
import { useAppStore } from "@/store";
import { userApi } from "@/api/user.js";
const store = useAppStore();
const logoutSuccessRef = ref(null);

function nav(url) { uni.navigateTo({ url }); }
function handleLogout() {
  uni.showModal({ title:"提示", content:"确定退出登录？", success(r){ if(r.confirm){ store.logout(); logoutSuccessRef.value.show(); } } });
}

onMounted(async () => {
  if (store.isLoggedIn) {
    try {
      const res = await userApi.getUserInfo();
      const data = res.data || res;
      if (data && data.name) {
        store.setUser({ ...store.user, name: data.name, phone: data.phone || store.user?.phone });
      }
    } catch(e) {}
  }
});
</script>

<style lang="scss" scoped>
.page { min-height:100vh; background: linear-gradient(180deg, #ebe7ff 0%,#f2feff 100% ); }
.status-bar-fill { height:var(--status-bar-height); background:#fff; }
.profile-hero { padding:24px 20px 30px; display:flex; flex-direction:column; align-items:center; position:relative; border-radius:0 0 32px 32px; }
.hero-avatar { width:70px; height:70px; border-radius:50%; background:#E8E8F0; display:flex; align-items:center; justify-content:center; margin-bottom:12px; border:2px solid #E0E0EC; overflow:hidden; }
.avatar-inner { width:50px; height:50px; border-radius:50%; display:block; object-fit:cover; }
.hero-name { font-size:20px; font-weight:700; color:#1A1A2E; }
.hero-phone { font-size:13px; color:#6B7280; margin-top:4px; }
.hero-btn { margin-top:14px; padding:10px 28px; background:#667eea; border-radius:20px; color:#fff; font-size:15px; font-weight:600; }
.section-label { font-size:12px; color:#9CA3AF; padding:20px 24px 8px; letter-spacing:0.5px; }
.list-group { background:#fff; border-radius:16px; margin:0 20px; overflow:hidden; }
.li { display:flex; align-items:center; padding:16px 20px; border-bottom:1px solid rgba(0,0,0,0.04); }
.li:last-child { border-bottom:none; }
.li-icon { width:24px; height:24px; margin-right:14px; }
.li-label { flex:1; font-size:15px; color:#1A1A2E; }
.li-arrow { font-size:18px; color:#9CA3AF; }
.logout { text-align:center; padding:18px; margin:24px 20px; background:#fff; border-radius:16px; color:#fa709a; font-size:15px; font-weight:600; }
.safe-bottom { padding-bottom:calc(50px + env(safe-area-inset-bottom)); }
</style>
