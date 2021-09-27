<template>
  <div class="login_box">
    <el-form :model="loginForm" ref="loginFormRef" :rules="loginFormRules">
      <el-form-item label="username" prop="username">
        <el-input
          v-model="loginForm.username"
          prefix-icon="el-icon-user-solid"
        ></el-input>
      </el-form-item>
      <el-form-item label="password" prop="password">
        <el-input
          type="password"
          v-model="loginForm.password"
          prefix-icon="el-icon-lock"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="login">登入</el-button>
        <el-button type="info" @click="resetLoginForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
// @ts-nocheck
import { reactive, toRefs, ref, defineComponent } from "vue";
import axios from "../utils/axios";
import { ElNotification, ElMessage } from "element-plus";
import router from "../router";

const url = import.meta.env.VITE_APP_URL2;

function useElement(state, loginFormRef) {
  const resetLoginForm = () => {
    loginFormRef.value.resetFields();
  };
  const login = async () => {
    loginFormRef.value.validate().then((valid) => {
      if (!valid) return;
      const query = {
        where: state.loginForm,
      };
      axios
        .post(`${url}/auth/login`, {
          username: state.loginForm.username,
          password: state.loginForm.password,
        })
        .then((res) => {
          if (res.data.code === 1) {
            ElNotification({
              title: "登錄失敗",
              message: res.data.msg,
              type: "warning",
            });
          } else if (res.data.code === 2) {
            ElNotification({
              title: "登錄失敗",
              message: res.data.msg,
              type: "warning",
            });
          } else {
            window.sessionStorage.setItem("token", res.data.token);
            router.push("/");
            ElMessage.success("登入成功");
          }
        });
    });
  };

  return {
    resetLoginForm,
    login,
  };
}

export default defineComponent({
  setup() {
    const loginFormRef = ref();
    const state = reactive({
      loginForm: {
        username: "",
        password: "",
      },
      where: "",
    });
    const loginFormRules = {
      username: [
        { required: true, message: "請輸入帳號", trigger: "blur" },
        { min: 3, max: 10, message: "帳號長度為3-10" },
      ],
      password: [
        { required: true, message: "請輸入密碼", trigger: "blur" },
        { min: 3, max: 10, message: "密碼長度為3-10" },
      ],
    };
    return {
      ...toRefs(state),
      loginFormRules,
      loginFormRef,
      ...useElement(state, loginFormRef),
    };
  },
});
</script>

<style>
.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  margin: 0 auto;
}
</style>
