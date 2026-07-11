import req from "@/utils/request.js";
import env from "@/env.js";

export const asrApi = {
  /**
   * 语音识别 - 上传音频文件，返回识别文字
   * @param {string} filePath - 录音文件临时路径
   * @returns {Promise<string>} 识别结果文字
   */
  recognize: async (filePath) => {
    // uni-app 上传文件需要使用 uni.uploadFile
    return new Promise((resolve, reject) => {
      uni.uploadFile({
        url: env.ASR_URL,
        filePath: filePath,
        name: "audio",
        header: {
          "Authorization": "Bearer " + (uni.getStorageSync("auth_token") || "")
        },
        success: (res) => {
          try {
            const data = JSON.parse(res.data);
            const result = data.data || data;
            resolve(result.text || "");
          } catch(e) {
            reject(new Error("解析识别结果失败"));
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  }
};