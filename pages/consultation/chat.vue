<template>
<view class="page">
  <view class="status-bar-fill"></view>
  <view class="nav"><view class="back" @click="uni.navigateBack()">&#x2039;</view><text class="nav-t">AI问诊中</text></view>

  <view class="msg-wrap">
    <scroll-view class="msgs" scroll-y :scroll-into-view="scrollToId" scroll-with-animation id="msgList">
      <view class="msg" v-for="m in messages" :key="m.id" :class="m.role" :id="'msg-' + m.id">
        <view class="bubble" :class="m.role + '-bubble'">
          <rich-text v-if="m.role === 'ai'" :nodes="formatAiContent(m.content)"></rich-text>
          <text v-else>{{ m.content }}</text>
        </view>
      </view>
      <view id="bottom-anchor" style="height:1px;"></view>
    </scroll-view>
  </view>

  <view class="input-bar">
    <image class="voice-btn" :class="{recording:isRecording}" :src="isRecording ? '/static/icon_mic_on.png' : '/static/icon_mic.png'" @click="toggleVoice"></image>
    <input class="msg-input" v-if="!isRecording" v-model="txt" confirm-type="send" placeholder="描述您的症状..." @confirm="sendMsg"/>
    <view class="send-btn" v-if="!isRecording" :class="{on:txt.trim()}" @click="sendMsg">&#x2191;</view>
    <view class="voice-hold" v-else
          @touchstart="onRecordStart"
          @touchend="onRecordEnd"
          @touchmove="onRecordMove"
          :class="{recording:isHolding, cancel:isCancel}">{{ holdText }}</view>
  </view>
</view>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from "vue";
import { consultApi } from "@/api/consultation.js";
import { conversationApi } from "@/api/conversation.js";
import { asrApi } from "@/api/asr.js";

const messages = ref([{id:1, role:"ai", content:"您好，我是您的智能医疗助手。请描述您的症状：\n· 哪里不舒服？\n· 持续多久了？\n· 有无其他症状？"}]);
const txt = ref("");
const isRecording = ref(false);
const isHolding = ref(false);
const isCancel = ref(false);
const scrollToId = ref("");
const convId = ref(null);

const holdText = computed(() => {
  if (!isHolding.value) return "按住说话";
  if (isCancel.value) return "松开取消";
  return "松开结束";
});

// 录音管理器
let recorderManager = null;
const recordStatus = ref("idle"); // idle / recording / recognizing

function getRecorder() {
  if (recorderManager) return recorderManager;
  // uni-app 录音管理器
  recorderManager = uni.getRecorderManager();

  recorderManager.onStart(() => {
    console.log("录音开始");
  });

  recorderManager.onStop((res) => {
    console.log("录音结束", res);
    if (res.tempFilePath && !isCancel.value) {
      // 进行语音识别
      doRecognize(res.tempFilePath);
    }
    isHolding.value = false;
  });

  recorderManager.onError((err) => {
    console.error("录音错误", err);
    uni.showToast({ title: "录音失败", icon: "none" });
    isHolding.value = false;
  });

  return recorderManager;
}

async function doRecognize(filePath) {
  recordStatus.value = "recognizing";
  uni.showLoading({ title: "语音识别中..." });

  try {
    const text = await asrApi.recognize(filePath);
    uni.hideLoading();

    if (text) {
      txt.value = text;
      // 切换到文字输入模式并自动发送
      isRecording.value = false;
      sendMsg();
    } else {
      uni.showToast({ title: "未识别到语音内容", icon: "none" });
    }
  } catch(e) {
    uni.hideLoading();
    uni.showToast({ title: "语音识别失败", icon: "none" });
  }

  recordStatus.value = "idle";
}

function formatAiContent(text) {
  if (!text) return [];
  let processed = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  processed = processed.replace(/\*\*(.+?)\*\*/g, '<span style="font-weight:700;color:#667eea;">$1</span>');
  processed = processed.replace(/^\* /gm, '· ');
  processed = processed.replace(/^- /gm, '· ');
  processed = processed.replace(/(?<!\*)\*(?!\*)/g, '');
  processed = processed.replace(/^(\d+)[.)]\s+/gm, '$1. ');
  processed = processed.replace(/\n/g, '<br/>');
  return processed;
}

function scrollToBottom() {
  nextTick(() => {
    scrollToId.value = "bottom-anchor";
  });
}

