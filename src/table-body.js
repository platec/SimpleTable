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
  render() {
    return (
      <table>
        <colgroup>
        {
          this._l(this.columns, column => {
            return <col name={column.prop} width="180" />
          })
        }
        </colgroup>
        <tbody>
          {
            this._l(this.data, row => {
              return <tr on-click={ $event => this.handleRowClick($event, row) }>
                { this._l(this.columns, column => {
                  return <td on-dblclick={ $event => this.handleDoubleClick($event, column) }>{ row[column.prop] }</td>
                }) }
              </tr>
            })
          }
        </tbody>
        <table-cell value={ this.inputValue } visible={ this.cellVisible } 
          style={ this.inputHolderStyle } cellStyle={ this.tableCellStyle }></table-cell>
      </table>
    )
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
  methods: {
    handleRowClick(e, row) {
      console.log(row);
      this.cellVisible = false;
    },
    handleDoubleClick(e, column) {
      var cell = e.target;
      var position = this.focusCell(cell);
      this.inputValue = this.data[position.row][column.prop];
      this.cellVisible = true;
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