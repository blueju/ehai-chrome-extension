<template>
  <div class="QuickQueryPrice">
    <el-row>
      <el-col>
        <div>取车门店：</div>
        <a-select
          v-model:value="storeId"
          style="width: 100%"
          :show-search="true"
          :filter-option="filterOption"
          @change="handleChange"
          @select="handleChange"
        >
          <a-select-option
            v-for="item in storeOptions"
            :key="item.value"
            :value="item.value"
            :label="item.label"
          >
            {{ item.label }}
          </a-select-option>
        </a-select>
      </el-col>
    </el-row>
    <el-row>
      <el-col>
        <div>取车时间：</div>
        <div
          style="
            display: flex;
            column-gap: 10px;
            justify-content: space-between;
          "
        >
          <el-date-picker
            v-model="pickupDate"
            type="date"
            placeholder="选择取车日期"
            :disabled-date="disabledDate"
            :editable="false"
            :clearable="false"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
          <el-time-select
            v-model="pickupHour"
            start="00:00"
            step="01:00"
            end="23:30"
            :editable="false"
            :min-time="startTime"
            format="HH:mm"
            style="width: 100%"
          />
        </div>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="12">
        <div>用车天数：</div>
        <el-input-number
          v-model="usageDays"
          :min="1"
          :max="60"
          style="width: 100%"
        />
      </el-col>
      <el-col :span="10" :offset="2">
        <el-checkbox v-model="isWednesday">周三下单88折扣</el-checkbox>
        <el-checkbox v-model="isAdd51">总价+51保障</el-checkbox>
      </el-col>
    </el-row>
    <el-row
      :gutter="20"
      justify="start"
      align="middle"
      style="margin-bottom: 0"
    >
      <el-col span="auto">
        <el-button type="primary" @click="confirm">确认</el-button>
      </el-col>
      <el-col span="auto"> 还车时间：{{ returnTime }}</el-col>
    </el-row>
    <el-divider>Result</el-divider>
    <el-row>
      <el-col>
        <a-select
          v-model:value="whichCarLevel"
          placeholder="选择车型"
          style="width: 50%"
          :show-search="false"
          :options="carLevelOptions"
        ></a-select>
      </el-col>
    </el-row>
    <el-row style="margin-bottom: 0">
      <el-col>
        <el-table size="small" :data="filteredStock" :pagination="false" border>
          <el-table-column label="车型" show-overflow-tooltip>
            <template #default="scope">
              {{ scope.row.carTypeItem.name }}
            </template>
          </el-table-column>
          <el-table-column label="总价" show-overflow-tooltip width="50">
            <template #default="scope">
              <div>{{ computeTotalPrice(scope.row) }}</div>
            </template>
          </el-table-column>
          <el-table-column label="从舒适升" show-overflow-tooltip width="100">
            <template #default="scope">
              {{ upgradeFromComfort(scope.row) }}
            </template>
          </el-table-column>
          <el-table-column label="从精英升" show-overflow-tooltip width="100">
            <template #default="scope">
              {{ upgradeFromBetter(scope.row) }}
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
import dayjs, { Dayjs } from "dayjs";

import stockMock from "../mock/stockMock.json";
import queryList from "../http/queryList";
import { isDev } from "../utils/index";

interface ICarLevel {
  // 车型名称
  name: string;
  // 车辆等级ID
  carLevelId: number;
}

interface IStoreOption {
  // 门店ID
  value: number;
  id: number;
  // 门店名称
  name: string;
  label: string;
  // 城市ID
  cityId: string;
  // 门店类型
  // 1：门店
  // 2：送车点
  type: 1 | 2;
}

