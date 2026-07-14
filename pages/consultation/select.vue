<template>
<view class="page">
  <view class="status-bar-fill"></view>
  <view class="nav"><view class="back" @click="uni.navigateBack()">&#x2039;</view><text class="nav-t">选择问诊成员</text></view>
  <view class="list" v-if="members.length > 0">
    <view class="card" v-for="m in members" :key="m.id" @click="goChat(m)">
      <view class="avatar" :class="m.gender===1?'male':'female'">{{ m.name.slice(-1) }}</view>
      <view class="info">
        <text class="name">{{ m.name }}</text>
        <text class="meta">{{ m.gender===1?'男':'女' }} · {{ m.birthDate ? calcAge(m.birthDate)+'岁' : '年龄未知' }}</text>
      </view>
      <text class="arrow">&#x2192;</text>
    </view>
  </view>
  <view class="empty" v-else>
    <text class="empty-text">暂未添加家庭成员</text>
    <text class="empty-hint">请先在「我的」→「家庭成员」中添加</text>
  </view>
</view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { familyApi } from "@/api/family.js";
import { useAppStore } from "@/store";
const store = useAppStore();
const members = ref([]);

onMounted(async () => {
  // 先从 store 拿
  await store.loadMembers();
  if (store.familyMembers && store.familyMembers.length > 0) {
    members.value = store.familyMembers;
    return;
  }
  // 再调 API
  try {
    const list = await familyApi.getList();
    if (list && list.length > 0) members.value = list;
  } catch(e) {
    uni.showToast({ title: "加载成员失败", icon: "none" });
  }
});

function calcAge(birthDate) {
  if (!birthDate) return "?";
  const b = new Date(birthDate);
  const n = new Date();
  let a = n.getFullYear() - b.getFullYear();
  if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) a--;
  return a;
}

function goChat(m) {
  const pages = getCurrentPages();
  const opts = (pages[pages.length - 1] || {}).options || {};
  let url = "/pages/consultation/chat?memberId=" + m.id + "&memberName=" + encodeURIComponent(m.name || "");
  if (opts.q) url += "&q=" + encodeURIComponent(opts.q);
  uni.navigateTo({ url });
}
</script>

<style lang="scss" scoped>
.page { min-height:100vh; background:#F5F5FA; }
.status-bar-fill { height:var(--status-bar-height); background:#fff; }
.nav { display:flex; align-items:center; padding:8px 20px 14px; background:#fff; }
.back { font-size:24px; color:#667eea; margin-right:12px; }
.nav-t { font-size:17px; font-weight:700; color:#1A1A2E; }
.list { padding:16px 20px; }
.card { display:flex; align-items:center; padding:16px; background:#fff; border-radius:18px; margin-bottom:10px; }
.avatar { width:44px; height:44px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:18px; color:#fff; font-weight:700; margin-right:14px; }
.avatar.male { background:linear-gradient(135deg,#667eea,#764ba2); }
.avatar.female { background:linear-gradient(135deg,#fa709a,#fee140); }
.info { flex:1; }
.name { font-size:16px; font-weight:600; color:#1A1A2E; display:block; }
.meta { font-size:13px; color:#9CA3AF; margin-top:2px; display:block; }
.arrow { font-size:20px; color:#9CA3AF; }
.empty { text-align:center; padding:60px 0; }
.empty-text { font-size:16px; color:#9CA3AF; display:block; }
.empty-hint { font-size:13px; color:#9CA3AF; margin-top:8px; display:block; }
</style>
