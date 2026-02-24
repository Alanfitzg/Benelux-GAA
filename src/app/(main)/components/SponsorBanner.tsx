import Image from "next/image";

export default function SponsorBanner() {
  return (
    <div className="flex flex-col items-center py-2">
      <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-[0.2em] font-medium mb-3">
        Official Regional Sponsor
      </p>
      <a href="https://breagh.com" target="_blank" rel="noopener noreferrer">
        <Image
          src="/sponsors/breagh-blue.png"
          alt="Breagh Recruitment"
          width={500}
          height={200}
          className="object-contain w-56 sm:w-72 md:w-80 hover:opacity-70 transition-opacity"
          unoptimized
        />
      </a>
      <div className="mt-3 flex items-center gap-3">
        <div className="w-8 h-px bg-gray-200" />
        <p className="text-[10px] sm:text-xs text-gray-400 tracking-wider">
          2026 Season
        </p>
        <div className="w-8 h-px bg-gray-200" />
      </div>
    </div>
  );
}
