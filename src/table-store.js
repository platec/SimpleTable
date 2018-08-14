const TableStore = function(table) {
  this.table = table;
  this._events = {};
  this.states = {
    data: null,
    columns: null
  };
  return this;
};

TableStore.prototype.on = function(event, handler) {
  this._events[event] = this._events[event] || [];
  if (this._events[event].indexOf(handler) === -1) {
    this._events[event].push(handler);
  } 
}

TableStore.prototype.emit = function(event, ...args) {
  var handlers = this._events[event];
  if (handlers) {
    for (let handler of handlers) {
      handler.apply(this, [].concat(args));
    }
  }
}

export default new TableStore;