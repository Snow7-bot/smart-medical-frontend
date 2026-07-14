<template>
<view class="page" :class="{elderly:store.elderlyMode}">
  <view class="status-bar-fill"></view>
  <view class="nav"><view class="back" @click="uni.navigateBack()">&#x2039;</view><text class="nav-t">AI 智能问诊</text></view>

  <view class="disclaimer">
    <text class="di-icon">&#x26A0;&#xFE0F;</text><text class="di-text">本服务为AI辅助建议，不可替代专业医疗诊断。紧急情况请拨打120。</text>
  </view>

  <!-- 选择问诊成员 -->
  <view class="section-label">选择问诊成员</view>
  <view class="member-list">
    <view class="member-card" v-for="m in familyMembers" :key="m.id" @click="selectMember(m)">
      <view class="m-avatar" :class="m.gender===1?'male':'female'">{{ (m.name||'?').slice(-1) }}</view>
      <view class="m-info">
        <text class="m-name">{{ m.name }}</text>
        <text class="m-meta">{{ m.gender===1?'男':m.gender===2?'女':'?' }} · {{ m.birthDate ? calcAge(m.birthDate)+'岁' : '年龄未知' }}</text>
      </view>
      <text class="m-arrow">&#x2192;</text>
    </view>
    <view class="member-card empty" v-if="familyMembers.length===0" @click="uni.navigateTo({url:'/pages/family/add'})">
      <text class="empty-text">＋ 添加家庭成员</text>
    </view>
  </view>

  <view class="section-label">常见症状</view>
  <view class="symptom-grid">
    <view class="sg-item" v-for="s in symptoms" :key="s" @click="quickAsk(s)"><text class="sg-emoji">{{ symEmoji[s] }}</text><text class="sg-name">{{ s }}</text></view>
  </view>

  <view class="section-label">最近问诊</view>
  <view class="hist-item" v-for="h in history" :key="h.id" @click="selectMember(null)">
    <text class="hi-symptom">{{ h.symptom }}</text>
    <view class="hi-badge" :style="{background:h.sev=='urgent'?'rgba(250,112,154,0.12)':'rgba(67,233,123,0.12)',color:h.sev=='urgent'?'#fa709a':'#43e97b'}">{{ h.sev=='urgent'?'急症':'轻症' }}</view>
    <text class="hi-time">{{ h.time }}</text>
  </view>
</view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAppStore } from "@/store";
import { consultApi } from "@/api/consultation.js";
import { familyApi } from "@/api/family.js";
const store = useAppStore();

const symptoms = ["头痛","咳嗽","发烧","胸闷","头晕","胃痛","牙痛","失眠"];
const symEmoji = {头痛:"🤕",咳嗽:"😤",发烧:"🌡",胸闷:"🫁",头晕:"💫",胃痛:"🤢",牙痛:"🦷",失眠:"😵"};

const history = ref([]);
const familyMembers = ref([]);
let pendingSymptom = null;

onMounted(async () => {
  await store.loadMembers();
  if (store.familyMembers && store.familyMembers.length > 0) {
    familyMembers.value = store.familyMembers;
  } else {
    try {
      const list = await familyApi.getList();
      if (list && list.length > 0) familyMembers.value = list;
    } catch(e) {}
  }
  try {
    const list = await consultApi.getHistory();
    if (list && list.length > 0) {
      history.value = list.slice(0, 5).map(h => ({
        id: h.id, symptom: h.symptom || "问诊记录",
        time: (h.date || "") + " " + (h.time || ""),
        sev: h.severity === "urgent" ? "urgent" : "mild",
      }));
    }
  } catch(e) { history.value = []; }
});

function calcAge(birthDate) {
  if (!birthDate) return "?";
  const b = new Date(birthDate);
  const n = new Date();
  let a = n.getFullYear() - b.getFullYear();
  if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) a--;
  return a;
}

function selectMember(m) {
  if (!m) return;
  let url = "/pages/consultation/chat?memberId=" + m.id + "&memberName=" + encodeURIComponent(m.name || "");
  if (pendingSymptom) { url += "&q=" + encodeURIComponent(pendingSymptom); pendingSymptom = null; }
  uni.navigateTo({ url });
}

function quickAsk(s) {
  pendingSymptom = s;
  if (familyMembers.value.length === 1) {
    selectMember(familyMembers.value[0]);
  } else if (familyMembers.value.length > 1) {
    uni.showToast({ title: "请先选择问诊成员", icon: "none" });
  }
}
</script>

<style lang="scss" scoped>
.page { min-height:100vh; background:#F5F5FA; }
.status-bar-fill { height:var(--status-bar-height); background:#fff; }
.nav { display:flex; align-items:center; padding:8px 20px 14px; background:#fff; }
.back { font-size:24px; color:#667eea; margin-right:12px; }
.nav-t { font-size:17px; font-weight:700; color:#1A1A2E; }
.disclaimer { display:flex; align-items:flex-start; padding:12px 18px; margin:12px 20px; background:rgba(246,211,101,0.15); border-radius:14px; }
.di-icon { font-size:16px; margin-right:8px; flex-shrink:0; margin-top:1px; }
.di-text { font-size:12px; color:#6B7280; line-height:1.6; }
.section-label { font-size:16px; font-weight:700; color:#1A1A2E; padding:16px 24px 10px; }
.member-list { padding:0 20px; margin-bottom:16px; }
.member-card { display:flex; align-items:center; padding:14px 16px; background:#fff; border-radius:16px; margin-bottom:8px; }
.member-card.empty { justify-content:center; padding:20px; border:1px dashed #9CA3AF; background:transparent; }
.empty-text { color:#667eea; font-size:15px; cursor:pointer; }
.m-avatar { width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:18px; color:#fff; font-weight:700; margin-right:12px; }
.m-avatar.male { background:#667eea; }
.m-avatar.female { background:#fa709a; }
.m-info { flex:1; }
.m-name { font-size:15px; font-weight:600; color:#1A1A2E; display:block; }
.m-meta { font-size:12px; color:#9CA3AF; margin-top:2px; display:block; }
.m-arrow { font-size:18px; color:#9CA3AF; }
.symptom-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; padding:0 20px; margin-bottom:16px; }
.sg-item { display:flex; flex-direction:column; align-items:center; padding:14px 8px; background:#fff; border-radius:14px; }
.sg-emoji { font-size:22px; }
.sg-name { font-size:12px; color:#6B7280; margin-top:4px; }
.hist-item { display:flex; align-items:center; padding:14px 20px; margin:0 20px 6px; background:#fff; border-radius:14px; }
.hi-symptom { flex:1; font-size:15px; color:#1A1A2E; }
.hi-badge { padding:3px 10px; border-radius:8px; font-size:11px; font-weight:600; margin-right:10px; }
.hi-time { font-size:12px; color:#9CA3AF; }
</style>
