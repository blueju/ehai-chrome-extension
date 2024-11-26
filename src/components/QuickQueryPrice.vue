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
          <el-date-picker v-model="pickupDate" type="date" placeholder="选择取车日期"
                          style="width: 100%;"/>
          <el-time-select v-model="pickupHour" start="00:00" step="01:00" end="23:30"
                          clearable format="HH:mm" style="width: 100%;"/>
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
    <el-row :gutter="20" justify="start" align="middle">
      <el-col span="auto">
        <el-button type="primary" @click="confirm">确认</el-button>
      </el-col>
      <el-col span="auto">
        还车时间：{{ returnTime }}
      </el-col>
    </el-row>
    <el-divider/>
    <div v-if="stock.length">
      <el-select v-model:value="filters.carLevel" show-search placeholder="选择车型"
                 style="width: 200px; margin-bottom: 16px" :options="carTypeOption"
                 :filter-option="filterOption"></el-select>

      <el-table :columns="stockTableColumns" size="small" :data="filteredStock" :pagination="false">
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
        <el-table-column label="从舒适升级" width="180" show-overflow-tooltip>
          <template #default="scope">
            <div>{{ computeTotalPrice(scope.row) }}</div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script lang="ts">
import stockMock from './stockMock.json';
import queryList from './queryList';
import dayjs from "dayjs";

