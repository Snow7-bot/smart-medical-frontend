import env from '@/env.js';

const BASE_URL = env.API_BASE_URL;

function getToken() {
  try { return uni.getStorageSync("auth_token"); } catch { return ""; }
}

async function request(method, url, data = {}, opts = {}) {
  const header = { "Content-Type": "application/json", ...opts.header };
  const token = getToken();
  if (token) header["Authorization"] = "Bearer " + token;
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + url, method: method.toUpperCase(), data, header,
      timeout: opts.timeout || 15000,
      success: (res) => {
        if (res.statusCode === 200) {
          var body = res.data;
          // 后端 ApiResponse 格式: { code: 0, data: ..., message: ... }
          if (body && body.code !== undefined && body.code !== 200) {
            reject(new Error(body.message || 'request failed'));
            return;
          }
          resolve(body.data || body);
        }
        else if (res.statusCode === 401) { uni.removeStorageSync("auth_token"); reject(new Error("token expired")); }
        else reject(new Error("request failed: " + res.statusCode));
      },
      fail: (e) => { uni.showToast({ title: "网络连接失败", icon: "none" }); reject(e); }
    });
  });
}

export default {
  get: (url, p) => request("GET", url, p),
  post: (url, d) => request("POST", url, d),
  put: (url, d) => request("PUT", url, d),
  delete: (url, d) => request("DELETE", url, d),
};