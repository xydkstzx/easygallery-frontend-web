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
          <!-- 👇 插入图标 -->
          <i :class="['iconfont', item.icon]"></i>
          <span>{{ item.name }}</span>
        </el-menu-item>
      </template>
    </el-menu>

    <template v-if="loginUserStore.loginUser?.userId">
      <el-dropdown class="user-dropdown">
        <!-- 这里也可以加个用户图标 -->
        {{ loginUserStore.loginUser.nickName }}
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="gotoUcenter(loginUserStore.loginUser.userId)">
              <i class="iconfont icon-gerenzhongxin"></i>
              我的主页
            </el-dropdown-item>
            <el-dropdown-item @click="logoutUser">
              <i class="iconfont icon-tuichudenglu"></i>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </template>
    
    <div class="buttoms-group" v-else>
      <el-button type="primary" @click="loginAndRegister(1)">
        <i class="iconfont icon-login" style="margin-right: 4px;"></i>登录
      </el-button>
      <el-button type="primary" @click="loginAndRegister(2)">注册</el-button>
    </div>
  </div>
  
  <!-- 登录注册弹窗组件 -->
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

// 👇 修改：给菜单列表加上 icon 字段
const menuList = ref([
  { name: "主页", path: "/", icon: "icon-shouye" },
  { name: "抓取图片", path: "/picture/scraping", icon: "icon-shoudongzhuaqushuju" },
  { name: "关于", path: "/about", icon: "icon-guanyu" },
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
// 🔥 核心：父容器开启 Flex 布局
.global-header {
  display: flex;
  width: 100%;
  align-items: center;
  padding: 0 280px;
  height: 60px;
  background: #fff;
  z-index: 999;
  
  // 统一设置图标样式
  :deep(.iconfont) {
    font-size: 16px; // 图标大小
    margin-right: 6px; // 图标和文字的间距
  }

  // Logo + 标题 容器
  .header-logo {
    text-decoration: none;
    margin-right: 40px;
  }

  .title-bar {
    display: flex;
    align-items: center;
    gap: 8px;

    .logo {
      height: 40px;
    }

    .title {
      font-size: 20px;
      font-weight: bold;
      color: #333;
      white-space: nowrap;
    }
  }

  // 菜单样式优化
  :deep(.el-menu-demo) {
    border-bottom: none;
    flex: 1;
    margin: 0;
    padding: 0;
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
    display: flex;
    align-items: center;
  }
}
</style>