<template>
  <div>
    <table>
      <thead v-if="headerVisible">
        <tr>
          <th v-for="colHeader in colHeaders">
            {{ colHeader }}
          </th>
        </tr>
      </thead>
      <tbody @dblclick="dblclickCell">
        <tr v-for="row in data">
          <td v-for="col in row">{{ col }}</td>
        </tr>
      </tbody>
    </table>

    <div class="inputHolder" v-show="inputHolderVisible" :style="inputHolderStyle">
      <textarea :style="textareaStyle" v-model="inputValue" id="textarea"></textarea>
    </div>
  </div>
</template>

<script>
  import { nodeOffset } from './util';

  export default {
    name: 'SimpleTable',
    props: {
      headerVisible: {
        type: Boolean,
        default: true
      },
      data: {
        type: Array,
        default: []
      },
      colHeaders: {
        type: Array,
        default: []
      }
    },
    mounted() {
      document.addEventListener('click', this.editCompleted);
    },
    beforeDestroy() {
      document.removeEventListener('click', this.editCompleted);
    },
    data() {
      return {
        inputHolderVisible: false,
        inputHolderStyle: {
          left: '',
          top: ''
        },
        textareaStyle: {
          width: '',
          height: '',
          fontSize: '',
          lineHeight: ''
        },
        inputValue: ''
      }
    },
    created() {
      this.dataOld = JSON.parse(JSON.stringify(this.data));
    },
    methods: {
      dblclickCell(e) {
        if (e.target.tagName.toUpperCase() === 'TD') {
          var target = e.target;
          var position = this.focusCell(target);
          this.inputValue = this.data[position.row][position.col];
        }
      },
      focusCell(cell) {
          var currentRow = cell.parentElement;
          var offset = nodeOffset(cell);
          this.inputHolderStyle.top = offset.top + 'px';
          this.inputHolderStyle.left = offset.left + 'px';
          
          var cellStyle = window.getComputedStyle(cell);
          this.textareaStyle.width = cellStyle.width;
          this.textareaStyle.height = cellStyle.height;
          this.textareaStyle.fontSize = cellStyle.fontSize;
          this.textareaStyle.lineHeight = cellStyle.height;
          this.inputHolderVisible = true;
          // cell info clicked, col and row
          var col = Array.from(currentRow.querySelectorAll('td')).indexOf(cell);
          var row = Array.from(currentRow.parentElement.querySelectorAll('tr')).indexOf(currentRow);
          this.position = {col, row};
          return {row, col};
      },
      editCompleted(e) {
        var target = e.target;
        var inputHolder = document.querySelector('.inputHolder');
        if (target !== inputHolder && !inputHolder.contains(target)) {
          this.inputHolderVisible = false;
          if (this.position) {
            // add modified class after data changed
            // skip table header
            let rowIndex = this.headerVisible ? this.position.row + 1 : this.position.row;
            var cell = this.$el.querySelectorAll('table tr')[rowIndex].querySelectorAll('td')[this.position.col];      
            if (this.dataOld[this.position.row][this.position.col] !== this.inputValue) {
              cell.classList.add('modified');
            } else {
              cell.classList.remove('modified');
            }
            this.data[this.position.row][this.position.col] = this.inputValue;
          }
        }
      }
    }
  }
</script>

<style>
  table,
  table tr th,
  table tr td {
    border: 1px solid #cfcfcc;
  }
  table tr th {
    padding: 0px 14px;
  }
  table {
    width: 200px;
    min-height: 25px;
    line-height: 25px;
    text-align: center;
    border-collapse: collapse;
    padding: 2px;
  }
  .inputHolder {
    position: absolute;
  }
  textarea {
    resize : none;
    overflow-y: hidden;
    border: 0;
    box-shadow: inset 0 0 0 2px #5292f7;
  }
  .modified {
    color: red;
  }
</style>
