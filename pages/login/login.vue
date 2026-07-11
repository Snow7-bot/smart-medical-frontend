<template>
<view class="page">
  <view class="status-bar-fill"></view>
  <view class="back-btn" @click="uni.navigateBack()">&#x2190;</view>
  <view class="container">
    <view class="logo">
      <image class="logo-icon" src="/static/icon_logo.png"></image>
      <text class="logo-title">健康伴</text>
      <text class="logo-sub">专业可靠的智能医疗助手</text>
    </view>
    <view class="form">
      <view class="input-wrap"><text class="in-label">手机号</text><input class="in" type="number" v-model="phone" placeholder="请输入手机号" maxlength="11"/></view>
      <view class="input-wrap">
        <text class="in-label">密码</text>
        <view class="pwd-row">
          <input class="in pwd-input" :type="showPwd ? 'text' : 'password'" v-model="pwd" placeholder="请输入密码"/>
          <image class="pwd-eye" :src="showPwd ? '/static/icon_eye_open.png' : '/static/icon_eye_close.png'" mode="aspectFit" @click="showPwd = !showPwd"></image>
        </view>
      </view>
      <view class="btn-grad" @click="handleLogin">登 录</view>
      <text class="link" @click="nav(`/pages/register/register`)">还没有账号？<text style="color:#667eea;font-weight:600;">立即注册</text></text>
    </view>
  </view>
  <SuccessCheck ref="successRef" />
</view>
</template>

<script setup>
import { ref } from "vue";
import SuccessCheck from "@/components/SuccessCheck.vue";
import { useAppStore } from "@/store";
import { userApi } from "@/api/user.js";
const store = useAppStore();
const successRef = ref(null);
const phone = ref(""); const pwd = ref(""); const showPwd = ref(false);
async function handleLogin() {
  if (!phone.value || phone.value.length!==11) { uni.showToast({title:"请输入正确的手机号",icon:"none"}); return; }
  if (!pwd.value) { uni.showToast({title:"请填写完整",icon:"none"}); return; }
  if (pwd.value.length < 6) { uni.showToast({title:"密码至少6位",icon:"none"}); return; }
  try {
    const res = await userApi.login({ phone: phone.value, password: pwd.value });
    const data = res.data || res;
    // 验证登录返回的 token 是否有效
    if (!data || !data.token) {
      const msg = (data && data.message) || "登录失败，请检查手机号或密码";
      uni.showToast({title: msg, icon:"none"});
      return;
    }
    uni.setStorageSync("auth_token", data.token);
    store.setUser({ name: data.name, phone: data.phone });
    successRef.value.show();
    setTimeout(()=>uni.switchTab({url:"/pages/tabbar/home/home"}),1200);
  } catch(e) {
    uni.showToast({title:"登录失败，请检查手机号或密码",icon:"none"});
  }
}
function nav(u){ uni.navigateTo({url:u}); }
</script>

<style lang="scss" scoped>
.page { min-height:100vh; background:#fff; }
.status-bar-fill { height:var(--status-bar-height); }
.back-btn { padding:8px 20px; font-size:28px; color:#667eea; background:#fff; }
.container { padding:30px 28px 0; }
.logo { text-align:center; margin-bottom:40px; }
.logo-icon { width:72px; height:72px; border-radius:24px; margin:0 auto 16px; }
.logo-title { font-size:22px; font-weight:800; color:#1A1A2E; display:block; }
.logo-sub { font-size:14px; color:#9CA3AF; margin-top:4px; display:block; }
.form { padding-top:10px; }
.input-wrap { margin-bottom:20px; overflow:hidden; }
.in-label { font-size:14px; font-weight:600; color:#1A1A2E; margin-bottom:8px; display:block; }
.in { display:block; padding:16px 18px; background:#F5F5FA; border-radius:14px; font-size:16px; border:none; outline:none; }
.pwd-row { display:flex; align-items:center; position:relative; }
.pwd-input { padding-right:50px; }
.pwd-eye { position:absolute; right:16px; width:24px; height:24px; z-index:2; }
.btn-grad { padding:18px; border-radius:14px; background:linear-gradient(135deg,#667eea,#764ba2); color:#fff; font-size:17px; font-weight:700; text-align:center; margin-top:8px; box-shadow:0 6px 24px rgba(102,126,234,0.3); }
.link { text-align:center; font-size:14px; color:#9CA3AF; margin-top:24px; display:block; }
</style>
