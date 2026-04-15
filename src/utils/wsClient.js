// 浏览器原生自带 WebSocket，无需导入！
// WebSocket 实例（唯一连接）
let ws = null;
// 最大重连次数（防止无限重连）
const maxRetries = 5;
// 基础重连间隔（2秒）
const retryInterval = 2000;
// 当前重试次数
let retryCount = 0;
// 心跳发送间隔（5秒发一次 ping）
const HEARTBEAT_INTERVAL = 5000;
// 心跳定时器
let heartBeatTimer = null;
// WebSocket 连接地址
let wsUrl = null;
// 是否需要重连（退出登录时设为 false）
let needReconnect = null;

// ====================== 初始化 WebSocket ======================
/**
 * 初始化并启动 WebSocket 连接
 * @param {string} _wsUrl  websocket 连接地址
 */
const initWs = (_wsUrl) => {
  // 已存在连接则关闭旧连接
  if (ws) {
    ws.close();
  }
  // 保存 ws 地址
  wsUrl = _wsUrl;
  // 允许重连
  needReconnect = true;
  // 建立连接（非重连模式）
  connectWs(false);
};
// ====================== 建立连接 ======================
const connectWs = (reconnect) => {
  // 如果已连接/正在连接，则不重复创建
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    console.log("WebSocket 已连接，无需重复创建");
    return;
  }

  console.log(`尝试连接.....(重试次数：${retryCount}/${maxRetries}, 地址:${wsUrl})`);

  // ✅ 浏览器原生 WebSocket
  ws = new WebSocket(wsUrl + "&reconnect=" + reconnect);

  // ---------------------- 连接成功 ----------------------
  ws.onopen = () => {
    // 重连成功提示
    if (retryCount > 0 && wsCheck()) {
      console.log("✅ WebSocket 重连成功");
      // 这里可以替换为你前端的 UI 提示（如 Element Plus 消息提示）
      // ElMessage.success("网络重连成功");
    }
    // 重置重连次数
    retryCount = 0;
    console.log("✅ WebSocket 连接成功");
    // 启动心跳
    startHeartBeat();
  };

  // ---------------------- 收到服务端消息 ----------------------
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("📩 收到服务端消息：", data);
      // 在这里处理业务消息（可自定义回调传给前端）
    } catch (e) {
      console.log("📩 收到非JSON消息：", event.data);
    }
  };

  // ---------------------- 连接错误 ----------------------
  ws.onerror = (error) => {
    console.error("❌ WebSocket 连接错误：", error);
    ws.close();
  };

  // ---------------------- 连接关闭 ----------------------
  ws.onclose = () => {
    console.log("❌ WebSocket 连接关闭");
    // 清除心跳
    clearHeartbeatTimers();
    // 处理重连
    handleReconnect();
  };
};

// ====================== 重连机制 ======================
const handleReconnect = () => {
  // 不需要重连（退出登录），直接返回
  if (!needReconnect) {
    console.log("🛑 已禁用重连");
    return;
  }
  // 达到最大重试次数
  if (retryCount >= maxRetries) {
    console.error("❌ 已达到最大重连次数，停止重试");
    retryCount = 0;
    if (wsCheck()) {
      logout();
      // 前端提示：连接断开，请重新登录
      // ElMessage.error("连接已断开，请重新登录");
    }
    return;
  }

  retryCount += 1;
  // 指数退避重连
  const delay = retryInterval * Math.pow(1.5, retryCount - 1);
  console.log(`⏳ 连接断开，${delay / 1000}秒后尝试第 ${retryCount} 次重连`);

  // 延迟重连
  setTimeout(() => {
    connectWs(true);
  }, delay);
};

// ====================== 心跳机制 ======================
const startHeartBeat = () => {
  // 先清除旧心跳
  clearHeartbeatTimers();
  heartBeatTimer = setInterval(() => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send("ping");
      console.log("❤️ 发送心跳 ping");
    }
  }, HEARTBEAT_INTERVAL);
};

const clearHeartbeatTimers = () => {
  clearInterval(heartBeatTimer);
  heartBeatTimer = null;
};

// ====================== 退出登录（纯 Web 版） ======================
const logout = () => {
  // 禁用重连
  needReconnect = false;
  // 关闭 WebSocket
  if (ws) {
    ws.close();
    ws = null;
  }
  // 清除心跳
  clearHeartbeatTimers();
  // 重置重连次数
  retryCount = 0;
  console.log("✅ 已退出登录，WebSocket 已断开");

  // ======================
  // 这里添加你的 Web 端退出逻辑：
  // 1. 清除本地 token
  // 2. 跳转到登录页
  // 3. 清空用户状态
  // ======================
  // localStorage.removeItem("token");
  // window.location.href = "/login";
};

// ====================== 发送消息 ======================
const sendWsData = (data) => {
  // 连接正常才发送
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.error("❌ WebSocket 未连接，无法发送消息");
    return;
  }
  // 对象自动转 JSON 字符串
  const sendData = typeof data === "object" ? JSON.stringify(data) : data;
  ws.send(sendData);
  console.log("📤 发送消息：", data);
};

// 导出方法
export {
  initWs,
  logout,
  sendWsData,
};