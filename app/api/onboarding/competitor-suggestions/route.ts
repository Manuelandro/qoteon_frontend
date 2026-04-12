export async function POST() {
  return Response.json(
    {
      error:
        "This frontend route is no longer used. Competitor prefills now come from the Core-backed onboarding flow.",
    },
    { status: 410 },
  );
}
