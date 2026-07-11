<template>
<view class="page">
  <view class="status-bar-fill"></view>
  <view class="nav">
    <text class="nav-title">健康监测</text>
    <text class="nav-date">{{ today }}</text>
  </view>

  <scroll-view class="member-pills" scroll-x show-scrollbar="false">
    <view class="pill" :class="{active: activeIdx === -1}" @click="selectMember(-1)">本人</view>
    <view class="pill" v-for="(m, i) in filteredMembers" :key="m.id" :class="{active: activeIdx === i}" @click="selectMember(i)">{{ m.name }}</view>
  </scroll-view>

  <view class="add-btn" @click="nav('/pages/health/record')">
    <text class="add-plus">+</text><text>记录新指标</text>
  </view>

  <view class="metric-card" v-for="m in metrics" :key="m.key" @click="nav('/pages/health/trend')">
    <view class="mc-left">
      <image class="mc-icon" :src="m.icon"></image>
      <view class="mc-info">
        <text class="mc-name">{{ m.label }}</text>
        <text class="mc-sub">{{ m.desc }}</text>
      </view>
    </view>
    <view class="mc-right">
      <text class="mc-value" :style="{color:m.status?.color || '#667eea'}">{{ m.value }}</text>
      <text class="mc-unit">{{ m.unit }}</text>
    </view>
    <view class="mc-badge" :style="{background:(m.status?.color||'#666')+'15',color:m.status?.color||'#666'}">{{ m.status?.label || "正常" }}</view>
  </view>

  <view class="report-banner" @click="nav('/pages/health/report')">
    <view class="rb-left">
      <image class="rb-icon" src="/static/icon_report.png"></image>
      <view>
        <text class="rb-title">健康周报</text>
        <text class="rb-desc">本周健康趋势与建议</text>
      </view>
    </view>
    <text class="rb-arrow">&#x2192;</text>
  </view>
  <view class="safe-bottom"></view>
</view>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { useAppStore } from "@/store";
import { healthApi } from "@/api/health.js";
const store = useAppStore();

const today = computed(() => { const d = new Date(); return d.getFullYear() + "/" + (d.getMonth()+1) + "/" + d.getDate(); });
const activeIdx = ref(-1);
const members = computed(() => store.familyMembers);
const filteredMembers = computed(() => members.value.filter(x => x.relation !== "本人"));

const metrics = ref([
  { key:"bp",icon:"/static/icon_bp.png",label:"血压",value:"--",unit:"mmHg",desc:"暂无数据",status:{label:"正常",color:"#43e97b"} },
  { key:"bs",icon:"/static/icon_bs.png",label:"血糖",value:"--",unit:"mmol/L",desc:"暂无数据",status:{label:"正常",color:"#43e97b"} },
  { key:"bo",icon:"/static/icon_bo.png",label:"血氧",value:"--",unit:"%",desc:"暂无数据",status:{label:"正常",color:"#43e97b"} },
  { key:"hr",icon:"/static/icon_hr.png",label:"心率",value:"--",unit:"bpm",desc:"暂无数据",status:{label:"正常",color:"#43e97b"} },
  { key:"wt",icon:"/static/icon_wt.png",label:"体重",value:"--",unit:"kg",desc:"暂无数据",status:{label:"标准",color:"#4facfe"} },
]);

function selectMember(i){
  activeIdx.value = i;
  if (i === -1) { store.setCurrentMember(null); }
  else { store.setCurrentMember(members.value[i]); }
  loadRecords();
}
function nav(url) { uni.navigateTo({ url }); }

function loadRecords() {
  // 根据当前选中的成员加载对应记录
  const params = {};
  if (store.currentMember && store.currentMember.id) {
    params.patientId = store.currentMember.id;
  }
  healthApi.getRecords(params).then(records => {
    if (records && records.length > 0) {
      updateMetrics(records);
    } else {
      loadLocalRecords();
    }
  }).catch(() => {
    loadLocalRecords();
  });
}

function loadLocalRecords() {
  try {
    const saved = uni.getStorageSync("health_records");
    if (saved) {
      const records = JSON.parse(saved);
      updateMetrics(records);
    }
  } catch(e) {}
}

