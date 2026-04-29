import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Button from "../components/Button"
import Input from "../components/Input"
import paymentFlow from "../assets/payment-flow.gif"

type LoginForm = {
  email: string
  password: string
}

function Login() {
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>()

  const onSubmit = async (_data: LoginForm) => {
    setServerError('')
    try {
      // API call goes here
    } catch {
      setServerError('Invalid email or password.')
    }
  }

  return (
    <section className="bg-soft h-screen w-full flex items-center justify-center">
      <div className="w-full max-w-360 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-16 px-16">
        <div className="max-w-125 flex flex-col justify-center">
          <h1 className="font-serif text-5xl font-medium">Durian Pay</h1>
          <h3 className="font-serif text-xl italic text-gray-800">
            Payment Infrastructure for <span className="font-bold text-accent">Scaling Enterprises</span>
          </h3>
          <p className="text-gray-600 mt-4">
            Sign in to track every transaction, settlement, and refund across your merchants
          </p>
          <img src={paymentFlow} alt="Payment flow" className="mt-6 w-full" />
        </div>

        <div className="bg-surface border border-border p-11 md:max-w-115 w-full h-fit">
          <h3 className="font-semibold text-2xl mb-2 font-serif">Welcome back.</h3>
          <h4 className="text-ink-2 text-sm mb-10 font-serif">Sign in to your account.</h4>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <Input
              type="email"
              placeholder="you@company.com"
              label="Email"
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Enter a valid email' },
              })}
            />
            <Input
              type="password"
              placeholder="••••••••"
              label="Password"
              error={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
            />
            {serverError && <p className="text-sm text-danger">{serverError}</p>}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default Login
