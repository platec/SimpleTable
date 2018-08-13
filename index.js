import SimpleTable from './src/table';

SimpleTable.install = function(Vue) {
  Vue.component(SimpleTable.name, SimpleTable);
};

export default SimpleTable;