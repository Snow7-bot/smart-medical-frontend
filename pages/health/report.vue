<template>
<view class="page">
  <view class="status-bar-fill"></view>
  <view class="nav"><view class="back" @click="uni.navigateBack()">&#x2039;</view><text class="nav-t">健康报告</text></view>

  <!-- 成员切换 -->
  <scroll-view class="member-row" scroll-x show-scrollbar="false" v-if="members.length > 0">
    <view class="member-avatar" v-for="m in members" :key="m.id" @click="selectMember(m)">
      <view class="ma-circle" :class="{ selected: selectedMemberId === m.id }" :style="{background:colorByIdx(m.id)}">
        <text class="ma-initial">{{ m.name.slice(-1) }}</text>
      </view>
      <text class="ma-name" :class="{ active: selectedMemberId === m.id }">{{ m.name }}</text>
    </view>
  </scroll-view>

  <view class="content">
    <view class="periods">
      <view class="p-item" :class="{on: period === 'week'}" @click="switchPeriod('week')">周报</view>
      <view class="p-item" :class="{on: period === 'month'}" @click="switchPeriod('month')">月报</view>
    </view>
    <view class="report-card" v-for="r in currentReports" :key="r.title" :style="{background:r.bg}" @click="showTrend(r)">
      <image class="rc-icon" :src="r.icon"></image>
      <text class="rc-title">{{ r.title }}</text>
      <text class="rc-summary">{{ r.summary }}</text>
      <view class="rc-stats">
        <view class="rc-stat" v-for="s in r.stats" :key="s.label"><text class="rcs-val">{{ s.value }}</text><text class="rcs-label">{{ s.label }}</text></view>
      </view>
      <view class="rc-advice"><text class="adv-text">{{ r.advice }}</text></view>
    </view>
    <view class="card">
      <text class="big-title">AI 综合建议</text>
      <view class="adv-block" v-if="aiAdvice">
        <text class="adv-text" style="line-height:1.8;">{{ aiAdvice }}</text>
      </view>
      <view class="adv-block" v-else @click="loadAIAdvice">
        <text class="adv-label">饮食</text><text class="adv-text">增加蔬菜摄入，减少高盐食品，每天饮水2000ml以上。</text>
        <text class="adv-label">运动</text><text class="adv-text">每周150分钟中等强度运动，运动前后注意监测血压。</text>
        <text class="adv-label" style="margin-bottom:0">用药</text><text class="adv-text">按时服药，如需调整请咨询医生。</text>
        <view class="ai-btn" v-if="!aiAdvice && !aiLoading">点击获取AI个性化建议</view>
        <text class="ai-loading" v-if="aiLoading">AI分析中...</text>
      </view>
    </view>
  </view>

  <!-- 趋势图表弹窗 -->
  <view class="modal-mask" v-if="trendModal.visible" @click="closeTrend">
    <view class="modal-content" @click.stop>
      <view class="modal-header">
        <text class="modal-title">{{ trendModal.title }}趋势</text>
        <text class="modal-close" @click="closeTrend">✕</text>
      </view>
      <canvas canvas-id="trendCanvas" class="trend-canvas"></canvas>
      <view class="trend-legend">
        <view class="legend-item" v-for="(d, i) in trendModal.data" :key="i">
          <text class="legend-dot" :style="{background: d.color}"></text>
          <text class="legend-label">{{ d.day }}</text>
          <text class="legend-value">{{ d.value }}</text>
        </view>
      </view>
    </view>
  </view>
</view>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from "vue";
import { useAppStore } from "@/store";
import { healthApi } from "@/api/health.js";
import { consultApi } from "@/api/consultation.js";
const store = useAppStore();

const period = ref("week");
const selectedMemberId = ref(null);
const members = computed(() => store.familyMembers);
const loading = ref(false);
const reportData = ref(null);
const aiAdvice = ref("");
const aiLoading = ref(false);

const selectedMember = computed(() => {
  if (selectedMemberId.value === null) return null;
  return members.value.find(m => m.id === selectedMemberId.value) || null;
});

