import req from '@/utils/request.js';

export const conversationGroupApi = {
  /** 创建分组 */
  create: (d) => req.post('/chat/groups', d),
  /** 分组列表 */
  list: () => req.get('/chat/groups'),
  /** 更新分组 */
  update: (id, d) => req.put('/chat/groups/' + id, d),
  /** 删除分组 */
  delete: (id) => req.delete('/chat/groups/' + id),
  /** 移入会话到分组 */
  moveConversation: (groupId, convId) => req.post('/chat/groups/' + groupId + '/conversations/' + convId),
  /** 从分组移出会话 */
  removeFromGroup: (groupId, convId) => req.delete('/chat/groups/' + groupId + '/conversations/' + convId),
};
