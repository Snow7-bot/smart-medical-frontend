<template>
<view class="page" :class="{elderly:store.elderlyMode}">
  <view class="status-bar-fill"></view>
  <view class="nav"><view class="back" @click="uni.navigateBack()">&#x2039;</view><text class="nav-t">AI 智能问诊</text></view>

  <view class="disclaimer">
    <text class="di-icon">&#x26A0;&#xFE0F;</text><text class="di-text">本服务为AI辅助建议，不可替代专业医疗诊断。紧急情况请拨打120。</text>
  </view>

  <view class="section-label">常见症状</view>
  <view class="symptom-grid">
    <view class="sg-item" v-for="s in symptoms" :key="s" @click="quickAsk(s)"><text class="sg-emoji">{{ symEmoji[s] }}</text><text class="sg-name">{{ s }}</text></view>
  </view>

  <view class="section-label">最近问诊</view>
  <view class="hist-item" v-for="h in history" :key="h.id" @click="nav(`/pages/consultation/chat`)">
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
const store = useAppStore();

const symptoms = ["头痛","咳嗽","发烧","胸闷","头晕","胃痛","牙痛","失眠"];
const symEmoji = {头痛:"🤕",咳嗽:"😤",发烧:"🌡",胸闷:"🫁",头晕:"💫",胃痛:"🤢",牙痛:"🦷",失眠:"😵"};

const history = ref([]);

onMounted(async () => {
  try {
    const list = await consultApi.getHistory();
    if (list && list.length > 0) {
      history.value = list.slice(0, 5).map(h => ({
        id: h.id,
        symptom: h.symptom || "问诊记录",
        time: (h.date || "") + " " + (h.time || ""),
        sev: h.severity === "urgent" ? "urgent" : "mild",
      }));
    } else {
      history.value = [
        {id:1,symptom:"持续头痛三天",time:"2小时前",sev:"mild"},
      ];
    }
  } catch(e) {
    history.value = [];
  }
});

function startText(){ uni.navigateTo({url:"/pages/consultation/chat"}); }
function startVoice(){ uni.showToast({title:"正在启动语音识别...",icon:"none"}); setTimeout(()=>uni.navigateTo({url:"/pages/consultation/chat"}),1200); }
function quickAsk(s){ uni.navigateTo({url:"/pages/consultation/chat?q="+encodeURIComponent(s)}); }
function nav(u){ uni.navigateTo({url:u}); }
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
.dual-mode { display:flex; gap:12px; padding:0 20px; margin-bottom:20px; }
.mode-card { flex:1; padding:24px 16px; border-radius:20px; background:#fff; text-align:center; box-shadow:0 2px 8px rgba(0,0,0,0.04); }
.mode-grad { width:56px; height:56px; border-radius:18px; display:flex; align-items:center; justify-content:center; margin:0 auto 12px; box-shadow:0 4px 16px rgba(102,126,234,0.2); }
.mode-icon { font-size:26px; }
.mode-title { font-size:16px; font-weight:700; color:#1A1A2E; display:block; }
.mode-desc { font-size:12px; color:#9CA3AF; margin-top:3px; display:block; }
.section-label { font-size:16px; font-weight:700; color:#1A1A2E; padding:16px 24px 10px; }
.symptom-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; padding:0 20px; margin-bottom:16px; }
.sg-item { display:flex; flex-direction:column; align-items:center; padding:14px 8px; background:#fff; border-radius:14px; }
.sg-emoji { font-size:22px; }
.sg-name { font-size:12px; color:#6B7280; margin-top:4px; }
.hist-item { display:flex; align-items:center; padding:14px 20px; margin:0 20px 6px; background:#fff; border-radius:14px; }
.hi-symptom { flex:1; font-size:15px; color:#1A1A2E; }
.hi-badge { padding:3px 10px; border-radius:8px; font-size:11px; font-weight:600; margin-right:10px; }
.hi-time { font-size:12px; color:#9CA3AF; }
</style>
