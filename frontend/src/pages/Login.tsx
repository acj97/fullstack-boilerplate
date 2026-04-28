import Button from "../components/Button"
import Input from "../components/Input"
import paymentFlow from "../assets/payment-flow.gif"

function Login() {
  return (
    <section className=" bg-soft h-screen w-full flex items-center justify-center">
      <div className="w-full max-w-360 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-16 px-16">
        <div className="max-w-125 flex flex-col justify-center">
          <h1 className="font-serif text-5xl font-medium">
            Durian Pay
          </h1>
          <h3 className="font-serif text-xl italic text-gray-800">
            Payment Infrastructure for <span className="font-bold text-accent">Scaling Enterprises</span>
          </h3>
          <p className="text-gray-600 mt-4">
            Sign in to track every transaction, settlement, and refund across your merchants
          </p>
          <img src={paymentFlow} alt="Payment flow" className="mt-6 w-full" />
        </div>
        <div className="bg-surface border border-border p-11 md:max-w-115 w-full h-fit">
          <h3 className="font-semibold text-2xl mb-2 font-serif">
            Welcome back.
          </h3>
          <h4 className="text-ink-2 text-sm mb-10 font-serif">
            Sign in to your account.
          </h4>
          <Input 
            type="email" 
            placeholder="you@company.com" 
            label="Email"
            className="mb-6"
          />
          <Input 
            type="password" 
            placeholder="••••••••" 
            label="Password"
          />
          <Button>
            Sign In
          </Button>
        </div>
      </div>
      
    </section>
  )
}

export default Login