<template>
  <div class="space-page-wrapper">
    <!-- 1. 未登录 -->
    <div class="center-container" v-if="!loginUserStore.loginUser">
      <el-empty description="请先登录后再访问空间">
        <el-button type="primary" @click="goToLogin">去登录</el-button>
      </el-empty>
    </div>

    <!-- 2. 已登录但无空间 -->
    <div class="center-container" v-else-if="showSpace">
      <el-empty description="您还没有创建空间">
        <el-button type="primary" @click="openDialog">
          <el-icon><Plus /></el-icon>
          创建空间
        </el-button>
      </el-empty>
    </div>

    <!-- 3. 已登录且有空间 -->
    <div v-else class="space-content">
      <!-- 空间头部 -->
      <div class="space-header">
        <div class="space-title">
          <h2>{{ space?.spaceName }}</h2>
          <el-tag :type="spaceLevelTagType">{{ spaceLevelLabel }}</el-tag>
        </div>
        <div class="space-header-right">
          <div class="space-stats">
            <span>已使用 {{ space?.totalCount ?? 0 }} / {{ space?.maxCount ?? 0 }} 张</span>
            <el-divider direction="vertical" />
            <span>已使用 {{ formatSize(space?.totalSize) }} / {{ formatSize(space?.maxSize) }}</span>
          </div>
          <el-button type="primary" @click="openUploadDialog">
            <el-icon><Upload /></el-icon>上传图片
          </el-button>
        </div>
      </div>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :model="searchForm" inline>
          <el-form-item label="图片名称">
            <el-input
              v-model.trim="searchForm.picName"
              placeholder="请输入图片名称"
              clearable
              style="width: 160px"
            />
          </el-form-item>
          <el-form-item label="图片简介">
            <el-input
              v-model.trim="searchForm.introduction"
              placeholder="请输入图片简介"
              clearable
              style="width: 160px"
            />
          </el-form-item>
          <el-form-item label="分类">
            <el-select
              v-model="searchForm.category"
              placeholder="全部分类"
              clearable
              style="width: 130px"
            >
              <el-option
                v-for="item in tagCategoryList.categoryList"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="标签">
            <el-select
              v-model="searchForm.tag"
              placeholder="全部标签"
              clearable
              style="width: 130px"
            >
              <el-option
                v-for="item in tagCategoryList.tagList"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>搜索
            </el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 图片列表 -->
      <PictureList
        :space-id="space?.spaceId"
        :pic-name="activeSearch.picName"
        :introduction="activeSearch.introduction"
        :category="activeSearch.category"
        :tag="activeSearch.tag"
        :auto-load="false"
        ref="pictureListRef"
        @picture-click="handlePictureClick"
      />
    </div>
  </div>

  <!-- 上传图片弹窗 -->
  <Dialog
    :show="uploadDialogConfig.show"
    title="上传图片"
    :buttons="uploadDialogConfig.buttons"
    width="600px"
    :showCancel="true"
    @close="closeUploadDialog"
  >
    <UploadPicture
      ref="uploadRef"
      :space-id="space?.spaceId"
      :tag-category-list="tagCategoryList"
      @success="handleUploadSuccess"
    />
  </Dialog>

  <!-- 创建空间弹窗 -->
  <Dialog
    :show="dialogConfig.show"
    title="创建空间"
    :buttons="dialogConfig.buttons"
    width="400px"
    :showCancel="false"
    @close="dialogConfig.show = false"
  >
    <el-form
      :model="formData"
      :rules="rules"
      ref="formDataRef"
      label-width="80px"
    >
      <el-form-item prop="spaceName" label="空间名称">
        <el-input
          clearable
          placeholder="请输入空间名称"
          v-model.trim="formData.spaceName"
          @keyup.enter="submitForm"
        ></el-input>
      </el-form-item>
      <el-form-item prop="spaceLevel" label="空间等级">
        <el-select v-model="formData.spaceLevel" placeholder="请选择空间等级" style="width: 100%">
          <el-option
            v-for="level in spaceLevelOptions"
            :key="level.value"
            :label="level.label"
            :value="level.value"
          />
        </el-select>
      </el-form-item>
    </el-form>
  </Dialog>
</template>

