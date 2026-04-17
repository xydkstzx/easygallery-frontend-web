<template>
    <div class="space-page-wrapper">
        <!-- 优先级 1：未登录 -> 显示请先登录 -->
        <div class="empty-container" v-if="!loginUserStore.loginUser">
            <el-empty description="请先登录后再访问空间">
                <el-button type="primary" @click="goToLogin">
                    去登录
                </el-button>
            </el-empty>
        </div>

        <!-- 优先级 2：已登录但没有空间 -> 显示创建按钮 -->
        <div class="empty-container" v-else-if="showSpace">
            <el-empty description="您还没有创建空间">
                <el-button type="primary" @click="openDialog">
                    <el-icon><Plus /></el-icon>
                    创建空间
                </el-button>
            </el-empty>
        </div>

        <!-- 优先级 3：已登录且有空间 -> 显示空间内容 -->
        <div v-else class="space-content">
            <h2>欢迎来到：{{ space?.spaceName }}</h2>
            <!-- 这里放置空间的具体功能 -->
        </div>
    </div>

    <!-- 创建空间弹窗 -->
    <Dialog 
        :show="dialogConfig.show" 
        :title="dialogConfig.title" 
        :buttons="dialogConfig.buttons" 
        width="400px"
        :showCancel="false" 
        @close="handleDialogClose"
    >
        <el-form
          :model="formData"
          :rules="rules"
          ref="formDataRef"
          label-width="0px"
        >
          <el-form-item prop="spaceName">
            <el-input 
                clearable 
                placeholder="请输入空间名称" 
                v-model.trim="formData.spaceName"
                @keyup.enter="submitForm"
            ></el-input>
          </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { useLoginUserStore } from "@/stores/user";
import { ref, reactive, getCurrentInstance, onMounted } from "vue";
import { useRouter } from "vue-router";
import { logout } from "@/utils/wsClient.js";
import { ElMessage } from "element-plus";
import { Api } from "@/utils/Api";
import { Plus } from '@element-plus/icons-vue';
import Dialog from "@/components/Dialog.vue";

const { proxy } = getCurrentInstance();
const router = useRouter();
const loginUserStore = useLoginUserStore();

// --- 状态定义 ---
const space = ref(null);
const showSpace = ref(false);
const formDataRef = ref();

const formData = ref({
    spaceName: ""
});

const rules = {
  spaceName: [{ required: true, message: "请输入空间名称", trigger: "blur" }],
};

const dialogConfig = reactive({
    show: false,
    title: "创建空间",
    buttons: [
        {
            type: "primary",
            text: "确定",
            click: () => {
                submitForm();
            },
        },
    ],
});

// --- 核心方法 ---

// 新增：跳转到登录页的方法
const goToLogin = () => {
    // 这里可以触发你 Header 组件里的登录弹窗，或者跳转到登录页
    // 这里演示直接跳转路由，或者你可以 emit 事件让父组件打开弹窗
    // 假设你有全局的登录弹窗引用，这里简单处理：
    ElMessage.warning("请先登录");
    // 如果有登录页路由：router.push('/login');
    // 这里你可以根据实际情况，调用之前 Header 里的 loginAndRegister(1)
};

// 检查是否有空间
const checkUserSpace = async () => {
    const loginUser = loginUserStore.loginUser;
    if (!loginUser) {
        // 未登录的情况：清除可能残留的旧数据
        localStorage.removeItem("token");
        logout();
        // 不再这里弹 Message 了，改为在模板里展示 UI
        return;
    }

    // 获取用户空间信息
    const result = await proxy.Request({
        url: Api.loadSpace
    });

    if (result.code === 200 && result.data) {
        space.value = result.data;
        showSpace.value = false;
    } else {
        space.value = null;
        showSpace.value = true;
    }
};

const openDialog = () => {
    dialogConfig.show = true;
    formData.value = { spaceName: "" };
    if (formDataRef.value) {
        formDataRef.value.clearValidate();
    }
};

const handleDialogClose = () => {
    dialogConfig.show = false;
};

const submitForm = async () => {
    if (!formDataRef.value) return;

    await formDataRef.value.validate(async (valid) => {
        if (valid) {
            // 这里调用创建接口
            const createResult = await proxy.Request({
                url: Api.createSpace, // 请确保 Api.js 中有此配置
                method: 'POST',
                data: formData.value
            });

            if (createResult.code === 200) {
                ElMessage.success("创建成功！");
                dialogConfig.show = false;
                checkUserSpace(); // 刷新状态
            } else {
                ElMessage.error(createResult.message || "创建失败");
            }
        }
    });
};

// --- 生命周期 ---
onMounted(() => {
    checkUserSpace();
});
</script>

<style lang="scss" scoped>
.space-page-wrapper {
    width: 100%;
    min-height: 60vh;
    display: flex;
    justify-content: center;
    align-items: center;
}

.empty-container {
    padding-top: 100px;
}

.space-content {
    width: 100%;
    padding: 20px;
}
</style>