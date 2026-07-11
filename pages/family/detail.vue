<template>
<view class="page">
  <view class="status-bar-fill"></view>
  <view class="nav"><view class="back" @click="uni.navigateBack()">&#x2039;</view><text class="nav-t">{{ m.name }}的健康档案</text></view>
  <view class="card">
    <view class="m-top">
      <view class="m-avatar" :style="{background:colors[m.id%5]}">
      <text class="m-initial">{{ m.name[0] }}</text>
    </view>
      <view><text class="m-name">{{ m.name }}</text><text class="m-meta">{{ m.age }}岁 · {{ m.gender==='male'?'男':'女' }} · {{ m.relation }}</text></view>
    </view>
  </view>
  <view class="card">
    <view class="dr"><text class="dk">既往病史</text><text class="dv">{{ m.history || '无' }}</text></view>
    <view class="dr"><text class="dk">过敏史</text><text class="dv">{{ m.allergy || '无' }}</text></view>
  </view>
  <view class="section"><text>医疗记录</text><text class="add-link" @click="addRec">＋ 添加</text></view>
  <view class="card" style="margin-bottom:30px">
    <view class="dr" v-for="r in recs" :key="r.id"><text class="dk">{{ r.type }}</text><text class="dv">{{ r.date }}</text></view>
    <text class="empty" v-if="recs.length===0">暂无记录</text>
  </view>
  <view class="delete-btn" @click="handleDelete">删除成员</view>
  <view class="safe-bottom"></view>
</view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAppStore } from "@/store";
import { familyApi } from "@/api/family.js";
import { medicalRecordApi } from "@/api/medical-record.js";
const store = useAppStore();
const colors=["#667eea","#4facfe","#43e97b","#f6d365","#fa709a"];
const m=ref(store.currentMember || {id:1,name:"未知",age:0,gender:"male",relation:"未知",history:"无",allergy:"无"});
const recs=ref([
  {id:1,type:"年度体检",date:"2026-05-01"},
  {id:2,type:"门诊记录",date:"2026-06-15"},
]);

onMounted(async () => {
  // 从后端获取最新成员详情
  if (store.currentMember?.id) {
    try {
      const detail = await familyApi.getDetail(store.currentMember.id);
      const data = detail.data || detail;
      if (data) {
        m.value = {
          id: data.id || data.patientId,
          name: data.name || data.patientName,
          age: data.age || 0,
          gender: data.gender || "male",
          relation: data.relation || "未知",
          history: data.history || data.medicalHistory || "无",
          allergy: data.allergy || data.allergies || "无",
        };
      }
    } catch(e) {}
  }
  // 从后端获取医疗记录
  try {
    const patientId = m.value.id;
    const records = await medicalRecordApi.listByPatient(patientId);
    const data = records.data || records;
    if (data && data.length > 0) {
      recs.value = data.map(r => ({
        id: r.id,
        type: r.type || r.recordType || "病历",
        date: r.recordDate || r.createdDate || "",
      }));
    }
  } catch(e) {}
});

function addRec(){
  uni.showActionSheet({
    itemList:["体检报告","病历","手术记录","过敏史"],
    success: (res) => {
      const types = ["体检报告", "病历", "手术记录", "过敏史"];
      uni.chooseImage({
        count: 1,
        success: (chooseRes) => {
          uni.showLoading({title:"上传中..."});
          medicalRecordApi.upload(chooseRes.tempFilePaths[0], m.value.id)
            .then(() => {
              uni.hideLoading();
              uni.showToast({title:"上传成功",icon:"success"});
            })
            .catch(() => {
              uni.hideLoading();
              uni.showToast({title:"上传失败",icon:"none"});
            });
        }
      });
    }
  });
}

async function handleDelete(){
  uni.showModal({
    title:"确认删除",
    content:`确定要删除「${m.value.name}」的健康档案吗？此操作不可撤销。`,
    async success(r){
      if(!r.confirm) return;
      try {
        await familyApi.deleteMember(m.value.id);
        uni.$emit("familyUpdated");
        uni.showToast({title:"已删除",icon:"success"});
        setTimeout(()=>uni.navigateBack(),1200);
      } catch(e) {
        // Fallback to local
        try {
          const saved = uni.getStorageSync("family_members");
          if (saved) {
            let list = JSON.parse(saved);
            list = list.filter(item => item.id !== m.value.id);
            uni.setStorageSync("family_members", JSON.stringify(list));
            store.setFamilyMembers(list);
          }
          uni.$emit("familyUpdated");
          uni.showToast({title:"已删除",icon:"success"});
          setTimeout(()=>uni.navigateBack(),1200);
        } catch(e2){
          uni.showToast({title:"删除失败",icon:"none"});
        }
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
.card { background:#fff; border-radius:18px; margin:12px 20px; padding:18px 20px; }
.m-top { display:flex; align-items:center; }
.m-avatar { width:54px; height:54px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin-right:14px; overflow:hidden; }
.m-initial { font-size:22px; color:#fff; font-weight:700; }
.m-name { font-size:18px; font-weight:700; color:#1A1A2E; display:block; }
.m-meta { font-size:13px; color:#6B7280; margin-top:2px; display:block; }
.dr { display:flex; justify-content:space-between; padding:14px 0; border-bottom:1px solid rgba(0,0,0,0.04); }
.dr:last-child { border:none; }
.dk { font-size:14px; color:#6B7280; }
.dv { font-size:14px; color:#1A1A2E; font-weight:500; text-align:right; max-width:60%; }
.section { display:flex; justify-content:space-between; padding:16px 24px 8px; font-size:17px; font-weight:700; color:#1A1A2E; }
.add-link { font-size:14px; color:#667eea; font-weight:400; }
.empty { text-align:center; font-size:13px; color:#9CA3AF; padding:20px; }
.delete-btn { margin:0 20px 20px; padding:16px; border-radius:14px; background:#fff; color:#e10e39; font-size:16px; font-weight:600; text-align:center; border:1px solid rgba(225, 14, 57, 0.2); }
.safe-bottom { padding-bottom:calc(30px + env(safe-area-inset-bottom)); }
</style>

