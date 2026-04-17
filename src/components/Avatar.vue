<template>
  <div class="avatar-wrapper" :style="{ width: size + 'px', height: size + 'px' }">
    <!-- 有头像图片时展示图片 -->
    <img
      v-if="src"
      :src="src"
      :alt="nickname"
      class="avatar-img"
      @error="handleImgError"
    />
    <!-- 无头像时展示昵称首字母 -->
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

const props = defineProps({
  // 头像图片地址
  src: { type: String, default: '' },
  // 用户昵称（用于 alt 和生成首字母占位）
  nickname: { type: String, default: '' },
  // 头像尺寸（px）
  size: { type: Number, default: 32 },
});

// 图片加载失败时降级为首字母占位
const imgError = ref(false);
const handleImgError = () => { imgError.value = true; };

// 实际是否显示图片：有 src 且未发生加载错误
const showImg = computed(() => props.src && !imgError.value);

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
</script>

<style lang="scss" scoped>
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
