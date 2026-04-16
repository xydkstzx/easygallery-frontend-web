<template>
  <el-aside width="220px" class="aside">
    <el-menu
      :default-active="activeMenu"
      class="sidebar-menu"
      mode="vertical"
      @select="handleMenuSelect"
    >
      <el-menu-item
        v-for="item in menuItems"
        :key="item.key"
        :index="item.key"
      >
        <span>{{ item.label }}</span>
      </el-menu-item>
    </el-menu>
  </el-aside>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

// 菜单列表
const menuItems = ref([
  {
    key: '/',
    label: '公共图库',
  },
  {
    key: '/my_space',
    label: '我的空间',
  },
]);

// 计算当前激活的菜单项
const activeMenu = computed(() => route.path);

// 菜单点击跳转
const handleMenuSelect = (index) => {
  router.push(index);
};
</script>

<style lang="scss" scoped>
.aside {
  background-color: #fff;
  border-right: 1px solid #e4e7ed;
  overflow-y: auto;
  flex-shrink: 0;
  height: 100%;
}

.sidebar-menu {
  border-right: none;
  height: 100%;
}
</style>