import Link from "next/link";

const links = [
  ["Dashboard", "/"],
  ["Setup", "/setup"],
  ["Apply", "/apply"],
  ["Drafts", "/drafts"],
  ["Replies", "/replies"],
  ["Outreach", "/outreach"],
  ["Sent", "/sent"],
  ["Settings", "/settings"],
] as const;

export function Nav() {
  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl gap-3 px-4 py-3 text-sm">
        {links.map(([label, href]) => (
          <Link key={href} href={href} className="rounded-md px-3 py-1.5 hover:bg-slate-100">
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
