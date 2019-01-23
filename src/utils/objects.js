export function deepClone(obj) {
  let newObj = { ...obj };

  for (let key in newObj) {
    let el = newObj[key];
    if (typeof el === "object" && el !== null) {
      el = deepClone(el);
    }
  }

  return newObj;
}
