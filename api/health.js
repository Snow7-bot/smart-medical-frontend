import req from "@/utils/request.js";
export const healthApi = {
  addRecord: (d) => req.post("/health/record", d),
  getRecords: (p) => req.get("/health/records", p),
  getTrend: (p) => req.get("/health/trend", p),
  getReport: (p) => req.get("/health/report", p),
};