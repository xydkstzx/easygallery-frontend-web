
import { defineStore } from "pinia";
import { ref } from "vue";
import Request from "@/utils/Request";
const api = {
  getLoginUser: "/account/getLoginUser",
};
export const useLoginUserStore = defineStore("loginUser", () => {
  // 登录用户信息，初始为 null 表示未登录
  const loginUser = ref(null);

  // 获取当前登录用户信息
  async function fetchLoginUser() {
    const result = await Request({
       url: api.getLoginUser,
       errorCallback: (response) => {
        console.log( response.info);
       }
    })
    if (result.code === 200) {
      console.log("设置用户信息", result.data);
      loginUser.value = result.data;
    }
  }

  // 设置用户信息
  function setLoginUser(newLoginUser) {
    loginUser.value = newLoginUser;
  }

  return { loginUser, setLoginUser, fetchLoginUser };
});