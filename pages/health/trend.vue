<template>
<view class="page">
  <view class="status-bar-fill"></view>
  <view class="nav"><view class="back" @click="uni.navigateBack()">&#x2039;</view><text class="nav-t">趋势分析</text></view>
  <view class="content">
    <view class="periods">
      <view class="p-item" v-for="p in periods" :key="p" :class="{on:period===p}" @click="period=p">{{ p }}</view>
    </view>
    <view class="card">
      <view class="chart-header"><text class="ch-t">血压趋势</text><text class="ch-sub">本周</text></view>
      <view class="chart-area">
        <view class="bar-row" v-for="(d,i) in trend" :key="i">
          <text class="bar-label">{{ d.day }}</text>
          <view class="bar-wrap"><view class="bar" :style="{width:d.val+'%',background:d.color}"></view></view>
          <text class="bar-val" :style="{color:d.color}">{{ d.sys }}/{{ d.dia }}</text>
        </view>
      </view>
      <view class="chart-legend">
        <view class="leg-dot" style="background:#43e97b"></view><text class="leg-text">正常</text>
        <view class="leg-dot" style="background:#f6d365;margin-left:12px"></view><text class="leg-text">偏高</text>
        <view class="leg-dot" style="background:#fa709a;margin-left:12px"></view><text class="leg-text">高(需关注)</text>
      </view>
    </view>
    <view class="section-label">历史记录</view>
    <view class="data-list">
      <view class="dl-item" v-for="(d,i) in datalist" :key="i"><text class="dl-date">{{ d.date }}</text><text class="dl-val" :style="{color:d.color}">{{ d.value }}</text><text class="dl-time">{{ d.time }}</text></view>
    </view>
  </view>
</view>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { healthApi } from "@/api/health.js";
const periods=["日","周","月","年"];
const period=ref("周");
const trendDefault=[{day:"周一",val:55,sys:"120",dia:"80",color:"#43e97b"},{day:"周二",val:62,sys:"132",dia:"85",color:"#f6d365"},{day:"周三",val:48,sys:"116",dia:"76",color:"#43e97b"},{day:"周四",val:70,sys:"142",dia:"92",color:"#fa709a"},{day:"周五",val:50,sys:"125",dia:"79",color:"#43e97b"},{day:"周六",val:52,sys:"130",dia:"84",color:"#f6d365"},{day:"周日",val:45,sys:"118",dia:"78",color:"#43e97b"}];
const trend=ref(JSON.parse(JSON.stringify(trendDefault)));
const datalist=ref([{date:"06-21",time:"08:00",value:"128/82",color:"#43e97b"},{date:"06-22",time:"08:15",value:"132/85",color:"#f6d365"},{date:"06-23",time:"09:00",value:"142/92",color:"#fa709a"},{date:"06-24",time:"07:45",value:"130/84",color:"#f6d365"},{date:"06-25",time:"08:30",value:"126/80",color:"#43e97b"}]);

async function loadTrend() {
  try {
    const list = await healthApi.getTrend({ metricType: "bp" });
    if (list && list.length > 0) {
      const items = list.slice(0, 10).reverse();
      // 后端返回格式: { date, time, metricType, value }
      // value 为 "120/80" 的字符串
      trend.value = items.map((d, i) => {
        const parts = (d.value || "120/80").split("/");
        const sys = parseInt(parts[0]) || 120;
        const dia = parseInt(parts[1]) || 80;
        const percent = Math.min(100, Math.max(10, ((sys - 80) / 100) * 100));
        const color = sys > 140 || dia > 90 ? "#fa709a" : (sys > 130 || dia > 85 ? "#f6d365" : "#43e97b");
        return {
          day: (d.date || "").substring(5) || "第"+(i+1)+"天",
          val: percent,
          sys: String(sys),
          dia: String(dia),
          color: color,
        };
      });
      datalist.value = items.map(d => {
        const parts = (d.value || "120/80").split("/");
        const sys = parseInt(parts[0]) || 120;
        const dia = parseInt(parts[1]) || 80;
        const color = sys > 140 || dia > 90 ? "#fa709a" : (sys > 130 || dia > 85 ? "#f6d365" : "#43e97b");
        return {
          date: (d.date || "").substring(5) || "",
          time: d.time || "",
          value: parts[0]+"/"+parts[1],
          color: color,
        };
      });
      return;
    }
  } catch(e) {
    console.log("loadTrend error:", e);
  }
  // 无数据时显示空状态
  trend.value = [];
  datalist.value = [];
}

watch(period, loadTrend);

onMounted(loadTrend);
</script>

<style lang="scss" scoped>
.page { min-height:100vh; background:#F5F5FA; }
.status-bar-fill { height:var(--status-bar-height); background:#fff; }
.nav { display:flex; align-items:center; padding:8px 20px 14px; background:#fff; }
.back { font-size:24px; color:#667eea; margin-right:12px; }
.nav-t { font-size:17px; font-weight:700; color:#1A1A2E; }
.content { padding:16px 20px 40px; }
.periods { display:flex; background:#E5E7EB; border-radius:12px; padding:3px; margin-bottom:16px; }
.p-item { flex:1; text-align:center; padding:10px; border-radius:10px; font-size:14px; color:#6B7280; }
.p-item.on { background:#fff; font-weight:700; color:#1A1A2E; box-shadow:0 1px 3px rgba(0,0,0,0.08); }
.card { background:#fff; border-radius:18px; padding:18px 20px; margin-bottom:12px; }
.chart-header { display:flex; justify-content:space-between; margin-bottom:16px; }
.ch-t { font-size:15px; font-weight:700; color:#1A1A2E; }
.ch-sub { font-size:12px; color:#9CA3AF; }
.bar-row { display:flex; align-items:center; margin-bottom:12px; }
.bar-label { width:32px; font-size:11px; color:#9CA3AF; }
.bar-wrap { flex:1; height:20px; background:#F5F5FA; border-radius:10px; margin:0 10px; overflow:hidden; }
.bar { height:100%; border-radius:10px; }
.bar-val { font-size:12px; font-weight:600; width:56px; text-align:right; }
.chart-legend { display:flex; align-items:center; margin-top:12px; padding-top:12px; border-top:1px solid rgba(0,0,0,0.04); }
.leg-dot { width:8px; height:8px; border-radius:4px; }
.leg-text { font-size:11px; color:#9CA3AF; margin-left:4px; }
.section-label { padding:12px 4px 8px; font-size:16px; font-weight:700; color:#1A1A2E; }
.dl-item { display:flex; align-items:center; padding:14px 16px; background:#fff; border-radius:12px; margin-bottom:6px; }
.dl-date { flex:1; font-size:14px; color:#1A1A2E; }
.dl-val { font-size:16px; font-weight:700; margin-right:10px; }
.dl-time { font-size:12px; color:#9CA3AF; }
</style>




