import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { getPayments } from '../../api/payments'
import Dashboard from '../../pages/Dashboard'
import { useAuthStore } from '../../store/authStore'

jest.mock('../../api/payments', () => ({ getPayments: jest.fn() }))
jest.mock('../../store/authStore', () => ({ useAuthStore: jest.fn() }))

const mockGetPayments = getPayments as jest.MockedFunction<typeof getPayments>
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>

const MOCK_PAYMENTS = [
  {
    id: 'p1',
    merchant_name: 'Tokopedia',
    created_at: '2024-01-15T10:00:00Z',
    amount: '50000',
    status: 'completed' as const,
  },
  {
    id: 'p2',
    merchant_name: 'Shopee',
    created_at: '2024-01-16T12:00:00Z',
    amount: '75000',
    status: 'failed' as const,
  },
]

// stats: total=30, completed=20, failed=5  |  table: returns MOCK_PAYMENTS
function setupPaymentsMock() {
  mockGetPayments.mockImplementation((_token, params) => {
    if (params?.status === 'completed')
      return Promise.resolve({ payments: [], total: 20, page: 1, page_size: 1 })
    if (params?.status === 'failed')
      return Promise.resolve({ payments: [], total: 5, page: 1, page_size: 1 })
    if (params?.page_size === 1)
      return Promise.resolve({ payments: [], total: 30, page: 1, page_size: 1 })
    return Promise.resolve({ payments: MOCK_PAYMENTS, total: 30, page: 1, page_size: 5 })
  })
}

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAuthStore.mockReturnValue({
      user: { token: 'test-token', email: 'user@test.com', role: 'cs' },
    } as ReturnType<typeof useAuthStore>)
    setupPaymentsMock()
  })

  describe('data loading', () => {
    it('renders payment rows from API response', async () => {
      render(<Dashboard />)
      expect(await screen.findByText('Tokopedia')).toBeInTheDocument()
      expect(screen.getByText('Shopee')).toBeInTheDocument()
    })

    it('shows stat card totals fetched independently of the table', async () => {
      render(<Dashboard />)
      // total=30, success=20, failed=5 come from 3 separate page_size=1 calls
      expect(await screen.findByText('30')).toBeInTheDocument()
      expect(screen.getByText('20')).toBeInTheDocument()
      // '5' also appears in pagination buttons, so scope to the stat card
      const failedCard = screen.getByText('Failed Payment').parentElement!
      expect(within(failedCard).getByText('5')).toBeInTheDocument()
    })
  })

  describe('filtering and sorting', () => {
    it('re-fetches with status param when a filter is selected', async () => {
      render(<Dashboard />)
      await screen.findByText('Tokopedia') // wait for initial load

      mockGetPayments.mockClear()
      setupPaymentsMock()

      await userEvent.click(screen.getByText('All statuses'))
      await userEvent.click(screen.getByRole('button', { name: /completed/i }))

      await waitFor(() => {
        const tableCalls = mockGetPayments.mock.calls.filter(
          ([, params]) => params?.page_size !== 1
        )
        expect(tableCalls[0][1]).toMatchObject({ status: 'completed' })
      })
    })

    it('re-fetches with sort param when a sortable column header is clicked', async () => {
      render(<Dashboard />)
      await screen.findByText('Tokopedia')

      mockGetPayments.mockClear()
      setupPaymentsMock()

      await userEvent.click(screen.getByRole('button', { name: /amount/i }))

      await waitFor(() => {
        const tableCalls = mockGetPayments.mock.calls.filter(
          ([, params]) => params?.page_size !== 1
        )
        expect(tableCalls[0][1]).toMatchObject({ sort: 'amount' })
      })
    })

    it('re-fetches with search param after the debounce period', async () => {
      render(<Dashboard />)
      await screen.findByText('Tokopedia')

      mockGetPayments.mockClear()
      setupPaymentsMock()

      await userEvent.type(screen.getByPlaceholderText('Search merchant...'), 'Gojek')

      await waitFor(
        () => {
          const tableCalls = mockGetPayments.mock.calls.filter(
            ([, params]) => params?.page_size !== 1
          )
          expect(tableCalls[0][1]).toMatchObject({ search: 'Gojek' })
        },
        { timeout: 2000 }
      )
    })
  })
})
