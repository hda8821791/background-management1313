<template>
  <el-config-provider :locale="zhCn">
    <!-- 麵包屑 -->
    <el-breadcrumb class="el-breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用戶管理</el-breadcrumb-item>
      <el-breadcrumb-item>用戶列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <!-- 用戶搜索與添加 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="searchContent">
            <template #prefix>
              <i class="el-input__icon el-icon-search"></i>
            </template>
          </el-input>
        </el-col>
        <el-col :span="2">
          <el-button type="danger" size="default" @click="handleSearch"
            >搜索</el-button
          >
        </el-col>
        <el-col :span="4">
          <el-button
            type="primary"
            size="default"
            @click="handle_CU({ isShow: true })"
            >添加用戶</el-button
          >
        </el-col>
      </el-row>
      <!-- 用戶數具展示 -->
      <el-table :data="tabelData" border stripe>
        <el-table-column label="編號" prop="_id"> </el-table-column>
        <el-table-column label="姓名" prop="username"> </el-table-column>
        <el-table-column label="建立日期" prop="createdAt"> </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="handle_CU({ isShow: true, scope })"
              >編輯</el-button
            >
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="handle_D(scope)"
              >刪除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <!-- 分頁控制 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[3, 5, 7, 9]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- CU 用戶對話框 -->
    <User_CU v-if="dialogTableVisible"></User_CU>
  </el-config-provider>
</template>

<script lang="ts">
// @ts-nocheck
import {
  onMounted,
  provide,
  reactive,
  toRefs,
  defineComponent,
} from "@vue/runtime-core";
import axios from "../utils/axios";
import User_CU from "../components/Users/User_CU.vue";
import zhCn from "element-plus/lib/locale/lang/zh-tw";
import { ref } from "vue";
import { ElMessageBox, ElNotification } from "element-plus";

const url = import.meta.env.VITE_APP_URL;

// 載入數據
function useLoadData(state) {
  const query = {
    page: state.currentPage,
    limit: state.pageSize,
    where: null,
  };

  if (state.searchContent !== null) {
    query.where = { username: { $regex: state.searchContent } };
  }

  axios.get(`${url}/users`, { params: { query } }).then((res) => {
    state.tabelData = res.data.data;
    state.total = res.data.total;
    // console.log(res.data);
  });
}

function useElement(state, dialogTableVisible, uid) {
  // 每頁筆數
  const handleSizeChange = (newSize) => {
    state.pageSize = newSize;
    useLoadData(state);
  };
  // 當前頁數
  const handleCurrentChange = (newPage) => {
    state.currentPage = newPage;
    useLoadData(state);
  };
  // 搜索功能
  const handleSearch = () => {
    state.currentPage = 1;
    useLoadData(state);
    console.log(state.currentPage);
  };

  return {
    handleSizeChange,
    handleCurrentChange,
    handleSearch,
  };
}

export default defineComponent({
  components: {
    User_CU,
  },
  setup() {
    const state = reactive({
      tabelData: [],
      total: 0,
      currentPage: 1,
      pageSize: 3,
      searchContent: "",
      uid: "",
    });
    // CR 對話框顯示控制
    const dialogTableVisible = ref(false);
    const uid = ref("");
    // CR 用戶對話框
    interface CR_Config {
      isShow: boolean;
      data?: any;
      scope?: any;
    }
    const handle_CU = (config: CR_Config) => {
      dialogTableVisible.value = config.isShow;
      if (config.data && typeof config.data === "object") {
        useLoadData(state);
        // console.log(typeof config.data);
      }
      if (config.scope) {
        uid.value = config.scope.row._id;
        console.log(uid.value);
      } else {
        uid.value = "";
      }
    };
    // 刪除用戶
    const handle_D = (scope) => {
      const id = scope.row._id;
      const username = scope.row.username;
      ElMessageBox.confirm(`是否刪除用戶${username}`, "刪除確認", {
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          axios.delete(`${url}/users/${id}`).then((res) => {
            if (res.status === 200) {
              ElNotification({
                title: "刪除成功",
                message: `用戶"${username}"已被刪除`,
                type: "success",
              });
              useLoadData(state);
            } else {
              ElNotification({
                title: "刪除失敗",
                message: `用戶"${username}"未被刪除`,
                type: "error",
              });
            }
          });
        })
        .catch(() => {
          ElNotification({
            title: "刪除取消",
            type: "info",
          });
        });
    };
    // 組件通信
    provide("dialogTableVisible", dialogTableVisible);
    provide("uid", uid);
    provide("handle_CU", handle_CU);

    onMounted(() => {
      useLoadData(state);
    });

    return {
      ...toRefs(state),
      ...useElement(state, dialogTableVisible, uid),
      zhCn,
      dialogTableVisible,
      handle_CU,
      handle_D,
    };
  },
});
</script>

<style>
.el-breadcrumb {
  margin-bottom: 15px;
  font-size: 14px;
}
</style>
