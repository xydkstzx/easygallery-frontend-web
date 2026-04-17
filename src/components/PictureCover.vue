<template>
  <div class="picture-cover" @click="handleClick">
    <!-- 图片 -->
    <el-image
      :src="src"
      fit="cover"
      class="cover-img"
      lazy
      :preview-src-list="previewSrcList"
      :initial-index="initialIndex"
      :preview-teleported="true"
    >
      <template #error>
        <div class="error-placeholder">加载失败</div>
      </template>
    </el-image>

    <!-- 图片信息 -->
    <div v-if="name" class="cover-info">
      <div class="name">{{ name }}</div>
    </div>
  </div>
</template>

<script setup>
// 仅保留必要的 Props
const props = defineProps({
  src: { type: String, required: true },
  name: { type: String, default: '' },
  previewSrcList: { type: Array, default: () => [] },
  initialIndex: { type: Number, default: 0 }
});

// 点击事件（可选，方便扩展）
const emit = defineEmits(['click']);
const handleClick = () => emit('click');
</script>

<style lang="scss" scoped>
.picture-cover {
  width: 100%;
  cursor: pointer;
  
  .cover-img {
    width: 100%;
    height: 220px;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .error-placeholder {
    width: 100%;
    height: 220px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f7fa;
    color: #909399;
    border-radius: 8px;
  }
  
  .cover-info {
    margin-top: 10px;
    
    .name {
      font-size: 14px;
      color: #333;
      line-height: 1.4;
      /* 单行省略 */
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>