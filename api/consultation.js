import req from "@/utils/request.js";
import { conversationApi } from "@/api/conversation.js";

export const consultApi = {
  sendText: (d) => req.post("/consultation/chat", d),
  getHistory: async (p) => {
    // 先尝试问诊历史API
    try {
      const res = await req.get("/consultation/history", p);
      if (res && (Array.isArray(res) ? res.length > 0 : true)) return res;
    } catch(e) {}
    // 降级：从对话API获取
    try {
      const convs = await conversationApi.list({ page: 0, size: 20 });
      if (convs && convs.length > 0) {
        return convs.map(c => ({
          id: c.id,
          symptom: c.title || c.symptom || "问诊记录",
          date: (c.updatedAt||c.createdAt||"").substring(0,10),
          time: (c.updatedAt||c.createdAt||"").substring(11,16),
          severity: "mild",
        }));
      }
    } catch(e2) {}
    // 最终降级：本地存储
    try {
      const saved = uni.getStorageSync("consultation_history");
      if (saved) return JSON.parse(saved);
    } catch(e3) {}
    return [];
  },
};
