<template>
  <table>
    <colgroup>
      <col v-for="column in columns" :name="column.prop" width="180"></col>
    </colgroup>
    <tbody>
      <tr v-for="row in data" @click="handleRowClick($event, row)">
        <td @dblclick="handleDoubleClick($event, column)" v-for="column in columns">{{ row[column.prop] }}</td>
      </tr>
    </tbody>
    <table-cell :store="store" v-model="inputValue"
      :style="inputHolderStyle" :cellStyle="tableCellStyle"></table-cell>
  </table>
</template>
<script>
  import { nodeOffset } from './util';
  import TableCell from './table-cell.vue';

  export default {
    name: 'TableBody',
    components: {
      TableCell
    },
    props: {
      store: {
        required: true
      }
    },
    data() {
      var columns = this.store.states.columns;
      var data = this.store.states.data;
      return {
        columns,
        data,
        inputValue: null,
        cellVisible: false,
        position: null,
        inputHolderStyle: null,
        tableCellStyle: null
      };
    },
    created() {
      this.store.on('data', data => {
        this.data = data;
      });
      this.store.on('cellModify', (position, value) => {
        var rows = document.querySelectorAll('tbody tr');
        var row = rows[position.row];
        var cells = row.querySelectorAll('td');
        var cell = cells[position.col];
        var prop = this.store.states.columns[position.col].prop;
        if (value !== this.store.states.oldData[position.row][prop]) {
          cell.classList.add('modified');
        } else {
          cell.classList.remove('modified');
        }
      });
    },
    methods: {
      handleRowClick(e, row) {
        this.cellVisible = false;
      },
      handleDoubleClick(e, column) {
        var cell = e.target;
        var position = this.focusCell(cell);
        this.inputValue = this.data[position.row][column.prop];
        this.store.emit('cellVisible', true, position);
      },
      focusCell(cell) {
        var currentRow = cell.parentElement;
        var offset = nodeOffset(cell);
        // cell info clicked, col and row
        var col = Array.from(currentRow.querySelectorAll('td')).indexOf(cell);
        var row = Array.from(currentRow.parentElement.querySelectorAll('tr')).indexOf(currentRow);
        this.inputHolderStyle = {};
        this.inputHolderStyle.top = offset.top + 'px';
        this.inputHolderStyle.left = offset.left + 'px';
        this.tableCellStyle = {};
        var cellStyle = window.getComputedStyle(cell);
        this.tableCellStyle.width = cellStyle.width;
        this.tableCellStyle.height = cellStyle.height;
        this.tableCellStyle.fontSize = cellStyle.fontSize;
        this.tableCellStyle.lineHeight = cellStyle.height;
        this.position = {col, row};
        return {row, col};
      }
    }
  };
</script>

<style scoped>
  .modified {
    color: red;
  }
</style>

