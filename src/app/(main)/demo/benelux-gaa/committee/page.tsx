"use client";

import Header from "../components/Header";
import Footer from "../components/Footer";
import EditableText from "../components/EditableText";
import { Users, Mail } from "lucide-react";

interface CommitteeMember {
  name: string;
  role: string;
  club?: string;
  email?: string;
  imageUrl?: string;
}

const committeeMembers: CommitteeMember[] = [
  {
    name: "To Be Announced",
    role: "Chairperson",
    club: "TBC",
  },
  {
    name: "To Be Announced",
    role: "Vice Chairperson",
    club: "TBC",
  },
  {
    name: "To Be Announced",
    role: "Secretary",
    club: "TBC",
    email: "secretary@beneluxgaa.eu",
  },
  {
    name: "To Be Announced",
    role: "Treasurer",
    club: "TBC",
  },
  {
    name: "To Be Announced",
    role: "PRO / Communications",
    club: "TBC",
  },
  {
    name: "To Be Announced",
    role: "Fixtures Coordinator",
    club: "TBC",
  },
  {
    name: "To Be Announced",
    role: "Referees Coordinator",
    club: "TBC",
  },
  {
    name: "To Be Announced",
    role: "Youth Development Officer",
    club: "TBC",
  },
];

export default function CommitteePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header currentPage="Committee" />

      <main className="flex-1 pt-24 pb-12 sm:pt-28 sm:pb-16 md:pt-32">
        <div className="max-w-5xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <Users size={48} className="mx-auto text-[#2B9EB3] mb-4" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              <EditableText
                pageKey="committee"
                contentKey="title"
                defaultValue="Benelux GAA Committee"
                maxLength={40}
              />
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              <EditableText
                pageKey="committee"
                contentKey="subtitle"
                defaultValue="Meet the volunteers who run Benelux GAA and coordinate Gaelic Games across the region."
                maxLength={150}
              />
            </p>
          </div>

          {/* Committee Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {committeeMembers.map((member, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden text-center hover:shadow-lg transition-shadow"
              >
                {/* Avatar Placeholder */}
                <div className="h-32 bg-gradient-to-br from-[#1a3a4a] to-[#2B9EB3] flex items-center justify-center">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                    <Users size={32} className="text-white" />
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-[#2B9EB3] text-sm font-medium mb-2">
                    {member.role}
                  </p>
                  {member.club && (
                    <p className="text-gray-500 text-sm">{member.club}</p>
                  )}
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="inline-flex items-center gap-1 text-gray-400 hover:text-[#2B9EB3] text-sm mt-2 transition-colors"
                    >
                      <Mail size={14} />
                      {member.email}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Join Committee CTA */}
          <div className="bg-[#1a3a4a] rounded-xl p-8 md:p-10 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              <EditableText
                pageKey="committee"
                contentKey="cta_title"
                defaultValue="Get Involved"
                maxLength={30}
                className="text-white"
              />
            </h2>
            <p className="text-gray-300 mb-6 max-w-xl mx-auto">
              <EditableText
                pageKey="committee"
                contentKey="cta_description"
                defaultValue="Interested in helping run Benelux GAA? We're always looking for volunteers to help with events, development, and administration."
                maxLength={200}
              />
            </p>
            <a
              href="/demo/benelux-gaa/contact"
              className="inline-flex items-center justify-center px-8 py-3 bg-[#2B9EB3] text-white rounded-lg font-semibold hover:bg-[#238a9c] transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
