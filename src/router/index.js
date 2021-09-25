// @ts-nocheck
import { createRouter, createWebHashHistory } from "vue-router";
import Layout from "../components/layout/index.vue";

const routes = [
  {
    path: "/",
    redirect: "/main",
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/Login.vue"),
  },
  {
    path: "/main",
    component: Layout,
    redirect: "/home",
    children: [
      {
        path: "/home",
        name: "Home",
        component: () => import("../views/Home.vue"),
      },
    ],
  },
  {
    path: "/goods",
    name: "商品管理",
    component: Layout,
    children: [
      {
        path: "goods-list",
        name: "商品列表",
        component: () => import("../views/GoodsList.vue"),
      },
      {
        path: "goods-info",
        name: "商品詳情",
        component: () => import("../views/GoodsInfo.vue"),
      },
    ],
  },
  {
    path: "/user",
    name: "用戶管理",
    component: Layout,
    children: [
      {
        path: "user-list",
        name: "用戶列表",
        component: () => import("../views/UserList.vue"),
      },
      {
        path: "user-setting",
        name: "用戶設定",
        component: () => import("../views/UserSetting.vue"),
      },
    ],
  },
  {
    path: "/:catchAll(.*)",
    name: "NotFound",
    component: () => import("../views/NotFound.vue"),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// router.beforeEach((to, from, next) => {
//   // to: 將要訪問的路徑
//   // from: 從哪個路徑跳轉過來
//   // next: 是一個函數, 放行
//   if (to.path === "/login") return next();
  
//   // 獲取 token
//   const tokenStr = window.sessionStorage.getItem("token");
//   if (!tokenStr) return next("/login");
//   next();
// });

export default router;
