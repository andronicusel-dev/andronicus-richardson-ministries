import { redirect } from "next/navigation";
import { login } from "@/app/actions/admin";
import { ActionForm } from "@/components/admin-client";
import { AField } from "@/components/admin-ui";
import { adminExists, getAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");
  if (!(await adminExists())) redirect("/admin/setup");

  return (
    <>
      <h1 className="font-sans text-2xl font-bold">Staff sign-in</h1>
      <p className="mb-6 mt-2 text-ink-soft">Sign in to update the website and read prayer requests and messages.</p>
      <ActionForm action={login} submitLabel="Sign in" pendingLabel="Signing in…">
        <div className="space-y-4">
          <AField label="Email" name="email" type="email" required autoComplete="username" />
          <AField label="Password" name="password" type="password" required autoComplete="current-password" />
        </div>
      </ActionForm>
      <p className="mt-6 border-t border-rule pt-4 text-[0.9rem] text-ink-soft">
        Forgotten your password? It can only be reset by the person who looks after this website&apos;s hosting.
      </p>
    </>
  );
}
