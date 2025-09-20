import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCountryCode } from "@/lib/calendar/geo-restrictions";
import { HolidayType } from "@prisma/client";

interface NagerHoliday {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  counties: string[] | null;
  launchYear: number | null;
  types: string[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get("country");
    const year = searchParams.get("year") || new Date().getFullYear().toString();
    const forceRefresh = searchParams.get("refresh") === "true";

    if (!country) {
      return NextResponse.json({ error: "Country is required" }, { status: 400 });
    }

    const countryCode = getCountryCode(country);
    if (!countryCode) {
      return NextResponse.json(
        { error: "Country not supported for calendar feature" },
        { status: 400 }
      );
    }

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedHolidays = await prisma.holiday.findMany({
        where: {
          country: countryCode,
          date: {
            gte: new Date(`${year}-01-01`),
            lte: new Date(`${year}-12-31`),
          },
          cachedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days
          },
        },
        orderBy: { date: "asc" },
      });

      if (cachedHolidays.length > 0) {
        return NextResponse.json(cachedHolidays);
      }
    }

    // Fetch from Nager.Date API
    const response = await fetch(
      `https://date.nager.at/api/v3/publicholidays/${year}/${countryCode}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch holidays: ${response.statusText}`);
    }

    const nagerHolidays: NagerHoliday[] = await response.json();

    // Transform and cache the holidays
    const holidays = await Promise.all(
      nagerHolidays.map(async (holiday) => {
        // Determine if it's a school holiday based on the type
        const isSchoolHoliday = holiday.types?.includes("School") ||
                               holiday.name.toLowerCase().includes("school") ||
                               holiday.name.toLowerCase().includes("break");

        const holidayData = {
          country: countryCode,
          date: new Date(holiday.date),
          name: holiday.name,
          type: isSchoolHoliday ? HolidayType.SCHOOL : HolidayType.PUBLIC,
          cachedAt: new Date(),
        };

        // Upsert the holiday
        return await prisma.holiday.upsert({
          where: {
            country_date_type: {
              country: countryCode,
              date: holidayData.date,
              type: holidayData.type,
            },
          },
          update: {
            name: holidayData.name,
            cachedAt: holidayData.cachedAt,
          },
          create: holidayData,
        });
      })
    );

    // Clean up old cache entries for this country and year
    await prisma.holiday.deleteMany({
      where: {
        country: countryCode,
        date: {
          gte: new Date(`${year}-01-01`),
          lte: new Date(`${year}-12-31`),
        },
        cachedAt: {
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    return NextResponse.json(holidays);
  } catch (error) {
    console.error("Error fetching holidays:", error);
    return NextResponse.json(
      { error: "Failed to fetch holidays" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // This endpoint is for manually adding school holidays
    // which are not available via the public API
    const body = await request.json();

    const { country, date, name, type } = body;

    if (!country || !date || !name) {
      return NextResponse.json(
        { error: "Country, date, and name are required" },
        { status: 400 }
      );
    }

    const holiday = await prisma.holiday.create({
      data: {
        country,
        date: new Date(date),
        name,
        type: type || HolidayType.SCHOOL,
        cachedAt: new Date(),
      },
    });

    return NextResponse.json(holiday, { status: 201 });
  } catch (error) {
    console.error("Error creating holiday:", error);
    return NextResponse.json(
      { error: "Failed to create holiday" },
      { status: 500 }
    );
  }
}