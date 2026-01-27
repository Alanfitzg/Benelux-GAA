import { NextResponse } from "next/server";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

// Static data for Irish counties organized by province
const IRISH_COUNTIES = {
  LEINSTER: [
    { id: "DUB", code: "DUB", name: "Dublin", displayOrder: 1 },
    { id: "WIC", code: "WIC", name: "Wicklow", displayOrder: 2 },
    { id: "WEX", code: "WEX", name: "Wexford", displayOrder: 3 },
    { id: "CAR", code: "CAR", name: "Carlow", displayOrder: 4 },
    { id: "KIK", code: "KIK", name: "Kilkenny", displayOrder: 5 },
    { id: "LAO", code: "LAO", name: "Laois", displayOrder: 6 },
    { id: "OFF", code: "OFF", name: "Offaly", displayOrder: 7 },
    { id: "KIL", code: "KIL", name: "Kildare", displayOrder: 8 },
    { id: "MEA", code: "MEA", name: "Meath", displayOrder: 9 },
    { id: "WES", code: "WES", name: "Westmeath", displayOrder: 10 },
    { id: "LON", code: "LON", name: "Longford", displayOrder: 11 },
    { id: "LOU", code: "LOU", name: "Louth", displayOrder: 12 },
  ],
  MUNSTER: [
    { id: "COR", code: "COR", name: "Cork", displayOrder: 1 },
    { id: "KER", code: "KER", name: "Kerry", displayOrder: 2 },
    { id: "LIM", code: "LIM", name: "Limerick", displayOrder: 3 },
    { id: "TIP", code: "TIP", name: "Tipperary", displayOrder: 4 },
    { id: "WAT", code: "WAT", name: "Waterford", displayOrder: 5 },
    { id: "CLA", code: "CLA", name: "Clare", displayOrder: 6 },
  ],
  CONNACHT: [
    { id: "GAL", code: "GAL", name: "Galway", displayOrder: 1 },
    { id: "MAY", code: "MAY", name: "Mayo", displayOrder: 2 },
    { id: "SLI", code: "SLI", name: "Sligo", displayOrder: 3 },
    { id: "LEI", code: "LEI", name: "Leitrim", displayOrder: 4 },
    { id: "ROS", code: "ROS", name: "Roscommon", displayOrder: 5 },
  ],
  ULSTER: [
    { id: "ANT", code: "ANT", name: "Antrim", displayOrder: 1 },
    { id: "ARM", code: "ARM", name: "Armagh", displayOrder: 2 },
    { id: "CAV", code: "CAV", name: "Cavan", displayOrder: 3 },
    { id: "DER", code: "DER", name: "Derry", displayOrder: 4 },
    { id: "DON", code: "DON", name: "Donegal", displayOrder: 5 },
    { id: "DOW", code: "DOW", name: "Down", displayOrder: 6 },
    { id: "FER", code: "FER", name: "Fermanagh", displayOrder: 7 },
    { id: "MON", code: "MON", name: "Monaghan", displayOrder: 8 },
    { id: "TYR", code: "TYR", name: "Tyrone", displayOrder: 9 },
  ],
};

async function getIrishCountiesHandler(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const provinceCode = searchParams.get("provinceCode");

    if (!provinceCode) {
      return NextResponse.json(
        { error: "provinceCode is required" },
        { status: 400 }
      );
    }

    const counties =
      IRISH_COUNTIES[provinceCode as keyof typeof IRISH_COUNTIES];

    if (!counties) {
      return NextResponse.json(
        { error: "Invalid province code" },
        { status: 400 }
      );
    }

    return NextResponse.json(counties);
  } catch (error) {
    console.error("Error fetching Irish counties:", error);
    return NextResponse.json(
      { error: "Failed to fetch counties" },
      { status: 500 }
    );
  }
}

export const GET = withRateLimit(
  RATE_LIMITS.PUBLIC_API,
  getIrishCountiesHandler
);