const colors = ["#667eea","#4facfe","#43e97b","#f6d365","#fa709a"];
function colorByIdx(id) { return colors[id % colors.length]; }
function selectMember(m) {
  if (selectedMemberId.value === m.id) {
    selectedMemberId.value = null;
  } else {
    selectedMemberId.value = m.id;
  }
  store.setCurrentMember(m);
  loadReport();
}

const weeklyReports = ref([
  {
    title: "血压分析", icon: "/static/icon_bp.png", bg: "linear-gradient(135deg, rgba(254,238,238,0.8), rgba(255,255,255,0.9))",
    summary: "加载中...",
    stats: [],
    advice: "暂无数据",
    trendKey: "bp",
  },
  {
    title: "血糖分析", icon: "/static/icon_bs.png", bg: "linear-gradient(135deg, rgba(246,211,101,0.15), rgba(255,255,255,0.9))",
    summary: "加载中...",
    stats: [],
    advice: "暂无数据",
    trendKey: "bs",
  },
]);

const monthlyReports = ref([
  {
    title: "综合月报", icon: "/static/icon_report.png", bg: "linear-gradient(135deg, rgba(102,126,234,0.08), rgba(255,255,255,0.9))",
    summary: "加载中...",
    stats: [],
    advice: "暂无数据",
    trendKey: "bp",
  },
]);

const currentReports = computed(() => period.value === "week" ? weeklyReports.value : monthlyReports.value);

const trendModal = ref({ visible: false, title: "", data: [], key: "" });

function switchPeriod(p) { period.value = p; loadReport(); }

async function loadReport() {
  const memberId = selectedMemberId.value;
  loading.value = true;
  try {
    const params = { period: period.value };
    if (memberId) params.memberId = memberId;
    const res = await healthApi.getReport(params);
    const data = res.data || res;
    if (data && data.items && data.items.length > 0) {
      const items = data.items;
      if (period.value === "week") {
        weeklyReports.value = items.map((item, idx) => ({
          title: item.title || ["血压分析","血糖分析"][idx] || "指标分析",
          icon: item.icon || (idx===0?"/static/icon_bp.png":"/static/icon_bs.png"),
          bg: item.bg || weeklyReports.value[idx]?.bg || "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.9))",
          summary: item.summary || "本周数据正常",
          stats: item.stats || [],
          advice: item.advice || "继续保持良好习惯",
          trendKey: item.trendKey || (idx===0?"bp":"bs"),
        }));
      } else {
        monthlyReports.value = items.map(item => ({
          title: item.title || "综合月报",
          icon: item.icon || "/static/icon_report.png",
          bg: item.bg || monthlyReports.value[0]?.bg || "",
          summary: item.summary || "",
          stats: item.stats || [],
          advice: item.advice || "",
          trendKey: item.trendKey || "bp",
        }));
      }
    } else {
      setMockData();
    }
    // 同时触发AI建议
    loadAIAdvice();
  } catch(e) {
    setMockData();
  }
  loading.value = false;
}

function setMockData() {
  weeklyReports.value = [
    { title:"血压分析",icon:"/static/icon_bp.png",bg:"linear-gradient(135deg, rgba(254,238,238,0.8), rgba(255,255,255,0.9))",summary:"本周血压基本稳定，有1天偏高",stats:[{label:"平均",value:"126/82"},{label:"最高",value:"142/92"},{label:"最低",value:"116/76"}],advice:"减少盐摄入，保持规律作息",trendKey:"bp"},
    { title:"血糖分析",icon:"/static/icon_bs.png",bg:"linear-gradient(135deg, rgba(246,211,101,0.15), rgba(255,255,255,0.9))",summary:"血糖控制良好，均在正常范围内",stats:[{label:"空腹均值",value:"5.2"},{label:"餐后均值",value:"6.8"},{label:"波动范围",value:"4.8-7.2"}],advice:"继续保持当前饮食和用药方案",trendKey:"bs"},
  ];
  monthlyReports.value = [
    { title:"综合月报",icon:"/static/icon_report.png",bg:"linear-gradient(135deg, rgba(102,126,234,0.08), rgba(255,255,255,0.9))",summary:"本月各项指标总体稳定",stats:[{label:"血压稳定率",value:"85%"},{label:"血糖达标率",value:"92%"},{label:"记录天数",value:"28天"}],advice:"各项指标控制良好，建议继续保持",trendKey:"bp"},
  ];
}

