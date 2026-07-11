import req from '@/utils/request.js';

export const patientApi = {
  /** 创建患者档案 */
  create: (d) => req.post('/patients', d),
  /** 患者列表 */
  list: () => req.get('/patients'),
  /** 患者详情 */
  getDetail: (id) => req.get('/patients/' + id),
  /** 更新患者 */
  update: (id, d) => req.put('/patients/' + id, d),
  /** 删除患者 */
  delete: (id) => req.delete('/patients/' + id),
};
