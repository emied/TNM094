export function reduceAddAvg(attr) {
  return function(p,v) {
  ++p.count
  p.sum += parseFloat(v[attr]);
  p.avg = p.sum/p.count;
  return p;
  };
}

export function reduceRemoveAvg(attr) {
  return function(p,v) {
    --p.count
    p.sum -= parseFloat(v[attr]);
    p.avg = p.sum/p.count;
    return p;
  };
}

export function reduceInitAvg() {
  return {count:0, sum:0, avg:0};
}
