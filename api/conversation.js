import req from "@/utils/request.js";

export const conversationApi = {
  /** 创建会话 */
  create: (d) => req.post('/chat/conversations', d),
  /** 会话列表 */
  list: (p) => req.get('/chat/conversations', p),
  /** 会话详情 */
  getDetail: (id) => req.get('/chat/conversations/' + id),
  /** 更新会话 */
  update: (id, d) => req.put('/chat/conversations/' + id, d),
  /** 删除会话 */
  delete: (id) => req.delete('/chat/conversations/' + id),
  /** 发送消息 */
  sendMessage: (id, d) => req.post('/chat/conversations/' + id + '/messages', d),
  /** 获取消息列表 */
  getMessages: (id, p) => req.get('/chat/conversations/' + id + '/messages', p),
  /** 删除消息 */
  deleteMessage: (convId, msgId) => req.delete('/chat/conversations/' + convId + '/messages/' + msgId),
};
