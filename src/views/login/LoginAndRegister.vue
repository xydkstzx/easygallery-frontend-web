<template>
  <div class="login-and-register">
    <Dialog
      :show="dialogConfig.show"
      :title="dialogConfig.title"
      width="400px"
      :showCancel="false"
      @close="closeDialog"
    >
      <el-form
        :model="formData"
        :rules="rules"
        ref="formDataRef"
        label-width="0px"
        @submit.prevent
      >
        <!-- 账号 -->
        <el-form-item prop="account" v-if="opType == 1 || opType == 2" size="large">
          <el-input
            clearable
            placeholder="请输入账号"
            v-model.trim="formData.account"
          >
            <template #prefix>
              <i class="iconfont icon-account"></i>
            </template>
          </el-input>
        </el-form-item>

        <!-- 昵称 -->
        <el-form-item prop="nickName" v-if="opType == 2" size="large">
          <el-input
            clearable
            placeholder="请输入昵称"
            v-model.trim="formData.nickName"
          >
            <template #prefix>
              <i class="iconfont icon-nicheng"></i>
            </template>
          </el-input>
        </el-form-item>

        <!-- 密码 -->
        <el-form-item prop="password" v-if="opType == 1 || opType == 2" size="large">
          <el-input
            clearable
            placeholder="请输入密码"
            v-model.trim="formData.password"
            type="password"
          >
            <template #prefix>
              <i class="iconfont icon-password"></i>
            </template>
          </el-input>
        </el-form-item>

        <!-- 确认密码 -->
        <el-form-item prop="confirmPassword" v-if="opType == 2" size="large">
          <el-input
            clearable
            placeholder="请再次输入密码"
            v-model.trim="formData.confirmPassword"
            type="password"
          >
            <template #prefix>
              <i class="iconfont icon-password"></i>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" class="op-btn" @click="submit">
            {{ opType == 1 ? "登录" : "注册" }}
          </el-button>
        </el-form-item>
      </el-form>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance } from "vue";
const { proxy } = getCurrentInstance();
import Dialog from "@/components/Dialog.vue";
import { useLoginUserStore } from "@/stores/user";
import {initWs} from "@/utils/wsClient";
const loginUserStore = useLoginUserStore()
const ws = {
  url: "ws://localhost:8151/ws/?token=",
};

// 表单数据
const formData = ref({
  account: "",
  nickName: "",
  password: "",
  confirmPassword: "",
});

const formDataRef = ref();

// 完整校验规则
const rules = reactive({
  account: [
    { required: true, message: "请输入账号", trigger: "blur" },
  ],
  nickName: [
    { required: true, message: "请输入昵称", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, message: "请再次输入密码", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (value !== formData.value.password) {
          callback(new Error("两次输入的密码不一致"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
});

// 弹窗配置
const dialogConfig = reactive({
  show: false,
  title: "标题",
});

const opType = ref(1);

// 显示面板
const showPanel = (type) => {
  opType.value = type;
  resetForm();
};

// 重置表单
const resetForm = () => {
  formData.value = {
    account: "",
    nickName: "",
    password: "",
    confirmPassword: "",
  };
  dialogConfig.show = true;
  dialogConfig.title = opType.value === 1 ? "登录" : opType.value === 2 ? "注册" : "重置密码";
};

// 关闭弹窗
const closeDialog = () => {
  dialogConfig.show = false;
};

// 提交
const submit = async () => {
  const valid = await formDataRef.value?.validate();
  if (!valid) return;
  if (opType.value === 1) {
    const result = await proxy.Request({
      url: proxy.Api.login,
      showLoading: true,
      params: {
        account: formData.value.account,
        password: formData.value.password,
      },
    })
    if(result.code===200){
      localStorage.setItem("token", result.data.token);
      loginUserStore.fetchLoginUser()
      closeDialog();
      initWs(ws.url + result.data.token);
    }
  } else if (opType.value === 2) {
    console.log("执行注册");
  }
};

defineExpose({ showPanel });
</script>

<style lang="scss" scoped>
.login-and-register {
  .op-btn {
    width: 100%;
  }
  // 图标样式统一
  :deep(.iconfont) {
    font-size: 16px;
    color: #909399;
  }
}
</style>