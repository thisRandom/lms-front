export interface AddressValue {
  provinceCode: string;
  cityCode: string;
  districtCode: string;
  detailAddress: string;
}

export interface AddressCascaderProps {
  modelValue?: AddressValue;
  size?: 'mini' | 'small' | 'medium' | 'large';
  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
}

export interface AreaOption {
  value: string;
  label: string;
  children?: AreaOption[];
}
