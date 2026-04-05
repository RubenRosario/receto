export type Receipt = {
  id: string,
  title: string  | '',
  vendor: string,
  receipt_date: string,
  total: number,
  currency: string,
  parse_status: string
}