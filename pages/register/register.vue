<template>
<view class="page">
  <view class="status-bar-fill"></view>
  <view class="back-btn" @click="uni.navigateBack()">&#x2190;</view>
  <view class="container">
    <text class="title">创建账号</text>
    <view class="form">
      <view class="input-wrap"><text class="in-label">手机号</text><input class="in" type="number" v-model="phone" placeholder="请输入手机号" maxlength="11"/></view>
      <view class="input-wrap row"><view style="flex:1"><text class="in-label">验证码</text><input class="in" type="number" v-model="code" placeholder="验证码"/></view><view class="send-code" @click="send">{{ timer ? timer+`s` : `获取验证码` }}</view></view>
      <view class="input-wrap">
        <text class="in-label">设置密码</text>
        <input class="in" type="password" v-model="pwd" placeholder="6-20位密码"/>
      </view>
      <view class="input-wrap">
        <text class="in-label">确认密码</text>
        <input class="in" type="password" v-model="confirmPwd" placeholder="请再次输入密码"/>
      </view>
      <view class="btn-grad" @click="handle">注 册</view>
    </view>
  </view>
  <SuccessCheck ref="successRef" />
</view>
</template>

<script setup>
import { ref } from "vue";
import SuccessCheck from "@/components/SuccessCheck.vue";
import { userApi } from "@/api/user.js";
const successRef = ref(null);
const phone=ref(""),code=ref(""),pwd=ref(""),confirmPwd=ref(""),timer=ref(0);
async function send(){
  if(!phone.value||phone.value.length!==11){uni.showToast({title:"请输入正确手机号",icon:"none"});return;}
  timer.value=60;
  const t=setInterval(()=>{timer.value--;if(timer.value<=0){clearInterval(t);}},1000);
  try { await userApi.sendCode(phone.value); } catch(e) {}
}
async function handle() {
  if(!phone.value||phone.value.length!==11){uni.showToast({title:"请输入正确的手机号",icon:"none"});return;}
  if(!code.value){uni.showToast({title:"请输入验证码",icon:"none"});return;}
  if(!pwd.value){uni.showToast({title:"请设置密码",icon:"none"});return;}
  if(pwd.value.length<6||pwd.value.length>20){uni.showToast({title:"密码需6-20位",icon:"none"});return;}
  if(pwd.value !== confirmPwd.value){uni.showToast({title:"两次密码不一致",icon:"none"});return;}
  try {
    await userApi.register({
      phone: phone.value,
      code: code.value,
      password: pwd.value,
      name: "用户" + phone.value.slice(-4)
    });
    successRef.value.show();
    setTimeout(()=>uni.navigateBack(),1200);
  } catch(e) {
    uni.showToast({title:"注册失败，请重试",icon:"none"});
  }
}
</script>

<style lang="scss" scoped>
.page { min-height:100vh; background:#fff; }
.status-bar-fill { height:var(--status-bar-height); }
.back-btn { padding:8px 20px; font-size:28px; color:#667eea; }
.container { padding:30px 28px 0; }
.title { font-size:26px; font-weight:800; color:#1A1A2E; display:block; margin-bottom:30px; }
.form { }
.input-wrap { margin-bottom:20px; overflow:hidden; }
.row { display:flex; gap:10px; align-items:flex-end; }
.in-label { font-size:14px; font-weight:600; color:#1A1A2E; margin-bottom:8px; display:block; }
.in { display:block; padding:16px 18px; background:#F5F5FA; border-radius:14px; font-size:16px; border:none; outline:none; }
.send-code { padding:16px 16px; white-space:nowrap; background:rgba(102,126,234,0.1); border-radius:14px; color:#667eea; font-size:14px; font-weight:600; }
.btn-grad { padding:18px; border-radius:14px; background:linear-gradient(135deg,#667eea,#764ba2); color:#fff; font-size:17px; font-weight:700; text-align:center; margin-top:8px; }
</style>