function updateMetrics(records) {
  const latest = {};
  const labels = { bp:"血压", bs:"血糖", bo:"血氧", hr:"心率", wt:"体重" };
  const units = { bp:"mmHg", bs:"mmol/L", bo:"%", hr:"bpm", wt:"kg" };
  const icons = { bp:"/static/icon_bp.png", bs:"/static/icon_bs.png", bo:"/static/icon_bo.png", hr:"/static/icon_hr.png", wt:"/static/icon_wt.png" };
  for (const r of records) {
    if (!latest[r.metricType]) {
      const val = r.valueStr || (r.valueSys ? r.valueSys+"/"+r.valueDia : "--");
      latest[r.metricType] = { value: val, unit: units[r.metricType] || "", icon: icons[r.metricType] || "", label: labels[r.metricType] || "" };
    }
  }
  metrics.value = ["bp","bs","bo","hr","wt"].map(k => {
    const data = latest[k];
    if (data) {
      return { key:k, icon:data.icon, label:data.label, value:data.value, unit:data.unit, desc:"最新记录", status:{label:"正常",color:"#43e97b"} };
    }
    return metrics.value.find(m => m.key === k);
  });
}

onMounted(()=>{
  store.loadMembers();
  loadRecords();
  uni.$on("familyUpdated", () => store.loadMembers());
});

// 每次切换到该 tab 时重新加载数据
onShow(() => {
  loadRecords();
});
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: linear-gradient(180deg, #ebe7ff 0%,#f2feff 100% ); }
.status-bar-fill { height: var(--status-bar-height); background: #fff; }
.nav { display:flex; justify-content:space-between; align-items:baseline; padding:8px 20px 12px; }
.nav-title { font-size:24px; font-weight:800; color:#1A1A2E; }
.nav-date { font-size:13px; color:#9CA3AF; }
.member-pills { white-space:nowrap; padding:12px 20px;  }
.pill { display:inline-flex; padding:8px 18px; margin-right:8px; border-radius:20px; font-size:14px; background:#F0F0F5; color:#6B7280; }
.pill.active { background:linear-gradient(135deg,#667eea,#658ae4); color:#fff; font-weight:600; }
.add-btn { display:flex; align-items:center; justify-content:center; gap:6px; padding:16px; margin:14px 20px; border:2px dashed #667eea; border-radius:16px; background:rgba(102,126,234,0.04); color:#667eea; font-size:15px; font-weight:600; }
.add-plus { font-size:22px; font-weight:300; }
.metric-card { display:flex; align-items:center; padding:16px; margin:0 20px 10px; background:#ffffff; border-radius:18px; box-shadow:0 2px 8px rgba(0,0,0,0.03); }
.mc-left { display:flex; align-items:center; flex:1; }
.mc-icon { width:46px; height:46px; border-radius:14px; margin-right:12px; }
.mc-name { font-size:16px; font-weight:600; color:#1A1A2E; display:block; }
.mc-sub { font-size:12px; color:#9CA3AF; margin-top:2px; display:block; }
.mc-right { display:flex; align-items:baseline; gap:4px; }
.mc-value { font-size:20px; font-weight:700; }
.mc-unit { font-size:11px; color:#9CA3AF; }
.mc-badge { font-size:12px; padding:4px 10px; border-radius:8px; margin-left:10px; flex-shrink:0; }
.report-banner { display:flex; align-items:center; justify-content:space-between; padding:18px 20px; margin:6px 20px; border-radius:18px; background:linear-gradient(135deg,rgba(102,126,234,0.06),rgba(118,75,162,0.06)); }
.rb-left { display:flex; align-items:center; gap:12px; }
.rb-icon { width:28px; height:28px; }
.rb-title { font-size:16px; font-weight:700; color:#1A1A2E; display:block; }
.rb-desc { font-size:12px; color:#6B7280; margin-top:2px; display:block; }
.rb-arrow { font-size:20px; color:#667eea; }
.safe-bottom { padding-bottom: calc(50px + env(safe-area-inset-bottom)); }
</style>