<script setup>
import { useLoginUserStore } from "@/stores/user";
import { ref, reactive, computed, getCurrentInstance, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { Api } from "@/utils/Api";
import { Plus, Search, Upload } from "@element-plus/icons-vue";
import PictureList from "@/components/PictureList.vue";
import UploadPicture from "@/components/UploadPicture.vue";
// Dialog 已在 main.js 全局注册，无需重复引入

const { proxy } = getCurrentInstance();
const loginUserStore = useLoginUserStore();
const route = useRoute();

// --- 空间状态 ---
const space = ref(null);
const showSpace = ref(false);
const pictureListRef = ref();
const uploadRef = ref();

// --- 上传弹窗 ---
const uploadDialogConfig = reactive({
  show: false,
  buttons: [{ type: 'primary', text: '确定上传', click: () => uploadRef.value?.submit() }],
});

const openUploadDialog = () => {
  uploadDialogConfig.show = true;
};

const closeUploadDialog = () => {
  uploadDialogConfig.show = false;
  uploadRef.value?.reset();
};

const handleUploadSuccess = () => {
  uploadDialogConfig.show = false;
  uploadRef.value?.reset();
  // 刷新图片列表和空间用量
  pictureListRef.value?.reload();
  checkUserSpace();
};

// --- 分类标签数据（用于搜索下拉选项） ---
const tagCategoryList = ref({ categoryList: [], tagList: [] });

// --- 搜索表单（展示用） ---
const searchForm = reactive({
  picName: '',
  introduction: '',
  category: '',
  tag: '',
});

// --- 已提交的搜索条件（实际传给 PictureList） ---
const activeSearch = reactive({
  picName: '',
  introduction: '',
  category: '',
  tag: '',
});

// --- 空间等级显示 ---
const spaceLevelOptions = [
  { label: '普通版（100张 / 100MB）', value: 0, tagType: 'info' },
  { label: '专业版（1000张 / 1000MB）', value: 1, tagType: 'warning' },
  { label: '旗舰版（10000张 / 10000MB）', value: 2, tagType: 'danger' },
];
const spaceLevelLabel = computed(() => {
  const found = spaceLevelOptions.find(o => o.value === space.value?.spaceLevel);
  return found?.label ?? '普通版';
});
const spaceLevelTagType = computed(() => {
  const found = spaceLevelOptions.find(o => o.value === space.value?.spaceLevel);
  return found?.tagType ?? 'info';
});

// --- 工具方法 ---
const formatSize = (bytes) => {
  if (!bytes) return '0MB';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + 'GB';
};

// --- 创建空间表单 ---
const formDataRef = ref();
const formData = ref({ spaceName: '', spaceLevel: 0 });
const rules = {
  spaceName: [{ required: true, message: '请输入空间名称', trigger: 'blur' }],
  spaceLevel: [{ required: true, message: '请选择空间等级', trigger: 'change' }],
};

// --- 方法 ---
const goToLogin = () => ElMessage.warning('请先登录');

// 获取分类标签选项
const getTagCategoryList = async () => {
  const result = await proxy.Request({ url: Api.tag_category });
  if (result?.code === 200) {
    tagCategoryList.value = result.data;
  }
};

// 检查空间状态
const checkUserSpace = async () => {
  if (!loginUserStore.loginUser) return;
  const result = await proxy.Request({ url: Api.loadSpace });
  if (result?.code === 200 && result.data) {
    space.value = result.data;
    showSpace.value = false;
    // 空间加载完成后触发图片列表加载
    await getTagCategoryList();
    proxy.$nextTick(() => pictureListRef.value?.reload());
  } else {
    space.value = null;
    showSpace.value = true;
  }
};

// 搜索搜索按閔：将表单条件同步到 activeSearch 再触发请求
const handleSearch = () => {
  Object.assign(activeSearch, { ...searchForm });
};

// 重置
const handleReset = () => {
  Object.assign(searchForm, { picName: '', introduction: '', category: '', tag: '' });
  Object.assign(activeSearch, { picName: '', introduction: '', category: '', tag: '' });
};

const handlePictureClick = (item) => {
  console.log('点击了图片:', item);
};

const openDialog = () => {
  dialogConfig.show = true;
  formData.value = { spaceName: '', spaceLevel: 0 };
  formDataRef.value?.clearValidate();
};

const submitForm = async () => {
  await formDataRef.value?.validate(async (valid) => {
    if (!valid) return;
    const createResult = await proxy.Request({
      url: Api.createSpace,
      method: 'POST',
      params: {
        spaceName: formData.value.spaceName,
        spaceLevel: formData.value.spaceLevel,
      },
    });
    if (createResult?.code === 200) {
      ElMessage.success('创建成功！');
      dialogConfig.show = false;
      checkUserSpace();
    }
  });
};

const dialogConfig = reactive({
  show: false,
  buttons: [{ type: 'primary', text: '确定', click: () => submitForm() }],
});

// --- 生命周期 ---
onMounted(async () => {
  await loginUserStore.fetchLoginUser();
});

watch(
  () => route.path,
  (newPath) => {
    if (newPath === '/space/mySpace' && loginUserStore.loginUser) {
      checkUserSpace();
    }
  }
);

watch(
  () => loginUserStore.loginUser,
  (newUser) => {
    if (newUser && route.path === '/space/mySpace') {
      checkUserSpace();
    }
  }
);
</script>

<style lang="scss" scoped>
.space-page-wrapper {
  width: 100%;
  min-height: 60vh;
}

// 未登录 / 无空间时居中展示
.center-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

// 空间内容区
.space-content {
  width: 100%;
  padding: 0;

  // 空间头部
  .space-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e4e7ed;

    .space-title {
      display: flex;
      align-items: center;
      gap: 12px;

      h2 {
        margin: 0;
        font-size: 22px;
        color: #303133;
      }
    }

    .space-stats {
      font-size: 13px;
      color: #909399;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .space-header-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }
  }

  // 搜索栏
  .search-bar {
    background: #fff;
    border-radius: 8px;
    padding: 16px 20px 4px;
    margin-bottom: 20px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);

    :deep(.el-form-item) {
      margin-bottom: 12px;
    }
  }
}
</style>