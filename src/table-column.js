export default {
  name: 'TableColumn',
  props: {
    label: String,
    prop: String,
    type: String
  },
  render(h) {
    return h('div', this.$slots.default);
  },
  created() {
    console.log(1);
  },
  data() {
    return {
      test: 'this is a test'
    }
  },
  methods: {
    renderCell(row) {
      return (
        <div>{ row[this.prop] }</div>
      )
    }
  }
};
 

// export default {
//   name: 'TableColumn',
//   props: {
//     label: String,
//     prop: String,
//     type: String
//   }
// };