<template>
  <el-card shadow="never" :body-style="{ padding: '20px' }">
    <template #header>
      <div class="card-header">
        <img src="../assets/logo.png" :style="{ width: '50px' }" />
        <span>商品列表</span>
      </div>
    </template>

    <el-row :gutter="10">
      <el-col :span="4" :offset="0">
        <el-input
          placeholder="請輸入商品名稱"
          v-model="searchContent"
        ></el-input>
      </el-col>
      <el-col :span="4" :offset="0">
        <el-button type="primary" size="default" @click="handleSearch"
          >搜索</el-button
        >
        <el-button type="primary" size="default" @click="addGoodsInfo()"
          >添加</el-button
        >
      </el-col>
    </el-row>

    <el-table :data="tableData" style="width: 100%">
      <el-table-column label="創建日期" width="250">
        <template #default="scope">
          <span style="margin-left: 10px; width: 300px">{{
            scope.row.createdAt
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品名稱" width="180">
        <template #default="scope">
          <el-popover effect="light" trigger="hover" placement="top">
            <template #default>
              <p>商品名稱: {{ scope.row.name }}</p>
            </template>
            <template #reference>
              <div class="name-wrapper">
                <el-tag size="medium">{{ scope.row.name }}</el-tag>
              </div>
            </template>
          </el-popover>
        </template>
      </el-table-column>

      <el-table-column label="商品價格" width="200">
        <template #default="scope">
          <span style="margin-left: 10px">{{ scope.row.price }}</span>
        </template>
      </el-table-column>

      <el-table-column label="商品圖片" width="200">
        <template #default="scope">
          <img :src="scope.row.coverImg" :style="{ width: '120px' }" />
        </template>
      </el-table-column>

      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="mini" @click="handleEdit(scope.$index, scope.row)"
            >编辑</el-button
          >
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(scope.$index, scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
      layout="prev, pager, next"
      :total="total"
      :page-size="pageSize"
      :current-page="currentPage"
      @current-change="changePage"
    >
    </el-pagination>
  </el-card>

  <!-- 新增商品 -->
  <AddProduct
    v-if="centerDialogVisible === true"
    :centerDialogVisible="centerDialogVisible"
    @onCloseDialog="closeDialogVisible"
  ></AddProduct>

  <!-- 編輯商品 -->
  <EditProduct
    v-if="editDialogVisible === true"
    :editDialogVisible="editDialogVisible"
    :goodsId="pId"
    @onCloseDialog="closeDialogVisible"
  ></EditProduct>
</template>

<script lang="ts">
// @ts-nocheck
import {
  onMounted,
  reactive,
  toRefs,
  defineComponent,
} from "@vue/runtime-core";
import axios from "../utils/axios";
import AddProduct from "../components/Goods/AddProduct.vue";
import EditProduct from "../components/Goods/EditProduct.vue";
import { ElMessageBox, ElNotification } from "element-plus";

const url = import.meta.env.VITE_APP_URL;

//? 載入商品列表
function loadData(state) {
  const query = {
    page: state.currentPage,
    limit: state.pageSize,
    where: null,
  };
  if (state.searchContent !== null) {
    query.where = { name: { $regex: state.searchContent } };
  }

  axios
    .get(`/goods`, {
      params: {
        query,
      },
    })
    .then((res) => {
      state.tableData = res.data.data;
      state.total = res.data.total;
      console.log(res);
    });
}

//? 編輯商品信息
function useEdit(state) {
  const handleEdit = (index, row) => {
    state.editDialogVisible = true;
    state.pId = row._id;
    // console.log(row._id);
  };
  return {
    handleEdit,
  };
}

//? 搜尋商品數據
function useHandleSearch(state) {
  const handleSearch = () => {
    state.currentPage = 1;
    const query = {
      page: state.currentPage,
      limit: state.pageSize,
      where: null,
    };
    if (state.searchContent !== null) {
      query.where = { name: { $regex: state.searchContent } };
    }

    axios
      .get(`/goods`, {
        params: {
          query,
        },
      })
      .then((res) => {
        state.tableData = res.data.data;
        state.total = res.data.total;
      });
  };
  return {
    handleSearch,
  };
}

//? 刪除商品數據
function useDelete(state) {
  const handleDelete = (index, row) => {
    ElMessageBox.confirm("確定要刪除嗎?", "提示", {
      confirmButtonText: "確定",
      cancelButtonText: "取消",
      type: "warning",
      callback: (action) => {
        if (action === "confirm") {
          axios.delete(`/goods/${row._id}`).then((res) => {
            if (res.statusText === "OK") {
              ElNotification({
                title: "成功",
                message: "刪除成功",
                type: "success",
                duration: 2000,
              });
              loadData(state);
            } else {
              ElNotification({
                title: "失敗",
                message: "刪除失敗",
                type: "error",
                duration: 2000,
              });
            }
          });
        }
      },
    });
  };
  return { handleDelete };
}

export default defineComponent({
  components: { AddProduct, EditProduct },
  setup() {
    const state = reactive({
      tableData: [], //? 商品表單資料
      centerDialogVisible: false, //? 添加對話框的顯示控制
      editDialogVisible: false, //? 編輯對話框的顯示控制
      total: 0,
      currentPage: 1,
      pageSize: 3,
      searchContent: "", //? 搜索條件
      pId: 0, //? 要編輯的商品編號
    });

    onMounted(() => {
      loadData(state);
    });

    //? 新增商品信息
    const addGoodsInfo = () => {
      state.centerDialogVisible = true;
    };

    //? 關閉對話框事件
    const closeDialogVisible = (visible, data) => {
      state.centerDialogVisible = visible;
      state.editDialogVisible = visible;
      if (data !== undefined) {
        loadData(state);
      }
    };

    //? 切換當前頁數
    const changePage = (val) => {
      state.currentPage = val;
      loadData(state);
    };

    return {
      ...toRefs(state),
      ...useDelete(state),
      ...useHandleSearch(state),
      ...useEdit(state),
      addGoodsInfo,
      closeDialogVisible,
      changePage,
    };
  },
});
</script>
