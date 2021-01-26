let getTime = function (type, time = new Date().getTime()) {
  let str = '',
    date = new Date(time),
    Y = date.getFullYear().toString(),
    m = (date.getMonth() + 1).toString().length == 1 ? `0${(date.getMonth() + 1).toString()}` : (date.getMonth() + 1).toString(),
    d = date.getDate().toString().length == 1 ? `0${date.getDate().toString()}` : date.getDate().toString(),
    H = date.getHours().toString().length == 1 ? `0${date.getHours().toString()}` : date.getHours().toString(),
    M = date.getMinutes().toString().length == 1 ? `0${date.getMinutes().toString()}` : date.getMinutes().toString(),
    S = date.getSeconds().toString().length == 1 ? `0${date.getSeconds().toString()}` : date.getSeconds().toString();
  switch (type) {
    case 'YYYY年mm月dd日HH:MM:SS':
      str = `${Y}年${m}月${d}日${H}:${M}:${S}`;
      break;
    case 'YYYY年mm月dd日 HH:MM:SS':
      str = `${Y}年${m}月${d}日 ${H}:${M}:${S}`;
      break;
    case 'YYYY-mm-dd HH:MM:SS':
      str = `${Y}-${m}-${d} ${H}:${M}:${S}`;
      break;
    case 'YYYY-mm-dd HH':
      str = `${Y}-${m}-${d} ${H}`;
      break;
    case 'YYYY.mm.dd HH:MM:SS':
      str = `${Y}.${m}.${d} ${H}:${M}:${S}`;
      break;
    case 'YYYY.mm.dd HH:MM':
      str = `${Y}.${m}.${d} ${H}:${M}`;
      break;
    case 'YYYY/mm/dd HH:MM:SS':
      str = `${Y}/${m}/${d} ${H}:${M}:${S}`;
      break;
    case 'HH:MM:SS':
      str = `${H}:${M}:${S}`;
      break;
    case 'YYYY':
      str = `${Y}`;
      break;
    case 'YYYY-mm':
      str = `${Y}-${m}`;
      break;
    case 'YYYY-mm-dd':
      str = `${Y}-${m}-${d}`;
      break;
    case 'HH时MM分SS秒':
      str = `${H}时${M}分${S}秒`;
      break;
    default:
  }
  return str;
};

let deepCopy = (obj) => {
  if (!obj || typeof obj !== "object") return obj;
  let objClone = Array.isArray(obj) ? [] : {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (obj[key] && typeof obj[key] === "object") {
        objClone[key] = deepCopy(obj[key]);
      } else {
        objClone[key] = obj[key];
      }
    }
  }
  return objClone;
};

let getGuid = () => {
  let d = new Date().getTime();
  let uuid = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.replace(/[x]/g, c => {
    let r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
};

export default {getTime, deepCopy, getGuid};
