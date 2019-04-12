export function reduceAddAvg(attr) {
  return function(p,v) {
    ++p.count
    p.sum += parseFloat(v[attr]);
    return p;
  };
}

export function reduceRemoveAvg(attr) {
  return function(p,v) {
    --p.count
    p.sum -= parseFloat(v[attr]);
    return p;
  };
}

export function reduceInitAvg() {
  return {count:0, sum:0};
}
