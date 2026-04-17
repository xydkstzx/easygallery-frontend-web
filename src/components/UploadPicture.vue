<template>
  <div class="upload-picture-wrapper">
    <!-- 图片选择区域 -->
    <el-upload
      class="picture-uploader"
      :auto-upload="false"
      :show-file-list="false"
      accept="image/*"
      :on-change="handleFileChange"
      drag
    >
      <!-- 已选图片预览 -->
      <div v-if="previewUrl" class="preview-container">
        <img :src="previewUrl" class="preview-img" alt="预览图片" />
        <div class="preview-mask">
          <el-icon size="24" color="#fff"><RefreshRight /></el-icon>
          <span>点击重新选择</span>
        </div>
      </div>
      <!-- 未选图片时的占位 -->
      <template v-else>
        <el-icon class="el-icon--upload" size="48"><UploadFilled /></el-icon>
        <div class="el-upload__text">拖拽图片到此处，或 <em>点击选择</em></div>
        <div class="el-upload__tip">支持 JPG / PNG / GIF / WEBP，单张不超过 10MB</div>
      </template>
    </el-upload>

    <!-- 图片信息表单 -->
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      class="upload-form"
    >
      <el-form-item label="图片名称" prop="picName">
        <el-input
          v-model.trim="form.picName"
          placeholder="请输入图片名称（可留空，将使用原文件名）"
          clearable
        />
      </el-form-item>

      <el-form-item label="图片简介">
        <el-input
          v-model.trim="form.introduction"
          type="textarea"
          :rows="2"
          placeholder="请输入图片简介（可选）"
        />
      </el-form-item>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="分类">
            <el-select
              v-model="form.category"
              placeholder="请选择分类"
              clearable
              allow-create
              filterable
              style="width: 100%"
            >
              <el-option
                v-for="item in tagCategoryList.categoryList"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="标签">
            <el-select
              v-model="form.tags"
              placeholder="请选择标签"
              multiple
              clearable
              allow-create
              filterable
              collapse-tags
              collapse-tags-tooltip
              style="width: 100%"
            >
              <el-option
                v-for="item in tagCategoryList.tagList"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { UploadFilled, RefreshRight } from '@element-plus/icons-vue';
import axios from 'axios';

// ---- Props ----
const props = defineProps({
  // 上传到指定空间（null 表示公共空间）
  spaceId: { type: [String, Number], default: null },
  // 分类标签数据（父组件传入，避免重复请求）
  tagCategoryList: {
    type: Object,
    default: () => ({ categoryList: [], tagList: [] }),
  },
});

// ---- Emits ----
const emit = defineEmits(['success']);

// ---- 状态 ----
const formRef = ref();
const previewUrl = ref('');
const fileObj = ref(null);   // 原始 File 对象
const uploading = ref(false);

const form = reactive({
  picName: '',
  introduction: '',
  category: '',
  tags: [],        // 多选标签数组，提交时序列化为 JSON
});

const rules = {
  picName: [],
};

// ---- 文件选择处理 ----
const handleFileChange = (uploadFile) => {
  const raw = uploadFile.raw;
  // 大小限制：10MB
  if (raw.size > 10 * 1024 * 1024) {
    ElMessage.warning('图片大小不能超过 10MB');
    return;
  }
  fileObj.value = raw;
  previewUrl.value = URL.createObjectURL(raw);
  // 自动填充图片名称（去掉后缀）
  if (!form.picName) {
    const dotIndex = raw.name.lastIndexOf('.');
    form.picName = dotIndex > 0 ? raw.name.slice(0, dotIndex) : raw.name;
  }
};

// ---- 提交（对外暴露，由父组件弹窗按钮调用） ----
const submit = async () => {
  if (!fileObj.value) {
    ElMessage.warning('请先选择要上传的图片');
    return false;
  }

  // 表单校验
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return false;

  uploading.value = true;
  try {
    const fd = new FormData();
    fd.append('file', fileObj.value);
    fd.append('picName', form.picName || '');
    fd.append('introduction', form.introduction || '');
    fd.append('category', form.category || '');
    // 标签存为 JSON 字符串
    fd.append('tags', form.tags.length > 0 ? JSON.stringify(form.tags) : '');
    if (props.spaceId) {
      fd.append('spaceId', props.spaceId);
    }

    const token = localStorage.getItem('token');
    const response = await axios.post(
      'http://localhost:8150/api/picture/uploadPicture',
      fd,
      {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          token: token || '',
        },
      }
    );

    const data = response.data;
    if (data.code === 200) {
      ElMessage.success('上传成功！');
      emit('success');
      return true;
    } else {
      ElMessage.error(data.info || '上传失败');
      return false;
    }
  } catch (e) {
    ElMessage.error('网络异常，上传失败');
    return false;
  } finally {
    uploading.value = false;
  }
};

// ---- 重置（关闭弹窗时清空） ----
const reset = () => {
  fileObj.value = null;
  previewUrl.value = '';
  Object.assign(form, { picName: '', introduction: '', category: '', tags: [] });
  formRef.value?.clearValidate();
};

defineExpose({ submit, reset, uploading });
</script>

<style lang="scss" scoped>
.upload-picture-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

// 上传区域
.picture-uploader {
  width: 100%;

  :deep(.el-upload) {
    width: 100%;
  }
  :deep(.el-upload-dragger) {
    width: 100%;
    height: 200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0;
    overflow: hidden;
    border-radius: 8px;
  }
}

// 预览图片容器
.preview-container {
  position: relative;
  width: 100%;
  height: 100%;

  .preview-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }

  .preview-mask {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    opacity: 0;
    transition: opacity 0.2s;
    color: #fff;
    font-size: 13px;
    cursor: pointer;
  }

  &:hover .preview-mask {
    opacity: 1;
  }
}

.upload-form {
  margin-top: 4px;
}
</style>
