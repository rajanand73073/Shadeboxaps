import Link from "next/link";

//App Router gives search params directly to page and this used because of suspense error happened while using useSearchParams hook in this page
export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params?.error;
  let message = "Something went wrong.";

  switch (error) {
    case "ACCOUNT_EXISTS":
      message =
        "An account already exists with this email. Please login with credentials.";
      break;

    case "EMAIL_NOT_VERIFIED":
      message = "Please verify your email before logging in.";
      break;

    case "USER_NOT_FOUND":
      message = "No user found with this email.";
      break;

    default:
      message = "Authentication failed. Please try again.";
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center px-4 py-8 text-center">
      <h1 className="mb-4 text-2xl font-bold">Authentication Error</h1>
      <p className="mb-6 max-w-md text-red-500">{message}</p>
      <Link href="/sign-in" className="underline">
        Back to Sign In
      </Link>
    </div>
  );
}
