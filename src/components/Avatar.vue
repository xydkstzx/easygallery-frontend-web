<template>
  <!-- 可上传模式 -->
  <el-upload
    v-if="uploadable"
    class="avatar-uploader"
    :action="uploadUrl"
    :show-file-list="false"
    :before-upload="beforeUpload"
    :on-success="handleUploadSuccess"
    :on-error="handleUploadError"
    :headers="uploadHeaders"
  >
    <div class="avatar-wrapper" :style="{ width: size + 'px', height: size + 'px' }">
      <img
        v-if="src"
        :src="src"
        :alt="nickname"
        class="avatar-img"
        @error="handleImgError"
      />
      <div
        v-else
        class="avatar-fallback"
        :style="{ fontSize: size * 0.42 + 'px', backgroundColor: bgColor }"
      >
        {{ initial }}
      </div>
    </div>
  </el-upload>

  <!-- 仅展示模式 -->
  <div 
    v-else
    class="avatar-wrapper" 
    :style="{ width: size + 'px', height: size + 'px' }"
  >
    <img
      v-if="src"
      :src="src"
      :alt="nickname"
      class="avatar-img"
      @error="handleImgError"
    />
    <div
      v-else
      class="avatar-fallback"
      :style="{ fontSize: size * 0.42 + 'px', backgroundColor: bgColor }"
    >
      {{ initial }}
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { ElMessage } from 'element-plus';

const props = defineProps({
  // 头像图片地址
  src: { type: String, default: '' },
  // 用户昵称（用于 alt 和生成首字母占位）
  nickname: { type: String, default: '' },
  // 头像尺寸（px）
  size: { type: Number, default: 32 },
  // 是否可上传头像
  uploadable: { type: Boolean, default: false },
});

const emit = defineEmits(['success', 'change']);

// 图片加载失败时降级为首字母占位
const imgError = ref(false);
const handleImgError = () => { imgError.value = true; };

// 取昵称首字（支持中英文）
const initial = computed(() => {
  const name = props.nickname?.trim();
  return name ? name.charAt(0).toUpperCase() : '?';
});

// 根据昵称生成固定背景色，保证同一用户颜色一致
const COLORS = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#9b59b6'];
const bgColor = computed(() => {
  const name = props.nickname || '';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
});

// 上传配置
const uploadUrl = 'http://localhost:8150/api/file/uploadMyAvatar';
const uploadHeaders = computed(() => {
  const token = localStorage.getItem('token');
  return {
    'X-Requested-With': 'XMLHttpRequest',
    'token': token || ''
  };
});

// 上传前验证
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/');
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error('只能上传图片文件！');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB！');
    return false;
  }
  return true;
};

// 上传成功
const handleUploadSuccess = (response) => {
  if (response.code === 200) {
    ElMessage.success('头像上传成功');
    emit('success', response.data);
    emit('change', response.data);
  } else {
    ElMessage.error(response.info || '上传失败');
  }
};

// 上传失败
const handleUploadError = () => {
  ElMessage.error('头像上传失败，请重试');
};
</script>

<style lang="scss" scoped>
.avatar-uploader {
  display: inline-block;
  cursor: pointer;
  
  :deep(.el-upload) {
    border-radius: 50%;
    overflow: hidden;
  }
  
  &:hover {
    opacity: 0.8;
  }
}

.avatar-wrapper {
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  .avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }

  .avatar-fallback {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: 600;
    line-height: 1;
    user-select: none;
  }
}
</style>