export default {
  name: 'QuickQueryPrice',
  data() {
    return {
      storeOptions: [] as Array<{ label: string; value: string }>,
      filters: {
        // 默认新能源
        carLevel: 5,
      },
      isHide: false,
      isWednesday: dayjs().day() === 3 ? true : false,
      isAdd51: true,
      // 门店列表
      storeList: [],
      // 车型列表
      carLevel: {},
      // 门店数据
      store: undefined,
      // 库存
      stock: [],
      // 门店ID
      storeId: 2596,
      // 取车日期
      pickupDate: dayjs().format('YYYY-MM-DD'),
      // 取车时刻
      pickupHour: dayjs().add(2, 'hour').format('HH:00'),
      // 使用天数
      usageDays: 1,
      // 最高的舒适车价格
      topComfortCarPrice: 0,
      // 最高的精英车价格
      topBetterCarPrice: 0,
      // 基础费用（基本保障服务费+车辆整备费）

      // preparePrice: 20,
      // basicServicePrice: 50,
      // 新能源车列表
      filteredStock: [],

      // 舒适车列表
      allComfortCar: [],
      // 舒适车价格集合
      comfortCarPriceSet: new Set(),
      // 精英车列表
      allBetterCar: [],
      // 精英车价格集合
      betterCarPriceSet: new Set(),

      stockTableColumns: [
        {
          title: '车型',
          dataIndex: 'carType',
          key: 'carType',
          customRender: ({_, record}) => {
            return record.carTypeItem.name;
          },
        },
        {
          title: '总价',
          dataIndex: 'totalPrice',
          key: 'totalPrice',
          customCell: (record, rowIndex, column) => {
            const totalPrice = record.priceItemList[0].totalPrice;
            return {
              title: this.isWednesday
                  ? `${totalPrice}-${Math.floor(totalPrice * 0.12)}+${this.basicServicePrice}*${this.usageDays}+${this.preparePrice}` +
                  (this.isAdd51 ? `+${51 * this.usageDays}` : 0)
                  : `${totalPrice}+${this.basicServicePrice}*${this.usageDays}+${this.preparePrice}` +
                  (this.isAdd51 ? `+${51 * this.usageDays}` : 0),
            };
          },
          customRender: ({_, record}) => {
            const totalPrice = record.priceItemList[0].totalPrice;
            return this.isWednesday
                ? // 总价-周三88折折扣+基本保障服务费*使用天数+车辆整备费+51保障
                record.priceItemList[0].totalPrice -
                Math.floor(totalPrice * 0.12) +
                this.basicServicePrice * this.usageDays +
                this.preparePrice +
                (this.isAdd51 ? 51 * this.usageDays : 0)
                : // 总价+基本保障服务费*使用天数+车辆整备费+51保障
                record.priceItemList[0].totalPrice +
                this.basicServicePrice * this.usageDays +
                this.preparePrice +
                (this.isAdd51 ? 51 * this.usageDays : 0);
          },
        },
        {
          title: '从舒适升级',
          dataIndex: 'upgradeFromComfort',
          key: 'upgradeFromComfort',
          customRender: ({_, record}) => {
            if (this.allComfortCar.length === 0) {
              return '/';
            }
            const totalPrice = record.priceItemList[0].totalPrice;
            const topSuitablePrice = this.findTopSuitablePrice(totalPrice, [...this.comfortCarPriceSet]);
            // 差价
            const priceDifference = totalPrice - topSuitablePrice;
            // 成本
            const cost = priceDifference + 127 * this.usageDays;
            return `${cost}（+${priceDifference}）`;
          },
        },
        {
          title: '从精英升级',
          key: 'upgradeFromBetter',
          dataIndex: 'upgradeFromBetter',
          customRender: ({_, record}) => {
            if (this.allBetterCar.length === 0) {
              return '/';
            }
            const totalPrice = record.priceItemList[0].totalPrice;
            const topSuitablePrice = this.findTopSuitablePrice(totalPrice, [...this.betterCarPriceSet]);
            // 差价
            const priceDifference = totalPrice - topSuitablePrice;
            const cost = priceDifference + 187 * this.usageDays;
            return `${cost}（+${priceDifference}）`;
          },
        },
      ],
    };
  },
  created() {
    this.queryStoreList();
    this.queryCarLevel();
  },
  computed: {
    carTypeOption() {
      if (Object.keys(this.carLevel).length) {
        return [
          {
            label: this.carLevel['newEnergy'].name,
            value: this.carLevel['newEnergy'].carLevelId,
          },
          {
            label: this.carLevel['suv'].name,
            value: this.carLevel['suv'].carLevelId,
          },
        ];
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
    disabledDate(current) {
      return current < dayjs();
    },
    disabledHours() {
      const currentHour = dayjs().hour();
      const currentDate = dayjs().format('YYYY-MM-DD');
      // 如果是今天
      if (currentDate === this.pickupDate) {
        const hours = [];
        // 禁用当前时间之前的小时
        for (let i = 0; i < currentHour; i++) {
          hours.push(i);
        }
        // 禁用当前小时内的小时（即当前小时的下一个小时）
        if (currentHour < 23) {
          hours.push(currentHour + 1);
        }
        return hours;
      } else {
        // 如果不是今天，返回空数组
        return [];
      }
    },
    pickupHourChange(e) {
      console.log(e);
    },
    // 查询门店列表
    queryStoreList() {
      fetch('https://dev.usemock.com/673c8274f92800c9ae107bc0/storeList')
          .then((res) => res.json())
          .then((resJson) => {
            console.log(222)
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
    filterOption(input, option) {
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
      debugger
      if (import.meta.env.MODE === 'development') {
        // mock
        setTimeout(() => {
          this.stock = stockMock;
          compute(stockMock);
        }, 0);
      } else {
        // 实际
        queryList(params)
            .then((res) => {
              console.log(res);
              this.stock = res.data.result.carTypeList;
              compute(res.data.result.carTypeList);
            })
            .catch((err) => {
              console.log(err);
            });
      }

      const compute = (stock) => {
        this.filteredStock = stock.filter((item) => {
          return (
              item.carTypeItem.carLevelId === this.carLevel['newEnergy'].carLevelId ||
              item.carTypeItem.carLevelId === this.carLevel['suv'].carLevelId
          );
        });
        // 计算最高的舒适车价格
        const comfortCar = stock.filter((item) => {
          return item.carTypeItem.carLevelId === this.carLevel['comfortCar'].carLevelId;
        });
        this.allComfortCar = comfortCar;
        if (comfortCar.length) {
          const comfortCarPriceSet = new Set();
          comfortCar.forEach((item) => {
            comfortCarPriceSet.add(item.priceItemList[0].totalPrice);
          });
          this.comfortCarPriceSet = comfortCarPriceSet;
          const topComfortCarPrice = Math.max(...comfortCarPriceSet);
          this.topComfortCarPrice = topComfortCarPrice;
        }
        // 计算最高的精英车价格
        const betterCar = stock.filter((item) => {
          return item.carTypeItem.carLevelId === this.carLevel['betterCar'].carLevelId;
        });
        this.allBetterCar = betterCar;
        if (betterCar.length) {
          const betterCarPriceSet = new Set();
          betterCar.forEach((item) => {
            betterCarPriceSet.add(item.priceItemList[0].totalPrice);
          });
          this.betterCarPriceSet = betterCarPriceSet;
          const topBetterCarPriceSet = Math.max(...betterCarPriceSet);
          this.topBetterCarPrice = topBetterCarPriceSet;
        }
      };
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
}
</style>
