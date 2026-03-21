import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Flame, TrendingUp, Target, Trophy, ArrowRight, AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const stats = [
    {
      label: "Questions Solved",
      value: "342",
      icon: Target,
      color: "text-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-900",
    },
    {
      label: "Current Streak",
      value: "12",
      icon: Flame,
      color: "text-orange-500",
      bgColor: "bg-orange-100 dark:bg-orange-900",
    },
    {
      label: "Accuracy",
      value: "84%",
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-100 dark:bg-green-900",
    },
    {
      label: "Contest Rank",
      value: "#247",
      icon: Trophy,
      color: "text-purple-500",
      bgColor: "bg-purple-100 dark:bg-purple-900",
    },
  ];

  const recentActivity = [
    {
      topic: "Polity",
      score: "8/10",
      date: "Today, 2:30 PM",
      difficulty: "Medium",
    },
    {
      topic: "History",
      score: "9/10",
      date: "Yesterday, 6:15 PM",
      difficulty: "Hard",
    },
    {
      topic: "Geography",
      score: "7/10",
      date: "2 days ago",
      difficulty: "Easy",
    },
    {
      topic: "Economy",
      score: "8/10",
      date: "3 days ago",
      difficulty: "Medium",
    },
    {
      topic: "Environment",
      score: "6/10",
      date: "4 days ago",
      difficulty: "Hard",
    },
  ];

  const weakTopics = [
    {
      topic: "Environment",
      accuracy: 62,
      questionsAttempted: 45,
    },
    {
      topic: "Science & Technology",
      accuracy: 71,
      questionsAttempted: 38,
    },
    {
      topic: "Current Affairs",
      accuracy: 68,
      questionsAttempted: 52,
    },
  ];

  const upcomingContest = {
    name: "Weekly Contest #14",
    date: "March 28, 2026",
    time: "6:00 PM IST",
    duration: "60 minutes",
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Greeting */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-2">
              Welcome back, Arjun! 🔥
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Day 12 Streak - Keep it going!
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={idx}
                  className="p-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                >
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {stat.value}
                  </p>
                </Card>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Today's Progress */}
              <Card className="p-8 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                  Today's Progress
                </h2>

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-gray-600 dark:text-gray-400">
                      Daily Goal: 10 questions
                    </p>
                    <p className="font-bold text-slate-900 dark:text-white">
                      7/10 completed
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: "70%" }}
                    />
                  </div>
                </div>

                <Link href="/practice">
                  <a>
                    <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-6">
                      Continue Practice
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </a>
                </Link>
              </Card>

              {/* Recent Activity */}
              <Card className="p-8 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                  Recent Activity
                </h2>

                <div className="space-y-4">
                  {recentActivity.map((activity, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {activity.topic}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {activity.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-orange-500">
                          {activity.score}
                        </p>
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          activity.difficulty === "Easy"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : activity.difficulty === "Medium"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}>
                          {activity.difficulty}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Weak Topics */}
              <Card className="p-8 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                  Topics to Improve
                </h2>

                <div className="space-y-4">
                  {weakTopics.map((topic, idx) => (
                    <div
                      key={idx}
                      className="p-4 border-2 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {topic.topic}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {topic.questionsAttempted} questions attempted
                          </p>
                        </div>
                        <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                          {topic.accuracy}%
                        </span>
                      </div>
                      <div className="w-full bg-red-200 dark:bg-red-800 rounded-full h-2 mb-3">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{ width: `${topic.accuracy}%` }}
                        />
                      </div>
                      <Link href="/practice">
                        <a>
                          <Button
                            variant="outline"
                            className="w-full border-red-500 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                          >
                            Practice Now
                          </Button>
                        </a>
                      </Link>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Upcoming Contest */}
              <Card className="p-8 bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
                <h3 className="text-xl font-bold mb-4">Upcoming Contest</h3>
                <div className="space-y-3 mb-6">
                  <div>
                    <p className="text-sm opacity-75">Contest</p>
                    <p className="font-bold text-lg">{upcomingContest.name}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-75">Date & Time</p>
                    <p className="font-bold">{upcomingContest.date}</p>
                    <p className="font-bold">{upcomingContest.time}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-75">Duration</p>
                    <p className="font-bold">{upcomingContest.duration}</p>
                  </div>
                </div>
                <Link href="/contests">
                  <a>
                    <Button className="w-full bg-white text-orange-600 hover:bg-gray-100 font-bold">
                      Register Now
                    </Button>
                  </a>
                </Link>
              </Card>

              {/* Upgrade CTA */}
              <Card className="p-8 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 border-gray-200 dark:border-slate-600">
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">
                      Unlock Premium
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Get unlimited questions, advanced analytics, and personalized study plans
                    </p>
                    <Link href="/premium">
                      <a>
                        <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold">
                          Upgrade to Pro
                        </Button>
                      </a>
                    </Link>
                  </div>
                </div>
              </Card>

              {/* Quick Stats */}
              <Card className="p-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">
                  This Week
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-gray-600 dark:text-gray-400">Questions</p>
                    <p className="font-bold text-slate-900 dark:text-white">
                      47
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-gray-600 dark:text-gray-400">Avg Accuracy</p>
                    <p className="font-bold text-slate-900 dark:text-white">
                      85%
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-gray-600 dark:text-gray-400">Study Time</p>
                    <p className="font-bold text-slate-900 dark:text-white">
                      12h 45m
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
