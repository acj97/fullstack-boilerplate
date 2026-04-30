import '@testing-library/jest-dom'
import { TextDecoder, TextEncoder } from 'util'

Object.assign(globalThis, { TextDecoder, TextEncoder })

// Suppress React's "empty src" warning caused by the image file mock returning ''
const originalError = console.error.bind(console)
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('empty string')) return
    originalError(...args)
  }
})
afterAll(() => {
  console.error = originalError
})
