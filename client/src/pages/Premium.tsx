import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check, X } from "lucide-react";

export default function Premium() {
  const plans = [
    {
      name: "Free",
      price: "₹0",
      period: "Forever",
      description: "Perfect for getting started",
      features: [
        { name: "10 daily MCQ questions", included: true },
        { name: "Streak tracking", included: true },
        { name: "Weekly contests", included: true },
        { name: "Topic-wise practice", included: true },
        { name: "Basic resources", included: true },
        { name: "Unlimited questions", included: false },
        { name: "Advanced analytics", included: false },
        { name: "Priority support", included: false },
        { name: "Personalized study plan", included: false },
        { name: "Ad-free experience", included: false },
      ],
      cta: "Start Free",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "₹199",
      period: "/month",
      description: "Most popular choice",
      features: [
        { name: "10 daily MCQ questions", included: true },
        { name: "Streak tracking", included: true },
        { name: "Weekly contests", included: true },
        { name: "Topic-wise practice", included: true },
        { name: "Basic resources", included: true },
        { name: "Unlimited questions", included: true },
        { name: "Advanced analytics", included: true },
        { name: "Priority support", included: true },
        { name: "Personalized study plan", included: true },
        { name: "Ad-free experience", included: true },
      ],
      cta: "Get Pro",
      highlighted: true,
    },
    {
      name: "Annual",
      price: "₹999",
      period: "/year",
      description: "Best value - Save 58%",
      features: [
        { name: "10 daily MCQ questions", included: true },
        { name: "Streak tracking", included: true },
        { name: "Weekly contests", included: true },
        { name: "Topic-wise practice", included: true },
        { name: "Basic resources", included: true },
        { name: "Unlimited questions", included: true },
        { name: "Advanced analytics", included: true },
        { name: "Priority support", included: true },
        { name: "Personalized study plan", included: true },
        { name: "Ad-free experience", included: true },
      ],
      cta: "Get Annual",
      highlighted: false,
    },
  ];

  const faqs = [
    {
      question: "Can I cancel my subscription anytime?",
      answer:
        "Yes, you can cancel your PrepBros Pro subscription anytime. No questions asked. Your access will continue until the end of your billing cycle.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards, debit cards, and digital payment methods including Google Pay, Apple Pay, and UPI through Razorpay.",
    },
    {
      question: "Is there a free trial for Pro?",
      answer:
        "Currently, we don't offer a free trial, but you can start with our Free plan to explore all features. The Pro plan is very affordable at ₹199/month.",
    },
    {
      question: "Can I upgrade from monthly to annual?",
      answer:
        "Yes, you can upgrade to the annual plan anytime. We'll credit the remaining balance from your monthly subscription.",
    },
    {
      question: "Do you offer refunds?",
      answer:
        "We offer a 7-day money-back guarantee if you're not satisfied with PrepBros Pro. Contact our support team for assistance.",
    },
    {
      question: "Will my progress be saved if I upgrade?",
      answer:
        "Absolutely! All your practice history, streaks, and performance data will be preserved when you upgrade to Pro.",
    },
  ];

  const testimonials = [
    {
      name: "Arjun Sharma",
      role: "PrepBros Pro User",
      quote:
        "The unlimited questions and advanced analytics helped me identify my weak areas. Cleared UPSC Prelims with 98 marks!",
      avatar: "AS",
    },
    {
      name: "Priya Patel",
      role: "PrepBros Pro User",
      quote:
        "The personalized study plan saved me so much time. Worth every rupee. Highly recommend for serious aspirants.",
      avatar: "PP",
    },
    {
      name: "Vikram Reddy",
      role: "PrepBros Pro User",
      quote:
        "Priority support was amazing. Got my doubts cleared within hours. The best investment for UPSC prep!",
      avatar: "VR",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Upgrade Your UPSC Prep
            </h1>
            <p className="text-xl opacity-90">
              Get unlimited access to questions, advanced analytics, and personalized study plans
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white text-center mb-12">
              Simple, Transparent Pricing
            </h2>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {plans.map((plan, idx) => (
                <Card
                  key={idx}
                  className={`p-8 transition-all duration-300 ${
                    plan.highlighted
                      ? "border-2 border-orange-500 shadow-2xl transform scale-105 bg-white dark:bg-slate-700"
                      : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800"
                  }`}
                >
                  {plan.highlighted && (
                    <div className="bg-orange-500 text-white text-sm font-bold px-4 py-2 rounded-full inline-block mb-4">
                      Most Popular
                    </div>
                  )}

                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                    {plan.description}
                  </p>

                  <div className="mb-6">
                    <span className="text-5xl font-bold text-slate-900 dark:text-white">
                      {plan.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 ml-2">
                      {plan.period}
                    </span>
                  </div>

                  <Button
                    className={`w-full mb-8 font-bold text-lg py-6 ${
                      plan.highlighted
                        ? "bg-orange-500 hover:bg-orange-600 text-white"
                        : "border-2 border-orange-500 text-orange-500 hover:bg-orange-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    {plan.cta}
                  </Button>

                  <div className="space-y-4">
                    {plan.features.map((feature, fidx) => (
                      <div key={fidx} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 dark:text-gray-600 flex-shrink-0 mt-0.5" />
                        )}
                        <span
                          className={`${
                            feature.included
                              ? "text-gray-700 dark:text-gray-300"
                              : "text-gray-400 dark:text-gray-500 line-through"
                          }`}
                        >
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 dark:bg-slate-800 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white text-center mb-12">
              What Premium Users Say
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, idx) => (
                <Card
                  key={idx}
                  className="p-8 bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 italic">
                    "{testimonial.quote}"
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white text-center mb-12">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              {faqs.map((faq, idx) => (
                <Card
                  key={idx}
                  className="p-8 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                >
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {faq.answer}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Crack UPSC?
            </h2>
            <p className="text-xl opacity-90 mb-8">
              Join thousands of aspirants who are already using PrepBros Pro
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-white text-orange-600 hover:bg-gray-100 font-bold text-lg px-8 py-6">
                Get Pro - ₹199/month
              </Button>
              <Button className="border-2 border-white text-white hover:bg-white/10 font-bold text-lg px-8 py-6">
                Get Annual - ₹999/year
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
