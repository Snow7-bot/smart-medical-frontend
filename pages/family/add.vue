<template>
<view class="page">
  <view class="status-bar-fill"></view>
  <view class="nav"><view class="back" @click="uni.navigateBack()">&#x2039;</view><text class="nav-t">添加成员</text></view>
  <view class="card">
    <view class="fg"><text class="fl">关系</text><picker :value="ri" :range="rels" @change="onRelationChange"><text class="fpv">{{ rels[ri] }} &#x25BE;</text></picker></view>
    <view class="fg"><text class="fl">姓名</text><input class="fi" v-model="f.name" placeholder="请输入姓名"/></view>
    <view class="fg"><text class="fl">性别</text><view class="fg-row"><view class="gopt" :class="{active:f.gender==='male',disabled:!genderEnabled('male')}" @click="setGender('male')">男</view><view class="gopt" :class="{active:f.gender==='female',disabled:!genderEnabled('female')}" @click="setGender('female')">女</view></view></view>
    <view class="fg"><text class="fl">年龄</text><input class="fi" type="number" v-model="f.age" placeholder="请输入年龄"/></view>
    <view class="fg"><text class="fl">既往病史</text><input class="fi" v-model="f.history" placeholder="如：高血压、糖尿病等"/></view>
    <view class="fg"><text class="fl">过敏史</text><input class="fi" v-model="f.allergy" placeholder="如：青霉素过敏等"/></view>
  </view>
  <view class="btn-grad" @click="save">保存成员</view>
  <SuccessCheck ref="successRef" />
</view>
</template>

<script setup>
import { ref, computed } from "vue";
import { useAppStore } from "@/store";
import { familyApi } from "@/api/family.js";
import SuccessCheck from "@/components/SuccessCheck.vue";
const store = useAppStore();
const ri=ref(0),rels=["本人","配偶","父亲","母亲","儿子","女儿","其他"];
const f=ref({name:"",relation:"self",gender:"male",age:"",history:"",allergy:""});
const successRef = ref(null);

// 检查是否已存在"本人"
const hasSelf = computed(() => {
  return store.familyMembers.some(m => m.relation === "本人" || m.relation === "self");
});

function onRelationChange(e) {
  const newIdx = e.detail.value;
  const rel = rels[newIdx];
  // 如果已有"本人"且用户想选"本人"，阻止并提示
  if (rel === "本人" && hasSelf.value) {
    uni.showToast({title:"已存在'本人'成员，不可重复添加",icon:"none",duration:2000});
    return;
  }
  ri.value = newIdx;
  if (rel === "父亲" || rel === "儿子") f.value.gender = "male";
  else if (rel === "母亲" || rel === "女儿") f.value.gender = "female";
}
function genderEnabled(v) {
  const rel = rels[ri.value];
  if (rel === "父亲" || rel === "儿子") return v === "male";
  if (rel === "母亲" || rel === "女儿") return v === "female";
  return true;
}
function setGender(v) {
  if (!genderEnabled(v)) return;
  f.value.gender = v;
}

async function save(){
  // 二次校验：如果是"本人"且已存在，阻止提交
  if (rels[ri.value] === "本人" && hasSelf.value) {
    uni.showToast({title:"已存在'本人'成员，不可重复添加",icon:"none",duration:2000});
    return;
  }
  if(!f.value.name||!f.value.age){uni.showToast({title:"请填写姓名和年龄",icon:"none"});return;}
  try {
    const age = parseInt(f.value.age) || 0;
    const birthYear = new Date().getFullYear() - age;
    const birthDate = birthYear + "-01-01";
    const genderLetter = f.value.gender === "male" ? "M" : "F";
    await familyApi.addMember({
      name: f.value.name,
      relation: rels[ri.value],
      gender: genderLetter,
      birthDate: birthDate,
      age: age,
      history: f.value.history || "",
      allergy: f.value.allergy || "",
    });
    uni.$emit("familyUpdated");
    successRef.value.show();
    setTimeout(()=>uni.navigateBack(),1200);
  } catch(e) {
    // Fallback to local storage
    const localList = store.familyMembers || [];
    // 检查本地存储是否已有"本人"
    const hasSelfLocal = localList.some(m => m.relation === "本人" || m.relation === "self");
    if (rels[ri.value] === "本人" && hasSelfLocal) {
      uni.showToast({title:"已存在'本人'成员，不可重复添加",icon:"none",duration:2000});
      return;
    }
    const member = {
      id: Date.now(),
      name: f.value.name,
      relation: rels[ri.value],
      age: parseInt(f.value.age) || 0,
      gender: f.value.gender,
      history: f.value.history || "无",
      allergy: f.value.allergy || "无",
    };
    let list = [];
    try {
      const saved = uni.getStorageSync("family_members");
      if (saved) list = JSON.parse(saved);
    } catch(e2){}
    list.push(member);
    uni.setStorageSync("family_members", JSON.stringify(list));
    store.setFamilyMembers(list);
    uni.$emit("familyUpdated");
    successRef.value.show();
    setTimeout(()=>uni.navigateBack(),1200);
  }
}
</script>

<style lang="scss" scoped>
.page { min-height:100vh; background:#F5F5FA; }
.status-bar-fill { height:var(--status-bar-height); background:#fff; }
.nav { display:flex; align-items:center; padding:8px 20px 14px; background:#fff; }
.back { font-size:24px; color:#667eea; margin-right:12px; }
.nav-t { font-size:17px; font-weight:700; color:#1A1A2E; }
.card { background:#fff; border-radius:18px; margin:16px 20px; padding:20px; }
.fg { margin-bottom:20px; display:flex; flex-direction:column; }
.fg:last-child { margin-bottom:0; }
.fl { font-size:14px; font-weight:600; color:#1A1A2E; margin-bottom:8px; display:block; }
.fpv { font-size:15px; color:#667eea; background:#F5F5FA; padding:14px 16px; border-radius:14px; display:block; }
.fi { padding:14px 16px; background:#F5F5FA; border-radius:14px; font-size:15px; border:none; outline:none; }
.fg-row { display:flex; gap:10px; }
.gopt { flex:1; padding:14px; text-align:center; background:#F5F5FA; border-radius:14px; font-size:15px; }
.gopt.active { background:linear-gradient(135deg,#667eea,#764ba2); color:#fff; font-weight:600; }
.gopt.disabled { background:#E5E7EB; color:#C0C4CC; cursor:not-allowed; opacity:0.5; }
.btn-grad { margin:0 20px; padding:16px; border-radius:14px; background:linear-gradient(135deg,#667eea,#764ba2); color:#fff; font-size:17px; font-weight:700; text-align:center; }
</style>
