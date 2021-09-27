<template>
  <el-dialog
    title="添加商品信息"
    v-model="editDialogVisible"
    width="30%"
    center
    @close="closeDialog(false)"
    :style="{ padding: '0px' }"
  >
    <el-form
      :model="goodsForm"
      :rules="rules"
      ref="vildateForm"
      label-width="100px"
      :style="{ height: '100%' }"
    >
      <el-form-item label="商品名稱" prop="name">
        <el-input v-model="goodsForm.name"></el-input>
      </el-form-item>

      <el-form-item label="商品價格" prop="price">
        <el-input v-model="goodsForm.price"></el-input>
      </el-form-item>

      <el-form-item label="商品封面" prop="coverImg">
        <el-upload
          class="avatar-uploader"
          :action="uploadUrl"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :before-upload="handleBeforeUpload"
        >
          <img v-if="imageUrl" :src="imageUrl" class="avatar" />
          <i v-else class="el-icon-plus avatar-uploader-icon"></i>
        </el-upload>
      </el-form-item>

      <el-form-item label="商品詳情" prop="goodsDetail">
        <QuillEditor theme="snow" ref="editor"></QuillEditor>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog(false)">取 消</el-button>
        <el-button type="primary" @click="submitEdit">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
// @ts-nocheck

import { reactive, toRefs, ref, defineComponent } from "vue";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import axios from "../../utils/axios";
import { ElMessage } from "element-plus";
import { onMounted } from "@vue/runtime-core";

const url = import.meta.env.VITE_APP_URL;

//? 編輯商品的方法
function useEdit(state, vildateForm, editor, emit) {
  const submitEdit = () => {
    state.goodsForm.goodsDetail =
      editor.value.getText().replace(/(\r\n|\n|\r)/gm, "<br />") !== "<br />"
        ? editor.value.getHTML()
        : "";
    vildateForm.value.validate((valid) => {
      if (valid) {
        const data = {
          name: state.goodsForm.name,
          price: state.goodsForm.price,
          coverImg: state.goodsForm.coverImg,
          goodsDetail: state.goodsForm.goodsDetail,
        };

        axios.put(`/goods/${state.goodsId}`, data).then((res) => {
          vildateForm.value.resetFields(); //? 重置表單
          editor.value.setText(""); //? 清空文字編輯器
          emit("onCloseDialog", false, res.data); //? 觸發關閉事件, 傳送響應資料給父組件
        });
      }
    });
  };
  return {
    submitEdit,
  };
}

//? 完成文件上傳的類型校驗
const handleBeforeUpload = (file) => {
  const arr = file.name.split(".")[1];
  if (!["jpg", "jpeg", "png"].includes(arr)) {
    ElMessage.error("請上傳jpg,jpeg,png類型的圖片文件");
    return false; //? 類型錯誤 返回 false 結束
  }
};

//? 根據商品編號, 查詢要編輯的數據
function useLoadEditData(state, editor) {
  axios.get(`/goods/${state.goodsId}`).then((res) => {
    state.goodsForm = res.data;
    state.imageUrl = res.data.coverImg;
    editor.value.setHTML(res.data.goodsDetail);
  });
}

export default defineComponent({
  props: {
    editDialogVisible: Boolean,
    goodsId: Number,
  },
  emits: ["onCloseDialog"],
  components: { QuillEditor },
  setup(props, { emit }) {
    const vildateForm = ref();
    const editor = ref();
    const state = reactive({
      editDialogVisible: props.editDialogVisible,
      goodsId: props.goodsId,
      uploadUrl: import.meta.env.VITE_APP_URL + "/goods/upload",
      imageUrl: "",
      goodsForm: {
        name: "",
        price: 0,
        coverImg: "",
        goodsDetail: "",
      },
    });

    //? 關閉對話框事件
    const closeDialog = (visible) => {
      state.imageUrl = "";
      emit("onCloseDialog", visible);
      console.log(state.editDialogVisible);
    };

    //? 上傳成功以後, 執行的處裡函數
    const handleAvatarSuccess = (res) => {
      state.imageUrl = res.url;
      state.goodsForm.coverImg = res.url;
    };

    //? 校驗規則
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

    //? 加載鉤子
    onMounted(() => {
      useLoadEditData(state, editor);
      console.log("goodsId=", state.goodsId);
    });

    return {
      ...toRefs(state),
      closeDialog,
      rules,
      handleAvatarSuccess,
      ...useEdit(state, vildateForm, editor, emit),
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

.el-upload img {
  width: auto;
}
</style>
