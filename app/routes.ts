import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("leaderboard", "routes/leaderboard.tsx"),
  route("methodology", "routes/methodology.tsx"),
  route("api/estimate", "routes/api.estimate.ts"),
  route("api/models", "routes/api.models.ts"),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
