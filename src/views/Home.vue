<template>
  <div class="home">
    <!-- 分类导航（第一行） -->
    <el-tabs
      v-model="activeCategory"
      class="nav-tabs"
      @tab-click="handleCategoryChange"
    >
      <el-tab-pane label="全部" name="all" />
      <el-tab-pane
        v-for="(item, index) in tagCategoryList.categoryList"
        :key="`cat-${index}`"
        :label="item"
        :name="item"
      />
    </el-tabs>
    <el-divider content-position="left" style="margin: 0 0 24px 0" />
    
    <!-- 标签导航（第二行） -->
    <div class="tag-nav-row">
      <el-tabs
        v-model="activeTag"
        class="nav-tabs tag-tabs"
        @tab-click="handleTagChange"
      >
        <!-- ✅ 修改：这里不再需要手动加“全部”，因为我们在JS逻辑里塞进数据里了 -->
        <el-tab-pane
          v-for="(item, index) in tagCategoryList.tagList"
          :key="`tag-${index}`"
          :label="item"
          :name="item"
        />
      </el-tabs>
    </div>

    <!-- 图片列表区域 -->
    <el-row :gutter="24" class="picture-list">
      <el-col 
        :xs="12" :sm="6" :md="6" :lg="6" :xl="6" 
        v-for="(item, index) in pictureList" 
        :key="item.pictureId"
      >
        <div class="picture-item">
          <el-image
            :src="getImageUrl(item.url)"
            :preview-src-list="pictureList.map(p => getImageUrl(p.url))"
            fit="cover"
            class="picture-img"
            :initial-index="index"
            lazy
          >
            <template #error>
              <div class="image-slot">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>
          <div class="picture-name">{{ item.picName }}</div>
        </div>
      </el-col>
    </el-row>

    <!-- 分页组件 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="pageNo"
        v-model:page-size="pageSize"
        :page-sizes="[12, 24, 48, 96]"
        :total="totalCount"
        layout="total, prev, pager, next, jumper"
        @size-change="loadPictureList"
        @current-change="loadPictureList"
        background
      />
    </div>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance, onMounted, nextTick } from "vue";
import { Picture } from '@element-plus/icons-vue'
const { proxy } = getCurrentInstance();

// --- 数据定义 ---
const tagCategoryList = ref({ categoryList: [], tagList: [] });
const activeCategory = ref("all");
const activeTag = ref("全部"); // ✅ 修改：默认文字改为“全部”

const pictureList = ref([]);
const pageNo = ref(1);
const pageSize = ref(12); // ✅ 修改：建议默认数量和分页器选项保持一致 (原为4)
const totalCount = ref(0);

// --- 获取分类标签 ---
const getTagCategoryList = async () => {
  const result = await proxy.Request({ url: proxy.Api.tag_category });
  if (result.code === 200) {
    // ✅ 修改：在返回的标签列表头部插入“全部”
    const processedTagList = ["全部", ...(result.data.tagList || [])];
    
    tagCategoryList.value = {
      ...result.data,
      tagList: processedTagList
    };
    
    // 设置默认选中第一个（即“全部”）
    activeTag.value = "全部";
    
    // ✅ 修改：关键！等标签准备好后，再去加载图片列表
    loadPictureList();
  }
};

// --- 加载图片列表 ---
const loadPictureList = async () => {
  await nextTick();
  const categoryParam = activeCategory.value === 'all' ? '' : activeCategory.value;
  
  // ✅ 修改：如果选中的是“全部”，则传给后端的标签为空
  const tagParam = activeTag.value === '全部' ? '' : activeTag.value;

  const queryParams = {
    pageNo: pageNo.value,
    pageSize: pageSize.value,
    category: categoryParam,
    tags: tagParam,
    picName: ""
  };
  
  const result = await proxy.Request({
    url: proxy.Api.loadPictureList,
    method: 'POST',
    params: queryParams
  });
  
  if (result.code === 200) {
    pictureList.value = result.data.list;
    totalCount.value = result.data.totalCount;
  }
};

// 图片路径
const getImageUrl = (relativePath) => {
  return `http://localhost:8150/api/file/getPicture?picturePath=${encodeURIComponent(relativePath)}`;
};

// 切换分类
const handleCategoryChange = () => {
  pageNo.value = 1;
  loadPictureList();
};

// 切换标签
const handleTagChange = () => {
  pageNo.value = 1;
  loadPictureList();
};

onMounted(() => {
  getTagCategoryList();
  // ✅ 修改：移除这里的 loadPictureList()，改在 getTagCategoryList 内部调用
});
</script>

<style lang="scss" scoped>
.home {
  width: 1300px;
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

/* 图片列表 */
.picture-list {
  margin-bottom: 60px;
}
.picture-item {
  margin-bottom: 30px;
  cursor: pointer;
}
.picture-img {
  width: 100%;
  height: 220px;
  border-radius: 8px;
  overflow: hidden;
}
.picture-name {
  margin-top: 12px;
  font-size: 16px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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