type Stat = { value: string; label: string };

export function StatBand({ stats }: { stats: Stat[] }) {
  return (
    <section className="bg-navy-900 text-white">
      <div className="container-x grid grid-cols-2 divide-white/10 py-10 lg:grid-cols-4 lg:divide-x rtl:lg:divide-x-reverse">
        {stats.map((stat) => (
          <div key={stat.label} className="px-4 py-4 text-center lg:py-2">
            <p className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl" dir="ltr">
              {stat.value}
            </p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/60">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
