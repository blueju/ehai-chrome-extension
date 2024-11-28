<template>
  <div class="CityStock">
    <el-row>
      <el-col>
        <div>城市：</div>
        <a-select
          v-model:value="cityId"
          show-search
          style="width: 200px"
          :options="cityOptions"
          :filter-option="filterOption"
          @change="handleChange"
          @select="handleChange"
        ></a-select>
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
    <el-row gutter="40">
      <el-col :span="12">
        <div>用车天数：</div>
        <el-input-number
          v-model="usageDays"
          :min="1"
          :max="60"
          style="width: 100%"
        />
      </el-col>
      <el-col :span="12">
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
    <el-row style="margin-bottom: 0">
      <el-col>
        <el-row>
          <el-input
            v-model="searchInput"
            style="width: 50%; margin-bottom: 10px; margin-right: 10px"
            placeholder="输入车型"
          ></el-input>
          <el-button @click="startFilter">筛选</el-button>
        </el-row>
        <el-table
          size="small"
          :data="filterCityStock"
          :pagination="false"
          border
        >
          <el-table-column label="车型" show-overflow-tooltip>
            <template #default="scope">
              {{ scope.row.carName }}
            </template>
          </el-table-column>
          <el-table-column label="门店" show-overflow-tooltip>
            <template #default="scope">
              {{ scope.row.storeName }}
            </template>
          </el-table-column>
          <el-table-column label="总价" show-overflow-tooltip>
            <template #default="scope">
              <div>{{ computeTotalPrice(scope.row.totalPrice) }}</div>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
import cityStockMock from "../mock/cityStockMock.json";
import queryList from "../http/queryList.ts";
import dayjs from "dayjs";
import { isDev } from "@/utils";

interface IStoreStock {
  cityId: number;
  storeId: number;
  storeName: string;
  storeStock: {};
}

export default {
  name: "CityStock",
  data() {
    return {
      isWednesday: dayjs().day() === 3 ? true : false,
      isAdd51: true,
      // 城市ID与城市名映射集合
      cityMap: new Map(),
      // 门店ID与门店名映射集合
      storeMap: new Map(),
      // 门店列表
      cityList: [],
      // 车型列表
      carLevel: [],
      // 门店数据
      city: undefined,
      // 整个城市的车辆库存
      cityStock: [] as IStoreStock["storeStock"][],
      searchInput: "",
      // filterCityStock: [],
      // 库存
      stock: [],
      // 城市ID（默认深圳）
      cityId: 21,
      // 取车日期
      pickupDate: dayjs().format("YYYY-MM-DD"),
      // 取车时刻
      pickupHour: dayjs().add(2, "hour").format("HH:00"),
      // 使用天数
      usageDays: 1,
      // 最高的舒适车价格
      comfortCarTopPrice: 0,
      // 最高的精英车价格
      betterCarTopPrice: 0,
      filterCityStock: [],
    };
  },
  mounted() {
    this.queryCityList();
    this.queryCarLevel();
    this.queryStoreList();
  },
  computed: {
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
    // 城市选项
    cityOptions() {
      return this.cityList.map((item) => {
        return {
          ...item,
          label: item.city,
          value: item.cityId,
        };
      });
    },
    // 取车时间
    pickupTime() {
      const pickupTime = `${this.pickupDate} ${this.pickupHour}`;
      return dayjs(pickupTime).format("YYYY-MM-DD HH:mm");
    },
    // 还车时间
    returnTime() {
      const returnTime = dayjs(this.pickupTime)
        .add(this.usageDays, "day")
        .format("YYYY-MM-DD HH:mm");
      return returnTime;
    },
  },
  methods: {
    startFilter() {
      if (this.searchInput.trim().length) {
        this.filterCityStock = this.cityStock.filter((item) => {
          return item.carName.includes(this.searchInput);
        });
      } else {
        this.filterCityStock = this.cityStock;
      }
    },
    computeTotalPrice(totalPrice) {
      // 车辆租赁费用及门店服务费
      const rent = totalPrice;
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
        .then((storeList) => {
          this.storeList = storeList;
          storeList.forEach((store) => {
            if (store.id === 2596) {
              this.store = store;
            }
            this.storeMap.set(store.id, store.name);
          });
        });
    },
    // 查询城市列表
    queryCityList() {
      fetch("https://dev.usemock.com/673c8274f92800c9ae107bc0/cityList")
        .then((res) => res.json())
        .then((cityList) => {
          this.cityList = cityList;
          cityList.forEach((city) => {
            if (city.id === 21) {
              // 21 深圳
              this.city = city;
            }
            this.cityMap.set(city.id, city.city);
          });
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
    filterOption(input, option) {
      return option.label.indexOf(input) >= 0;
    },
    handleChange(cityId, option) {
      this.cityId = cityId;
      this.city = option;
    },
    confirm() {
      // 城市门店（仅看门店）
      const cityStoreList = this.storeList.filter((item) => {
        return item.cityId === this.cityId && item.type === 1;
      });
      console.log(cityStoreList);
      const handleCityStock = (cityStock) => {
        const handledCityStock = [];
        cityStock.forEach((store) => {
          const carTypeList = store.storeStock.carTypeList;
          carTypeList.forEach((item) => {
            handledCityStock.push({
              carId: item.videoDto.carTypeId,
              carName: item.carTypeItem.name,
              totalPrice: item.priceItemList[0].totalPrice,
              storeId: store.storeId,
              storeName: store.storeName,
            });
          });
        });
        console.log("cityStock", handledCityStock);
        this.cityStock = handledCityStock;
      };
      if (isDev) {
        // mock
        setTimeout(() => {
          handleCityStock(cityStockMock);
          this.startFilter();
        }, 0);
      } else {
        function getRandomDelay() {
          // 返回 1 到 3 秒之间的随机延迟（以毫秒为单位）
          return Math.floor(Math.random() * 3000);
        }

        const requestQueue = cityStoreList.map((item) => {
          const params = {
            cityId: this.cityId,
            storeId: item.id,
            pickupTime: this.pickupTime,
            returnTime: this.returnTime,
          };
          return new Promise(async (resolve, reject) => {
            try {
              setTimeout(async () => {
                const response = await queryList(params);
                resolve(response);
              }, getRandomDelay());
            } catch (error) {
              reject(error);
            }
          });
        });

        // 实际
        Promise.allSettled(requestQueue).then((results) => {
          const cityStock = results
            .filter((item) => {
              return item.status === "fulfilled";
            })
            .map((item) => {
              return item.value;
            })
            .map((item) => {
              const storeId = item.config.param.pickupDto.storeId;
              return {
                cityId: this.cityId,
                cityName: this.cityMap.get(this.cityId),
                storeId,
                storeName: this.storeMap.get(storeId),
                storeStock: item.data.result,
              };
            });
          handleCityStock(cityStock);
          this.startFilter();
        });
      }
    },
  },
};
</script>

<style lang="less" scoped>
.CityStock {
  position: relative;

  :deep(.el-row) {
    margin-bottom: 10px;
  }

  :deep(.el-divider) {
    margin: 20px 0;
  }
}
</style>
