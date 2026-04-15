<template>
  <el-config-provider :locale="zhCn">
    <BasicLayout></BasicLayout>
  </el-config-provider>
</template>

<script setup lang="ts">
import { ElConfigProvider } from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import BasicLayout from "./components/BasicLayout.vue";
import { useLoginUserStore } from "@/stores/user";
import { onMounted } from "vue";
import { initWs } from "@/utils/wsClient.js";
const ws = {
  url: "ws://localhost:8151/ws/?token=",
};
const loginUserStore = useLoginUserStore();
onMounted(() => {
  if (localStorage.getItem("token")) {
    loginUserStore.fetchLoginUser();
    initWs(ws.url + localStorage.getItem("token"));
  }
});
</script>

<style lang="scss" scoped>
</style>
