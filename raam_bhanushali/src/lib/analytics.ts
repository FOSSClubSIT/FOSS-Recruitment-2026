import { prisma } from "@/lib/prisma";

export async function getViewsLast7Days(
  userId: string
) {
  const result = [];

  for (let i = 6; i >= 0; i--) {
    const start = new Date();

    start.setDate(
      start.getDate() - i
    );

    start.setHours(
      0,
      0,
      0,
      0
    );

    const end = new Date(start);

    end.setHours(
      23,
      59,
      59,
      999
    );

    const count =
      await prisma.portfolioView.count({
        where: {
          viewedAt: {
            gte: start,
            lte: end,
          },

          // IMPORTANT:
          // Only count views belonging to
          // the logged-in user's portfolios.
          portfolio: {
            userId,
          },
        },
      });

    result.push({
      name: start.toLocaleDateString(
        "en-US",
        {
          weekday: "short",
        }
      ),
      views: count,
    });
  }

  return result;
}