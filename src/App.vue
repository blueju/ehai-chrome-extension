<template>
  <el-config-provider :locale="locale">
    <el-tabs v-model="activeName" style="height: 100%">
      <el-tab-pane name="1" label="门店库存">
        <StoreStock/>
      </el-tab-pane>
      <el-tab-pane name="2" label="城市库存" style="height: 100%">
        <CityStock/>
      </el-tab-pane>
    </el-tabs>
  </el-config-provider>
</template>

<script>
import zhCn from 'element-plus/es/locale/lang/zh-cn'

import StoreStock from "@/components/StoreStock.vue";
import CityStock from "@/components/CityStock.vue";

export default {
  name: 'App',
  components: {
    StoreStock,
    CityStock,
  },
  data() {
    return {
      locale: zhCn,
      activeName: '2',
    };
  },
};
</script>

<style lang="less" scoped>
:global(.ehai-helper) {
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  //background-color: rgba(178, 94, 239, 0.5);
  background: #ffffff;
  z-index: 999;
  padding: 10px;
}

// 隐藏禁用了的时间选择项
:global(.el-select-dropdown__item.is-disabled) {
  display: none;
}

:deep(.el-tabs__content) {
  height: 100%;
  overflow-y: auto;
}

:global(body) {
  overflow: hidden;
}
</style>
