export type csvData = {
  "計算対象": number,
  "日付": string,
  "内容": string,
  "金額（円）": number,
  "保有金融機関": string,
  "大項目": string,
  "中項目": string,
  "メモ": string | null,
  "振替": number,
  "ID": string
}
export type csvList = Array<csvData>;

export type result = {
  takeru: {
    cash: number,
    card: number,
    utility: number,
    total:number,
    half: number
  },
  reina: {
    cash: number,
    card: number,
    utility: number,
    total:number,
    half: number
  },
  total: {
    cash: number,
    card: number,
    utility: number
  }
}