<template>
  <!-- 外层容器 -->
  <div>
    <!-- Element Plus 弹窗组件，绑定显示、关闭、标题、宽度等属性 -->
    <el-dialog
      :model-value="show"
      :show-close="showClose"
      :draggable="true"
      :close-on-click-modal="false"
      :title="title"
      class="dialog"
      :width="width"
      :top="top"
      @close="close"
    >
      <!-- 弹窗内容区域 -->
      <div class="dialog-body">
        <slot></slot>
        <!-- 插槽，插入自定义内容 -->
      </div>
      <!-- 弹窗底部按钮区域，只有有按钮或显示取消时才渲染 -->
      <template v-if="(buttons && buttons.length > 0) || showCancel">
        <div class="dialog-footer">
          <!-- 取消按钮 -->
          <el-button link @click="close" v-if="showCancel">取消</el-button>
          <!-- 其他自定义按钮，需加 :key 保证唯一性 -->
          <el-button v-for="btn in buttons" :key="btn.text" :type="btn.type" @click="btn.click">
            {{ btn.text }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>

// 定义组件属性
const props = defineProps({
  show: {
    type: Boolean,
    default: false, // 控制弹窗显示/隐藏
  },
  title: {
    type: String,
    default: '标题', // 弹窗标题
  },
  showClose: {
    type: Boolean,
    default: true, // 是否显示右上角关闭按钮
  },
  width: {
    type: String,
    default: '30%', // 弹窗宽度
  },
  top: {
    type: String,
    default: '50px', // 弹窗距离顶部距离
  },
  buttons: {
    type: Array, // 自定义按钮数组，格式：[{text, type, click}]
  },
  showCancel: {
    type: Boolean,
    default: true, // 是否显示取消按钮
  },
})
// 定义事件，声明 close 事件
const emit = defineEmits(['close'])
// 关闭弹窗方法，触发 close 事件
const close = () => {
  emit('close')
}
</script>

<style lang="scss" scoped>
// 弹窗内容区域样式
.dialog-body {
  border-top: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
  padding: 15px;
  min-height: 100px;
}
// 弹窗底部按钮区域样式
.dialog-footer {
  text-align: right;
  padding: 10px 20px;
}
</style>
