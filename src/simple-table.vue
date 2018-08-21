<template>
  <div>
    <el-table ref="table"
    border
    @cell-dblclick="handleModify"
    @row-contextmenu="handleMenu"
    @cell-click="handleClick"
    stripe
    :size="size"
    :data="tableData"
    style="width: 100%">
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
          <tr @click="addNewRow">
            <td style="height:22px;">
              <div class="itemWrapper">插入行</div>
            </td>
          </tr>
          <tr @click="deleteCurrentRow">
            <td style="height:22px;">
              <div class="itemWrapper">删除当前行</div>
            </td>
          </tr>
          <tr @click="handleUndo" :class="{disabled: historyStore.length === 0}">
            <td style="height:22px;">
              <div class="itemWrapper">撤销</div>
            </td>
          </tr>
          <tr @click="handleSave">
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
  import { nodeOffset } from './util';
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
      }
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
        rowsAdded: [], // 新增的行
        rowsDeleted: [], // 删除的行
        rowsModified: [] // 修改的行
      };
    },
    watch: {
      data() {
        this.tableData = JSON.parse(JSON.stringify(this.data)).map((item, index) => {
          item._id = index;
          return item;
        });
      },
      tableData() {
        let data = this.tableData;
        let oldData = this.originalData;
        let columns = this.$refs.table.columns.map(item => {
          return item.property;
        });
        let tbody = document.querySelector('tbody');
        this.$nextTick(() => {
          for (let i = 0; i < data.length; i++) {
            let row = data[i];
            let oldRow = oldData[i];
            for (let j in columns) {
              let column = columns[j];
              let rowElement = tbody.querySelectorAll('.el-table__row')[i];
              let cell = rowElement.querySelectorAll('td')[j];
              if (oldRow === void 0) {
                cell.classList.add('new');
              } else {
                cell.classList.remove('new');
              }
              if (oldRow !== void 0 && row[column] !== oldRow[column]) {
                cell.classList.add('modified');
              } else {
                cell.classList.remove('modified');
              }
            }
          }
        });
      }
    },
    methods: {
      handleModify(row, column, cell, event) {
        var offset = nodeOffset(cell);
        this.inputHolderVisible = true;
        var inputHolder = document.querySelector('.inputHolder');
        inputHolder.style.top = offset.top + 'px';
        inputHolder.style.left = offset.left + 'px';
        var input = document.querySelector('textarea');
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
      },
      handleMenu(row, event) {
        event.preventDefault();
        this.contextMenuRow = row;
        var menu = document.querySelector('.contextMenu');
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
              old: JSON.parse(JSON.stringify(this.originalData))
            };
            // 存储操作历史
            this.historyStore.push(history);            
          }
          var currentRow = this.tableData[this.position.row];
          currentRow[this.position.prop] = this.inputValue;         
          this.tableData.splice(this.position.row, 1, currentRow);
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
        // 存储操作历史
        let history = {
          new: JSON.parse(JSON.stringify(this.tableData)),
          old: JSON.parse(JSON.stringify(this.originalData))          
        };
        this.historyStore.push(history);         
        this.tableData = this.tableData.filter(item => {
          return item._id !== this.contextMenuRow._id;
        });
        this.originalData = this.originalData.filter(item => {
          return item._id !== this.contextMenuRow._id;
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
          this.tableData = this.tableData.filter(item => {
            return item._id !== this.contextMenuRow._id;
          });
          this.originalData = this.originalData.filter(item => {
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
        this.tableData.push({_id: this.tableData.length});
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
        new Promise(resolve => {
          this.$emit('save', this.tableData, resolve);
        }).then(() => {
          this.originalData = JSON.parse(JSON.stringify(this.tableData));
          // this.tableData = JSON.parse(JSON.stringify(this.tableData));
          this.$emit('update:data', this.tableData);
          this.historyStore = [];
          this.contextMenuVisible = false;
        });
      },
      diff() {
        // let 
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
  }
  .contextMenu {
    position: absolute;
    z-index: 1000;
    color: #363636;
    font-size: 13px;
    background-color: #ffffff;
    cursor: default;
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
    cursor: default;
    min-height: 23px;
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
