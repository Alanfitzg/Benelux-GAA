"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Newspaper,
  Calendar,
  Trophy,
  Landmark,
  Mail,
  Loader2,
  LogOut,
  Download,
} from "lucide-react";
import FixturesManager from "./FixturesManager";
import StandingsManager from "./StandingsManager";
import TimelineManager from "./TimelineManager";
import NewsManager from "../components/NewsManager";
import type { Fixture } from "../data/fixtures";

interface CompetitionSection {
  id: string;
  name: string;
  shortName: string;
  color: string;
  bgColor: string;
  borderColor: string;
  subtitle: string;
  status: "upcoming" | "in_progress" | "complete";
  nextFixture?: string;
  pools?: { name: string; teams: string[] }[];
  teams?: string[];
}

interface TimelineEvent {
  year: number;
  month?: string;
  title: string;
  description: string;
  category:
    | "founding"
    | "championship"
    | "milestone"
    | "award"
    | "international"
    | "sponsorship";
  sourceUrl?: string;
  sourceName?: string;
  clubCrests?: string[];
  imageUrl?: string;
  featured?: boolean;
}

const tabs = [
  { id: "news", label: "News", icon: Newspaper },
  { id: "fixtures", label: "Fixtures", icon: Calendar },
  { id: "standings", label: "Standings", icon: Trophy },
  { id: "timeline", label: "Timeline", icon: Landmark },
  { id: "subscribers", label: "Subscribers", icon: Mail },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function BeneluxAdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("news");
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [standings, setStandings] = useState<CompetitionSection[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [fixturesRes, standingsRes, timelineRes] = await Promise.all([
        fetch("/api/admin/site-data?key=fixtures"),
        fetch("/api/admin/site-data?key=standings"),
        fetch("/api/admin/site-data?key=timeline"),
      ]);

      const fixturesData = await fixturesRes.json();
      const standingsData = await standingsRes.json();
      const timelineData = await timelineRes.json();

      if (fixturesData.data) setFixtures(fixturesData.data);
      if (standingsData.data) setStandings(standingsData.data);
      if (timelineData.data) setTimeline(timelineData.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleSave(key: string, data: unknown) {
    const res = await fetch("/api/admin/site-data", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, data }),
    });

    if (!res.ok) throw new Error("Failed to save");

    setSaveStatus(`${key} saved successfully`);
    setTimeout(() => setSaveStatus(null), 3000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#2B9EB3]" />
          <span className="text-gray-500">Loading admin dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#1a3a4a] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/images/Benelux Crest white background.png"
              alt="Benelux GAA"
              width={50}
              height={50}
              className="object-contain"
              unoptimized
            />
            <div>
              <h1 className="text-white font-bold text-lg">
                Benelux GAA Admin
              </h1>
              <p className="text-white/50 text-xs">Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {saveStatus && (
              <span className="text-green-400 text-sm font-medium animate-pulse">
                {saveStatus}
              </span>
            )}
            <Link
              href="/"
              className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors"
            >
              <LogOut size={16} />
              Back to site
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1 -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                    activeTab === tab.id
                      ? "border-[#2B9EB3] text-[#2B9EB3]"
                      : "border-transparent text-white/50 hover:text-white/80"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          {activeTab === "news" && <NewsManager />}

          {activeTab === "fixtures" && (
            <FixturesManager
              fixtures={fixtures}
              onSave={async (updated) => {
                await handleSave("fixtures", updated);
                setFixtures(updated);
              }}
            />
          )}

          {activeTab === "standings" && (
            <StandingsManager
              standings={standings}
              onSave={async (updated) => {
                await handleSave("standings", updated);
                setStandings(updated);
              }}
            />
          )}

          {activeTab === "timeline" && (
            <TimelineManager
              events={timeline}
              onSave={async (updated) => {
                await handleSave("timeline", updated);
                setTimeline(updated);
              }}
            />
          )}

          {activeTab === "subscribers" && <SubscribersPanel />}
        </div>
      </main>
    </div>
  );
}

interface Subscriber {
  email: string;
  subscribedAt: string;
}

function SubscribersPanel() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/newsletter")
      .then((res) => res.json())
      .then((data) => setSubscribers(data.subscribers || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function downloadCSV() {
    const header = "Email,Subscribed Date\n";
    const rows = subscribers
      .map(
        (s) =>
          `${s.email},${new Date(s.subscribedAt).toLocaleDateString("en-GB")}`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `benelux-gaa-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[#2B9EB3]" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Newsletter Subscribers
          </h2>
          <p className="text-gray-500 text-sm">
            {subscribers.length} subscriber{subscribers.length !== 1 ? "s" : ""}
          </p>
        </div>
        {subscribers.length > 0 && (
          <button
            type="button"
            onClick={downloadCSV}
            className="flex items-center gap-2 px-4 py-2 bg-[#2B9EB3] text-white rounded-lg text-sm font-medium hover:bg-[#238a9c] transition-colors"
          >
            <Download size={16} />
            Export CSV
          </button>
        )}
      </div>

      {subscribers.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Mail size={40} className="mx-auto mb-3 opacity-50" />
          <p>No subscribers yet.</p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Email
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Subscribed
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subscribers.map((sub) => (
                <tr key={sub.email} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">{sub.email}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(sub.subscribedAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