async function loadAIAdvice() {
  if (aiAdvice.value) return;
  aiLoading.value = true;
  try {
    // 调用AI获取个性化健康建议
    const res = await consultApi.sendText({
      message: "根据当前用户的健康指标数据，请生成一份简洁的健康管理建议（包含饮食、运动、用药三个方面，每个方面1-2句话），以中文输出。",
      type: "report_analysis"
    });
    const data = res.data || res;
    aiAdvice.value = data.reply || data.advice || "";
  } catch(e) {
    aiAdvice.value = "";
  }
  aiLoading.value = false;
}

function showTrend(report) {
  const mockData = [
    { day:"周一",value:"120/80",color:"#43e97b"},{ day:"周二",value:"132/85",color:"#f6d365"},{ day:"周三",value:"116/76",color:"#43e97b"},{ day:"周四",value:"142/92",color:"#fa709a"},{ day:"周五",value:"125/79",color:"#43e97b"},{ day:"周六",value:"130/84",color:"#f6d365"},{ day:"周日",value:"118/78",color:"#43e97b"},
  ];
  trendModal.value = { visible:true, title:report.title, data:mockData, key:report.trendKey };
  nextTick(() => drawTrend(mockData));
}

function closeTrend() { trendModal.value.visible = false; }

function drawTrend(data) {
  const ctx = uni.createCanvasContext("trendCanvas");
  const w = 280, h = 150;
  const pad = { top: 10, right: 10, bottom: 18, left: 32 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;
  const values = data.map(d => parseInt((d.value || "").split("/")[0] || 0));
  const min = Math.min(...values) * 0.9;
  const max = Math.max(...values) * 1.1;
  const range = max - min || 1;

  const points = data.map((d, i) => ({
    x: pad.left + (i / (data.length - 1)) * chartW,
    y: h - pad.bottom - ((values[i] - min) / range) * chartH,
    color: d.color,
    value: d.value
  }));

  ctx.setFontSize(10);
  ctx.setFillStyle("#9CA3AF");
  const yLabels = [min, (min + max) / 2, max];
  ctx.setTextAlign("right");
  yLabels.forEach(v => {
    const y = h - pad.bottom - ((v - min) / range) * chartH;
    const label = v % 1 === 0 ? v.toString() : v.toFixed(1);
    ctx.fillText(label, pad.left - 6, y + 3);
    ctx.setStrokeStyle("#F0F0F5");
    ctx.setLineWidth(1);
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(w - pad.right, y);
    ctx.stroke();
  });

  ctx.setTextAlign("center");
  data.forEach((d, i) => {
    const x = pad.left + (i / (data.length - 1)) * chartW;
    ctx.fillText(d.day, x, h - pad.bottom + 16);
  });

  ctx.setStrokeStyle("#667eea");
  ctx.setLineWidth(2);
  ctx.beginPath();
  points.forEach((p, i) => { i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); });
  ctx.stroke();

  points.forEach(p => {
    ctx.beginPath();
    ctx.setFillStyle("#667eea");
    ctx.arc(p.x, p.y, 3, 0, 2 * Math.PI);
    ctx.fill();
  });

  ctx.draw();
}

onMounted(() => {
  store.loadMembers();
  uni.$on("familyUpdated", () => store.loadMembers());
  loadReport();
});
</script>

