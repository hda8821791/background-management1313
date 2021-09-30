<template>
  <el-container class="el-container">
    <el-header class="el-header">
      <div class="header-div">
        <router-link to="/" @click="clearPath">
          <img src="../../assets/logo.png" alt="logo" />
          <span> 後台管理系統 </span>
        </router-link>
        <el-button
          style="float: right; margin-top: 0.5%"
          type="info"
          size="default"
          @click="logout"
          >退出</el-button
        >
      </div>
    </el-header>
    <el-container>
      <el-aside class="el-aside" :width="isCollapse ? '60px' : '200px'">
        <div class="toggle-button" @click="openCollapse">|||</div>
        <el-menu
          active-text-color="#ffd04b"
          background-color="#545c64"
          class="el-menu-vertical-demo"
          :default-active="activePath"
          :open="handleOpen"
          text-color="#fff"
          :collapse="isCollapse"
          :collapse-transition="false"
          router
        >
          <!-- 一級菜單 -->
          <el-sub-menu
            v-for="(item, index) in menuData"
            :index="index"
            :key="index"
          >
            <!-- 一級菜單的模板區域 -->
            <template #title>
              <i :class="item.icon"></i>
              <span>{{ item.title }}</span>
            </template>
            <el-menu-item
              v-for="(subItem, subIndex) in item.children"
              :index="subItem.path"
              :key="subIndex"
              @click="saveNavPath(subItem.path)"
              >{{ subItem.title }}</el-menu-item
            >
          </el-sub-menu>
        </el-menu>
      </el-aside>
      <el-main class="el-main">
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts">
// @ts-nocheck
import { onMounted, reactive, toRefs, defineComponent } from "vue";
import axios from "../../utils/axios";
import router from "../../router";
const url = import.meta.env.VITE_APP_URL;
// 載入導航欄
async function useLoadMenuData(state) {
  await axios.get(`/goods/menu`).then((res) => {
    state.menuData = res.data.menu;
  });
}
export default defineComponent({
  setup() {
    const state = reactive({
      menuData: [],
      isCollapse: false,
      activePath: window.sessionStorage.getItem("activePath") || "",
    });
    // 導航欄顯示切換
    const openCollapse = () => {
      state.isCollapse = !state.isCollapse;
    };
    // 用戶登出
    const logout = () => {
      window.sessionStorage.clear();
      router.push("/login");
    };
    // 保存激活的路徑
    const saveNavPath = (activePath) => {
      // 將激活路徑存入 sessionStorage, 刷新頁面時保持原激活路徑
      window.sessionStorage.setItem("activePath", activePath);
      state.activePath = activePath;
    };
    const handleOpen = (key: any, keyPath: any) => {
      console.log("key", key);
      console.log("keyPath", keyPath);
    };
    const clearPath = () => {
      window.sessionStorage.setItem("activePath", "");
      state.activePath = "";
    };
    onMounted(() => {
      useLoadMenuData(state);
      // console.log(state.activePath);
    });
    return {
      ...toRefs(state),
      openCollapse,
      logout,
      saveNavPath,
      handleOpen,
      clearPath,
    };
  },
});
</script>

<style lang="scss" scoped>
$color: rgb(233, 147, 147);

.el-container {
  height: 1000px;
}
.header-div img {
  height: 50px;
  vertical-align: middle;
  margin-right: 10px;
}
.el-header {
  background-color: #373d41;
  color: #fff;
  font-size: 20px;
}
.el-aside {
  background-color: #333744;
}
.el-main {
  background-color: #eaedf1;
}
.toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
a {
  text-decoration: none;
  color: #fff;
}
@media screen and (max-width: 400px) {
 
}
</style>
