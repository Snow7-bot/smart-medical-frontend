import { defineStore } from "pinia";

export const useAppStore = defineStore("app", {
  state: () => ({
    user: null,
    isLoggedIn: false,
    elderlyMode: false,
    currentMember: null,
    familyMembers: [],
    medicationReminders: [],
  }),
  actions: {
    initApp() {
      try {
        const token = uni.getStorageSync("auth_token");
        if (token) this.isLoggedIn = true;
        const em = uni.getStorageSync("elderly_mode");
        if (em !== "") this.elderlyMode = em === "true";
      } catch (e) {
        console.error("initApp failed:", e);
      }
    },
    setUser(u) { this.user = u; this.isLoggedIn = true; },
    logout() {
      this.user = null;
      this.isLoggedIn = false;
      try { uni.removeStorageSync("auth_token"); } catch (e) { console.error("logout failed:", e); }
    },
    toggleElderlyMode() { this.elderlyMode = !this.elderlyMode; uni.setStorageSync("elderly_mode", String(this.elderlyMode)); },
    setCurrentMember(m) { this.currentMember = m; },
    setFamilyMembers(arr) { this.familyMembers = arr; },
    async loadMembers() {
      try {
        // 优先从 API 加载家庭成员列表
        const { familyApi } = await import("@/api/family.js");
        const list = await familyApi.getList();
        if (list && list.length > 0) {
          this.familyMembers = list;
          return;
        }
      } catch (e) {
        // API 不可用时从 localStorage 加载
      }
      // 降级: 从 localStorage 加载
      try {
        const saved = uni.getStorageSync("family_members");
        if (saved) {
          this.familyMembers = JSON.parse(saved);
        } else {
          this.familyMembers = [];
        }
      } catch (e2) {
        console.error("loadMembers failed:", e2);
        this.familyMembers = [];
      }
    },
  }
});
