import { apiClient } from './client'
import type { components, paths } from './generated'

export type Payment = components['schemas']['Payment']

// Use generated parameter types
export type GetPaymentsParams = {
  status?: 'completed' | 'processing' | 'failed'
  sort?: components['parameters']['sort']
  search?: components['parameters']['search']
  page?: components['parameters']['page']
  page_size?: components['parameters']['page_size']
}

// Non-optional response type for backward compatibility
export type PaginatedPaymentsResponse = {
  payments: Payment[]
  total: number
  page: number
  page_size: number
}

// Extract operation types from paths
export type GetPaymentsOperation = paths['/dashboard/v1/payments']['get']

export async function getPayments(
  token: string,
  params?: GetPaymentsParams
): Promise<PaginatedPaymentsResponse> {
  const { data, error } = await apiClient.GET('/dashboard/v1/payments', {
    params: {
      query: {
        status: params?.status,
        sort: params?.sort,
        search: params?.search,
        page: params?.page,
        page_size: params?.page_size,
      },
    },
    headers: { Authorization: `Bearer ${token}` },
  })

  if (error) {
    throw new Error(error.message ?? 'Failed to fetch payments')
  }

  const payments = data?.payments ?? []
  return {
    payments,
    total: data?.total ?? payments.length,
    page: data?.page ?? 1,
    page_size: data?.page_size ?? payments.length,
  }
}
