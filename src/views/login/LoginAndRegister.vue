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
          ></el-input>
        </el-form-item>

        <!-- 昵称 -->
        <el-form-item prop="nickName" v-if="opType == 2" size="large">
          <el-input
            clearable
            placeholder="请输入昵称"
            v-model.trim="formData.nickName"
          ></el-input>
        </el-form-item>

        <!-- 密码 -->
        <el-form-item prop="password" v-if="opType == 1 || opType == 2" size="large">
          <el-input
            clearable
            placeholder="请输入密码"
            v-model.trim="formData.password"
            type="password"
          ></el-input>
        </el-form-item>

        <!-- 确认密码 -->
        <el-form-item prop="confirmPassword" v-if="opType == 2" size="large">
          <el-input
            clearable
            placeholder="请再次输入密码"
            v-model.trim="formData.confirmPassword"
            type="password"
          ></el-input>
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

// ====================== 完整校验规则 ======================
const rules = reactive({
  // 账号：必填、长度 3-20
  account: [
    { required: true, message: "请输入账号", trigger: "blur" },
  ],
  // 昵称：必填、长度 2-10
  nickName: [
    { required: true, message: "请输入昵称", trigger: "blur" },
  ],
  // 密码：必填、6-18位
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
  ],
  // 确认密码：必填 + 和密码一致
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
  // 清空表单
  formData.value = {
    account: "",
    nickName: "",
    password: "",
    confirmPassword: "",
  };
  dialogConfig.show = true;
  if (opType.value === 1) {
    dialogConfig.title = "登录";
  } else if (opType.value === 2) {
    dialogConfig.title = "注册";
  } else if (opType.value === 0) {
    dialogConfig.title = "重置密码";
  }
};

// 关闭弹窗
const closeDialog = () => {
  console.log("登录成功关闭弹窗")
  dialogConfig.show = false;
};

// 提交校验 + 后续请求
const submit = async () => {
  const valid = await formDataRef.value?.validate();
  if (!valid) return;
  // 校验通过 → 在这里写登录/注册接口请求
  console.log("提交数据：", formData.value);
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
      // 关闭弹窗
      closeDialog();
      //建立ws连接
      initWs(ws.url + result.data.token);
    }
  } else if (opType.value === 2) {
    // 注册逻辑
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
}
</style>