<template>
<view class="page">
  <view class="status-bar-fill"></view>
  <view class="nav"><view class="back" @click="uni.navigateBack()">&#x2039;</view><text class="nav-t">家庭成员</text></view>
  <view class="list">
    <view class="mem-card" v-for="m in members" :key="m.id" @click="store.setCurrentMember(m);nav(`/pages/family/detail`)">
      <view class="mem-avatar" :style="{background:colors[m.id%5]}">
      <text class="mem-initial">{{m.name.slice(-1)}}</text>
    </view>
      <view class="mem-info">
        <text class="mem-name">{{m.name}}</text>
        <text class="mem-meta">{{m.relation}} · {{calcAge(m.birthDate)}}岁 · {{genderLabel(m.gender)}}</text>
      </view>
      <text class="mem-arrow">&#x2192;</text>
    </view>
    <text class="empty" v-if="members.length===0">暂无家庭成员，点击下方添加</text>
  </view>
  <view class="add-fixed"><view class="btn-grad" @click="nav(`/pages/family/add`)">＋ 添加家庭成员</view></view>
</view>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAppStore } from "@/store";
import { familyApi } from "@/api/family.js";
const store = useAppStore();
const colors = ["#667eea","#4facfe","#43e97b","#f6d365","#fa709a"];
const members = computed(() => store.familyMembers);
function nav(u){uni.navigateTo({url:u});}
function calcAge(birthDate) {
  if (!birthDate) return "?";
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--;
  return age;
}
function genderLabel(g) {
  if (g === 1 || g === "male") return "男";
  if (g === 2 || g === "female") return "女";
  return "?";
}
onMounted(async ()=>{
  try {
    const list = await familyApi.getList();
    if (list && list.length > 0) store.setFamilyMembers(list);
    else store.loadMembers();
  } catch(e) { store.loadMembers(); }
  uni.$on("familyUpdated", async () => {
    try {
      const list = await familyApi.getList();
      if (list && list.length > 0) store.setFamilyMembers(list);
      else store.loadMembers();
    } catch(e) { store.loadMembers(); }
  });
});
</script>

<style lang="scss" scoped>
.page { min-height:100vh; background:#F5F5FA; }
.status-bar-fill { height:var(--status-bar-height); background:#fff; }
.nav { display:flex; align-items:center; padding:8px 20px 14px; background:#fff; }
.back { font-size:24px; color:#667eea; margin-right:12px; }
.nav-t { font-size:17px; font-weight:700; color:#1A1A2E; }
.list { padding:16px 20px 100px; }
.mem-card { display:flex; align-items:center; padding:16px; background:#fff; border-radius:18px; margin-bottom:10px; box-shadow:0 2px 6px rgba(0,0,0,0.03); }
.mem-avatar { width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin-right:14px; box-shadow:0 4px 12px rgba(102,126,234,0.2); overflow:hidden; }
.mem-initial { font-size:20px; color:#fff; font-weight:700; }
.mem-info { flex:1; }
.mem-name { font-size:16px; font-weight:600; color:#1A1A2E; display:block; }
.mem-meta { font-size:12px; color:#9CA3AF; margin-top:2px; display:block; }
.mem-arrow { font-size:20px; color:#9CA3AF; }
.empty { text-align:center; font-size:13px; color:#9CA3AF; padding:40px 0; }
.add-fixed { position:fixed; bottom:0; left:0; right:0; padding:12px 20px; padding-bottom:calc(12px + env(safe-area-inset-bottom)); background:#fff; }
.btn-grad { padding:16px; border-radius:14px; background:linear-gradient(135deg,#667eea,#764ba2); color:#fff; font-size:16px; font-weight:700; text-align:center; box-shadow:0 6px 24px rgba(102,126,234,0.3); }
</style>
