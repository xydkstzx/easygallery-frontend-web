<template>
  <div class="home">
    <!-- 分类导航 -->
    <el-tabs v-model="activeCategory" class="nav-tabs" @tab-change="handleCategoryChange">
      <el-tab-pane label="全部" name="all" />
      <el-tab-pane v-for="(item, index) in tagCategoryList.categoryList" :key="`cat-${index}`" :label="item"
        :name="item" />
    </el-tabs>
    <el-divider content-position="left" style="margin: 0 0 24px 0" />

    <!-- 标签导航 -->
    <div class="tag-nav-row">
      <el-tabs v-model="activeTag" class="nav-tabs tag-tabs" @tab-change="handleTagChange">
        <el-tab-pane v-for="(item, index) in tagCategoryList.tagList" :key="`tag-${index}`" :label="item"
          :name="item" />
      </el-tabs>
    </div>

    <!-- 图片列表组件 -->
    <PictureList
      ref="pictureListRef"
      :category="categoryParam"
      :tag="tagParam"
      :auto-load="false"
      @picture-click="handlePictureClick"
    />
  </div>
</template>

<script setup>
import { ref, computed, getCurrentInstance, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import PictureList from "@/components/PictureList.vue";

const { proxy } = getCurrentInstance();
const route = useRoute();

// --- 分类 / 标签数据 ---
const tagCategoryList = ref({ categoryList: [], tagList: [] });
const activeCategory = ref("all");
const activeTag = ref("全部");

// --- 传入 PictureList 的计算属性 ---
const categoryParam = computed(() => activeCategory.value === 'all' ? '' : activeCategory.value);
const tagParam = computed(() => activeTag.value === '全部' ? '' : activeTag.value);

// --- PictureList 组件引用 ---
const pictureListRef = ref();

// --- 加载分类标签列表，完成后触发图片加载 ---
const getTagCategoryList = async () => {
  const result = await proxy.Request({ url: proxy.Api.tag_category });
  if (result.code === 200) {
    const processedTagList = ["全部", ...(result.data.tagList || [])];
    tagCategoryList.value = { ...result.data, tagList: processedTagList };
    activeTag.value = "全部";
    // 分类标签加载完成后手动触发图片加载
    pictureListRef.value?.reload();
  }
};

const handleCategoryChange = () => {
  activeTag.value = "全部";
};

const handleTagChange = () => {};

const handlePictureClick = (item) => {
  console.log("点击了图片:", item);
};

onMounted(() => {
  getTagCategoryList();
});

// 监听路由变化，当切换回首页时重新加载
watch(
  () => route.path,
  (newPath) => {
    if (newPath === '/') {
      getTagCategoryList();
    }
  }
);
</script>

<style lang="scss" scoped>
.home {
  width: 1500px;
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
}

/* Tabs 样式 */
:deep(.el-tabs__header) {
  margin: 0 0 24px 0;
  border-bottom: none;
}

:deep(.el-tabs__nav-wrap::after) {
  display: none;
}

:deep(.el-tabs__item) {
  padding: 0 24px;
  font-size: 15px;
  color: #333;
  height: 48px;
  line-height: 48px;

  &.is-active {
    color: #409eff;
    font-weight: 500;
  }
}

:deep(.el-tabs__active-bar) {
  background-color: #409eff;
  height: 3px;
}

.tag-nav-row {
  display: flex;
  align-items: center;
  margin-bottom: 20px;

  .tag-tabs {
    flex: 1;
  }
}
</style>