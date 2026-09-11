export function SiteLogo({ siteName, color }: { siteName: string; color: string }) {
  const words = siteName.toUpperCase().split(" ");

  return (
    <div className="flex flex-col justify-center leading-none" style={{ fontFamily: "var(--font-outfit)" }}>
      {words.map((w, i) => (
        <span key={i} className="text-[12px] font-black tracking-tight md:text-[15px]" style={{ color }}>
          {w}
        </span>
      ))}
    </div>
  );
}
