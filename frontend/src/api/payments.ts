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
}

export async function getPayments(token: string, params?: GetPaymentsParams): Promise<Payment[]> {
  const query = new URLSearchParams()
  if (params?.status) query.set('status', params.status)
  if (params?.sort) query.set('sort', params.sort)

  const res = await fetch(`${BASE_URL}/dashboard/v1/payments?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message ?? 'Failed to fetch payments')
  }

  return data.payments ?? []
}
