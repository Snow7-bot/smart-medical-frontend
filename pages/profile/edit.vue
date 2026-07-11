<template>
<view class="page">
  <view class="status-bar-fill"></view>
  <view class="nav"><view class="back" @click="uni.navigateBack()">‹</view><text class="nav-t">编辑个人资料</text></view>

  <view class="card">
    <!-- 头像 -->
    <view class="av-row" @click="changeAvatar">
      <text class="row-label">头像</text>
      <view class="av-wrap">
        <image class="av-image" v-if="avatar" :src="avatar"></image>
        <text class="av-placeholder" v-else>👤</text>
      </view>
      <text class="row-arrow">→</text>
    </view>

    <!-- 昵称 -->
    <view class="row">
      <text class="row-label">昵称</text>
      <input class="row-input" v-model="nickname" placeholder="请输入昵称" maxlength="20"/>
    </view>

    <!-- 手机号（只读） -->
    <view class="row" v-if="store.user?.phone">
      <text class="row-label">手机号</text>
      <text class="row-value">{{ store.user.phone }}</text>
    </view>
  </view>

  <view class="btn-grad" @click="save">保存</view>
  <SuccessCheck ref="successRef" />
</view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAppStore } from "@/store";
import { userApi } from "@/api/user.js";
import SuccessCheck from "@/components/SuccessCheck.vue";
const store = useAppStore();
const successRef = ref(null);
const nickname = ref("");
const avatar = ref("");

onMounted(() => {
  if (store.user) {
    nickname.value = store.user.name || "";
    avatar.value = store.user.avatar || "";
  }
});

function changeAvatar() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      avatar.value = res.tempFilePaths[0];
    }
  });
}

function save() {
  if (!nickname.value.trim()) {
    uni.showToast({ title: "请输入昵称", icon: "none" });
    return;
  }
  const updated = { ...store.user, name: nickname.value.trim(), avatar: avatar.value };
  
  // 先尝试调用后端 API 保存
  userApi.getCurrentUser().then(info => {
    return userApi.updateProfile({ name: updated.name, avatar: updated.avatar });
  }).then(() => {
    store.setUser(updated);
    successRef.value.show();
    setTimeout(() => uni.navigateBack(), 800);
  }).catch(() => {
    // 后端不可用时降级到本地存储
    store.setUser(updated);
    uni.setStorageSync("user_profile", JSON.stringify(updated));
    successRef.value.show();
    setTimeout(() => uni.navigateBack(), 800);
  });
}
</script>

<style lang="scss" scoped>
.page { min-height:100vh; background:#F5F5FA; }
.status-bar-fill { height:var(--status-bar-height); background:#fff; }
.nav { display:flex; align-items:center; padding:8px 20px 14px; background:#fff; }
.back { font-size:24px; color:#667eea; margin-right:12px; }
.nav-t { font-size:17px; font-weight:700; color:#1A1A2E; }

.card { background:#fff; border-radius:18px; margin:16px 20px; overflow:hidden; }

.av-row { display:flex; align-items:center; padding:16px 20px; border-bottom:1px solid rgba(0,0,0,0.04); }
.row { display:flex; align-items:center; padding:16px 20px; border-bottom:1px solid rgba(0,0,0,0.04); }
.row:last-child, .av-row:last-child { border-bottom:none; }

.row-label { font-size:15px; color:#1A1A2E; font-weight:500; width:70px; flex-shrink:0; }
.row-input { flex:1; font-size:15px; color:#1A1A2E; border:none; outline:none; padding:0; }
.row-value { flex:1; font-size:15px; color:#9CA3AF; }
.row-arrow { font-size:18px; color:#9CA3AF; }

.av-wrap { flex:1; display:flex; justify-content:center; }
.av-image { width:60px; height:60px; border-radius:50%; object-fit:cover; }
.av-placeholder { font-size:32px; }

.btn-grad { margin:0 20px; padding:16px; border-radius:14px; background:linear-gradient(135deg,#667eea,#764ba2); color:#fff; font-size:17px; font-weight:700; text-align:center; box-shadow:0 6px 24px rgba(102,126,234,0.3); }
</style>


