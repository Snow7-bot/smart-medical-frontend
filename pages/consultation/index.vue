<template>
<view class="page">
  <view class="status-bar-fill"></view>
  <view class="nav"><view class="back" @click="uni.navigateBack()">&#x2039;</view><text class="nav-t">AI 智能问诊</text></view>

  <view class="disclaimer">
    <text class="di-icon">&#x26A0;&#xFE0F;</text><text class="di-text">本服务为AI辅助建议，不可替代专业医疗诊断。紧急情况请拨打120。</text>
  </view>

  <view class="big-btn" @click="goSelect()">
    
    <text class="big-btn-title">选择问诊成员</text>
    <text class="big-btn-desc">为家庭成员进行AI智能问诊</text>
  </view>

  <view class="section-label">最近问诊</view>
  <view class="hist-item" v-for="h in history" :key="h.id" @click="goSelect()" @longpress="deleteHistory(h)">
    <text class="hi-symptom">{{ h.symptom }}</text>
    <view class="hi-badge" :style="{background:h.sev=='urgent'?'rgba(250,112,154,0.12)':'rgba(67,233,123,0.12)',color:h.sev=='urgent'?'#fa709a':'#43e97b'}">{{ h.sev=='urgent'?'急症':'轻症' }}</view>
    <text class="hi-time">{{ h.time }}</text>
  </view>
</view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { consultApi } from "@/api/consultation.js";
import { conversationApi } from "@/api/conversation.js";

const history = ref([]);

onMounted(async () => {
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

function goSelect() { uni.navigateTo({ url: "/pages/consultation/select" }); }

function deleteHistory(h) {
  uni.showModal({
    title: "删除记录",
    content: "确定删除「" + h.symptom + "」的问诊记录吗？",
    success: async (res) => {
      if (!res.confirm) return;
      try {
        await conversationApi.delete(h.id);
        history.value = history.value.filter(item => item.id !== h.id);
        uni.showToast({ title: "已删除", icon: "success" });
      } catch(e) {
        uni.showToast({ title: "删除失败", icon: "none" });
      }
    }
  });
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
.big-btn { margin:12px 20px; padding:28px 20px; background:linear-gradient(135deg,#667eea,#764ba2); border-radius:20px; text-align:center; box-shadow:0 6px 24px rgba(102,126,234,0.3); }
.big-btn-icon { font-size:36px; display:block; margin-bottom:8px; }
.big-btn-title { font-size:18px; font-weight:700; color:#fff; display:block; }
.big-btn-desc { font-size:13px; color:rgba(255,255,255,0.8); margin-top:4px; display:block; }
.hist-item { display:flex; align-items:center; padding:14px 20px; margin:0 20px 6px; background:#fff; border-radius:14px; }
.hi-symptom { flex:1; font-size:15px; color:#1A1A2E; }
.hi-badge { padding:3px 10px; border-radius:8px; font-size:11px; font-weight:600; margin-right:10px; }
.hi-time { font-size:12px; color:#9CA3AF; }
</style>
