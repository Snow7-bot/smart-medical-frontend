import req from '@/utils/request.js';

export const attachmentApi = {
  /** 上传附件 */
  upload: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return req.post('/chat/attachments', fd, { header: { 'Content-Type': 'multipart/form-data' }, timeout: 30000 });
  },
  /** 删除附件 */
  delete: (id) => req.delete('/chat/attachments/' + id),
};