export default {
  name: "GiveMoneyUpgrade",
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
          name: string;
          carLevelId: number;
        };
      },
      // 门店数据
      store: undefined,
      // 门店库存
      storeStock: [],
      // 门店ID
      storeId: 2596,
      // 取车日期
      pickupDate: dayjs().format("YYYY-MM-DD"),
      // 取车时刻
      pickupHour: dayjs().add(2, "hour").format("HH:00"),
      // 使用天数
      usageDays: 1,
      // 展示库存
      filteredStock: [],

      // 舒适车列表
      comfortCar: [],
      // 舒适车价格集合
      comfortCarPriceSet: new Set(),

      // 精英车列表
      betterCar: [],
      // 精英车价格集合
      betterCarPriceSet: new Set(),
    };
  },
  created() {
    this.queryStoreList();
    this.queryCarLevel();
  },
  computed: {
    filteredStock() {
      return this.storeStock.filter((item) => {
        return item.carTypeItem.carLevelId === this.whichCarLevel;
      });
    },
    //
    startTime() {
      const currentDate = dayjs().format("YYYY-MM-DD");
      // 如果是今天
      if (currentDate === this.pickupDate) {
        const recentlyHour = dayjs()
          .add(1, "hour")
          .startOf("hour")
          .add(1, "hour");
        if (recentlyHour.isAfter(dayjs(), "day")) {
          this.pickupDate = dayjs().add(1, "day").format("YYYY-MM-DD");
        }
        return recentlyHour.format("HH:mm");
      } else {
        return "";
      }
    },
    carLevelOptions() {
      if (Object.keys(this.carLevel).length) {
        return Object.values(this.carLevel).map((item) => {
          return {
            label: item.name,
            value: item.carLevelId,
          };
        });
      } else {
        return [];
      }
    },
    // 取车时间
    pickupTime() {
      const pickupTime = `${this.pickupDate} ${this.pickupHour}`;
      return dayjs(pickupTime).format("YYYY-MM-DD HH:mm");
    },
    // 还车时间
    returnTime() {
      console.log(111);
      const returnTime = dayjs(this.pickupTime)
        .add(this.usageDays, "day")
        .format("YYYY-MM-DD HH:mm");
      return returnTime;
    },
  },
  methods: {
    upgradeFromComfort(record) {
      if (this.comfortCar.length === 0) {
        return "/";
      }
      const totalPrice = record.priceItemList[0].totalPrice;
      const topSuitablePrice = this.findTopSuitablePrice(totalPrice, [
        ...this.comfortCarPriceSet,
      ]);
      // 差价
      const priceDifference = totalPrice - topSuitablePrice;
      // 成本
      const cost = priceDifference + 127 * this.usageDays;
      return `${cost}（+${priceDifference}）`;
    },
    upgradeFromBetter(record) {
      if (this.betterCar.length === 0) {
        return "/";
      }
      const totalPrice = record.priceItemList[0].totalPrice;
      const topSuitablePrice = this.findTopSuitablePrice(totalPrice, [
        ...this.betterCarPriceSet,
      ]);
      // 差价
      const priceDifference = totalPrice - topSuitablePrice;
      const cost = priceDifference + 187 * this.usageDays;
      return `${cost}（+${priceDifference}）`;
    },
    computeEachCarLevelTopPrice(record) {
      debugger;
      // 计算最高的舒适车价格
      const comfortCar = record.filter((item) => {
        return (
          item.carTypeItem.carLevelId === this.carLevel["comfortCar"].carLevelId
        );
      });
      this.comfortCar = comfortCar;
      if (comfortCar.length) {
        const comfortCarPriceSet = new Set();
        comfortCar.forEach((item) => {
          comfortCarPriceSet.add(item.priceItemList[0].totalPrice);
        });
        this.comfortCarPriceSet = comfortCarPriceSet;
      }
      // 计算最高的精英车价格
      const betterCar = record.filter((item) => {
        return (
          item.carTypeItem.carLevelId === this.carLevel["betterCar"].carLevelId
        );
      });
      this.betterCar = betterCar;
      if (betterCar.length) {
        const betterCarPriceSet = new Set();
        betterCar.forEach((item) => {
          betterCarPriceSet.add(item.priceItemList[0].totalPrice);
        });
        this.betterCarPriceSet = betterCarPriceSet;
      }
    },
    computeTotalPrice(record) {
      // 车辆租赁费用及门店服务费
      const rent = record.priceItemList[0].totalPrice;
      // 基础保障服务费
      const basicPrice = 50 * this.usageDays;
      // 整备费
      const preparePrice = 20;
      // 保险保障
      const safeguardPrice = this.isAdd51
        ? 51 * (this.usageDays > 7 ? 7 : this.usageDays)
        : 0;
      // 折扣
      const discount = this.isWednesday ? Math.floor(rent * 0.12) : 0;
      // 最终价
      return rent + basicPrice + preparePrice + safeguardPrice - discount;
    },
    // 控制哪些日期不可选
    disabledDate(time: Date) {
      return dayjs(time).isBefore(dayjs(), "day");
    },
    // 查询门店列表
    queryStoreList() {
      fetch("https://dev.usemock.com/673c8274f92800c9ae107bc0/storeList")
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
      fetch("https://dev.usemock.com/673c8274f92800c9ae107bc0/carLevel")
        .then((res) => res.json())
        .then((resJson) => {
          this.carLevel = resJson;
        });
    },
    // 门店搜索逻辑
    filterOption(input: string, option: IStoreOption) {
      return option.label.indexOf(input) >= 0;
    },
    handleChange(storeId: number, option: IStoreOption) {
      this.storeId = storeId;
      this.store = option;
    },
    // 查找最高合适的价格
    // eg.如果海口新速腾比新能源还贵，总不能让一嗨倒贴钱吧，所以此时要跟第二贵的车价比，再补差价
    findTopSuitablePrice(totalPrice, prices) {
      // 先对价格数组进行排序
      const sortedPrices = [...prices].sort((x, y) => y - x); // 从大到小排序
      // 找到最大值
      const maxPrice = sortedPrices[0];
      // 如果价格 totalPrice 小于最大值
      if (totalPrice < maxPrice) {
        for (let i = 1; i < sortedPrices.length; i++) {
          // 找到第一个小于 totalPrice 的价格
          if (sortedPrices[i] < totalPrice) {
            return sortedPrices[i]; // 返回第一个比 totalPrice 小的价格
          }
        }
        // 如果没有找到比 totalPrice 小的价格，返回 null 或其他值
        return null;
      }
      // 如果 totalPrice 大于等于最大值，返回最大值
      return maxPrice;
    },
    confirm() {
      const params = {
        cityId: this.store.cityId,
        storeId: this.storeId,
        pickupTime: this.pickupTime,
        returnTime: this.returnTime,
      };
      console.log(params);
      if (isDev) {
        // mock
        setTimeout(() => {
          this.storeStock = stockMock;
          this.computeEachCarLevelTopPrice(stockMock);
        }, 500);
      } else {
        // 实际
        queryList(params)
          .then((res) => {
            console.log(res);
            this.storeStock = res.data.result.carTypeList;
            this.computeEachCarLevelTopPrice(res.data.result.carTypeList);
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
