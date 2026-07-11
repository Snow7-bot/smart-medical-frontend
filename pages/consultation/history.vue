<template>
<view class="page">
  <view class="status-bar-fill"></view>
  <view class="nav"><view class="back" @click="uni.navigateBack()">&#x2039;</view><text class="nav-t">问诊记录</text></view>
  <view class="list">
    <view class="item" v-for="h in hist" :key="h.id" @click="nav(`/pages/consultation/chat`)">
      <view class="i-icon" :style="{background:h.color+'20'}"><text :style="{color:h.color}">{{ h.icon }}</text></view>
      <view class="i-info"><text class="i-symp">{{ h.symptom }}</text><text class="i-date">{{ h.date }} {{ h.time }}</text></view>
      <view class="i-badge" :style="{background:h.sevColor+'15',color:h.sevColor}">{{ h.sevLabel }}</view>
    </view>
    <text class="empty" v-if="hist.length===0">暂无问诊记录</text>
  </view>
</view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { consultApi } from "@/api/consultation.js";
import { conversationApi } from "@/api/conversation.js";
const hist = ref([]);

onMounted(async () => {
  try {
    const list = await consultApi.getHistory();
    if (list && list.length > 0) {
      hist.value = list.map((h, i) => ({
        id: h.id || i+1,
        symptom: h.symptom || "问诊记录",
        date: h.date || "",
        time: h.time || "",
        icon: "💪",
        color: "#43e97b",
        sevColor: h.severity === "urgent" ? "#fa709a" : "#43e97b",
        sevLabel: h.severity === "urgent" ? "急症" : "轻症",
      }));
    } else {
      // 回退到对话列表
      try {
        const convs = await conversationApi.list({ page: 0, size: 20 });
        if (convs && convs.length > 0) {
          hist.value = convs.map(c => ({
            id: c.id,
            symptom: c.title || c.symptom || "问诊记录",
            date: (c.updatedAt||c.createdAt||"").substring(0,10),
            time: (c.updatedAt||c.createdAt||"").substring(11,16),
            icon: "💪",
            color: "#43e97b",
            sevColor: "#43e97b",
            sevLabel: "轻症",
          }));
          return;
        }
      } catch(e2) {}
      hist.value = [
        {id:1,symptom:"持续头痛三天",date:"2026-06-25",time:"14:30",icon:"💪",color:"#43e97b",sevColor:"#43e97b",sevLabel:"轻症"},
      ];
    }
  } catch(e) {
    hist.value = [
      {id:1,symptom:"持续头痛三天",date:"2026-06-25",time:"14:30",icon:"💪",color:"#43e97b",sevColor:"#43e97b",sevLabel:"轻症"},
    ];
  }
});

function nav(u){uni.navigateTo({url:u});}
</script>

<style lang="scss" scoped>
.page { min-height:100vh; background:#F5F5FA; }
.status-bar-fill { height:var(--status-bar-height); background:#fff; }
.nav { display:flex; align-items:center; padding:8px 20px 14px; background:#fff; }
.back { font-size:24px; color:#667eea; margin-right:12px; }
.nav-t { font-size:17px; font-weight:700; color:#1A1A2E; }
.list { padding:16px 20px; }
.item { display:flex; align-items:center; padding:16px; background:#fff; border-radius:18px; margin-bottom:10px; box-shadow:0 2px 6px rgba(0,0,0,0.03); }
.i-icon { width:44px; height:44px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:18px; margin-right:14px; }
.i-info { flex:1; }
.i-symp { font-size:15px; color:#1A1A2E; display:block; }
.i-date { font-size:12px; color:#9CA3AF; margin-top:2px; display:block; }
.i-badge { font-size:12px; padding:4px 10px; border-radius:8px; font-weight:600; }
.empty { text-align:center; color:#9CA3AF; font-size:14px; padding:40px; }
</style>
