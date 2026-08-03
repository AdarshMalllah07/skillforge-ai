interface Props {
  total: number;
  completed: number;
  progress: number;
  ai: number;
}

export default function DashboardStats({
  total,
  completed,
  progress,
  ai,
}: Props) {
  const cards = [
    {
      title: "Total Roadmaps",
      value: total,
      color: "text-blue-600",
    },
    {
      title: "Completed",
      value: completed,
      color: "text-green-600",
    },
    {
      title: "In Progress",
      value: progress,
      color: "text-orange-500",
    },
    {
      title: "AI Generated",
      value: ai,
      color: "text-violet-600",
    },
  ];

  return (
    <div className="grid gap-5 md:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-xl bg-white p-6 shadow"
        >
          <p className="text-gray-500">
            {card.title}
          </p>

          <h2
            className={`mt-3 text-4xl font-bold ${card.color}`}
          >
            {card.value}
          </h2>
        </div>
      ))}
    </div>
  );
}