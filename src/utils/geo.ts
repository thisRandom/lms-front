// 完整的省份 adcode 映射表
const provinceCodeMap: Record<number, string> = {
  110000: '北京市',
  120000: '天津市',
  130000: '河北省',
  140000: '山西省',
  150000: '内蒙古自治区',
  210000: '辽宁省',
  220000: '吉林省',
  230000: '黑龙江省',
  310000: '上海市',
  320000: '江苏省',
  330000: '浙江省',
  340000: '安徽省',
  350000: '福建省',
  360000: '江西省',
  370000: '山东省',
  410000: '河南省',
  420000: '湖北省',
  430000: '湖南省',
  440000: '广东省',
  450000: '广西壮族自治区',
  460000: '海南省',
  500000: '重庆市',
  510000: '四川省',
  520000: '贵州省',
  530000: '云南省',
  540000: '西藏自治区',
  610000: '陕西省',
  620000: '甘肃省',
  630000: '青海省',
  640000: '宁夏回族自治区',
  650000: '新疆维吾尔自治区',
  710000: '台湾省',
  810000: '香港特别行政区',
  820000: '澳门特别行政区',
};

// 根据 adcode 获取省份名称
const getProvinceByCode = (adcode: number): string | null => {
  // 6位码：省份码是前4位（如 130100 河北省石家庄市 -> 130000）
  // 4位码：本身就是省份码
  let provinceCode: number;
  if (adcode > 100000) {
    // 6位码，取前4位
    provinceCode = Math.floor(adcode / 100) * 100;
  } else if (adcode > 10000) {
    // 4位码或5位码，取前2位 * 10000
    provinceCode = Math.floor(adcode / 10000) * 10000;
  } else {
    // 已经是省份码或更短
    provinceCode = adcode;
  }
  return provinceCodeMap[provinceCode] || null;
};

// 根据 adcode 转换为省市区地址
export const getAddressByAdcode = (adcode: number, districtName: string): string => {
  const province = getProvinceByCode(adcode);
  if (province) {
    // 直辖市/特别行政区: 北京市 东城区
    if (['北京市', '天津市', '上海市', '重庆市', '香港特别行政区', '澳门特别行政区'].includes(province)) {
      return `${province} ${districtName}`;
    }
    // 其他省份: 广东省 广州市
    if (province !== districtName) {
      return `${province} ${districtName}`;
    }
  }
  return districtName;
};