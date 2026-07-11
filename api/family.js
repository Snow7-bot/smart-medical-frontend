import req from "@/utils/request.js";
export const familyApi = {
  getList: () => req.get("/family/list"),
  addMember: (d) => req.post("/family/add", d),
  deleteMember: (id) => req.delete("/family/delete/" + id),
  getDetail: (id) => req.get("/family/detail/" + id),
};