import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background text-center">
      <span className="font-mono-data text-sm text-muted-foreground">404</span>
      <h1 className="font-display text-2xl font-semibold">Page not found</h1>
      <p className="text-sm text-muted-foreground">
        That page doesn't exist in this journey.
      </p>
      <Link
        to="/"
        className="mt-2 text-sm text-primary underline-offset-4 hover:underline"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
