<template>
<view class="page">
  <view class="status-bar-fill"></view>
  <view class="nav">
    <text class="nav-title">用药管理</text>
  </view>

  <view class="quick-row">
    <view class="quick-card" v-for="q in quicks" :key="q.key" @click="nav(q.key)">
      <image class="qc-icon" :src="q.icon"></image>
      <text class="qc-label">{{ q.label }}</text>
      <text class="qc-desc">{{ q.desc }}</text>
    </view>
  </view>

  <view class="risk-bar" v-if="hasRisk" @click="showRisk">
    <image class="risk-icon" src="/static/icon_warning.png"></image>
    <text class="risk-text">检测到药物潜在相互作用</text>
    <text class="risk-arrow">&#x2192;</text>
  </view>

  <view class="section-title"><text>当前用药</text></view>
  <view class="drug-card" v-for="d in drugs" :key="d.id" @click="nav('/pages/medication/detail')" @longpress="confirmDelete(d)">
    <view class="dc-top">
      <image class="dc-icon-img" :src="getDrugIcon(d.name)"></image>
      <view class="dc-info">
        <text class="dc-name">{{ d.name }}</text>
        <text class="dc-spec">{{ d.spec }}</text>
      </view>
      <view class="dc-badge" :style="{background:d.warning?'rgba(250,112,154,0.12)':'rgba(67,233,123,0.12)',color:d.warning?'#fa709a':'#43e97b'}">
        {{ d.warning ? "注意" : "安全" }}
      </view>
    </view>
    <view class="dc-bottom">
      <text class="dc-freq">{{ d.freq }} · {{ d.dose }}</text>
      <text class="dc-person">{{ d.person }}</text>
    </view>
  </view>

  <text class="empty-note" v-if="drugs.length===0">点击上方添加药品</text>
  <view class="safe-bottom"></view>
</view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { medApi } from "@/api/medication.js";
const hasRisk = ref(true);

const quicks = [
  { key:"/pages/medication/add", icon:"/static/icon_add_drug.png", label:"添加药品", desc:"添加药品信息" },
  { key:"/pages/medication/scan", icon:"/static/icon_scan.png", label:"扫码识别", desc:"扫描药盒" },
  { key:"/pages/medication/children", icon:"/static/icon_child.png", label:"儿童换算", desc:"计算安全剂量" },
];

const drugs = ref([]);

async function loadDrugs() {
  try {
    const list = await medApi.getList();
    if (list && list.length > 0) {
      drugs.value = list.map(d => ({
        id: d.id,
        name: d.name,
        spec: d.spec || '',
        freq: d.freq || '每日1次',
        dose: d.dose || '',
        person: '本人',
        warning: d.warning || false,
      }));
      hasRisk.value = drugs.value.some(d => d.warning);
      uni.setStorageSync("medication_list", JSON.stringify(list));
    } else {
      // API 返回空列表，清空显示（不加载旧缓存）
      drugs.value = [];
      hasRisk.value = false;
    }
  } catch(e) {
    drugs.value = [];
    hasRisk.value = false;
  }
}


function confirmDelete(d) {
  uni.showModal({
    title: "删除药品",
    content: "确定删除" + d.name + "？",
    success(r) {
      if (r.confirm) {
        medApi.deleteDrug(d.id).then(() => {
          uni.showToast({ title: "已删除", icon: "success" });
          loadDrugs();
        }).catch(() => {
          // 本地降级删除
          try {
            const saved = uni.getStorageSync("medication_list");
            if (saved) {
              let list = JSON.parse(saved);
              list = list.filter(item => item.id != d.id);
              uni.setStorageSync("medication_list", JSON.stringify(list));
            }
          } catch(e2) {}
          uni.showToast({ title: "已删除", icon: "success" });
          loadDrugs();
        });
      }
    }
  });
}

onMounted(() => {
  loadDrugs();
  uni.$on("medicationUpdated", loadDrugs);
});

onShow(() => {
  loadDrugs();
});

async function showRisk() {
  try {
    const ids = drugs.value.map(d => d.id);
    if (ids.length < 2) { uni.showToast({title:"需要至少2种药品才能检测冲突",icon:"none"}); return; }
    const res = await medApi.checkInteraction(ids);
    const data = res.data || res;
    const content = data.message || data.result || data.aiAnalysis || "AI分析中，请查看详情。";
    uni.showModal({ title:"AI冲突检测", content: content, showCancel:false });
  } catch(e) {
    uni.showModal({ title:"AI冲突检测", content:"暂无法连接AI服务。常见相互作用提示：阿莫西林与布洛芬间隔2小时以上服用。详见药品说明书。", showCancel:false });
  }
}
function nav(url) { uni.navigateTo({ url }); }

function getDrugIcon(name) {
  if (name.includes("胶囊")) return "/static/icon_capsule.png";
  if (name.includes("片")) return "/static/icon_tablet.png";
  if (name.includes("液") || name.includes("口服液") || name.includes("溶液")) return "/static/icon_liquid.png";
  return "/static/icon_capsule.png";
}
</script>

<style lang="scss" scoped>
.page { min-height:100vh; background: linear-gradient(180deg, #ebe7ff 0%,#f2feff 100% ); }
.status-bar-fill { height:var(--status-bar-height); background:#fff; }
.nav { padding:8px 20px 14px;  }
.nav-title { font-size:24px; font-weight:800; color:#1A1A2E; }
.quick-row { display:flex; gap:10px; padding:16px 20px; }
.quick-card { flex:1; padding:18px 14px; border-radius:16px; background:#fff; box-shadow:1px 3px 8px rgba(0,0,0,0.04); text-align:center; }
.qc-icon { width:44px; height:44px; border-radius:14px; margin:0 auto 8px; }
.qc-label { font-size:15px; font-weight:600; color:#1A1A2E; display:block; }
.qc-desc { font-size:11px; color:#9CA3AF; margin-top:2px; display:block; }
.risk-bar { display:flex; align-items:center; padding:14px 18px; margin:14px 20px 6px; background:rgba(250,112,154,0.1); border-radius:14px; }
.risk-icon { width:30px; height:30px; margin-right:10px; display:block; }
.risk-text { flex:1; font-size:14px; color:#fa709a; font-weight:500; }
.risk-arrow { font-size:18px; color:#fa709a; }
.section-title { padding:18px 24px 10px; }
.section-title text { font-size:17px; font-weight:700; color:#1A1A2E; }
.drug-card { margin:0 20px 8px; background:#fff; border-radius:18px; padding:14px 18px; box-shadow:0 2px 6px rgba(0,0,0,0.03); }
.dc-top { display:flex; align-items:center; margin-bottom:8px; }
.dc-icon-img { width:40px; height:40px; margin-right:12px; flex-shrink:0; object-fit:cover; }
.dc-info { flex:1; }
.dc-name { font-size:15px; font-weight:600; color:#1A1A2E; display:block; }
.dc-spec { font-size:12px; color:#9CA3AF; margin-top:1px; display:block; }
.dc-badge { font-size:11px; padding:3px 10px; border-radius:8px; font-weight:600; }
.dc-bottom { display:flex; justify-content:space-between; padding-top:8px; border-top:1px solid rgba(0,0,0,0.04); }
.dc-freq { font-size:12px; color:#667eea; }
.dc-person { font-size:12px; color:#9CA3AF; }
.empty-note { text-align:center; font-size:13px; color:#9CA3AF; padding:30px; display:block; }
.safe-bottom { padding-bottom:calc(50px + env(safe-area-inset-bottom)); }
</style>
