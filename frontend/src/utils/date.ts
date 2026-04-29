import { format } from 'date-fns'

export function formatDate(val: string | Date): string {
  return format(new Date(val), 'dd-MM-yyyy HH:mm')
}
