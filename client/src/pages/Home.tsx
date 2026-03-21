import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Flame, BookOpen, Trophy, TrendingUp, Users, Globe, ArrowRight, Check } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const [streak] = useState(7);

  const features = [
    {
      icon: BookOpen,
      title: "Daily MCQ Practice",
      description: "Solve 10 carefully curated questions every day from all UPSC topics",
    },
    {
      icon: Flame,
      title: "Streak System",
      description: "Build your consistency streak and stay motivated with daily challenges",
    },
    {
      icon: Trophy,
      title: "Weekly Contests",
      description: "Compete with 1,20,000+ aspirants and rank on the leaderboard",
    },
    {
      icon: TrendingUp,
      title: "Topic-wise Bank",
      description: "Access 50,000+ questions organized by topic and difficulty",
    },
    {
      icon: Globe,
      title: "Free Resources",
      description: "Download syllabus PDFs, previous year papers, and strategy guides",
    },
    {
      icon: Users,
      title: "State Exams",
      description: "Prepare for TSPSC, APPSC, and other state-level exams",
    },
  ];

  const testimonials = [
    {
      name: "Arjun Sharma",
      city: "Hyderabad",
      target: "UPSC CSE 2026",
      quote: "PrepBros helped me maintain a consistent study streak. The daily MCQs are exactly at UPSC level!",
      avatar: "AS",
    },
    {
      name: "Priya Patel",
      city: "Bangalore",
      target: "UPSC CSE 2025",
      quote: "The leaderboard competitions keep me motivated. Best free platform for UPSC prep!",
      avatar: "PP",
    },
    {
      name: "Vikram Reddy",
      city: "Telangana",
      target: "TSPSC Group 1",
      quote: "Free, comprehensive, and exactly what serious aspirants need. Highly recommended!",
      avatar: "VR",
    },
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "₹0",
      period: "Forever",
      features: [
        "10 daily MCQ questions",
        "Streak tracking",
        "Weekly contests",
        "Topic-wise practice",
        "Basic resources",
      ],
      cta: "Start Practicing",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "₹199",
      period: "/month",
      features: [
        "Unlimited MCQ questions",
        "Advanced analytics",
        "Priority contest ranking",
        "Personalized study plan",
        "Premium resources",
        "Ad-free experience",
      ],
      cta: "Get Pro",
      highlighted: true,
    },
    {
      name: "Annual",
      price: "₹999",
      period: "/year",
      features: [
        "All Pro features",
        "Save 58% vs monthly",
        "Lifetime access",
        "Priority support",
        "Exclusive webinars",
        "1-on-1 mentoring",
      ],
      cta: "Get Annual",
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32 bg-gradient-to-br from-orange-50 to-white dark:from-slate-800 dark:to-slate-900">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 right-10 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl" />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-fade-in-up">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight">
                  Crack UPSC Without Spending ₹1 Lakh
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  Free daily MCQ practice, streaks, contests and study resources — built for serious aspirants.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/practice">
                  <a>
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2">
                      Start Practicing Free
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </a>
                </Link>
                <Link href="/contests">
                  <a>
                    <Button variant="outline" className="border-2 border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-200">
                      View Today's Questions
                    </Button>
                  </a>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-orange-600">1.2L+</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Aspirants</p>
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-orange-600">50K+</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Questions</p>
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-orange-600">100%</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Free Forever</p>
                </div>
              </div>
            </div>

            {/* Right - Streak Widget */}
            <div className="relative h-96 md:h-full flex items-center justify-center">
              <Card className="w-full max-w-sm p-8 bg-white dark:bg-slate-800 border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105 duration-300">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Your Streak</h3>
                    <Flame className="w-8 h-8 text-orange-500 animate-pulse" />
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-8 text-center">
                    <p className="text-6xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                      {streak}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                      Days Consistent
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500" />
                      <p className="text-gray-700 dark:text-gray-300">Today's questions solved</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500" />
                      <p className="text-gray-700 dark:text-gray-300">Accuracy: 92%</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500" />
                      <p className="text-gray-700 dark:text-gray-300">Rank: #1,234</p>
                    </div>
                  </div>

                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg transition-all duration-200">
                    Continue Practicing
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Everything You Need to Crack UPSC
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Comprehensive tools and resources designed specifically for serious UPSC aspirants
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={idx}
                  className="p-8 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-6 group-hover:bg-orange-200 dark:group-hover:bg-orange-800/40 transition-colors duration-300">
                    <Icon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 md:py-28 bg-gray-50 dark:bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Loved by Aspirants
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Join thousands of successful UPSC candidates
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <Card
                key={idx}
                className="p-8 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.city} • {testimonial.target}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed">
                  "{testimonial.quote}"
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 md:py-28 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Start free, upgrade anytime. No hidden charges.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, idx) => (
              <Card
                key={idx}
                className={`p-8 rounded-xl border transition-all duration-300 ${
                  plan.highlighted
                    ? "border-orange-500 bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/20 dark:to-slate-900 shadow-xl scale-105 md:scale-100"
                    : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-lg"
                }`}
              >
                {plan.highlighted && (
                  <div className="mb-4 inline-block px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
                    MOST POPULAR
                  </div>
                )}

                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">
                    {plan.price}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 ml-2">
                    {plan.period}
                  </span>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                    plan.highlighted
                      ? "bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl"
                      : "bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-600"
                  }`}
                >
                  {plan.cta}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Your UPSC Journey?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Join 1,20,000+ aspirants who are preparing with PrepBros. Start for free today.
          </p>
          <Link href="/practice">
            <a>
              <Button className="bg-white hover:bg-gray-100 text-orange-600 font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                Start Practicing Now
              </Button>
            </a>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
