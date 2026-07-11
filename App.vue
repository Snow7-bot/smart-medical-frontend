<script setup>
import { ref, onMounted } from "vue";
import { onLaunch } from "@dcloudio/uni-app";
import { useAppStore } from "@/store";

const showCheck = ref(false);

onLaunch(() => {
  useAppStore().initApp();
  console.log("Smart Medical Assistant launched");
});

onMounted(() => {
  uni.$on("showSuccess", () => {
    showCheck.value = true;
    setTimeout(() => { showCheck.value = false; }, 1800);
  });
});
</script>

<template>
  <view v-if="showCheck" class="success-overlay">
    <view class="success-circle">
      <text class="success-check">✓</text>
    </view>
  </view>
</template>

<style lang="scss">
page {
  background: #F5F5FA;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif;
  -webkit-font-smoothing: antialiased;
}

.success-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  pointer-events: none;
}

.success-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #43e97b, #38f9d7);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(67, 233, 123, 0.35);
  animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.success-check {
  font-size: 42px;
  color: #fff;
  font-weight: 700;
  animation: drawCheck 0.3s ease-out 0.15s both;
}

@keyframes popIn {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes drawCheck {
  0% { transform: scale(0) rotate(-45deg); opacity: 0; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
</style>
