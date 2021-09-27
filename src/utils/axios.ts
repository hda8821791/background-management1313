// @ts-nocheck
import Axios from "axios";
import { ElMessage } from "element-plus";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
// import { config } from "process";

const axios = Axios.create({
  timeout: 10000,
  baseURL: "https://background-management-db1313.herokuapp.com",
});

axios.interceptors.request.use(
  (config) => {
    // 方送請求時, 攜帶 token
    config.headers.Authorization = window.sessionStorage.getItem("token");
    NProgress.start();
    return config;
  },
  (err) => {
    return Promise.reject(err);
  }
);

axios.interceptors.response.use(
  (res) => {
    NProgress.done();
    return res;
  },
  (err) => {
    if (err.response && err.response.data) {
      const code = err.response.status;
      const msg = err.response.data.message;
      ElMessage.error(`Code: ${code}, Message: ${msg}`);
      console.log(`[Axios Error]`, err.response);
    } else {
      ElMessage.error(`${err}`);
    }

    return Promise.reject(err);
  }
);

export default axios;
