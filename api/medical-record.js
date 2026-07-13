import req from '@/utils/request.js';
import env from '@/env.js';

const BASE = env.API_BASE_URL.replace('/api', '');

export const medicalRecordApi = {
  /** 上传病历文件（自动OCR+AI分析） */
  upload: (filePath, patientId, recordDate) => {
    return new Promise((resolve, reject) => {
      uni.uploadFile({
        url: BASE + '/api/medical-records',
        filePath: filePath,
        name: 'file',
        formData: {
          patientId: String(patientId || 0),
          recordDate: recordDate || '',
        },
        header: {
          'Authorization': 'Bearer ' + (uni.getStorageSync('auth_token') || '')
        },
        success: (res) => {
          try {
            const data = JSON.parse(res.data);
            if (data.code === 200) resolve(data.data);
            else reject(new Error(data.message));
          } catch(e) { reject(e); }
        },
        fail: reject
      });
    });
  },

  /** 上传病历（同步，手动触发解析） */
  uploadSync: (filePath, patientId) => {
    return new Promise((resolve, reject) => {
      uni.uploadFile({
        url: BASE + '/api/medical-records/upload',
        filePath: filePath,
        name: 'file',
        formData: { patientId: String(patientId || 0) },
        header: {
          'Authorization': 'Bearer ' + (uni.getStorageSync('auth_token') || '')
        },
        success: (res) => {
          try {
            const data = JSON.parse(res.data);
            if (data.code === 200) resolve(data.data);
            else reject(new Error(data.message));
          } catch(e) { reject(e); }
        },
        fail: reject
      });
    });
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
  /** 获取AI分析摘要 */
  getSummary: (recordId) => req.get('/medical-records/' + recordId + '/summary'),
  /** 获取临时访问URL */
  getPresignedUrl: (recordId) => req.get('/medical-records/' + recordId + '/url'),
  /** 更新病历日期 */
  updateDate: (recordId, d) => req.put('/medical-records/' + recordId + '/date', d),
  /** 删除病历 */
  delete: (recordId) => req.delete('/medical-records/' + recordId),
  /** 批量删除 */
  batchDelete: (ids) => req.delete('/medical-records', { ids }),
};
