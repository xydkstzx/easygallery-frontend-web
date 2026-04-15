<template>
  <div class="global-header">
    <!-- Logo + 标题 -->
    <RouterLink to="/" class="header-logo">
      <div class="title-bar">
        <img class="logo" src="../assets/logo.png" alt="logo" />
        <div class="title">智能云图库</div>
      </div>
    </RouterLink>
    <!-- 横向菜单 -->
    <el-menu
      class="el-menu-demo"
      mode="horizontal"
      :default-active="activeIndex"
      @select="handleSelect"
    >
      <template v-for="item in menuList" :key="item.path">
        <el-menu-item :index="item.path">
          {{ item.name }}
        </el-menu-item>
      </template>
    </el-menu>
    <template v-if="loginUserStore.loginUser?.userId">
      <el-dropdown class="user-dropdown">
        {{ loginUserStore.loginUser.nickName }}
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              @click="gotoUcenter(loginUserStore.loginUser.userId)"
              >我的主页</el-dropdown-item
            >
            <el-dropdown-item @click="logoutUser">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </template>
    <div class="buttoms-group" v-else>
      <el-button type="primary" @click="loginAndRegister(1)">登录</el-button>
      <el-button type="primary" @click="loginAndRegister(2)">注册</el-button>
    </div>
  
  </div>
  <!-- 登录注册弹窗组件，通过 ref 引用以便父组件调用 -->
  <LoginAndRegister ref="loginRegisterRef"></LoginAndRegister>
</template>

<script setup>
import { useRouter } from "vue-router";
import LoginAndRegister from "@/views/login/LoginAndRegister.vue";
import { useLoginUserStore } from "@/stores/user";
import { ElMessage } from "element-plus";
import { ref, reactive, getCurrentInstance, nextTick } from "vue";
import {logout} from "@/utils/wsClient.js";
const { proxy } = getCurrentInstance();
const loginUserStore = useLoginUserStore();
const router = useRouter();
const activeIndex = ref("/");
const menuList = ref([
  { name: "主页", path: "/" },
  { name: "关于", path: "/about" },
]);

// 菜单点击跳转
const handleSelect = (index) => {
  activeIndex.value = index;
  router.push(index);
};
const loginRegisterRef = ref();
const loginAndRegister = (type) => {
  console.log("type", type);
  loginRegisterRef.value.showPanel(type);
};


const logoutUser = async () => {
  const result = await proxy.Request({
    url: proxy.Api.logout,
    showLoading: true,
  });
  if (result.code === 200) {
    // 清除用户信息和 token
    localStorage.removeItem("token");
    loginUserStore.setLoginUser(null);
    ElMessage.success("退出登录成功");
    logout();
    
  }

  // 跳转到主页
};

const gotoUcenter = (userId) => {
  console.log(userId);
  router.push(`/ucenter/${userId}`);
};
</script>

<style lang="scss" scoped>
// 🔥 核心：父容器开启 Flex 布局，实现平行展示
.global-header {
  display: flex;
  position: sticky; // 可选：固定在顶部，滚动不消失（推荐）
  top: 0;
  left: 0; // 关键：贴紧浏览器左侧
  width: 100%; // 关键：强制宽度100%，撑满整个屏幕
  align-items: center; // 垂直居中
  padding: 0 280px; // 左右内边距（内容和容器边缘的间距，保留你原来的需求）
  height: 80px; // 头部高度
  box-shadow: 0 2px 6px 0 #ddd;
  background: #fff; // 可选：给头部加背景色，避免透明透出
  box-sizing: border-box; // 关键：padding算在总宽度内，不会撑出屏幕
  z-index: 999; // 可选：固定顶部时，确保头部在最上层

  // Logo + 标题 容器
  .header-logo {
    text-decoration: none; // 去掉路由链接下划线
    margin-right: 40px; // 与菜单之间的间距
  }

  .title-bar {
    display: flex;
    align-items: center;
    gap: 8px; // Logo 和文字间距

    .logo {
      height: 40px;
    }

    .title {
      font-size: 20px;
      font-weight: bold;
      color: #333;
      white-space: nowrap; // 防止文字换行
    }
  }

  // 菜单样式优化：消除Element Plus默认边距
  :deep(.el-menu-demo) {
    border-bottom: none;
    flex: 1;
    margin: 0; // 关键：清除菜单默认外边距
    padding: 0; // 关键：清除菜单默认内边距
  }

  // 登录/注册按钮组样式优化
  .buttoms-group {
    display: flex;
    gap: 12px;
  }

  // 用户下拉菜单样式
  .user-dropdown {
    cursor: pointer;
    margin-left: 20px;
  }
}
</style>