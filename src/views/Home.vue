<template>
  <div class="home">
    <!-- 分类导航（保持不变） -->
    <el-tabs v-model="activeCategory" class="nav-tabs" @tab-click="handleCategoryChange">
      <el-tab-pane label="全部" name="all" />
      <el-tab-pane v-for="(item, index) in tagCategoryList.categoryList" :key="`cat-${index}`" :label="item"
        :name="item" />
    </el-tabs>
    <el-divider content-position="left" style="margin: 0 0 24px 0" />

    <!-- 标签导航（保持不变） -->
    <div class="tag-nav-row">
      <el-tabs v-model="activeTag" class="nav-tabs tag-tabs" @tab-click="handleTagChange">
        <el-tab-pane v-for="(item, index) in tagCategoryList.tagList" :key="`tag-${index}`" :label="item"
          :name="item" />
      </el-tabs>
    </div>

    <!-- 图片列表区域：使用封装后的组件 -->
    <el-row :gutter="24" class="picture-list">
      <el-col :xs="12" :sm="6" :md="6" :lg="6" :xl="6" v-for="(item, index) in pictureList" :key="item.pictureId">
        <!-- 🎉 新组件登场 -->
        <PictureCover :src="getImageUrl(item.url)" :name="item.picName"
          :preview-src-list="pictureList.map(p => getImageUrl(p.url))" :initial-index="index"
          @click="handleCoverClick(item)" />
      </el-col>
    </el-row>

    <!-- 分页组件（保持不变） -->
    <div class="pagination-wrapper">
      <el-pagination v-model:current-page="pageNo" v-model:page-size="pageSize" :page-sizes="[12, 24, 48, 96]"
        :total="totalCount" layout="total, prev, pager, next, jumper" @size-change="loadPictureList"
        @current-change="loadPictureList" background />
    </div>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance, onMounted, nextTick } from "vue";
import { Picture } from '@element-plus/icons-vue';
// 👇 引入新组件
import PictureCover from "@/components/PictureCover.vue";

const { proxy } = getCurrentInstance();

// --- 数据定义（保持不变）---
const tagCategoryList = ref({ categoryList: [], tagList: [] });
const activeCategory = ref("all");
const activeTag = ref("全部");
const pictureList = ref([]);
const pageNo = ref(1);
const pageSize = ref(12);
const totalCount = ref(0);

// --- 方法（保持不变）---
const getTagCategoryList = async () => {
  const result = await proxy.Request({ url: proxy.Api.tag_category });
  if (result.code === 200) {
    const processedTagList = ["全部", ...(result.data.tagList || [])];
    tagCategoryList.value = { ...result.data, tagList: processedTagList };
    activeTag.value = "全部";
    loadPictureList();
  }
};

const loadPictureList = async () => {
  await nextTick();
  const categoryParam = activeCategory.value === 'all' ? '' : activeCategory.value;
  const tagParam = activeTag.value === '全部' ? '' : activeTag.value;

  const queryParams = {
    pageNo: pageNo.value, pageSize: pageSize.value,
    category: categoryParam, tags: tagParam, picName: ""
  };

  const result = await proxy.Request({
    url: proxy.Api.loadPictureList, method: 'POST', params: queryParams
  });

  if (result.code === 200) {
    pictureList.value = result.data.list;
    totalCount.value = result.data.totalCount;
  }
};

const getImageUrl = (relativePath) => {
  return `http://localhost:8150/api/file/getPicture?picturePath=${encodeURIComponent(relativePath)}`;
};

const handleCategoryChange = () => { pageNo.value = 1; loadPictureList(); };
const handleTagChange = () => { pageNo.value = 1; loadPictureList(); };

// --- 新增：封面点击回调 ---
const handleCoverClick = (item) => {
  console.log("点击了图片:", item);
  // 这里可以写跳转到详情页等逻辑
};

onMounted(() => {
  getTagCategoryList();
});
</script>

<style lang="scss" scoped>
/* 这里的样式可以大幅简化，因为图片样式已经封装到组件里了 */
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

/* 图片列表间距 */
.picture-list {
  margin-bottom: 60px;
}

/* 分页居中 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 20px 0;
  box-sizing: border-box;
}
</style>