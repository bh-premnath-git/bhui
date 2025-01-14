export function fuzzyFilter(row: any, columnId: string, value: string) {
    const searchValue = value.toLowerCase()
    const cellValue = String(row.getValue(columnId)).toLowerCase()
    return cellValue.includes(searchValue)
  }
  
  export function formatDate(date: string) {
    return new Date(date).toLocaleString()
  }
  
  