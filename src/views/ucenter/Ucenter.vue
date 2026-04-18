<template>
  <div class="ucenter-panel">
    <div class="user-side">
      <!-- 头像信息 -->
      <div class="avatar-panel">
        <div class="edit-btn a-link" @click="updateUserInfo">
          修改资料
        </div>
        <div class="avatar-inner">
          <Avatar :src="getImageUrl(loginUserStore.loginUser?.avatar)" :size="130"></Avatar>
        </div>
        <div class="nick-name">
          <span>{{ loginUserStore.loginUser?.nickName }}</span>
        </div>
        <div class="desc">
          {{ loginUserStore.loginUser?.profile }}
        </div>
      </div>
    </div>
    <UcenterEditUserInfo ref="ucenterEditUserInfoRef" @resetUserInfo="resetUserInfoHandler"></UcenterEditUserInfo>
  </div>
</template>

<script setup>

import { ref, reactive, getCurrentInstance, nextTick } from "vue"
import { useLoginUserStore } from "@/stores/user";
import UcenterEditUserInfo from "./UcenterEditUserInfo.vue";
const { proxy } = getCurrentInstance();
const loginUserStore = useLoginUserStore();
const userInfo = ref({});

// ---- 方法 ----
const getImageUrl = (relativePath) => {
  if (!relativePath) return '';
  return `http://localhost:8150/api/file/getPicture?picturePath=${encodeURIComponent(relativePath)}`;
};
//修改用户信息
const ucenterEditUserInfoRef = ref(null);
const updateUserInfo = () => {
  ucenterEditUserInfoRef.value.showEditUserInfoDialog(loginUserStore.loginUser);
};

const resetUserInfoHandler = (data) => {
  userInfo.value = loginUserStore.loginUser;
};
</script>

<style lang="scss" scoped>
.ucenter-panel {
  display: flex;

  .user-side {
    width: 300px;
    margin-right: 10px;

    .avatar-panel {
      background: #fff;
      text-align: center;
      padding: 10px;

      .edit-btn {
        text-align: right;
        font-size: 14px;
        color: #3265fd;
      }

      .avatar-inner {
        display: flex;
        justify-content: center;
      }

      .nick-name {
        margin-left: 5px;
        color: var(--link);
      }
      .desc {
        margin-top: 5px;
        text-align: left;
        font-size: 14px;
        color: #929393;
      }

    }

  }
}
</style>