<style lang="scss" scoped>
.page { min-height:100vh; background:#F5F5FA; }
.status-bar-fill { height:var(--status-bar-height); background:#fff; }
.nav { display:flex; align-items:center; padding:8px 20px 14px;  }
.back { font-size:24px; color:#667eea; margin-right:12px; }
.nav-t { font-size:17px; font-weight:700; color:#1A1A2E; }

.member-row { white-space: nowrap; padding: 2px 12px 12px; height: 65px; }
.member-avatar { display: inline-flex; flex-direction: column; align-items: center; margin-right: 14px; width: 60px;margin-top: 5px; }
.ma-circle { overflow:hidden;
  width: 42px; height: 42px; border-radius: 50%; display: flex;
  align-items: center; justify-content: center;
  box-shadow: 0 4px 12px rgba(102,126,234,0.2);
  transition: all 0.25s ease;
}
.ma-circle.selected {
  border: 1px solid #d1d1d1;
  box-shadow: 0 0 3px rgba(102,126,234,0.45);
  transform: scale(1.12);
}
.ma-initial { font-size: 18px; color: #fff; font-weight: 700; }
.ma-name { font-size: 11px; color: #6B7280; margin-top: 4px; text-align: center; max-width: 60px; overflow: hidden; text-overflow: ellipsis; }
.ma-name.active { color: #667eea; font-weight: 600; }

.content { padding:16px 20px 40px; }
.periods { display:flex; background:#E5E7EB; border-radius:12px; padding:3px; margin-bottom:16px; }
.p-item { flex:1; text-align:center; padding:10px; border-radius:10px; font-size:14px; color:#6B7280; }
.p-item.on { background:#fff; font-weight:700; color:#1A1A2E; box-shadow:0 1px 3px rgba(0,0,0,0.08); }

.report-card { border-radius:18px; padding:20px; margin-bottom:12px; }
.rc-icon { width:46px; height:46px; display:block; margin-bottom:8px; }
.rc-title { font-size:17px; font-weight:700; color:#1A1A2E; display:block; }
.rc-summary { font-size:13px; color:#6B7280; display:block; margin:6px 0 12px; line-height:1.5; }
.rc-stats { display:flex; gap:24px; margin-bottom:12px; }
.rc-stat { text-align:center; }
.rcs-val { font-size:18px; font-weight:700; color:#1A1A2E; display:block; }
.rcs-label { font-size:11px; color:#9CA3AF; margin-top:2px; display:block; }
.rc-advice { display:flex; align-items:flex-start; padding:10px 12px; background:rgba(255,255,255,0.5); border-radius:12px; }

.adv-text { font-size:12px; color:#6B7280; flex:1; line-height:1.5; }

.card { background:#fff; border-radius:18px; padding:20px; }
.big-title { font-size:16px; font-weight:700; color:#1A1A2E; margin-bottom:16px; display:block; }
.adv-block { margin-bottom:14px; }
.adv-label { font-size:14px; font-weight:600; color:#667eea; margin-bottom:4px; display:block; }
.ai-btn { padding:12px; margin-top:12px; background:linear-gradient(135deg,#667eea,#764ba2); color:#fff; border-radius:12px; text-align:center; font-size:14px; font-weight:600; }
.ai-loading { padding:12px; margin-top:12px; text-align:center; color:#9CA3AF; font-size:14px; }

.modal-mask { position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.4); z-index:999; display:flex; align-items:center; justify-content:center; }
.modal-content { background:#fff; border-radius:20px; padding:24px; width:300px; max-height:80vh; overflow-y:auto; }
.modal-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
.modal-title { font-size:17px; font-weight:700; color:#1A1A2E; }
.modal-close { font-size:20px; color:#9CA3AF; padding:4px; }
.trend-canvas { width:280px; height:150px; margin:0 auto 16px; }
.trend-legend { display:flex; flex-wrap:wrap; gap:12px; justify-content:center; }
.legend-item { display:flex; align-items:center; gap:4px; }
.legend-dot { width:8px; height:8px; border-radius:50%; display:inline-block; }
.legend-label { font-size:11px; color:#6B7280; }
.legend-value { font-size:11px; color:#1A1A2E; font-weight:600; }
</style>
