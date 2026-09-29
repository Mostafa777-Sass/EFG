import type { Client } from "@prisma/client";
import { pick } from "@/lib/l10n";
import { cn } from "@/lib/utils";
import { AppImage } from "@/components/ui/app-image";

type Props = { clients: Client[]; locale: string; compact?: boolean };

export function ClientLogoGrid({ clients, locale, compact = false }: Props) {
  return (
    <ul
      className={cn(
        "grid gap-4",
        compact ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
      )}
    >
      {clients.map((client) => {
        const name = pick(locale, client.nameEn, client.nameAr);
        const card = (
          <div
            className={cn(
              "flex items-center justify-center rounded-xl border border-mist-200 bg-white p-4 transition-colors hover:border-navy-900/20",
              compact ? "h-24" : "h-32",
            )}
            title={name}
          >
            {client.logoUrl ? (
              <div className="relative h-full w-full">
                <AppImage
                  src={client.logoUrl}
                  alt={name}
                  fill
                  sizes="(min-width: 1024px) 20vw, (min-width: 640px) 30vw, 45vw"
                  className="object-contain"
                />
              </div>
            ) : (
              <span className="text-center text-sm font-bold text-navy-900">{name}</span>
            )}
          </div>
        );
        return (
          <li key={client.id}>
            {client.websiteUrl ? (
              <a href={client.websiteUrl} target="_blank" rel="noopener noreferrer" aria-label={name}>
                {card}
              </a>
            ) : (
              card
            )}
          </li>
        );
      })}
    </ul>
  );
}
