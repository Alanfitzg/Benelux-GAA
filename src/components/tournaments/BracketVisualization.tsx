"use client";

import React from "react";
import Image from "next/image";
import { Match, TournamentTeam } from "@/types";

interface SimplifiedTeam {
  id: string;
  clubId: string;
  clubName: string;
  clubImageUrl?: string | null;
  score?: number;
  teamType: string;
  division?: string;
}

interface SimplifiedMatch {
  id: string;
  round: number;
  position: number;
  homeTeam?: SimplifiedTeam;
  awayTeam?: SimplifiedTeam;
  division?: string;
  status: string;
}

interface BracketVisualizationProps {
  matches: Match[];
  teams: TournamentTeam[];
  bracketType?: "SINGLE_ELIMINATION" | "DOUBLE_ELIMINATION" | "ROUND_ROBIN" | "GROUP_STAGE";
}

export default function BracketVisualization({
  matches,
}: BracketVisualizationProps) {
  const getRoundName = (round: number, totalRounds: number): string => {
    if (round === totalRounds) return "Final";
    if (round === totalRounds - 1) return "Semi";
    if (round === totalRounds - 2) return "Quarter";
    return `R${round}`;
  };

  const organizeByDivision = (): Map<string, Map<number, SimplifiedMatch[]>> => {
    const divisionBrackets = new Map<string, Map<number, SimplifiedMatch[]>>();
    
    matches.forEach((match) => {
      const division = match.division || match.homeTeam?.division || match.awayTeam?.division || "Open";
      const round = parseInt(match.round || "1");
      
      if (!divisionBrackets.has(division)) {
        divisionBrackets.set(division, new Map());
      }
      
      const divisionRounds = divisionBrackets.get(division)!;
      if (!divisionRounds.has(round)) {
        divisionRounds.set(round, []);
      }
      
      const simplifiedMatch: SimplifiedMatch = {
        id: match.id,
        round,
        position: match.bracketPosition || 0,
        division,
        status: match.status,
        homeTeam: match.homeTeam ? {
          id: match.homeTeam.id,
          clubId: match.homeTeam.clubId,
          clubName: match.homeTeam.club?.name || "Unknown Club",
          clubImageUrl: match.homeTeam.club?.imageUrl,
          score: match.homeScore ?? undefined,
          teamType: match.homeTeam.teamType,
          division: match.homeTeam.division,
        } : undefined,
        awayTeam: match.awayTeam ? {
          id: match.awayTeam.id,
          clubId: match.awayTeam.clubId,
          clubName: match.awayTeam.club?.name || "Unknown Club",
          clubImageUrl: match.awayTeam.club?.imageUrl,
          score: match.awayScore ?? undefined,
          teamType: match.awayTeam.teamType,
          division: match.awayTeam.division,
        } : undefined,
      };
      
      divisionRounds.get(round)!.push(simplifiedMatch);
    });
    
    divisionBrackets.forEach((rounds) => {
      rounds.forEach((roundMatches) => {
        roundMatches.sort((a, b) => a.position - b.position);
      });
    });
    
    return divisionBrackets;
  };

  const divisionBrackets = organizeByDivision();

  const getMatchWinner = (match: SimplifiedMatch): string | null => {
    if (match.status !== "COMPLETED") return null;
    if (!match.homeTeam || !match.awayTeam) return null;
    
    const homeScore = match.homeTeam.score ?? 0;
    const awayScore = match.awayTeam.score ?? 0;
    
    if (homeScore > awayScore) return match.homeTeam.clubId;
    if (awayScore > homeScore) return match.awayTeam.clubId;
    return null;
  };

  const renderTeam = (team: SimplifiedTeam | undefined, isWinner: boolean) => {
    if (!team) {
      return (
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-gray-400 text-xs">TBD</span>
        </div>
      );
    }

    return (
      <div className={`relative group ${isWinner ? 'ring-2 ring-green-500' : ''}`}>
        {team.clubImageUrl ? (
          <Image
            src={team.clubImageUrl}
            alt={team.clubName}
            width={48}
            height={48}
            className="rounded-full object-cover border-2 border-white shadow-md"
            unoptimized
          />
        ) : (
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
            {team.clubName.charAt(0)}
          </div>
        )}
        {team.score !== undefined && (
          <div className="absolute -bottom-1 -right-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {team.score}
          </div>
        )}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
          <div className="bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
            {team.clubName}
          </div>
        </div>
      </div>
    );
  };

  const renderMatch = (match: SimplifiedMatch) => {
    const winner = getMatchWinner(match);
    
    return (
      <div key={match.id} className="flex flex-col items-center mb-6">
        <div className="flex items-center gap-4">
          {renderTeam(match.homeTeam, winner === match.homeTeam?.clubId)}
          
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-400 uppercase">vs</span>
            {match.status === "IN_PROGRESS" && (
              <span className="text-xs text-red-500 font-bold animate-pulse">LIVE</span>
            )}
          </div>
          
          {renderTeam(match.awayTeam, winner === match.awayTeam?.clubId)}
        </div>
      </div>
    );
  };

  const getTeamTypeFromDivision = (division: string): string => {
    const lowerDiv = division.toLowerCase();
    if (lowerDiv.includes('senior') && lowerDiv.includes('men')) return 'Senior Men';
    if (lowerDiv.includes('senior') && (lowerDiv.includes('women') || lowerDiv.includes('ladies'))) return 'Senior Ladies';
    if (lowerDiv.includes('junior') && lowerDiv.includes('boys')) return 'Junior Boys';
    if (lowerDiv.includes('junior') && lowerDiv.includes('girls')) return 'Junior Girls';
    if (lowerDiv.includes('mixed')) return 'Mixed';
    return division;
  };

  return (
    <div className="w-full">
      {Array.from(divisionBrackets.entries()).map(([division, rounds]) => {
        const totalRounds = Math.max(...Array.from(rounds.keys()));
        const teamType = getTeamTypeFromDivision(division);
        
        return (
          <div key={division} className="mb-8">
            <div className="mb-4 border-b pb-2">
              <h3 className="text-lg font-bold text-gray-900">{teamType}</h3>
              <p className="text-xs text-gray-500">{division !== teamType ? division : ''}</p>
            </div>
            
            <div className="overflow-x-auto">
              <div className="min-w-max">
                <div className="flex gap-8">
                  {Array.from(rounds.entries())
                    .sort(([a], [b]) => a - b)
                    .map(([round, roundMatches]) => (
                      <div key={round} className="flex flex-col min-w-[140px]">
                        <div className="text-center mb-3">
                          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            {getRoundName(round, totalRounds)}
                          </span>
                        </div>
                        <div
                          className="flex flex-col justify-around"
                          style={{
                            minHeight: `${Math.pow(2, totalRounds - round) * 100}px`,
                          }}
                        >
                          {roundMatches.map((match) => renderMatch(match))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}