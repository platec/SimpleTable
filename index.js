import SimpleTable from './src/simple-table.vue';

SimpleTable.install = function(Vue) {
  Vue.component(SimpleTable.name, SimpleTable);
};

export default SimpleTable;