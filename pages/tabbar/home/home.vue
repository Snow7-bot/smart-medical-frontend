<template>
<view class="home">
  <view class="header">
    <view class="status-bar-fill"></view>
    <view class="header-top">
      <view class="header-info">
        <text class="greeting">{{ greeting }}</text>
        <text class="username">{{ store.user?.name || "用户" }}</text>
      </view>
      <view class="header-bell"></view>
    </view>
    <scroll-view class="member-row" scroll-x show-scrollbar="false" style="padding-top:6px;padding-bottom:10px">
      <view class="member-avatar" v-for="m in members" :key="m.id" @click="selectMember(m)">
        <view class="ma-circle" :class="{ selected: selectedMemberId === m.id }" :style="{background:colorByIdx(m.id)}">
          <text class="ma-initial">{{ m.name.slice(-1) }}</text>
        </view>
        <text class="ma-name" :class="{ 'ma-name-active': selectedMemberId === m.id }">{{ m.name }}</text>
      </view>
      <view class="member-avatar" @click="navTo('familyAdd')">
        <view class="ma-circle add-circle"><text class="ma-initial">+</text></view>
        <text class="ma-name">添加</text>
      </view>
    </scroll-view>
    <view class="hero-card">
      <view class="hero-stats">
        <view class="hero-stat" v-for="s in memberStats" :key="s.key" @click="navTo(s.key)">
          <text class="hero-value" :style="{color:s.color}">{{ s.value }}</text>
          <text class="hero-label">{{ s.label }}</text>
        </view>
      </view>
      <view class="hero-tip">{{ selectedMember ? selectedMember.name + " · 健康概览" : "今日健康概览 · 数据良好" }}</view>
    </view>
  </view>

  <view class="consult-entry" @click="navTo('consult')">
    <view class="consult-glow"></view>
    <image class="consult-badge-img" src="/static/icon_AI.png" mode="aspectFill"></image>
    <view class="consult-body">
      <text class="consult-title">AI智能问诊</text>
      <text class="consult-desc">描述症状，AI 为您精准分析</text>
    </view>
    <view class="consult-arrow">&#x2192;</view>
  </view>

  <view class="consult-entry" @click="navTo('family')">
    <view class="consult-glow"></view>
    <image class="consult-badge-img" src="/static/icon_family.png" mode="aspectFill"></image>
    <view class="consult-body">
      <text class="consult-title">家庭档案</text>
      <text class="consult-desc">查看和管理家庭成员健康信息</text>
    </view>
    <view class="consult-arrow">&#x2192;</view>
  </view>

  <view class="section-title">
    <text>最近用药</text>
    <text class="sec-link" @click="navTo('medTab')">全部 &#x2192;</text>
  </view>
  <view class="card" style="margin:0 16px 80px">
    <view class="med-row" v-for="m in meds" :key="m.id">
      <view class="med-dot" :style="{background:m.color}"></view>
      <text class="med-name">{{ m.name }}</text>
      <text class="med-dose">{{ m.dosage }}</text>
      <text class="med-time">{{ m.time }}</text>
    </view>
    <text class="empty-text" v-if="meds.length===0">暂无用药计划</text>
  </view>
</view>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAppStore } from "@/store";
import { familyApi } from "@/api/family.js";
import { medApi } from "@/api/medication.js";
const store = useAppStore();

const greeting = computed(() => {
  const h = new Date().getHours();
  if (h < 6) return "夜深了，注意休息";
  if (h < 9) return "早上好";
  if (h < 12) return "上午好";
  if (h < 14) return "中午好";
  if (h < 18) return "下午好";
  return "晚上好";
});

const selectedMemberId = ref(null);
const selectedMember = computed(() => {
  if (selectedMemberId.value === null) return null;
  return members.value.find(m => m.id === selectedMemberId.value) || null;
});

const members = computed(() => store.familyMembers);

function genStatsForMember(memberId) {
  const seed = memberId || 0;
  const bpSys = 110 + (seed * 7 % 20);
  const bpDia = 70 + (seed * 5 % 15);
  const bs = (4.5 + (seed * 0.3 % 2.0)).toFixed(1);
  const hr = 65 + (seed * 3 % 20);
  const spo2 = 95 + (seed % 5);
  return [
    { key: "trend", label: "血压", value: bpSys+"/"+bpDia, color: bpSys > 130 ? "#fa709a" : "#43e97b" },
    { key: "trend", label: "血糖", value: bs, color: parseFloat(bs) > 6.1 ? "#fa709a" : "#43e97b" },
    { key: "trend", label: "心率", value: hr+"bpm", color: hr > 90 || hr < 55 ? "#fa709a" : "#4facfe" },
    { key: "trend", label: "血氧", value: spo2+"%", color: spo2 < 95 ? "#fa709a" : "#43e97b" },
  ];
}

const memberStats = computed(() => genStatsForMember(selectedMemberId.value));

const colors = ["#667eea","#4facfe","#43e97b","#f6d365","#fa709a"];
function colorByIdx(id) { return colors[id % colors.length]; }
function selectMember(m) {
  if (selectedMemberId.value === m.id) {
    selectedMemberId.value = null;
  } else {
    selectedMemberId.value = m.id;
  }
  store.setCurrentMember(m);
}

const meds = ref([]);

function loadMeds() {
  // 优先从API加载
  medApi.getList().then(list => {
    if (list && list.length > 0) {
      meds.value = list.slice(0, 5).map(d => ({
        id: d.id,
        name: d.name,
        dosage: d.dose || d.freq || "1粒/次",
        time: d.time || "08:00",
        color: d.warning ? "#fa709a" : "#667eea",
      }));
      uni.setStorageSync("medication_list", JSON.stringify(list));
    } else {
      loadLocalMeds();
    }
  }).catch(() => {
    loadLocalMeds();
  });
}

