export default {
  name: 'TableHeader',
  props: {
    store: {
      required: true
    }
  },
  render(h) {
    return (
      <table>
        <colgroup>
          {
            this._l(this.columns, column => {
              return <col name={column.prop} width="180" />
            })
          }
        </colgroup>
        <thead>
          <tr>
            { 
              this._l(this.columns, column => {
                return <th>{ column.label }</th>
              })
            }
          </tr>
        </thead>
      </table>
    )
  },
  data() {
    var columns = this.store.states.columns;
    return {
      columns
    };
  },
  methods: {

  }
}