"use client";

interface SurveyResponse {
  id: string;
  eventId: string | null;
  role: string;
  clubName: string | null;
  country: string;
  city: string | null;
  hasTraveledAbroad: string;
  travelFrequency: string | null;
  destinationsVisited: string[];
  preferredTravelTime: string;
  teamSize: string;
  budgetPerPerson: string;
  biggestChallenge: string;
  interestedServices: string[];
  improvementSuggestion: string | null;
  additionalFeedback: string | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  submittedAt: Date;
  event: {
    id: string;
    title: string;
    location: string;
    startDate: Date;
  } | null;
}

interface SurveyExportButtonProps {
  responses: SurveyResponse[];
}

function generateCSV(responses: SurveyResponse[]): string {
  const headers = [
    "ID",
    "Contact Name",
    "Contact Email",
    "Contact Phone",
    "Role",
    "Club Name",
    "Country",
    "City",
    "Has Traveled Abroad",
    "Travel Frequency",
    "Destinations Visited",
    "Preferred Travel Time",
    "Team Size",
    "Budget Per Person",
    "Biggest Challenge",
    "Interested Services",
    "Improvement Suggestion",
    "Additional Feedback",
    "Event Title",
    "Event Location",
    "Submitted At",
  ];

  const csvContent = [
    headers.join(","),
    ...responses.map((response) =>
      [
        response.id,
        `"${response.contactName}"`,
        `"${response.contactEmail}"`,
        `"${response.contactPhone || ""}"`,
        `"${response.role}"`,
        `"${response.clubName || ""}"`,
        `"${response.country}"`,
        `"${response.city || ""}"`,
        `"${response.hasTraveledAbroad}"`,
        `"${response.travelFrequency || ""}"`,
        `"${response.destinationsVisited.join("; ")}"`,
        `"${response.preferredTravelTime}"`,
        `"${response.teamSize}"`,
        `"${response.budgetPerPerson}"`,
        `"${response.biggestChallenge}"`,
        `"${response.interestedServices.join("; ")}"`,
        `"${response.improvementSuggestion || ""}"`,
        `"${response.additionalFeedback || ""}"`,
        `"${response.event?.title || ""}"`,
        `"${response.event?.location || ""}"`,
        `"${response.submittedAt.toISOString()}"`,
      ].join(",")
    ),
  ].join("\n");

  return csvContent;
}

function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export default function SurveyExportButton({
  responses,
}: SurveyExportButtonProps) {
  const handleExport = () => {
    const csv = generateCSV(responses);
    downloadCSV(csv, "survey-responses.csv");
  };

  return (
    <button
      onClick={handleExport}
      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
    >
      Export to CSV
    </button>
  );
}
