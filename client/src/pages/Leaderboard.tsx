import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Medal, Flame } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  name: string;
  state: string;
  streak: number;
  questionsSolved: number;
  accuracy: number;
  avatar: string;
}

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState<"daily" | "weekly" | "alltime" | "state">("daily");
  const [selectedState, setSelectedState] = useState("all");

  const leaderboardData: LeaderboardEntry[] = [
    {
      rank: 1,
      name: "Arjun Sharma",
      state: "Telangana",
      streak: 45,
      questionsSolved: 1250,
      accuracy: 87,
      avatar: "AS",
    },
    {
      rank: 2,
      name: "Priya Patel",
      state: "Gujarat",
      streak: 38,
      questionsSolved: 1180,
      accuracy: 85,
      avatar: "PP",
    },
    {
      rank: 3,
      name: "Vikram Reddy",
      state: "Andhra Pradesh",
      streak: 42,
      questionsSolved: 1320,
      accuracy: 82,
      avatar: "VR",
    },
    {
      rank: 4,
      name: "Neha Singh",
      state: "Delhi",
      streak: 28,
      questionsSolved: 980,
      accuracy: 88,
      avatar: "NS",
    },
    {
      rank: 5,
      name: "Rohit Kumar",
      state: "Karnataka",
      streak: 35,
      questionsSolved: 1100,
      accuracy: 84,
      avatar: "RK",
    },
    {
      rank: 6,
      name: "Anjali Verma",
      state: "Uttar Pradesh",
      streak: 22,
      questionsSolved: 850,
      accuracy: 86,
      avatar: "AV",
    },
    {
      rank: 7,
      name: "Karan Desai",
      state: "Maharashtra",
      streak: 31,
      questionsSolved: 1050,
      accuracy: 83,
      avatar: "KD",
    },
    {
      rank: 8,
      name: "Divya Nair",
      state: "Kerala",
      streak: 26,
      questionsSolved: 920,
      accuracy: 89,
      avatar: "DN",
    },
    {
      rank: 9,
      name: "Sanjay Gupta",
      state: "Rajasthan",
      streak: 19,
      questionsSolved: 780,
      accuracy: 81,
      avatar: "SG",
    },
    {
      rank: 10,
      name: "Meera Iyer",
      state: "Tamil Nadu",
      streak: 33,
      questionsSolved: 1200,
      accuracy: 85,
      avatar: "MI",
    },
  ];

  const states = ["All India", "Telangana", "Andhra Pradesh", "Karnataka", "Maharashtra", "Gujarat"];

  const topThree = leaderboardData.slice(0, 3);
  const restOfLeaderboard = leaderboardData.slice(3);

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-yellow-500";
      case 2:
        return "text-gray-400";
      case 3:
        return "text-orange-600";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Leaderboard
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">
            See where you stand among thousands of aspirants
          </p>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-12 border-b border-gray-200 dark:border-slate-700 pb-4">
            {["daily", "weekly", "alltime", "state"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab as any);
                  if (tab !== "state") setSelectedState("all");
                }}
                className={`px-4 py-2 font-semibold transition-colors capitalize ${
                  activeTab === tab
                    ? "text-orange-500 border-b-2 border-orange-500"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                {tab === "alltime" ? "All Time" : tab === "state" ? "By State" : tab}
              </button>
            ))}
          </div>

          {/* State Filter */}
          {activeTab === "state" && (
            <div className="mb-8 flex flex-wrap gap-2">
              {states.map((state) => (
                <button
                  key={state}
                  onClick={() => setSelectedState(state)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedState === state
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {state}
                </button>
              ))}
            </div>
          )}

          {/* Podium - Top 3 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
              Top Performers
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {/* 2nd Place */}
              <div className="md:order-1">
                <Card className="p-8 text-center bg-gradient-to-b from-gray-100 to-gray-50 dark:from-slate-700 dark:to-slate-800 border-gray-300 dark:border-slate-600">
                  <Medal className={`w-12 h-12 mx-auto mb-4 ${getMedalColor(2)}`} />
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                    {topThree[1].avatar}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {topThree[1].name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {topThree[1].state}
                  </p>
                  <div className="text-3xl font-bold text-gray-500 mb-4">
                    2nd
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600 dark:text-gray-400">
                      <Flame className="w-4 h-4 inline text-orange-500 mr-1" />
                      {topThree[1].streak} day streak
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {topThree[1].questionsSolved} questions
                    </p>
                  </div>
                </Card>
              </div>

              {/* 1st Place */}
              <div className="md:order-2 md:scale-110">
                <Card className="p-8 text-center bg-gradient-to-b from-yellow-100 to-yellow-50 dark:from-yellow-900 dark:to-yellow-800 border-yellow-400 dark:border-yellow-600 shadow-2xl">
                  <Medal className={`w-16 h-16 mx-auto mb-4 ${getMedalColor(1)}`} />
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                    {topThree[0].avatar}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-yellow-100 mb-2">
                    {topThree[0].name}
                  </h3>
                  <p className="text-gray-700 dark:text-yellow-200 text-sm mb-4">
                    {topThree[0].state}
                  </p>
                  <div className="text-4xl font-bold text-yellow-600 dark:text-yellow-300 mb-4">
                    🏆 1st
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-700 dark:text-yellow-200">
                      <Flame className="w-4 h-4 inline text-orange-500 mr-1" />
                      {topThree[0].streak} day streak
                    </p>
                    <p className="text-gray-700 dark:text-yellow-200">
                      {topThree[0].questionsSolved} questions
                    </p>
                  </div>
                </Card>
              </div>

              {/* 3rd Place */}
              <div className="md:order-3">
                <Card className="p-8 text-center bg-gradient-to-b from-orange-100 to-orange-50 dark:from-orange-900 dark:to-orange-800 border-orange-300 dark:border-orange-600">
                  <Medal className={`w-12 h-12 mx-auto mb-4 ${getMedalColor(3)}`} />
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-300 to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                    {topThree[2].avatar}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {topThree[2].name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {topThree[2].state}
                  </p>
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-300 mb-4">
                    3rd
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600 dark:text-gray-400">
                      <Flame className="w-4 h-4 inline text-orange-500 mr-1" />
                      {topThree[2].streak} day streak
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {topThree[2].questionsSolved} questions
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>

          {/* Full Leaderboard Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200 dark:border-slate-700">
                  <th className="text-left py-4 px-4 font-bold text-gray-700 dark:text-gray-300">
                    Rank
                  </th>
                  <th className="text-left py-4 px-4 font-bold text-gray-700 dark:text-gray-300">
                    Name
                  </th>
                  <th className="text-left py-4 px-4 font-bold text-gray-700 dark:text-gray-300">
                    State
                  </th>
                  <th className="text-center py-4 px-4 font-bold text-gray-700 dark:text-gray-300">
                    Streak
                  </th>
                  <th className="text-center py-4 px-4 font-bold text-gray-700 dark:text-gray-300">
                    Questions
                  </th>
                  <th className="text-center py-4 px-4 font-bold text-gray-700 dark:text-gray-300">
                    Accuracy
                  </th>
                </tr>
              </thead>
              <tbody>
                {restOfLeaderboard.map((entry, idx) => (
                  <tr
                    key={entry.rank}
                    className={`border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors ${
                      idx === restOfLeaderboard.length - 1 ? "" : ""
                    }`}
                  >
                    <td className="py-4 px-4">
                      <span className="font-bold text-lg text-slate-900 dark:text-white">
                        #{entry.rank}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center font-bold text-orange-600 dark:text-orange-300">
                          {entry.avatar}
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {entry.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                      {entry.state}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {entry.streak}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center font-semibold text-slate-900 dark:text-white">
                      {entry.questionsSolved}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full font-semibold">
                        {entry.accuracy}%
                      </span>
                    </td>
                  </tr>
                ))}

                {/* Current User Row */}
                <tr className="border-t-2 border-orange-500 bg-orange-50 dark:bg-orange-900">
                  <td className="py-4 px-4">
                    <span className="font-bold text-lg text-orange-600 dark:text-orange-300">
                      #247
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center font-bold text-white">
                        YOU
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        You (Login to track)
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                    —
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span className="font-semibold text-slate-900 dark:text-white">
                        —
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center font-semibold text-slate-900 dark:text-white">
                    —
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-block px-3 py-1 bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200 rounded-full font-semibold">
                      —
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Want to see your rank on the leaderboard?
            </p>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              Login to Track Your Progress
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
