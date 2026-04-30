const BASE_URL = import.meta.env.VITE_API_BASE_URL

export type Payment = {
  id: string | null
  merchant_name: string | null
  created_at: string | null
  amount: string | null
  status: 'completed' | 'processing' | 'failed' | null
}

export type GetPaymentsParams = {
  status?: 'completed' | 'processing' | 'failed'
  sort?: string
  search?: string
  page?: number
  page_size?: number
}

export type PaginatedPaymentsResponse = {
  payments: Payment[]
  total: number
  page: number
  page_size: number
}

export async function getPayments(token: string, params?: GetPaymentsParams): Promise<PaginatedPaymentsResponse> {
  const query = new URLSearchParams()
  if (params?.status) query.set('status', params.status)
  if (params?.sort) query.set('sort', params.sort)
  if (params?.search) query.set('search', params.search)
  if (params?.page) query.set('page', String(params.page))
  if (params?.page_size) query.set('page_size', String(params.page_size))

  const res = await fetch(`${BASE_URL}/dashboard/v1/payments?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message ?? 'Failed to fetch payments')
  }

  const payments: Payment[] = data.payments ?? []
  return {
    payments,
    total: data.total ?? payments.length,
    page: data.page ?? 1,
    page_size: data.page_size ?? payments.length,
  }
}
