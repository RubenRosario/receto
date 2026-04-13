export type Receipt = {
  id: string,
  title: string | null,
  vendor: string,
  receipt_date: string,
  total: number,
  currency: string,
  parse_status: 'pending' | 'processing' | 'parsed' | 'confirmed'
}

export type ReceiptItem = {
  id: string,
  name: string,
  quantity: number,
  unit_price: number,
  line_total: number,
}