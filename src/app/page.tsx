import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center gap-8 text-center">
          <div className="flex flex-col gap-4">
            <h1 className="text-6xl font-bold tracking-tight text-slate-900 sm:text-7xl">
              Welcome to <span className="text-emerald-600">Grid</span>
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl">
              The Income Operating System for the Global Workforce
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 gap-6 mt-12 max-w-5xl w-full sm:grid-cols-3">
            <Card className="bg-white border-slate-200 rounded-xl hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-emerald-600">Earn</CardTitle>
                <CardDescription className="text-slate-500">
                  Receive stablecoin payroll instantly with near-zero fees
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  Get paid in USDC on the Arc Network. No more 5-10% wire fees or waiting days for your money.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 rounded-xl hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-emerald-600">Grow</CardTitle>
                <CardDescription className="text-slate-500">
                  Access US-market yields and tokenized stocks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  Invest in real-world assets and earn yields previously inaccessible to global workers.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 rounded-xl hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-emerald-600">Spend</CardTitle>
                <CardDescription className="text-slate-500">
                  Utilize funds instantly via virtual cards and bill pay
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  Pay bills and spend without manual off-ramping. Your money works when you need it.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="flex flex-col gap-4 mt-12 items-center">
            <div className="flex gap-4">
              <Link href="/login">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg rounded-xl">
                  Get Started
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-8 py-6 text-lg rounded-xl">
                  View Dashboard
                </Button>
              </Link>
            </div>
            <p className="text-sm text-slate-500 mt-4">
              Built on the Arc Network · Powered by Circle & Supabase
            </p>
          </div>

          {/* Tech Stack Badge */}
          <div className="mt-16 p-6 bg-white rounded-xl border border-slate-200">
            <p className="text-sm text-slate-500 mb-3 font-semibold">Built with</p>
            <div className="flex gap-4 flex-wrap justify-center">
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-sm">Next.js</span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-sm">TypeScript</span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-sm">Tailwind CSS</span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-sm">tRPC</span>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-md text-sm font-semibold">shadcn/ui</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
