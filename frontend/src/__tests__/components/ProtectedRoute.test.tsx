import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '../../components/ProtectedRoute'
import { useAuthStore } from '../../store/authStore'

jest.mock('../../store/authStore', () => ({ useAuthStore: jest.fn() }))

const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>

function renderWithRouter(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div>protected content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>login page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  it('renders children when user is authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      user: { token: 'tok', email: 'user@test.com', role: 'cs' },
    } as ReturnType<typeof useAuthStore>)

    renderWithRouter('/dashboard')

    expect(screen.getByText('protected content')).toBeInTheDocument()
  })

  it('redirects to /login when user is not authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
    } as ReturnType<typeof useAuthStore>)

    renderWithRouter('/dashboard')

    expect(screen.queryByText('protected content')).not.toBeInTheDocument()
    expect(screen.getByText('login page')).toBeInTheDocument()
  })
})
