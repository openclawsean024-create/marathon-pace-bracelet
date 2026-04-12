export type PaceStrategy = 'negative-split' | 'even-pace' | 'positive-split';

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
  // P1: 新增第5、6場台灣賽事湊滿六場
  kaohsiung: {
    id: 'kaohsiung',
    name: '高雄馬拉松',
    nameEn: 'Kaohsiung Marathon',
    totalKm: 42.195,
    totalDPlus: 60,
    totalDMinus: 60,
    elevationNodes: [
      { km: 0, elevation: 8, label: '世運主場館' },
      { km: 5, elevation: 10, label: '左營蓮池潭' },
      { km: 10, elevation: 12, label: '中都濕地' },
      { km: 15, elevation: 8, label: '愛河河畔' },
      { km: 21.0975, elevation: 10, label: '半程檢查點' },
      { km: 25, elevation: 8, label: '前鎮河岸' },
      { km: 30, elevation: 10, label: '小港機場' },
      { km: 35, elevation: 12, label: '林園海岸' },
      { km: 40, elevation: 8, label: '鳳山古城' },
      { km: 42.195, elevation: 8, label: '終點' },
    ],
    specialNotes: ['最平坦賽道之一', '市區折返為主', '適合初馬'],
  },
  hualien: {
    id: 'hualien',
    name: '花蓮馬拉松',
    nameEn: 'Hualien Marathon',
    totalKm: 42.195,
    totalDPlus: 320,
    totalDMinus: 320,
    elevationNodes: [
      { km: 0, elevation: 15, label: '花蓮火車站' },
      { km: 5, elevation: 20, label: '美崙田徑場' },
      { km: 10, elevation: 40, label: '七星潭海岸' },
      { km: 15, elevation: 60, label: '太魯閣大橋' },
      { km: 21.0975, elevation: 80, label: '半程檢查點' },
      { km: 25, elevation: 100, label: '清水斷崖' },
      { km: 30, elevation: 120, label: '崇德管制站' },
      { km: 35, elevation: 100, label: '和平礦區' },
      { km: 40, elevation: 60, label: '新城折返' },
      { km: 42.195, elevation: 15, label: '終點' },
    ],
    specialNotes: ['山線海岸混合', '太魯閣峽谷壯闊', '建議有經驗跑者'],
  },
};
