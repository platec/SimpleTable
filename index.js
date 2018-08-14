import SimpleTable from './src/table';
import TableColumn from './src/table-column';

SimpleTable.install = function(Vue) {
  Vue.component(SimpleTable.name, SimpleTable);
};

TableColumn.install = function(Vue) {
  Vue.component(TableColumn.name, TableColumn);
}
 
export {SimpleTable, TableColumn};