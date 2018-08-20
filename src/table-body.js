
  import { nodeOffset } from './util';
  import TableCell from './table-cell.vue';
  import './table-body.css';

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
      var columns = this.columns;
      var data = this.data;
      return (
        <table>
          <colgroup>
            {
              this._l(columns, column => {
                return <col name={ column.name } width="180"></col>
              })
            }
          </colgroup>
          <tbody>
            {
              this._l(data, row => {
                return <tr
                        on-click={ ($event, row) => { this.handleRowClick($event, row) } }>
                          {
                            this._l(columns, (column, index) => {
                              return <td on-dblclick={ $event => {
                                this.handleDoubleClick($event, column)
                              } }>{ row[column.prop] }</td>
                            })
                          }
                        </tr>
              })
            }
          </tbody>
        </table>
      )
    },
    data() {
      return {
        inputValue: null,
        cellVisible: false,
        position: null,
        inputHolderStyle: null,
        tableCellStyle: null
      };
    },
    created() {
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
    },
    computed: {
      data() {
        return this.store.states.data;
      },
      columns() {
        return this.store.states.columns;
      }
    }    
  };
