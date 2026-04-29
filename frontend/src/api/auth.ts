const BASE_URL = import.meta.env.VITE_API_BASE_URL

export type LoginResponse = {
  email: string
  role: string
  token: string
}

export async function loginApi(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}/dashboard/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message ?? 'Login failed')
  }

  return data
}
