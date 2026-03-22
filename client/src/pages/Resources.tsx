import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Download, BookOpen, Video, FileText, ExternalLink } from "lucide-react";

export default function Resources() {
  const freeResources = [
    {
      title: "UPSC GS1 Syllabus PDF",
      description: "Complete syllabus for General Studies Paper 1",
      icon: FileText,
      url: "https://upsc.gov.in/sites/default/files/Syllabus-CSP-2020-Engl-31102019.pdf",
    },
    {
      title: "UPSC GS2 Syllabus PDF",
      description: "Complete syllabus for General Studies Paper 2",
      icon: FileText,
      url: "https://upsc.gov.in/sites/default/files/Syllabus-CSP-2020-Engl-31102019.pdf",
    },
    {
      title: "UPSC GS3 Syllabus PDF",
      description: "Complete syllabus for General Studies Paper 3",
      icon: FileText,
      url: "https://upsc.gov.in/sites/default/files/Syllabus-CSP-2020-Engl-31102019.pdf",
    },
    {
      title: "UPSC GS4 Syllabus PDF",
      description: "Complete syllabus for General Studies Paper 4",
      icon: FileText,
      url: "https://upsc.gov.in/sites/default/files/Syllabus-CSP-2020-Engl-31102019.pdf",
    },
    {
      title: "CSAT Syllabus PDF",
      description: "Complete syllabus for Civil Services Aptitude Test",
      icon: FileText,
      url: "https://upsc.gov.in/sites/default/files/Syllabus-CSP-2020-Engl-31102019.pdf",
    },
    {
      title: "Previous Year Papers (2015-2023)",
      description: "All UPSC Prelims papers with solutions",
      icon: FileText,
      url: "https://upsc.gov.in/examinations/previous-question-papers",
    },
    {
      title: "UPSC Strategy Guide",
      description: "Step-by-step guide to crack UPSC in 12 months",
      icon: BookOpen,
      url: "https://www.drishtiias.com/images/pdf/UPSC-Mains-2023-GS-Paper-1-Question-Paper.pdf",
    },
    {
      title: "Topper Notes - Polity",
      description: "Comprehensive notes from UPSC toppers",
      icon: BookOpen,
      url: "https://www.drishtiias.com/hindi/images/pdf/polity-notes.pdf",
    },
  ];

  const books = [
    {
      title: "Indian Polity by M. Laxmikanth",
      author: "M. Laxmikanth",
      description: "The most recommended book for UPSC Polity preparation",
      price: "₹699",
      url: "https://www.amazon.in/dp/9355323816",
    },
    {
      title: "NCERT History Set (Ancient, Medieval, Modern)",
      author: "NCERT",
      description: "Essential for UPSC history section",
      price: "₹1,200",
      url: "https://www.amazon.in/s?k=ncert+history+set+upsc",
    },
    {
      title: "Spectrum's A Brief History of Modern India",
      author: "Rajiv Ahir",
      description: "Comprehensive coverage of modern Indian history",
      price: "₹450",
      url: "https://www.amazon.in/dp/8193975170",
    },
    {
      title: "Geography of India by Majid Husain",
      author: "Majid Husain",
      description: "Best for physical and human geography",
      price: "₹550",
      url: "https://www.amazon.in/s?k=geography+of+india+majid+husain",
    },
  ];

  const videoChannels = [
    {
      name: "Drishti IAS",
      description: "Comprehensive UPSC preparation videos in Hindi & English",
      subscribers: "2M+",
      url: "https://www.youtube.com/@DrishtiIASEnglish",
    },
    {
      name: "ForumIAS",
      description: "In-depth analysis and current affairs",
      subscribers: "1.5M+",
      url: "https://www.youtube.com/@ForumIAS",
    },
    {
      name: "Unacademy UPSC",
      description: "Live classes and doubt sessions",
      subscribers: "5M+",
      url: "https://www.youtube.com/@UnacademyIAS",
    },
    {
      name: "UPSC Pathshala",
      description: "Focused on UPSC mains preparation",
      subscribers: "800K+",
      url: "https://www.youtube.com/@UPSCPathshala",
    },
  ];

  const stateResources = [
    {
      exam: "TSPSC",
      state: "Telangana",
      url: "https://www.tspsc.gov.in/",
      resources: [
        "TSPSC Group 1 Syllabus",
        "Previous Year Papers",
        "State-specific Geography",
        "Telangana History & Culture",
      ],
    },
    {
      exam: "APPSC",
      state: "Andhra Pradesh",
      url: "https://psc.ap.gov.in/",
      resources: [
        "APPSC Group 1 Syllabus",
        "Previous Year Papers",
        "State-specific Geography",
        "AP History & Culture",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Study Resources
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">
            Everything you need for UPSC and state exam preparation
          </p>

          {/* Free Resources */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
              Free Resources
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {freeResources.map((resource, idx) => {
                const Icon = resource.icon;
                return (
                  <Card
                    key={idx}
                    className="p-6 hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <Icon className="w-8 h-8 text-orange-500 flex-shrink-0" />
                      <Download className="w-5 h-5 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                      {resource.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      {resource.description}
                    </p>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full"
                    >
                      <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                        Download Free
                      </Button>
                    </a>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Books */}
          <section className="mb-16 bg-gray-50 dark:bg-slate-800 -mx-4 px-4 py-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
              Recommended Books
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {books.map((book, idx) => (
                <Card
                  key={idx}
                  className="p-6 hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600"
                >
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {book.title}
                  </h3>
                  <p className="text-sm text-orange-500 font-semibold mb-2">
                    {book.author}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {book.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-orange-500">
                      {book.price}
                    </span>
                    <a
                      href={book.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-500 hover:text-orange-600 font-semibold flex items-center gap-2"
                    >
                      Buy on Amazon
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Video Resources */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
              Video Resources
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {videoChannels.map((channel, idx) => (
                <Card
                  key={idx}
                  className="p-8 hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-slate-800 dark:to-slate-700 border-gray-200 dark:border-slate-600"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Video className="w-8 h-8 text-orange-500" />
                    <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                      {channel.subscribers}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {channel.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {channel.description}
                  </p>
                  <a
                    href={channel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-semibold"
                  >
                    Watch on YouTube
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Card>
              ))}
            </div>
          </section>

          {/* State Exam Resources */}
          <section className="mb-16 bg-gray-50 dark:bg-slate-800 -mx-4 px-4 py-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
              State Exam Resources
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {stateResources.map((state, idx) => (
                <Card
                  key={idx}
                  className="p-8 bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600"
                >
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {state.exam}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {state.state}
                    </p>
                  </div>
                  <div className="space-y-3 mb-6">
                    {state.resources.map((resource, ridx) => (
                      <div
                        key={ridx}
                        className="flex items-center gap-3 text-gray-700 dark:text-gray-300"
                      >
                        <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />
                        {resource}
                      </div>
                    ))}
                  </div>
                  <a
                    href={state.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                      Visit Official Site
                    </Button>
                  </a>
                </Card>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Want More Resources?</h2>
            <p className="text-lg mb-8 opacity-90">
              Upgrade to PrepBros Pro for unlimited access to premium study materials, personalized study plans, and expert guidance
            </p>
            <a href="/premium">
              <Button className="bg-white text-orange-600 hover:bg-gray-100 font-bold text-lg px-8 py-6">
                Upgrade to Pro
              </Button>
            </a>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}