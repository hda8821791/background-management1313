<template>
  <el-dialog
    title="添加用戶信息"
    width="30%"
    v-model="dialogTableVisible"
    @close="handle_CU({ isShow: false })"
    center
    ><!-- 用戶表單 -->
    <el-form
      ref="formRef"
      :model="form"
      :rules="formRule"
      label-width="70px"
      status-icon
    >
      <el-form-item label="用戶名" prop="username">
        <el-input v-model="form.username"></el-input
      ></el-form-item>
      <el-form-item label="密碼" prop="password">
        <el-input v-model="form.password" type="password"></el-input>
      </el-form-item>
    </el-form>
    <template #footer="scope">
      <span class="dialog-footer">
        <el-button type="primary" @click="handle_CU({ isShow: false })"
          >取消</el-button
        >
        <el-button type="primary" @click="submit_CU">確定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
// @ts-nocheck
import axios from "axios";
import {
  inject,
  onMounted,
  reactive,
  ref,
  ToRefs,
  toRefs,
  defineComponent,
} from "vue";
import { encodeBase64 } from "bcryptjs";

interface State {
  form: {
    username: string;
    password: string;
  };
}
const url = import.meta.env.VITE_APP_URL;

// 載入用戶數具
function locadUserData(uid: ToRefs, state: State) {
  if (uid.value !== "") {
    axios.get(`/users/${uid.value}`).then((res) => {
      const pass = encodeBase64(res.data.password, 10);
      state.form.username = res.data.username;
      state.form.password = pass;
    });
  }
}

function useElemet(state, formRef, handle_CU, uid) {
  // 發送
  const submit_CU = () => {
    formRef.value.validate((valid) => {
      if (valid) {
        if (uid.value !== "") {
          // console.log("uid.value", uid.value);
          axios
            .put(`/users/${uid.value}`, formRef.value.model)
            .then((res) => {
              handle_CU({ isShow: false, data: res.data });
            });
          // console.log("修改", uid.value);
        } else {
          axios.post(`/users`, formRef.value.model).then((res) => {
            handle_CU({ isShow: false, data: res.data });
          });
          // console.log("新增", uid.value);
        }
      }
    });
  };
  return {
    submit_CU: submit_CU,
  };
}

export default defineComponent({
  name: "User_CU",
  setup() {
    const formRef = ref();

    const state: State = reactive({
      form: {
        username: "",
        password: "",
      },
    });
    // 定義驗證規則
    const formRule = reactive({
      username: [
        { required: true, message: "請輸入用戶名", trigger: "blur" },
        {
          min: 3,
          max: 10,
          message: "用戶名長度在3~10個字符之間",
          trigger: "blur",
        },
      ],
      password: [
        { required: true, message: "請輸入密碼", trigger: "blur" },
        {
          min: 6,
          max: 15,
          message: "密碼長度在6~15個字符之間",
          trigger: "blur",
        },
      ],
    });
    // 對話框數據顯示控制
    const dialogTableVisible: ToRefs = inject("dialogTableVisible");
    const uid: ToRefs = inject("uid");
    const CR: Function = inject("handle_CU");
    const handle_CU = (obj) => {
      formRef.value.resetFields();
      CR(obj);
    };
    // 載入鉤子
    onMounted(() => {
      locadUserData(uid, state);
    });

    return {
      ...toRefs(state),
      formRef,
      formRule,
      dialogTableVisible,
      handle_CU,
      ...useElemet(state, formRef, handle_CU, uid),
    };
  },
});
</script>

<style></style>
