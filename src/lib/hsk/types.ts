/** Kiểu từ vựng HSK dùng chung cho kho theo cấp (src/lib/hsk/levelN.ts). */
export interface HSKWord {
  hanzi: string;
  pinyin: string;
  meaning: string;
  /** Am Han Viet — tra cuu kieu nguoi Viet (vd: 你好 = "nhĩ hảo") */
  hanViet?: string;
  example?: string;
}
