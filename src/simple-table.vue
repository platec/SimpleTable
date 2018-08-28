<template>
  <div>
    <el-table ref="table"
      :border="border"
      @cell-dblclick="handleModify"
      @row-contextmenu="handleMenu"
      @cell-click="handleClick"
      @sort-change="handleSortChange"
      :header-row-class-name="headerRowClassName"
      :stripe="stripe"
      :size="size"
      :data="tableData"
      :check-before-edit="checkBeforeEdit"
      style="width: 100%;">
      <slot></slot>
    </el-table>
    
    <div class="inputHolder" v-clickoutside="outsideInputHolder" v-show="inputHolderVisible">
      <textarea v-model="inputValue"></textarea>
    </div>

    <div class="contextMenu" v-clickoutside="outsideMenu" v-show="contextMenuVisible">
      <table>
        <colgroup>
          <col style="width:215px;">
        </colgroup>
        <thead></thead>
        <tbody>
          <tr @click="addNewRow" v-if="addable">
            <td style="height:22px;">
              <div class="itemWrapper">插入行</div>
            </td>
          </tr>
          <tr @click="deleteCurrentRow" v-if="deletable">
            <td style="height:22px;">
              <div class="itemWrapper">删除当前行</div>
            </td>
          </tr>
          <tr @click="handleUndo" :class="{disabled: historyStore.length === 0}">
            <td style="height:22px;">
              <div class="itemWrapper">撤销</div>
            </td>
          </tr>
          <tr @click="handleSave" :class="{disabled: historyStore.length === 0}">
            <td style="height:22px;">
              <div class="itemWrapper">保存</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>    
  </div>
</template>

