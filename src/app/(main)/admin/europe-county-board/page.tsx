"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface BoardMember {
  position: string;
  name: string;
  club: string;
  email: string;
  username: string;
  password: string;
}

const boardMembers: BoardMember[] = [
  {
    position: "Chairperson",
    name: "Rory Conway",
    club: "Zürich Inneoin",
    email: "Chairperson.europe@gaa.ie",
    username: "chairperson_europe",
    password: "RoryConway",
  },
  {
    position: "Vice-chairperson",
    name: "Wenjing Zhuang",
    club: "Copenhagen",
    email: "Vicechairperson.europe@gaa.ie",
    username: "vicechairperson_europe",
    password: "WenjingZhuang",
  },
  {
    position: "Secretary",
    name: "Dave Reilly",
    club: "Zürich Inneoin",
    email: "Secretary.europe@gaa.ie",
    username: "secretary_europe",
    password: "DaveReilly",
  },
  {
    position: "Treasurer",
    name: "Daire Kivlehan",
    club: "Munich Colmchilles",
    email: "Treasurer.europe@gaa.ie",
    username: "treasurer_europe",
    password: "DaireKivlehan",
  },
  {
    position: "Coaching Officer",
    name: "Anna Marie O'Rourke",
    club: "Rennes",
    email: "Coachingofficer.europe@gaa.ie",
    username: "coachingofficer_europe",
    password: "AnnaMarieO'Rourke",
  },
  {
    position: "Central Council Delegate",
    name: "John White",
    club: "Zurich Inneoin",
    email: "ccdelegate.europe@gaa.ie",
    username: "ccdelegate_europe",
    password: "JohnWhite",
  },
  {
    position: "Assistant Secretary",
    name: "Dave Lewis",
    club: "Lugundum CLG",
    email: "assistantsecretary.europe@gaa.ie",
    username: "assistantsecretary_europe",
    password: "DaveLewis",
  },
  {
    position: "Assistant Treasurer/Registrar",
    name: "Annika Werner",
    club: "Berlin GAA",
    email: "Assistanttreasurer.europe@gaa.ie",
    username: "assistanttreasurer_europe",
    password: "AnnikaWerner",
  },
  {
    position: "Youth Officer",
    name: "Pearse Bell",
    club: "Vannes",
    email: "Youthofficer.europe@gaa.ie",
    username: "youthofficer_europe",
    password: "PearseBell",
  },
  {
    position: "Irish Culture & Language Officer",
    name: "Niamh Ryan",
    club: "Rome Hibernia",
    email: "Irishculturalofficer.europe@gaa.ie",
    username: "irishculturalofficer_europe",
    password: "NiamhRyan",
  },
  {
    position: "Referee Administrator",
    name: "Ray Coleman",
    club: "Eintracht Frankfurt GAA",
    email: "Refereesadministrator.europe@gaa.ie",
    username: "refereesadministrator_europe",
    password: "RayColeman",
  },
  {
    position: "Camogie Officer",
    name: "Michelle Cotter",
    club: "Stockholm Gaels",
    email: "Camogieofficer.europe@gaa.ie",
    username: "camogieofficer_europe",
    password: "MichelleCotter",
  },
  {
    position: "Hurling Officer",
    name: "Shane Morrisroe",
    club: "Earls of Leuven",
    email: "Hurlingofficer.europe@gaa.ie",
    username: "hurlingofficer_europe",
    password: "ShaneMorrisroe",
  },
  {
    position: "Handball Officer",
    name: "Guillaume Kerrian",
    club: "Toulouse",
    email: "Handballofficer.europe@gaa.ie",
    username: "handballofficer_europe",
    password: "GuillaumeKerrian",
  },
  {
    position: "Mens Football Officer",
    name: "Eoin McCall",
    club: "Barcelona Gaels",
    email: "MensFootballOfficer.europe@gaa.ie",
    username: "mensfootballofficer_europe",
    password: "EoinMcCall",
  },
  {
    position: "Ladies Football Officer",
    name: "Mairead Malone",
    club: "Paris Gaels",
    email: "Ladiesfootballofficer.europe@gaa.ie",
    username: "ladiesfootballofficer_europe",
    password: "MaireadMalone",
  },
  {
    position: "IT Officer",
    name: "Daniel Thiem",
    club: "Darmstadt GAA",
    email: "Itofficer.europe@gaa.ie",
    username: "itofficer_europe",
    password: "DanielThiem",
  },
  {
    position: "Health and Wellbeing Officer",
    name: "Marla Candon",
    club: "Brussels Craobh Rua",
    email: "Chairperson.hwc.europe@gaa.ie",
    username: "chairperson_hwc_europe",
    password: "MarlaCandon",
  },
  {
    position: "Sponsorship Officer",
    name: "John Murphy",
    club: "Amsterdam GAA",
    email: "Sponsorshipofficer.europe@gaa.ie",
    username: "sponsorshipofficer_europe",
    password: "JohnMurphy",
  },
  {
    position: "Recreational Games Officer",
    name: "Charlie Jameson",
    club: "München Colmcilles",
    email: "recreationalofficer.europe@gaa.ie",
    username: "recreationalofficer_europe",
    password: "CharlieJameson",
  },
  {
    position: "Higher Education Officer",
    name: "David Grenhab",
    club: "Nijmegen GFC",
    email: "highereducationofficer.europe@gaa.ie",
    username: "highereducationofficer_europe",
    password: "DavidGrenhab",
  },
  {
    position: "Child Protection Officer",
    name: "Kayleigh O'Sullivan",
    club: "Anjou Gaels",
    email: "Childrensofficer.europe@gaa.ie",
    username: "childrensofficer_europe",
    password: "KayleighO'Sullivan",
  },
  {
    position: "Benelux Representative",
    name: "Conchúr Caomhánach",
    club: "Brussels Craobh Rua",
    email: "beneluxrep.europe@gaa.ie",
    username: "beneluxrep_europe",
    password: "ConchúrCaomhánach",
  },
  {
    position: "Central/East Representative",
    name: "Shane Maloney",
    club: "Vienna Gaels",
    email: "centralandeastrep.europe@gaa.ie",
    username: "centralandeastrep_europe",
    password: "ShaneMaloney",
  },
  {
    position: "North West Representative",
    name: "Nathan Begoc",
    club: "Brest Bro Leon",
    email: "northwestrep.europe@gaa.ie",
    username: "northwestrep_europe",
    password: "NathanBegoc",
  },
  {
    position: "Nordics Representative",
    name: "Niall Blackwell",
    club: "Stockholm Gaels",
    email: "nordicsrep.europe@gaa.ie",
    username: "nordicsrep_europe",
    password: "NiallBlackwell",
  },
  {
    position: "Iberia Representative",
    name: "JJ Keaney",
    club: "Madrid Harps Youths",
    email: "Chairperson.iberia.europe@gaa.ie",
    username: "chairperson_iberia_europe",
    password: "JJKeaney",
  },
];

