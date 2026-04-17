<template>
    <div class="picture-list-container">
        <!-- 图片列表区域 -->
        <el-row :gutter="24" class="picture-list">
            <el-col :xs="12" :sm="6" :md="6" :lg="6" :xl="6" v-for="(item, index) in list" :key="item.pictureId">
                <div class="picture-item">
                    <el-image :src="getImageUrl(item.url)" :preview-src-list="previewList" fit="cover"
                        class="picture-img" :initial-index="index" lazy>
                        <template #error>
                            <div class="image-slot">
                                <el-icon>
                                    <Picture />
                                </el-icon>
                            </div>
                        </template>
                    </el-image>
                    <div class="picture-name">{{ item.picName }}</div>
                </div>
            </el-col>
        </el-row>

        <!-- 分页组件 -->
        <div class="pagination-wrapper" v-if="total > 0">
            <el-pagination :current-page="pageNo" 
                :page-size="pageSize" 
                :page-sizes="[12, 24, 48, 96]"
                :total="total"
                layout="total, prev, pager, next, jumper"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                background
                />
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { Picture } from '@element-plus/icons-vue';

// --- Props 定义 ---
const props = defineProps({
    list: { type: Array, default: () => [] },
    pageNo: { type: Number, default: 1 },
    pageSize: { type: Number, default: 12 },
    total: { type: Number, default: 0 },
    getImageUrl: { type: Function, required: true }
});

// --- Emits 定义 ---
// 🔥 简化：只保留 change 事件，移除 update 事件
const emit = defineEmits(['change']);

// --- 内部计算 ---
const previewList = computed(() => {
    return props.list.map(p => props.getImageUrl(p.url));
});

// --- 事件处理：只负责通知，不负责维护状态 ---

const handleSizeChange = (newSize) => {
    // 告诉父组件：改成第1页，每页 newSize 条
    emit('change', { pageNo: 1, pageSize: newSize });
};

const handleCurrentChange = (newPage) => {
    // 告诉父组件：改成第 newPage 页，每页条数不变
    emit('change', { pageNo: newPage, pageSize: props.pageSize });
};
</script>

<style lang="scss"">
/* 保持样式不变 */
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

.pagination-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: 20px 0;
    box-sizing: border-box;
}
</style>