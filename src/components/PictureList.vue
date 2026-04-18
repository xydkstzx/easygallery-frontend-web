<template>
  <div class="picture-list-wrapper">
    <!-- 图片网格 -->
    <div v-if="pictureList.length > 0">
      <el-row :gutter="16">
        <el-col
          :xs="12" :sm="8" :md="6" :lg="6" :xl="4"
          v-for="(item, index) in pictureList"
          :key="item.pictureId"
          class="picture-col"
        >
          <!-- 图片封面 -->
          <PictureCover
            :src="getImageUrl(item.url)"
            :name="item.picName"
            :preview-src-list="pictureList.map(p => getImageUrl(p.url))"
            :initial-index="index"
            @click="handleCoverClick(item)"
          />

          <!-- 编辑 + 删除按钮（受控显示） -->
          <div v-if="showOperateButtons" class="operate-buttons">
            <el-button
              type="primary"
              link
              size="small"
              @click.stop="handleEdit(item)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              link
              size="small"
              @click.stop="handleDelete(item)"
            >
              删除
            </el-button>
          </div>
        </el-col>
      </el-row>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pageNo"
          v-model:page-size="pageSize"
          :page-sizes="[12, 24, 48, 96]"
          :total="totalCount"
          layout="total, prev, pager, next, jumper"
          @size-change="onSizeChange"
          @current-change="onPageChange"
          background
        />
      </div>
    </div>
    <!-- 空状态 -->
    <div v-else-if="!loading" class="empty-wrapper">
      <el-empty description="暂无图片数据" />
    </div>
    <!-- 加载中骨架屏 -->
    <div v-if="loading" class="skeleton-wrapper">
      <el-row :gutter="16">
        <el-col
          :xs="12" :sm="8" :md="6" :lg="6" :xl="4"
          v-for="i in pageSize"
          :key="i"
        >
          <el-skeleton :rows="3" animated>
            <template #template>
              <el-skeleton-item variant="image" class="skeleton-img" />
              <el-skeleton-item variant="text" style="margin-top: 8px; width: 80%;" />
            </template>
          </el-skeleton>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, getCurrentInstance, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import PictureCover from '@/components/PictureCover.vue';

// ---- Props ----
const props = defineProps({
  // 分类筛选（'' 表示全部）
  category: { type: String, default: '' },
  // 标签筛选（'' 表示全部）
  tag: { type: String, default: '' },
  // 图片名称搜索
  picName: { type: String, default: '' },
  // 图片简介搜索
  introduction: { type: String, default: '' },
  // 空间 ID（用于我的空间/团队空间，不传则查公共图库）
  spaceId: { type: [String, Number], default: null },
  // 是否在 mounted 时自动加载
  autoLoad: { type: Boolean, default: true },
  // ✅ 新增：是否显示编辑删除按钮
  showOperateButtons: { type: Boolean, default: false },
});

// ---- Emits ----
const emit = defineEmits([
  'picture-click',
  'picture-edit',    // 编辑事件
  'picture-delete'   // 删除事件
]);

const { proxy } = getCurrentInstance();

// ---- 状态 ----
const pictureList = ref([]);
const pageNo = ref(1);
const pageSize = ref(12);
const totalCount = ref(0);
const loading = ref(false);

// ---- 方法 ----
const getImageUrl = (relativePath) => {
  if (!relativePath) return '';
  return `http://localhost:8150/api/file/getPicture?picturePath=${encodeURIComponent(relativePath)}`;
};

const loadPictureList = async () => {
  loading.value = true;
  try {
    const queryParams = {
      pageNo: pageNo.value,
      pageSize: pageSize.value,
      category: props.category,
      tags: props.tag,
      picName: props.picName,
      introduction: props.introduction,
    };
    if (props.spaceId) {
      queryParams.spaceId = props.spaceId;
    }

    const result = await proxy.Request({
      url: proxy.Api.loadPictureList,
      method: 'POST',
      params: queryParams,
    });

    if (result.code === 200) {
      pictureList.value = result.data.list || [];
      totalCount.value = result.data.totalCount || 0;
    }
  } finally {
    loading.value = false;
  }
};

const handleCoverClick = (item) => {
  emit('picture-click', item);
};

// ✅ 编辑点击
const handleEdit = (item) => {
  emit('picture-edit', item);
};

// ✅ 删除点击
const handleDelete = (item) => {
  emit('picture-delete', item);
};

const onSizeChange = (size) => {
  pageSize.value = size;
  pageNo.value = 1;
  loadPictureList();
};

const onPageChange = (page) => {
  pageNo.value = page;
  loadPictureList();
};

// ---- 对外暴露：父组件可手动触发刷新 ----
const reload = (resetPage = true) => {
  if (resetPage) pageNo.value = 1;
  loadPictureList();
};
defineExpose({ reload });

// ---- 监听筛选条件变化，自动刷新 ----
watch(
  () => [props.category, props.tag, props.picName, props.introduction, props.spaceId],
  () => {
    pageNo.value = 1;
    loadPictureList();
  }
);

// ---- 生命周期 ----
onMounted(() => {
  if (props.autoLoad) {
    loadPictureList();
  }
});
</script>

<style lang="scss" scoped>
.picture-list-wrapper {
  width: 100%;
}

.picture-col {
  margin-bottom: 16px;
}

// ✅ 按钮样式
.operate-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 8px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px 0 8px;
}

.empty-wrapper {
  padding: 60px 0;
  text-align: center;
}

.skeleton-wrapper {
  width: 100%;

  .skeleton-img {
    width: 100%;
    height: 200px;
    border-radius: 8px;
  }
}
</style>