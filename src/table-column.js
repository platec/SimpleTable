export default {
  name: 'TableColumn',
  props: {
    label: String,
    prop: String
  },
  created() {
    this.$options.render = h => h('div', this.$slots.default);
  },
  data() {
    return {
      test: 'this is a test'
    }
  }
}