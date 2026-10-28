import { loginFromForm } from "@/app/actions/auth";
import { LoginForm } from "@/components/LoginForm";
import { SubmitButton } from "@/components/SubmitButton";

const accounts = [
  ["Amira Hassan", "amira.hassan@demo.local", "Issued proof 180 Certificate and a Course Completion record"],
  ["Omar Nasser", "omar.nasser@demo.local", "Corporate learner with a review queue item"],
  ["Yusuf Adel", "yusuf.adel@demo.local", "Failed attempts and an exhausted limit"],
  ["Hana Mostafa", "hana.mostafa@demo.local", "Eligible quiz that has not been started"],
  ["Rania Saleh", "rania.saleh@demo.local", "No completed courses"],
  ["Nadia Karim", "nadia.karim@demo.local", "Reviewer"],
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
      <section className="card p-6">
        <h1 className="serif text-4xl">Sign in</h1>
        <p className="mt-3 text-muted">
          Demo password for every sample account: <strong>demo-pass</strong>. This does not connect
          to a Career 180 production database.
        </p>
        {error ? (
          <p className="mt-4 text-red" role="alert">
            {error}
          </p>
        ) : null}
        <div className="mt-6">
          <LoginForm />
        </div>
      </section>
      <section>
        <h2 className="serif text-2xl">Sample accounts</h2>
        <div className="mt-4 grid gap-3">
          {accounts.map(([name, email, note]) => (
            <form key={email} action={loginFromForm} className="card flex flex-wrap items-center justify-between gap-3 p-4">
              <input type="hidden" name="email" value={email} />
              <input type="hidden" name="password" value="demo-pass" />
              <div>
                <p className="font-semibold">{name}</p>
                <p className="text-sm text-muted">{email}</p>
                <p className="text-sm">{note}</p>
              </div>
              <SubmitButton tone="ghost" pendingLabel="Signing in...">
                Continue
              </SubmitButton>
            </form>
          ))}
        </div>
      </section>
    </div>
  );
}
