// similar to jquery.fn.offset
export const nodeOffset = function(el) {
  var rect, win;
  if (!el) {
    return;
  }
  if (!el.getClientRects().length) {
    return { top: 0, left: 0 };
  }
  rect = el.getBoundingClientRect();
  win = el.ownerDocument.defaultView;
  return {
    top: rect.top + win.pageYOffset,
    left: rect.left + win.pageXOffset    
  };
};