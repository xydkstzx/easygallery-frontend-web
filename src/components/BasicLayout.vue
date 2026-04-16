<template>
  <div class="basic-layout">
    <el-container class="app-container">
      <!-- 1. 顶部 Header (固定高度) -->
      <el-header class="app-header">
        <global-header></global-header>
      </el-header>

      <!-- 2. 中间内容区 (Flex 自适应，包含侧边栏和主内容) -->
      <el-container class="content-wrapper">
        <!-- 左侧侧边栏 -->
        <global-sider></global-sider>
        <!-- 右侧主内容区 (可独立滚动) -->
        <el-main class="app-main">
          <router-view></router-view>
        </el-main>
      </el-container>

      <!-- 3. 底部 Footer (固定高度) -->
      <el-footer class="app-footer">
        <a href="https://www.codefather.cn" target="_blank"> 智能云图库 </a>
      </el-footer>
    </el-container>
  </div>
</template>

<script setup>
import GlobalHeader from "./GlobalHeader.vue";
import GlobalSider from "./GlobalSider.vue";
</script>

<style lang="scss" scoped>
// 全局重置，确保页面边距为0
:global(body) {
  margin: 0;
  padding: 0;
}

.app-container {
  height: 100vh; // 强制撑满整个视口高度
  display: flex;
  flex-direction: column;
  overflow: hidden; // 禁止最外层滚动
}

// 顶部栏
.app-header {
  padding: 0; // 清除默认 padding，交给 GlobalHeader 内部控制
  flex-shrink: 0; // 禁止被压缩
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); // 增加头部阴影
}

// 中间内容包裹层 (侧边栏 + 主内容)
.content-wrapper {
  flex: 1; // 占据剩余所有空间
  display: flex;
  overflow: hidden;
}

// 主内容区
.app-main {
  background-color: #f5f7fa; // 淡灰色背景，区分侧边栏
  padding: 24px;
  margin: 0; // 清除默认 margin
  overflow-y: auto; // 仅让主内容区滚动
  box-sizing: border-box;
}

// 底部栏
.app-footer {
  background: #e3e3e3;
  padding: 16px;
  text-align: center;
  flex-shrink: 0; // 禁止被压缩
  border-top: 1px solid #dcdfe6;
}
</style>