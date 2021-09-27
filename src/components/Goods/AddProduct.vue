<template>
  <el-dialog
    title="添加商品信息"
    v-model="centerDialogVisible"
    width="30%"
    center
    @close="closeDialog(false)"
    :style="{ padding: '0px' }"
    ><el-form
      :model="goodsForm"
      :rules="rules"
      ref="vildateForm"
      label-width="100px"
      :style="{ height: '100%' }"
      ><el-form-item label="商品名稱" prop="title"
        ><el-input v-model="goodsForm.name"></el-input></el-form-item
      ><el-form-item label="商品價格" prop="price"
        ><el-input v-model="goodsForm.price"></el-input></el-form-item
      ><el-form-item label="商品封面" prop="coverImg"
        ><el-upload
          class="avatar-uploader"
          :action="uploadUrl"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :before-upload="handleBeforeUpload"
          ><img class="avatar" v-if="imageUrl" :src="imageUrl" /><i
            class="el-icon-plus avatar-uploader-icon"
            v-else
          ></i></el-upload></el-form-item
      ><el-form-item label="商品詳情" prop="goodsDetail"
        ><QuillEditor theme="snow" ref="editor"></QuillEditor
      ></el-form-item>
    </el-form>
    <template #footer
      ><span class="dialog-footer"
        ><el-button @click="closeDialog(false)">取 消</el-button
        ><el-button type="primary" @click="submitAdd">确 定</el-button></span
      ></template
    ></el-dialog
  >
</template>

<script lang="ts">
// @ts-nocheck

import { reactive, toRefs, ref, defineComponent } from "vue";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import axios from "../../utils/axios";
import { ElMessage } from "element-plus";

const url = import.meta.env.VITE_APP_URL;

//? 添加商品的方法
function useAdd(state, vildateForm, editor, emit) {
  const submitAdd = () => {
    state.goodsForm.goodsDetail =
      editor.value.getText().replace(/(\r\n|\n|\r)/gm, "<br />") !== "<br />"
        ? editor.value.getHTML()
        : "";

    vildateForm.value.validate((valid) => {
      console.log(valid);
      if (valid) {
        const params = {
          name: state.goodsForm.name,
          price: state.goodsForm.price,
          coverImg: state.goodsForm.coverImg,
          goodsDetail: state.goodsForm.goodsDetail,
        };

        axios.post(`${url}/goods`, params).then(
          (res) => {
            vildateForm.value.resetFields(); //? 重置表單
            editor.value.setText(""); //? 清空文字編輯器
            emit("onCloseDialog", false, res.data); //? 觸發關閉事件, 傳送響應資料給父組件
            console.log(res);
          },
          () => {
            console.log("上傳失敗");
          }
        );
      }
    });
  };
  return {
    submitAdd,
  };
}

//? 完成文件上傳的類型校驗
const handleBeforeUpload = (file) => {
  const arr = file.name.split(".")[1];
  if (!["jpg", "jpeg", "png"].includes(arr)) {
    ElMessage.error("請上傳jpg,jpeg,png類型的圖片文件");
    return fals; //? 類型錯誤 返回 false 結束
  }
};

export default defineComponent({
  props: {
    centerDialogVisible: Boolean,
  },
  emits: ["onCloseDialog"],
  components: { QuillEditor },
  setup(props, { emit }) {
    const vildateForm = ref();
    const editor = ref();
    const state = reactive({
      centerDialogVisible: props.centerDialogVisible,
      uploadUrl: import.meta.env.VITE_APP_URL + "/goods/upload",
      imageUrl: "",
      goodsForm: {
        name: "",
        price: 0,
        coverImg: "",
        goodsDetail: "",
      },
    });

    const closeDialog = (visible) => {
      state.imageUrl = "";
      emit("onCloseDialog", visible);
      console.log(state.centerDialogVisible);
    };

    //? 上傳成功以後, 執行的處裡函數
    const handleAvatarSuccess = (res) => {
      state.imageUrl = res.url;
      state.goodsForm.coverImg = res.url;
      console.log(res.url);
    };

    const rules = reactive({
      name: [{ required: true, message: "請輸入商品名稱", trigger: "blur" }],
      price: [{ required: true, message: "請輸入商品價格", trigger: "blur" }],
      coverImg: [
        { required: true, message: "請輸入商品圖片", trigger: "blur" },
      ],
      goodsDetail: [
        { required: true, message: "請輸入商品詳情", trigger: "blur" },
      ],
    });

    return {
      ...toRefs(state),
      closeDialog,
      rules,
      handleAvatarSuccess,
      ...useAdd(state, vildateForm, editor, emit),
      vildateForm,
      editor,
      handleBeforeUpload,
    };
  },
});
</script>

<style>
.ql-container {
  height: auto;
}

.ql-toolbar {
  height: auto;
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
