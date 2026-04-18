<template>
    <Dialog :show="dialogConfig.show" :title="dialogConfig.title" :buttons="dialogConfig.buttons" width="400px"
        :showCancel="false" @close="dialogConfig.show = false">
        <!-- 昵称头像简介 -->
        <el-form :model="formData" :rules="rules" ref="formDataRef" label-width="80px" @submit.prevent>
            <!--input输入-->
            <el-form-item label="昵称" prop="nickName">
                {{ formData.nickName }}
            </el-form-item>
            <el-form-item label="头像" prop="avatar">
                <Avatar 
                    :src="getImageUrl(formData.avatar)" 
                    :size="130"
                    uploadable
                    @change="handleAvatarChange"
                ></Avatar>
            </el-form-item>
            <!--textarea输入-->
            <el-form-item label="简介" prop="profile">
                <el-input clearable placeholder="提示信息" type="textarea" :rows="5" :maxlength="150" resize="none"
                    show-word-limit v-model.trim="formData.profile"></el-input>
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>

import Avatar from "@/components/Avatar.vue";
import { ref, reactive, getCurrentInstance, nextTick } from "vue"
import { Api } from "@/utils/Api";
import { useLoginUserStore } from "@/stores/user";
import { ElMessage } from "element-plus";

const { proxy } = getCurrentInstance();
const loginUserStore = useLoginUserStore();

const dialogConfig = reactive({
    show: false,
    title: "修改用户信息",
    buttons: [
        {
            type: "danger",
            text: "确定",
            click: (e) => {
                submitForm();
            },
        },
    ],
});

const formData = ref({});
const formDataRef = ref();
const rules = {
    title: [{ required: true, message: "请输入内容" }],
};


const showEditUserInfoDialog = (userInfo) => {
    console.log(userInfo)
    dialogConfig.show = true;
    nextTick(() => {
        formDataRef.value.resetFields();
        const dataInfo = JSON.parse(JSON.stringify(userInfo));
        formData.value = dataInfo;
    });
};

const emit = defineEmits();
const submitForm = async () => {
    // 验证简介长度
    if (formData.value.profile && formData.value.profile.length > 150) {
        ElMessage.warning('简介不能超过150个字符');
        return;
    }
    
    // 调用后端接口更新用户信息
    const result = await proxy.Request({
        url: Api.updateMyInfo,
        params: {
            nickName: formData.value.nickName,
            avatar: formData.value.avatar,
            profile: formData.value.profile
        },
        showLoading: true
    });
    
    if (result) {
        ElMessage.success('修改成功');
        dialogConfig.show = false;
        // 更新 store 中的用户信息
        await loginUserStore.refreshLoginUser();
        // 通知父组件用户信息已更新
        emit('resetUserInfo', loginUserStore.loginUser);
    }
}

// ---- 方法 ----
const getImageUrl = (relativePath) => {
  if (!relativePath) return '';
  return `http://localhost:8150/api/file/getPicture?picturePath=${encodeURIComponent(relativePath)}`;
};

// 处理头像上传成功
const handleAvatarChange = (avatarPath) => {
    formData.value.avatar = avatarPath;
};


defineExpose({ showEditUserInfoDialog });

</script>

<style lang="scss" scoped></style>
