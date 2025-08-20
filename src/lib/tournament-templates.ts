export interface TournamentTemplate {
  id: string;
  name: string;
  description: string;
  sports: string[];
  divisions: string[];
  teamsPerDivision: {
    min: number;
    max: number;
    default: number;
  };
  bracketType: 'SINGLE_ELIMINATION' | 'DOUBLE_ELIMINATION' | 'ROUND_ROBIN' | 'GROUP_STAGE';
  estimatedDuration: string;
  requiredFacilities: string[];
}

export const tournamentTemplates: TournamentTemplate[] = [
  {
    id: 'standard-gaa',
    name: 'Standard GAA Tournament',
    description: 'Traditional format with mens and ladies football across two divisions',
    sports: ["Men's Football", "Ladies Football"],
    divisions: ['Division 1', 'Division 2'],
    teamsPerDivision: {
      min: 4,
      max: 8,
      default: 6
    },
    bracketType: 'SINGLE_ELIMINATION',
    estimatedDuration: '2 days',
    requiredFacilities: ['2 full-size pitches', 'Changing rooms', 'First aid']
  },
  {
    id: 'youth-championship',
    name: 'Youth Championship',
    description: 'Age-grouped tournament for underage players',
    sports: ['Boys', 'Girls'],
    divisions: ['U14', 'U16', 'U18'],
    teamsPerDivision: {
      min: 4,
      max: 6,
      default: 4
    },
    bracketType: 'ROUND_ROBIN',
    estimatedDuration: '1 day',
    requiredFacilities: ['1-2 pitches', 'Changing rooms', 'First aid', 'Refreshments area']
  },
  {
    id: 'club-championship',
    name: 'Club Championship',
    description: 'Single sport championship with multiple skill divisions',
    sports: ['Football'],
    divisions: ['Senior', 'Intermediate', 'Junior', 'Junior B'],
    teamsPerDivision: {
      min: 4,
      max: 8,
      default: 6
    },
    bracketType: 'GROUP_STAGE',
    estimatedDuration: '3 days',
    requiredFacilities: ['2-3 pitches', 'Changing rooms', 'First aid', 'Spectator areas']
  },
  {
    id: 'mixed-social',
    name: 'Mixed Social Tournament',
    description: 'Fun mixed-gender tournament for social clubs',
    sports: ['Mixed Football', 'Mixed Hurling'],
    divisions: ['Competitive', 'Social'],
    teamsPerDivision: {
      min: 4,
      max: 12,
      default: 8
    },
    bracketType: 'SINGLE_ELIMINATION',
    estimatedDuration: '1 day',
    requiredFacilities: ['1-2 pitches', 'Social area', 'BBQ facilities']
  },
  {
    id: 'sevens-tournament',
    name: '7-a-side Tournament',
    description: 'Fast-paced 7-a-side format',
    sports: ['Men\'s 7s', 'Ladies 7s'],
    divisions: ['Open'],
    teamsPerDivision: {
      min: 8,
      max: 16,
      default: 12
    },
    bracketType: 'GROUP_STAGE',
    estimatedDuration: '1 day',
    requiredFacilities: ['1-2 pitches', 'Changing rooms']
  },
  {
    id: 'custom',
    name: 'Custom Configuration',
    description: 'Create your own tournament structure',
    sports: [],
    divisions: [],
    teamsPerDivision: {
      min: 2,
      max: 32,
      default: 8
    },
    bracketType: 'SINGLE_ELIMINATION',
    estimatedDuration: 'Varies',
    requiredFacilities: []
  }
];

export interface TeamRegistrationMatrix {
  clubId: string;
  clubName: string;
  participations: {
    sport: string;
    division: string;
    teamName?: string;
    registered: boolean;
  }[];
}

export function generateTeamMatrix(
  template: TournamentTemplate,
  clubs: { id: string; name: string }[]
): TeamRegistrationMatrix[] {
  return clubs.map(club => ({
    clubId: club.id,
    clubName: club.name,
    participations: template.sports.flatMap(sport =>
      template.divisions.map(division => ({
        sport,
        division,
        teamName: `${club.name} ${division} ${sport}`,
        registered: false
      }))
    )
  }));
}

export function calculateTotalTeams(matrix: TeamRegistrationMatrix[]): number {
  return matrix.reduce(
    (total, club) => total + club.participations.filter(p => p.registered).length,
    0
  );
}

export function calculateTotalTeamsFromTemplate(template: TournamentTemplate, clubCount: number): number {
  return clubCount * template.sports.length * template.divisions.length;
}

export function getTeamsByDivision(matrix: TeamRegistrationMatrix[]): Map<string, number> {
  const divisionCounts = new Map<string, number>();
  
  matrix.forEach(club => {
    club.participations.filter(p => p.registered).forEach(participation => {
      const key = `${participation.sport} - ${participation.division}`;
      divisionCounts.set(key, (divisionCounts.get(key) || 0) + 1);
    });
  });
  
  return divisionCounts;
}

export function generateTeamCombinations(
  club: { id: string; name: string },
  template: TournamentTemplate
): { name: string; sport: string; division: string }[] {
  const combinations = [];
  
  for (const sport of template.sports) {
    for (const division of template.divisions) {
      combinations.push({
        name: `${club.name} ${division} ${sport}`,
        sport,
        division
      });
    }
  }
  
  return combinations;
}

export function validateTemplateCapacity(
  template: TournamentTemplate,
  clubCount: number,
  maxTeams?: number
): {
  isValid: boolean;
  totalTeams: number;
  errors: string[];
} {
  const totalTeams = clubCount * template.sports.length * template.divisions.length;
  const errors: string[] = [];
  
  if (maxTeams && totalTeams > maxTeams) {
    errors.push(`Total teams (${totalTeams}) would exceed maximum allowed (${maxTeams})`);
  }
  
  if (totalTeams < template.teamsPerDivision.min * template.divisions.length) {
    errors.push(`Not enough teams to meet minimum requirements`);
  }
  
  return {
    isValid: errors.length === 0,
    totalTeams,
    errors
  };
}