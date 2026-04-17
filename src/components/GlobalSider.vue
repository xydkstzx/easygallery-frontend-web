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
        <!-- 👇 插入图标 -->
        <i :class="['iconfont', item.icon]"></i>
        <template #title>{{ item.label }}</template>
      </el-menu-item>
    </el-menu>
  </el-aside>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

// 菜单列表：增加 icon 字段
const menuItems = ref([
  {
    key: '/',
    label: '公共图库',
    icon: 'icon-tuku' // 图库图标
  },
  {
    key: '/space/mySpace',
    label: '我的空间',
    icon: 'icon-kongjian' // 空间图标
  },
  {
    key: '/space/teamSpace', // 🔧 建议：顺便修正一下这里的 key，不要和上面重复
    label: '团队空间',
    icon: 'icon-tuandui' // 团队图标
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
  
  // 👇 图标样式统一调整
  :deep(.iconfont) {
    font-size: 18px;
    margin-right: 8px;
  }
}
</style>