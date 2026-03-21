import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Trophy, Clock, Users } from "lucide-react";

interface Contest {
  id: number;
  name: string;
  date: string;
  duration: string;
  topics: string;
  prize: string;
  status: "upcoming" | "past";
  winner?: string;
  yourRank?: number;
}

export default function Contests() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [countdown, setCountdown] = useState({
    days: 2,
    hours: 14,
    minutes: 32,
    seconds: 45,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        let { days, hours, minutes, seconds } = prev;
        seconds--;

        if (seconds < 0) {
          seconds = 59;
          minutes--;
        }
        if (minutes < 0) {
          minutes = 59;
          hours--;
        }
        if (hours < 0) {
          hours = 23;
          days--;
        }
        if (days < 0) {
          days = 0;
          hours = 0;
          minutes = 0;
          seconds = 0;
        }

        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const upcomingContests: Contest[] = [
    {
      id: 1,
      name: "Weekly Contest #14",
      date: "March 28, 2026",
      duration: "60 minutes",
      topics: "GS1 + CSAT",
      prize: "PrepBros Pro subscription",
      status: "upcoming",
    },
    {
      id: 2,
      name: "Monthly Challenge - March",
      date: "March 31, 2026",
      duration: "120 minutes",
      topics: "All GS Subjects",
      prize: "₹5,000 PrepBros Pro credits",
      status: "upcoming",
    },
    {
      id: 3,
      name: "State Exam Special - TSPSC",
      date: "April 5, 2026",
      duration: "90 minutes",
      topics: "TSPSC Group 1 Syllabus",
      prize: "Premium resources bundle",
      status: "upcoming",
    },
  ];

  const pastContests: Contest[] = [
    {
      id: 101,
      name: "Weekly Contest #13",
      date: "March 21, 2026",
      duration: "60 minutes",
      topics: "GS2 + CSAT",
      prize: "PrepBros Pro subscription",
      status: "past",
      winner: "Arjun Sharma",
      yourRank: 247,
    },
    {
      id: 102,
      name: "Monthly Challenge - February",
      date: "February 28, 2026",
      duration: "120 minutes",
      topics: "All GS Subjects",
      prize: "₹5,000 PrepBros Pro credits",
      status: "past",
      winner: "Priya Patel",
      yourRank: 1543,
    },
    {
      id: 103,
      name: "State Exam Special - APPSC",
      date: "February 20, 2026",
      duration: "90 minutes",
      topics: "APPSC Group 1 Syllabus",
      prize: "Premium resources bundle",
      status: "past",
      winner: "Vikram Reddy",
      yourRank: 892,
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navbar />

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Weekly Contest #14
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Compete with thousands of aspirants and climb the leaderboard
            </p>

            {/* Countdown Timer */}
            <div className="bg-white/20 backdrop-blur rounded-lg p-8 mb-8">
              <p className="text-sm opacity-90 mb-4">Starts in</p>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-4xl font-bold">
                    {String(countdown.days).padStart(2, "0")}
                  </div>
                  <p className="text-sm opacity-75 mt-2">Days</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold">
                    {String(countdown.hours).padStart(2, "0")}
                  </div>
                  <p className="text-sm opacity-75 mt-2">Hours</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold">
                    {String(countdown.minutes).padStart(2, "0")}
                  </div>
                  <p className="text-sm opacity-75 mt-2">Minutes</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold">
                    {String(countdown.seconds).padStart(2, "0")}
                  </div>
                  <p className="text-sm opacity-75 mt-2">Seconds</p>
                </div>
              </div>
            </div>

            <Button className="bg-white text-orange-600 hover:bg-gray-100 font-bold text-lg px-8 py-6">
              Register Now
            </Button>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === "upcoming"
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              Upcoming Contests
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === "past"
                  ? "text-orange-500 border-b-2 border-orange-500"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              Past Contests
            </button>
          </div>

          {/* Contest Cards */}
          <div className="space-y-6 mb-12">
            {(activeTab === "upcoming" ? upcomingContests : pastContests).map(
              (contest) => (
                <Card
                  key={contest.id}
                  className="p-8 hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                >
                  <div className="grid md:grid-cols-3 gap-8 mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        {contest.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {contest.date}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                        <Clock className="w-5 h-5 text-orange-500" />
                        <span>{contest.duration}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                        <Trophy className="w-5 h-5 text-orange-500" />
                        <span>{contest.topics}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Prize
                      </p>
                      <p className="font-bold text-slate-900 dark:text-white mb-4">
                        {contest.prize}
                      </p>
                      {activeTab === "upcoming" ? (
                        <Button className="bg-orange-500 hover:bg-orange-600 text-white w-full">
                          Register
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Your Rank: <span className="font-bold text-orange-500">#{contest.yourRank}</span>
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Winner: <span className="font-bold">{contest.winner}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )
            )}
          </div>
        </div>
      </section>

      {/* Contest Format Explanation */}
      <section className="bg-gray-50 dark:bg-slate-800 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
              Contest Format
            </h2>

            <div className="grid md:grid-cols-4 gap-6">
              <Card className="p-6 bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600">
                <div className="text-4xl font-bold text-orange-500 mb-2">60</div>
                <p className="text-gray-600 dark:text-gray-400">Questions</p>
              </Card>
              <Card className="p-6 bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600">
                <div className="text-4xl font-bold text-orange-500 mb-2">60</div>
                <p className="text-gray-600 dark:text-gray-400">Minutes</p>
              </Card>
              <Card className="p-6 bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600">
                <div className="text-4xl font-bold text-orange-500 mb-2">GS1 + CSAT</div>
                <p className="text-gray-600 dark:text-gray-400">Topics</p>
              </Card>
              <Card className="p-6 bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600">
                <div className="text-4xl font-bold text-orange-500 mb-2">Score</div>
                <p className="text-gray-600 dark:text-gray-400">Then Time</p>
              </Card>
            </div>

            <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700">
              <p className="text-blue-900 dark:text-blue-200">
                <span className="font-bold">Ranking:</span> Contestants are ranked by their score first, then by the time taken to complete the quiz. Higher scores rank better, and among equal scores, faster completion ranks higher.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
