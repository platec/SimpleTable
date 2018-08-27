# SimpleTable
vue table component
```vue
<template>
  <div>
    <div style="width:600px">
      <simple-table :data.sync="tableData">
        <el-table-column
          prop="date"
          label="日期"
          width="180">
        </el-table-column>
        <el-table-column
          prop="name"
          label="姓名"
          width="180">
        </el-table-column>
        <el-table-column
          prop="address"
          label="地址">
        </el-table-column>      
      </simple-table>
    </div>
  </div>
</template>

<script>

export default {
  created() {
  },
  data() {
    return {
      tableData: [{
        date: '2016-05-02',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '2016-05-04',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1517 弄'
      }, {
        date: '2016-05-01',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1519 弄'
      }, {
        date: '2016-05-03',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1516 弄'
      }]
    };
  },
  methods: {
  }
};
</script>
```
```javascript
import SimpleTable from 'SimpleTable';

Vue.use(SimpleTable);
```

![edit-sample](./screenshot/edit.png)

### 参数说明

兼容element-ui Table的参数

### Table Attributes

| 参数      | 说明                 | 类型    | 可选值 | 默认值 |
| --------- | -------------------- | ------- | ------ | ------ |
| addable   | 菜单显示“插入行”     | boolean |        | true   |
| deletable | 菜单显示“删除当前行” | boolean |        | true   |

**element-ui table的属性可另加**

### Table-column Attributes

| 参数       | 说明                       | 类型   | 可选值 | 默认值 |
| ---------- | -------------------------- | ------ | ------ | ------ |
| class-name | 包含”editable“为可编辑的列 | string |        |        |

**element-ui table-column的属性可另加**

### Table Events

| 事件名     | 说明                  | 参数                     |
| ---------- | --------------------- | ------------------------ |
| delete-row | 删除行，resolve后执行 | row, resolve             |
| cell-click | 点击单元格            | row, column, cell, event |
| add-row    | 添加行                |                          |
| save       | 保存，resolve后执行   | data, resolve            |

**element-ui table组件的事件可另加**