async function sendMsg() {
  const t = txt.value.trim();
  if (!t) return;
  messages.value.push({id: Date.now(), role:"user", content: t});
  txt.value = "";
  scrollToBottom();
  try {
    const payload = { message: t };
    if (convId.value) payload.conversationId = convId.value;
    const res = await consultApi.sendText(payload);
    const data = res.data || res;
    if (data.conversationId) convId.value = data.conversationId;
    const reply = data.reply || "收到您的描述，请多休息多喝水，密切观察。如症状加重请及时就医。";
    messages.value.push({id: Date.now() + 1, role:"ai", content: reply});
    scrollToBottom();
  } catch(e) {
    messages.value.push({id: Date.now() + 1, role:"ai", content: "抱歉，服务暂不可用，请稍后重试。"});
  }
}

function toggleVoice() {
  if (recordStatus.value === "recognizing") return;
  isRecording.value = !isRecording.value;
  isHolding.value = false;
  isCancel.value = false;
}

function onRecordStart() {
  if (recordStatus.value === "recognizing") return;
  isHolding.value = true;
  isCancel.value = false;
  uni.showToast({ title: "录音中...", icon: "none" });

  try {
    const recorder = getRecorder();
    recorder.start({
      format: "wav",
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 256000,
    });
  } catch(e) {
    uni.showToast({ title: "启动录音失败", icon: "none" });
    isHolding.value = false;
  }
}

function onRecordEnd() {
  if (recordStatus.value === "recognizing") return;
  if (recorderManager && isHolding.value) {
    recorderManager.stop();
  }
  isCancel.value = false;
}

function onRecordMove(e) {
  const touch = e.touches[0];
  if (!touch) return;
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  const dist = touch.clientY - rect.top;
  isCancel.value = dist < -40;
}

onMounted(() => {
  scrollToBottom();
});

onUnmounted(() => {
  // 页面离开时停止录音
  if (recorderManager && isHolding.value) {
    recorderManager.stop();
  }
});
</script>

<style lang="scss" scoped>
.page { display:flex; flex-direction:column; height:100vh; background:linear-gradient(180deg,#ffffff 0%,#ebe7ff 100%); overflow:hidden; }
.status-bar-fill { height:var(--status-bar-height); flex-shrink:0; background:#fff; }
.nav { display:flex; align-items:center; padding:8px 20px 14px; background:#fff; flex-shrink:0; }
.back { font-size:24px; color:#667eea; margin-right:12px; }
.nav-t { font-size:17px; font-weight:700; color:#1A1A2E; }
.msg-wrap { flex:1; overflow:hidden; }
.msgs { height:100%; padding:16px 20px; box-sizing:border-box; }
.msg { margin-bottom:16px; display:flex; align-items:flex-end; }
.msg.ai { justify-content:flex-start; }
.msg.user { justify-content:flex-end; }
.msg.user .bubble { background:linear-gradient(135deg,#667eea,#764ba2); color:#fff; border-radius:16px 4px 16px 16px; }
.msg.ai .bubble { background:rgba(255,255,255,0.92); color:#1A1A2E; border-radius:4px 16px 16px 16px; box-shadow:0 2px 8px rgba(102,126,234,0.08); }
.bubble { max-width:70%; padding:14px 18px; font-size:15px; line-height:1.7; word-wrap:break-word; }
.input-bar { display:flex; align-items:center; gap:8px; padding:10px 12px; padding-bottom:calc(10px + env(safe-area-inset-bottom)); background:#fff; border-top:1px solid rgba(0,0,0,0.05); flex-shrink:0; }
.voice-btn { width:35px; height:35px; border-radius:50%; flex-shrink:0; }
.msg-input { flex:1; padding:12px 16px; background:#F5F5FA; border-radius:22px; font-size:15px; border:none; outline:none; }
.send-btn { width:40px; height:40px; background:#E5E7EB; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff; font-size:20px; font-weight:600; opacity:0.5; flex-shrink:0; padding:0; }
.send-btn.on { background:linear-gradient(135deg,#667eea,#764ba2); opacity:1; }
.voice-hold { flex:1; padding:12px 16px; background:#F5F5FA; border-radius:22px; font-size:15px; text-align:center; color:#9CA3AF; user-select:none; -webkit-user-select:none; }
.voice-hold.recording { background:rgba(102,126,234,0.1); color:#667eea; font-weight:600; }
.voice-hold.cancel { background:rgba(250,112,154,0.12); color:#fa709a; }
</style>