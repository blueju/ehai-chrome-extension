<template>
  <div class="QuickQueryPrice">
    <el-row>
      <el-col>
        <div>取车门店：</div>
        <a-select
            v-model:value="storeId"
            style="width: 100%"
            :filter-option="filterOption"
            @change="handleChange"
            @select="handleChange"
        >
          <a-select-option v-for="item in storeOptions" :key="item.value" :value="item.value">
            {{ item.label }}
          </a-select-option>
        </a-select>
      </el-col>
    </el-row>
    <el-row>
      <el-col>
        <div>取车时间：</div>
        <div style="display: flex; column-gap: 10px;justify-content: space-between;">
          <el-date-picker v-model="pickupDate"
                          type="date"
                          placeholder="选择取车日期"
                          :disabled-date="disabledDate"
                          style="width: 100%;"/>
          <el-time-select v-model="pickupHour"
                          start="00:00"
                          step="01:00"
                          end="23:30"
                          clearable
                          :min-time="startTime"
                          format="HH:mm"
                          style="width: 100%;"/>
        </div>
      </el-col>
    </el-row>
    <el-row gutter="40">
      <el-col :span="12">
        <div>取车时间：</div>
        <el-input-number v-model="usageDays" :min="1" :max="60" style="width: 100%"/>
      </el-col>
      <el-col :span="12">
        <el-checkbox v-model:checked="isWednesday">周三下单88折扣</el-checkbox>
        <el-checkbox v-model:checked="isAdd51">总价+51保障</el-checkbox>
      </el-col>
    </el-row>
    <el-row :gutter="20" justify="start" align="middle" style="margin-bottom: 0">
      <el-col span="auto">
        <el-button type="primary" @click="confirm">确认</el-button>
      </el-col>
      <el-col span="auto">
        还车时间：{{ returnTime }}
      </el-col>
    </el-row>
    <el-divider/>
    <el-row>
      <el-col>
        <a-select v-model:value="whichCarLevel"
                  show-search
                  placeholder="选择车型"
                  style="width: 50%"
                  :options="carLevelOptions"
                  :filter-option="filterOption"></a-select>
      </el-col>
    </el-row>
    <el-row>
      <el-col>
        <el-table size="small" :data="filteredStock" :pagination="false" border>
          <el-table-column label="车型" width="180" show-overflow-tooltip>
            <template #default="scope">
              {{ scope.row.carTypeItem.name }}
            </template>
          </el-table-column>
          <el-table-column label="总价" width="180" show-overflow-tooltip>
            <template #default="scope">
              <div>{{ computeTotalPrice(scope.row) }}</div>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
import dayjs, {Dayjs} from "dayjs";

import stockMock from './stockMock.json';
import queryList from './queryList';
import {isDev} from '../utils/index'

export default {
  name: 'StoreStock',
  data() {
    return {
      storeOptions: [] as Array<{ label: string; value: string }>,
      //
      whichCarLevel: 5,
      isWednesday: dayjs().day() === 3 ? true : false,
      isAdd51: true,
      // 门店列表
      storeList: [],
      // 车型列表
      carLevel: {} as {
        [key: string]: {
          name: string,
          carLevel: number
        }
      },
      // 门店数据
      store: undefined,
      // 门店库存
      storeStock: [],
      // 门店ID
      storeId: 2596,
      // 取车日期
      pickupDate: dayjs().format('YYYY-MM-DD'),
      // 取车时刻
      pickupHour: dayjs().add(2, 'hour').format('HH:00'),
      // 使用天数
      usageDays: 1,
      // 展示库存
      filteredStock: [],
    };
  },
  created() {
    this.queryStoreList();
    this.queryCarLevel();
  },
  computed: {
    filteredStock() {
      return this.storeStock.filter(item => {
        return item.carTypeItem.carLevelId === this.whichCarLevel
      })
    },
    startTime() {
      const currentDate = dayjs().format('YYYY-MM-DD');
      // 如果是今天
      if (currentDate === this.pickupDate) {
        const recentlyHour = dayjs().add(1, 'hour').startOf('hour').add(1, 'hour')
        if (recentlyHour.isAfter(dayjs(), 'day')) {
          this.pickupDate = dayjs().add(1, 'day').format('YYYY-MM-DD')
        }
        return recentlyHour.format('HH:mm')
      } else {
        return ''
      }
    },
    carLevelOptions() {
      if (Object.keys(this.carLevel).length) {
        return Object.values(this.carLevel).map((item: { name: string, carLevelId: number }) => {
          return {
            label: item.name,
            value: item.carLevelId
          }
        })
      } else {
        return [];
      }
    },
    // 取车时间
    pickupTime() {
      const pickupTime = `${this.pickupDate} ${this.pickupHour}`;
      return dayjs(pickupTime).format('YYYY-MM-DD HH:mm');
    },
    // 还车时间
    returnTime() {
      const returnTime = dayjs(this.pickupTime).add(this.usageDays, 'day').format('YYYY-MM-DD HH:mm');
      return returnTime;
    },
  },
  methods: {
    computeTotalPrice(record) {
      // 车辆租赁费用及门店服务费
      const rent = record.priceItemList[0].totalPrice;
      // 基础保障服务费
      const basicPrice = 50 * this.usageDays
      // 整备费
      const preparePrice = 20
      // 保险保障
      const safeguardPrice = this.isAdd51
          ? 51 * (this.usageDays > 7 ? 7 : this.usageDays)
          : 0
      // 折扣
      const discount = this.isWednesday ? Math.floor(rent * 0.12) : 0
      // 最终价
      return rent + basicPrice + preparePrice + safeguardPrice - discount
    },
    disabledDate(time: Date) {
      return dayjs(time).isBefore(dayjs(), 'day')
    },
    // 查询门店列表
    queryStoreList() {
      fetch('https://dev.usemock.com/673c8274f92800c9ae107bc0/storeList')
          .then((res) => res.json())
          .then((resJson) => {
            this.storeList = resJson;
            this.storeOptions = resJson.map((item) => {
              return {
                ...item,
                label: item.name,
                value: item.id,
              };
            });
            const store = resJson.find((item) => {
              return item.id === 2596;
            });
            this.store = store;
          });
    },
    // 查询车型列表
    queryCarLevel() {
      fetch('https://dev.usemock.com/673c8274f92800c9ae107bc0/carLevel')
          .then((res) => res.json())
          .then((resJson) => {
            this.carLevel = resJson;
          });
    },
    filterOption(input: string, option: { label: string; value: string }) {
      return option.label.indexOf(input) >= 0;
    },
    handleChange(storeId, option) {
      this.storeId = storeId;
      this.store = option;
    },
    confirm() {
      const params = {
        cityId: this.store.cityId,
        storeId: this.storeId,
        pickupTime: this.pickupTime,
        returnTime: this.returnTime,
      };
      console.log(params)
      if (isDev) {
        // mock
        setTimeout(() => {
          this.storeStock = stockMock;
        }, 500);
      } else {
        // 实际
        queryList(params)
            .then((res) => {
              console.log(res);
              this.storeStock = res.data.result.carTypeList;
            })
            .catch((err) => {
              console.log(err);
            });
      }
    },
  },
};
</script>

<style lang="less" scoped>
.QuickQueryPrice {
  position: relative;

  :deep(.el-row) {
    margin-bottom: 10px;
  }

  :deep(.el-divider) {
    margin: 20px 0;
  }
}
</style>
