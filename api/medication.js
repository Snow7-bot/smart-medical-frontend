import req from "@/utils/request.js";
export const medApi = {
  getList: () => req.get("/medication/list"),
  addDrug: (d) => req.post("/medication/add", d),
  deleteDrug: (id) => req.delete("/medication/delete/" + id),
  scanDrug: (p) => req.post("/medication/scan", { image: p }),
  calcDosage: (d) => req.post("/medication/children-dosage", d),
  checkInteraction: (ids) => req.post("/medication/check-interaction", { drugIds: ids }),
};
