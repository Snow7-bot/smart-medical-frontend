import req from '@/utils/request.js';

export const userApi = {
  login: (d) => req.post('/user/login', d),
  register: (d) => req.post('/user/register', d),
  sendCode: (p) => req.post('/user/send-code', { phone: p }),
  getUserInfo: () => req.get('/user/info'),
  /** 获取当前用户完整信息（JWT+本地扩展） */
  getCurrentUser: () => req.get('/me'),
  /** 更新用户资料 */
  updateProfile: (d) => req.put('/user/profile', d),
};
