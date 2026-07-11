import req from '@/utils/request.js';

export const medicalRecordApi = {
  /** 上传病历文件（异步-自动解析） */
  upload: (file, patientId, recordDate) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('patientId', patientId);
    if (recordDate) fd.append('recordDate', recordDate);
    return req.post('/medical-records', fd, { header: { 'Content-Type': 'multipart/form-data' } });
  },
  /** 上传病历文件（同步-手动触发解析） */
  uploadSync: (file, patientId) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('patientId', patientId);
    return req.post('/medical-records/upload', fd, { header: { 'Content-Type': 'multipart/form-data' } });
  },
  /** 触发病历解析 */
  parse: (recordId) => req.post('/medical-records/' + recordId + '/parse'),
  /** 按患者查询病历列表 */
  listByPatient: (patientId) => req.get('/medical-records/patients/' + patientId),
  /** 分页查询病历 */
  listAll: (p) => req.get('/medical-records', p),
  /** 时间线查询 */
  timeline: (p) => req.get('/medical-records/timeline', p),
  /** 病历详情 */
  getDetail: (recordId) => req.get('/medical-records/' + recordId),
  /** 获取临时访问URL */
  getPresignedUrl: (recordId) => req.get('/medical-records/' + recordId + '/url'),
  /** 更新病历日期 */
  updateDate: (recordId, d) => req.put('/medical-records/' + recordId + '/date', d),
  /** 删除病历 */
  delete: (recordId) => req.delete('/medical-records/' + recordId),
  /** 批量删除 */
  batchDelete: (ids) => req.delete('/medical-records', { ids }),
};
