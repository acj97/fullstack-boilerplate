import { apiClient } from './client'
import type { components } from './generated'

type LoginResponse = components['schemas']['User']

export async function loginApi(email: string, password: string): Promise<Required<LoginResponse>> {
  const { data, error } = await apiClient.POST('/dashboard/v1/auth/login', {
    body: { email, password },
  })

  if (error) {
    throw new Error(error.message ?? 'Login failed')
  }

  if (!data) {
    throw new Error('Login failed')
  }

  return {
    email: data.email ?? '',
    role: data.role ?? '',
    token: data.token ?? '',
  }
}
