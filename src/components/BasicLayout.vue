<template>
  <div class="basic-layout">
    <el-container>
      <el-header class="header">
        <global-header></global-header>
      </el-header>
      <el-main class="main">
        <router-view></router-view>
      </el-main>
      <el-footer class="footer">
        <a href="https://www.codefather.cn" target="_blank"> 智能云图库 </a>
      </el-footer>
    </el-container>
  </div>
</template>

<script setup>
import GlobalHeader from "./GlobalHeader.vue";
</script>

<style lang="scss" scoped>
.basic-layout {
  .footer {
    background: #e3e3e3;
    padding: 16px;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: center;
  }
  .main {
    margin-top: 20px;
    position: relative;
    min-height: calc(100vh - 210px);
  }
}
</style>