function loadLocalMeds() {
  try {
    const saved = uni.getStorageSync("medication_list");
    if (saved) {
      const list = JSON.parse(saved);
      meds.value = list.slice(0, 5).map(d => ({
        id: d.id,
        name: d.name,
        dosage: d.dose || d.freq || "1粒/次",
        time: d.time || "08:00",
        color: "#667eea",
      }));
    } else {
      meds.value = [];
    }
  } catch(e) {
    meds.value = [];
  }
}

function navTo(key) {
  const map = {
    consult: "/pages/consultation/index", family: "/pages/family/list", familyAdd: "/pages/family/add", trend: "/pages/health/trend",
    medTab: "/pages/tabbar/medication/medication",
  };
  if (key === "medTab") {
    uni.switchTab({ url: map[key] });
  } else {
    uni.navigateTo({ url: map[key] });
  }
}
onMounted(async () => {
  try {
    const list = await familyApi.getList();
    if (list && list.length > 0) {
      store.setFamilyMembers(list);
    }
  } catch(e) {
    store.loadMembers();
  }
  loadMeds();
  uni.$on("familyUpdated", async () => {
    try {
      const list = await familyApi.getList();
      if (list && list.length > 0) store.setFamilyMembers(list);
      else store.loadMembers();
    } catch(e) { store.loadMembers(); }
  });
  uni.$on("medicationUpdated", loadMeds);
});
</script>

<style lang="scss" scoped>
.home { min-height: 100vh; background: linear-gradient(180deg, #ebe7ff 0%,#f2feff 100% ); }
.header { padding-bottom: 4px; }
.status-bar-fill { height: var(--status-bar-height); background: #ffffff; }
.header-top { display: flex; justify-content: space-between; align-items: center; padding: 8px 24px 12px; }
.greeting { font-size: 14px; color: #9CA3AF; }
.username { font-size: 22px; font-weight: 700; color: #1A1A2E; display: block; margin-top: 2px; }
.header-bell { font-size: 22px; color: #9CA3AF; }
.member-row { white-space: nowrap; padding: 0 16px 0 ; height: 85px; }
.member-avatar { display: inline-flex; flex-direction: column; align-items: center; margin-right: 14px; width: 60px; padding-top: 6px;padding-bottom: 6px; }
.ma-circle { width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(102,126,234,0.2); transition: all 0.25s ease; }
.ma-circle.selected { border: 1px solid #d1d1d1; box-shadow: 0 0 3px rgba(102,126,234,0.45); transform: scale(1.12); }
.add-circle { background: #E5E7EB; box-shadow: none; }
.ma-initial { font-size: 20px; color: #fff; font-weight: 700; }
.add-circle .ma-initial { color: #9CA3AF; }
.ma-name { font-size: 11px; color: #6B7280; margin-top: 6px; text-align: center; max-width: 60px; overflow: hidden; text-overflow: ellipsis; transition: color 0.25s ease; }
.ma-name-active { color: #667eea; font-weight: 600; }
.hero-card { background: linear-gradient(to top right, rgba(254, 244, 255, 0.5),rgba(228, 237, 255, 0.8)); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(20px); border-radius: 24px; margin: 15px 16px 0; padding: 20px; border: 1px solid rgba(255,255,255,0.6); box-shadow: 10px -10px 20px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.3); }
.hero-stats { display: flex; justify-content: space-around; margin-bottom: 12px; }
.hero-stat { display: flex; flex-direction: column; align-items: center; }
.hero-value { font-size: 22px; font-weight: 700; }
.hero-label { font-size: 12px; color: #6B7280; margin-top: 2px; }
.hero-tip { text-align: center; font-size: 12px; color: #9CA3AF; padding-top: 8px; border-top: 1px solid rgba(0,0,0,0.05); }
.consult-entry { display: flex; align-items: center; padding: 18px 20px; margin: 20px 16px 16px; background: #fff; border-radius: 18px; box-shadow: 0 4px 20px rgba(102,126,234,0.12); position: relative; overflow: hidden; }
.consult-glow { position: absolute; right: -30px; top: -30px; width: 120px; height: 120px; border-radius: 50%; background: rgba(102,126,234,0.06); }
.consult-badge-img { width: 48px; height: 48px; margin-right: 14px; flex-shrink: 0; border-radius: 12px; }
.consult-body { flex: 1; z-index: 1; }
.consult-title { font-size: 17px; font-weight: 700; color: #1A1A2E; display: block; }
.consult-desc { font-size: 13px; color: #6B7280; margin-top: 3px; display: block; }
.consult-arrow { font-size: 20px; color: #667eea; font-weight: 600; }
.section-title { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px 10px; }
.section-title > text { font-size: 17px; font-weight: 700; color: #1A1A2E; }
.sec-link { font-size: 13px; color: #667eea; }
.card { background: #fff; border-radius: 16px; padding: 6px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.med-row { display: flex; align-items: center; padding: 14px 18px; border-bottom: 1px solid rgba(0,0,0,0.04); }
.med-row:last-child { border: none; }
.med-dot { width: 8px; height: 8px; border-radius: 4px; margin-right: 12px; flex-shrink: 0; }
.med-name { flex: 1; font-size: 15px; color: #1A1A2E; }
.med-dose { font-size: 13px; color: #6B7280; margin-right: 10px; }
.med-time { font-size: 13px; color: #9CA3AF; }
.empty-text { text-align: center; font-size: 13px; color: #9CA3AF; padding: 24px; }
</style>