<script>
  import { nodeOffset, orderBy } from './util';
  import clickoutside from './clickoutside';

  export default {
    name: 'SimpleTable',
    directives: {
      clickoutside
    },
    props: {
      data: Array,
      size: {
        type: String,
        default: 'mini'
      },
      addable: {
        default: false
      },
      deletable: {
        default: false
      },
      stripe: {
        default: false
      },
      headerRowClassName: String,
      checkBeforeEdit: {
        type: Function,
        default: () => true
      },
      border: {
        type: Boolean,
        default: false
      }
    },
    mounted() {
      window.addEventListener('scroll', e => {
        this.outsideInputHolder();
        this.outsideMenu();
      });
    },
    data() {
      var tableData = JSON.parse(JSON.stringify(this.data)).map((item, index) => {
        item._id = index;
        return item;
      });      
      var originalData = JSON.parse(JSON.stringify(tableData));
      return {
        originalData, // 原始数据
        tableData,
        inputValue: null,
        inputHolderVisible: false,
        contextMenuVisible: false,
        contextMenuRow: null,
        historyStore: [],
        changedRows: [], // 新增的行
        addedRows: [], // 删除的行
        deletedRows: [] // 修改的行
      };
    },
    computed: {
      dataWithId() {
        return JSON.parse(JSON.stringify(this.data)).map((item, index) => {
          item._id = index;
          return item;
        });
      }
    },
    watch: {
      data() {
        this.tableData = JSON.parse(JSON.stringify(this.data)).map((item, index) => {
          item._id = index;
          return item;
        });
        this.originalData = JSON.parse(JSON.stringify(this.data)).map((item, index) => {
          item._id = index;
          return item;
        });        
      },
      tableData() {
        let data = this.tableData;
        this.diff(data);
      }
    },
    methods: {
      // 检测变化
      diff(data) {
        let origin = this.dataWithId;
        let originIds = origin.map(item => {
          return item._id;
        });
        let ids = data.map(item => {
          return item._id;
        });
        let columns = this.$refs.table.columns.map(item => {
          return item.property;
        });
        
        this.$nextTick(() => {
          let tbody = this.$el.querySelector('tbody');
          for (let i=0; i < data.length; i++) {
            let row = data[i];
            let rowElement = tbody.querySelectorAll('.el-table__row')[i];
            let cells = rowElement.querySelectorAll('td');
            for (let cell of cells) {
              cell.classList.remove('new');
              cell.classList.remove('modified');
            }            
            for (let j=0; j < origin.length; j++) {
              let originalRow = origin[j];
              // 检查值是否有变化
              if (row._id === originalRow._id) {
                for (let columnIndex in columns) {
                  let column = columns[columnIndex];
                  if (row[column] !== originalRow[column]) {
                    cells[columnIndex].classList.add('modified');
                    if (this.changedRows.filter(item => item._id === row._id).length === 0) {
                      this.changedRows.push(row);
                    }
                  }
                }
              }
              // 检查是否有删除的行
              if (ids.indexOf(originalRow._id) === -1
                && this.deletedRows.filter(item => item._id === originalRow._id).length === 0) {
                this.deletedRows.push(originalRow);
              }
            }
            // 检查是否包含新增行
            if (originIds.indexOf(row._id) === -1) {
              for (let cell of cells) {
                cell.classList.add('new');
              }
              if (this.addedRows.filter(item => item._id === row._id).length === 0) {
                this.addedRows.push(row);
              }
            }
          }
        });
      },
      // 检查列是否可编辑
      checkColumnEditable(column) {
        for (let slot of this.$slots.default) {
          if (slot.componentOptions && slot.componentOptions.propsData.prop === column
            && slot.componentOptions.propsData.className) {
            let classNames = slot.componentOptions.propsData.className.split(/ +/);
            if (classNames.indexOf('editable') >= 0) {
              return true;
            }
          }
        }
        return false;
      },
      handleSortChange(options) {
        this.diff(this.$refs.table.store.states.data);
        this.$emit('sort-change', options);
      },
      handleModify(row, column, cell, event) {
        if (this.checkColumnEditable(column.property) && this.checkBeforeEdit(row, column, cell, event)) {
          var offset = nodeOffset(cell);
          console.log(cell.offsetParent, cell.offsetLeft, cell.offsetTop)
          this.inputHolderVisible = true;
          var inputHolder = this.$el.querySelector('.inputHolder');
          inputHolder.style.top = (cell.offsetTop + parseInt(window.getComputedStyle(this.$el.querySelector('thead')).height)) + 'px';
          inputHolder.style.left = cell.offsetLeft + 'px';
          // inputHolder.style.top = offset.top + 'px';
          // // x轴有滚动条时减去滚动距离
          // inputHolder.style.left = (offset.left - window.scrollX) + 'px';
          var input = this.$el.querySelector('textarea');
          // TODO IE,CHROME
          var cellStyle = window.getComputedStyle(cell);
          input.style.width = parseInt(cellStyle.width) - 4 + 'px';
          input.style.height = parseInt(cellStyle.height) - 4 + 'px';
          input.style.lineHeight = parseInt(cellStyle.height) - 4 + 'px';

          // input.style.width = cellStyle.width;
          // input.style.height = cellStyle.height;
          // input.style.lineHeight = cellStyle.height;

          input.style.fontSize = cellStyle.fontSize;
          
          var currentRow = cell.parentElement;
          var tbody = currentRow.parentElement;
          var colNum = Array.from(currentRow.querySelectorAll('td')).indexOf(cell);
          var rowNum = Array.from(tbody.querySelectorAll('tr')).indexOf(currentRow);
          this.position = {
            col: colNum,
            row: rowNum,
            prop: column.property,
            cell
          };
          this.inputValue = row[column.property];
        }
      },
      handleMenu(row, event) {
        event.preventDefault();
        this.contextMenuRow = row;
        var menu = this.$el.querySelector('.contextMenu');
        this.contextMenuVisible = true;
        menu.style.top = event.clientY + 'px';
        menu.style.left = event.clientX + 'px'; 
      },
      outsideInputHolder() {
        if (this.inputHolderVisible) {
          var originalRow = this.originalData[this.position.row] || {};
          if (this.inputValue !== originalRow[this.position.prop]) {
            let history = {
              new: JSON.parse(JSON.stringify(this.tableData)),
              old: JSON.parse(JSON.stringify(this.originalData)),
              operation: 'modify'
            };
            // 存储操作历史
            this.historyStore.push(history);
          }
          let data = JSON.parse(JSON.stringify(this.$refs.table.store.states.data));
          var currentRow = data[this.position.row];
          currentRow[this.position.prop] = this.inputValue;
          this.tableData = data;
        }
        this.inputHolderVisible = false;
      },
      outsideMenu() {
        if (this.contextMenuVisible) {
          this.contextMenuVisible = false;
        }
      },
      // 删除当前行
      deleteCurrentRow() {
        // 目前row-contextmenu事件的参数只有row
        // 数据相同时无法区分，添加内部属性_id作区分
        new Promise(resolve => {
          this.$emit('delete-row', this.contextMenuRow, resolve);
        }).then(() => {
          // 存储操作历史
          let history = {
            new: JSON.parse(JSON.stringify(this.tableData)),
            old: JSON.parse(JSON.stringify(this.originalData)),
            operation: 'delete'     
          };
          this.historyStore.push(history);
          let data = JSON.parse(JSON.stringify(this.$refs.table.store.states.data));
          this.$refs.table.store.states.data = data.filter(item => {
            return item._id !== this.contextMenuRow._id;
          });
          this.tableData = data.filter(item => {
            return item._id !== this.contextMenuRow._id;
          });
          this.contextMenuVisible = false;
        });
      },
      handleClick(row, column, cell, event) {
        this.$emit('cell-click', row, column, cell, event);
      },
      // 增加新行
      addNewRow() {
        // 存储操作历史
        let history = {
          new: JSON.parse(JSON.stringify(this.tableData)),
          old: JSON.parse(JSON.stringify(this.originalData)),
          operation: 'add'
        };        
        this.historyStore.push(history);
        let data = JSON.parse(JSON.stringify(this.$refs.table.store.states.data));
        data.push({_id: this.tableData.length});
        this.$refs.table.store.states.data = data;
        this.tableData = data;
        this.contextMenuVisible = false;
        this.$emit('add-row');
      },
      // 撤销
      handleUndo() {
        if (this.historyStore.length > 0) {
          let history = this.historyStore.pop();
          this.tableData = history.new;
          this.originalData = history.old;
          this.contextMenuVisible = false;
        }
      },
      // 保存
      handleSave() {
        if (this.historyStore.length > 0) {
          new Promise(resolve => {
            let data = {
              data: this.tableData,
              changedRows: this.changedRows,
              addedRows: this.addedRows,
              deletedRows: this.deletedRows
            };
            this.$emit('save', data, resolve);
          }).then(() => {
            this.$emit('update:data', this.tableData);
            this.historyStore = [];
            this.contextMenuVisible = false;
          });
        }
      }
    }
  }
</script>

<style>
  .inputHolder {
    position: absolute;
    z-index: 1000;
  }
  textarea {
    resize: none;
    overflow-y: hidden;
    border: 0;
    box-shadow: inset 0 0 0 2px #5292f7;
    padding-left: 5px;
  }
  .contextMenu {
    position: fixed;
    z-index: 1000;
    color: #363636;
    font-size: 13px;
    background-color: #ffffff;
    cursor: default;
    text-align: left !important;
    box-shadow: 3px 3px 3px #808080;
  }
  .contextMenu table {
    border: 1px solid #ccc;
  }
  .contextMenu table tr td {
    padding: 4px 6px;
  }
  .contextMenu table tr:not(.disabled):hover {
    background: #f3f3f3;
  }  
  .itemWrapper {
    margin-left: 10px;
    margin-right: 6px;
  }
  .cell {
    min-height: 23px;
  }
  .editable {
    cursor: pointer;
  }
  .cell-selected {
    box-shadow: inset 0 0 0 2px #5292f7; 
  }
  .modified {
    color: red;
  }
  .new {
    color: green;
  }
  .disabled {
    color: #999;
  }
</style>
