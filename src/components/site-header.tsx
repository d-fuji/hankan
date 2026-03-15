import Link from "next/link";

const NAV_ITEMS = [
  { href: "/", label: "領地検索" },
  { href: "/annual/1700", label: "年代ビュー", matchPrefix: "/annual" },
  { href: "/clans", label: "家一覧", matchPrefix: "/clans" },
  { href: "/shoguns", label: "将軍一覧" },
];

type SiteHeaderProps = {
  currentPath?: string;
};

export function SiteHeader({ currentPath }: SiteHeaderProps) {
  return (
    <header className="border-b border-gold/30 bg-navy text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-(family-name:--font-noto-serif) text-2xl font-bold tracking-wider"
        >
          藩鑑
        </Link>
        <nav className="flex gap-6 text-sm">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                (
                  item.matchPrefix
                    ? currentPath?.startsWith(item.matchPrefix)
                    : currentPath === item.href
                )
                  ? "text-gold"
                  : "text-white/60 hover:text-white"
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
