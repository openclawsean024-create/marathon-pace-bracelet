export type PaceStrategy = 'negative-split' | 'even-pace' | 'safe-start';

export interface CourseNode {
  km: number;
  elevation: number;
  label?: string;
}

export interface Course {
  id: string;
  name: string;
  nameEn: string;
  totalKm: number;
  totalDPlus: number;
  totalDMinus: number;
  elevationNodes: CourseNode[];
  specialNotes?: string[];
}

export const COURSES: Record<string, Course> = {
  taipei: {
    id: 'taipei',
    name: '台北馬拉松',
    nameEn: 'Taipei Marathon',
    totalKm: 42.195,
    totalDPlus: 104,
    totalDMinus: 106,
    elevationNodes: [
      { km: 0, elevation: 3, label: '市政府廣場' },
      { km: 1.1, elevation: 26, label: '虹橋高架' },
      { km: 5, elevation: 8, label: '國父紀念館' },
      { km: 10, elevation: 10, label: '中山南北路' },
      { km: 15, elevation: 5, label: '淡水河畔' },
      { km: 21.0975, elevation: 8, label: '半程檢查點' },
      { km: 30, elevation: 12, label: '彩虹橋' },
      { km: 35, elevation: 15, label: '汐止折返' },
      { km: 40, elevation: 8, label: '南京東路' },
      { km: 42.195, elevation: 5, label: '終點' },
    ],
    specialNotes: ['虹橋高架 ~1.1K', '汐止大同路折返 35K'],
  },
  taichung: {
    id: 'taichung',
    name: '台中馬拉松',
    nameEn: 'Taichung Marathon',
    totalKm: 42.195,
    totalDPlus: 80,
    totalDMinus: 80,
    elevationNodes: [
      { km: 0, elevation: 30, label: '花博園區' },
      { km: 10, elevation: 32, label: '后里區' },
      { km: 20, elevation: 35, label: '外埔區' },
      { km: 25, elevation: 36, label: '大甲區' },
      { km: 30, elevation: 38, label: '大雅區' },
      { km: 35, elevation: 40, label: '環中路' },
      { km: 42.195, elevation: 28, label: '終點' },
    ],
    specialNotes: ['25K後緩上', '最後7K環中路略上坡'],
  },
  yilan: {
    id: 'yilan',
    name: '宜蘭馬拉松',
    nameEn: 'Yilan Marathon',
    totalKm: 42.195,
    totalDPlus: 50,
    totalDMinus: 50,
    elevationNodes: [
      { km: 0, elevation: 15, label: '羅東運動公園' },
      { km: 10, elevation: 12, label: '冬山河堤' },
      { km: 20, elevation: 15, label: '蘭陽大橋' },
      { km: 30, elevation: 18, label: '梅花湖入口' },
      { km: 35, elevation: 25, label: '梅花湖丘陵' },
      { km: 38, elevation: 30, label: '梅花湖最高點' },
      { km: 42.195, elevation: 15, label: '終點' },
    ],
    specialNotes: ['最平坦賽道之一', '35K後梅花湖輕度丘陵'],
  },
  penghu: {
    id: 'penghu',
    name: '澎湖馬拉松',
    nameEn: 'Penghu Marathon',
    totalKm: 42,
    totalDPlus: 280,
    totalDMinus: 280,
    elevationNodes: [
      { km: 0, elevation: 10, label: '馬公市' },
      { km: 5, elevation: 60, label: '跨海大橋' },
      { km: 10, elevation: 15, label: '湖西' },
      { km: 15, elevation: 65, label: '西嶼大橋' },
      { km: 20, elevation: 20, label: '白沙' },
      { km: 25, elevation: 55, label: '跨海大橋返程' },
      { km: 30, elevation: 15, label: '本島' },
      { km: 35, elevation: 50, label: '最後大橋' },
      { km: 42, elevation: 10, label: '終點' },
    ],
    specialNotes: ['第5/15/25/35K有橋樑爬升', '海島地形風大', '建議保守配速'],
  },
};