export default function EuropeCountyBoardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      router.push("/");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/admin"
              className="text-white/70 hover:text-white transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <span className="text-3xl">🇪🇺</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Europe County Board
              </h1>
              <p className="text-white/70 text-sm">
                Super Admin accounts for board members
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">
              {boardMembers.length}
            </div>
            <div className="text-sm text-white/60">Board Members</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-blue-400">Super Admin</div>
            <div className="text-sm text-white/60">Access Level</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-400">Active</div>
            <div className="text-sm text-white/60">Account Status</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-amber-400">@gaa.ie</div>
            <div className="text-sm text-white/60">Email Domain</div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <span className="text-xl">ℹ️</span>
            <div>
              <h3 className="font-medium text-white mb-1">Login Information</h3>
              <p className="text-sm text-white/70">
                All board members can log in using their email address or
                username. Passwords are set to their name (without spaces). For
                example: &quot;Rory Conway&quot; logs in with password
                &quot;RoryConway&quot;.
              </p>
            </div>
          </div>
        </div>

        {/* Board Members Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Club
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Password
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {boardMembers.map((member, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {member.position}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {member.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {member.club}
                    </td>
                    <td className="px-4 py-3 text-sm text-blue-600">
                      {member.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                      {member.username}
                    </td>
                    <td className="px-4 py-3 text-sm text-amber-600 font-mono font-medium">
                      {member.password}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
