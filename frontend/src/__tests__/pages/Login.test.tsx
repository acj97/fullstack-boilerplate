import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { loginApi } from '../../api/auth'
import Login from '../../pages/Login'
import { useAuthStore } from '../../store/authStore'

const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

jest.mock('../../api/auth', () => ({ loginApi: jest.fn() }))

jest.mock('../../store/authStore', () => ({ useAuthStore: jest.fn() }))

const mockLoginApi = loginApi as jest.MockedFunction<typeof loginApi>
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  )
}

async function fillAndSubmit(email: string, password: string) {
  await userEvent.type(screen.getByPlaceholderText('you@company.com'), email)
  await userEvent.type(screen.getByPlaceholderText('••••••••'), password)
  await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
}

describe('Login — onSubmit', () => {
  let mockLogin: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockLogin = jest.fn()
    mockUseAuthStore.mockReturnValue({ login: mockLogin } as ReturnType<typeof useAuthStore>)
  })

  it('calls loginApi with the entered credentials', async () => {
    mockLoginApi.mockResolvedValueOnce({ email: 'user@test.com', role: 'cs', token: 'tok' })
    renderLogin()
    await fillAndSubmit('user@test.com', 'password123')
    await waitFor(() => {
      expect(mockLoginApi).toHaveBeenCalledWith('user@test.com', 'password123')
    })
  })

  it('stores the user and navigates to /dashboard on success', async () => {
    const user = { email: 'user@test.com', role: 'cs', token: 'tok' }
    mockLoginApi.mockResolvedValueOnce(user)
    renderLogin()
    await fillAndSubmit('user@test.com', 'password123')
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(user)
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true })
    })
  })

  it('shows a server error message when loginApi rejects', async () => {
    mockLoginApi.mockRejectedValueOnce(new Error('Invalid credentials'))
    renderLogin()
    await fillAndSubmit('user@test.com', 'password123')
    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument()
  })
})
