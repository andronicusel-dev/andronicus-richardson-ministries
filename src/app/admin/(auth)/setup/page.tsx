import { redirect } from "next/navigation";
import { setupAdmin } from "@/app/actions/admin";
import { ActionForm } from "@/components/admin-client";
import { AField } from "@/components/admin-ui";
import { adminExists } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  if (await adminExists()) redirect("/admin/login");

  return (
    <>
      <h1 className="font-sans text-2xl font-bold">Create your admin sign-in</h1>
      <p className="mb-6 mt-2 text-ink-soft">
        This is a one-time step. The email and password you choose here are what you will use to update the website.
      </p>
      <ActionForm action={setupAdmin} submitLabel="Create sign-in" pendingLabel="Creating…">
        <div className="space-y-4">
          <AField label="Your email" name="email" type="email" required autoComplete="username" />
          <AField
            label="Choose a password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            hint="At least 10 characters. A short sentence you will remember works well."
          />
          <AField label="Type the password again" name="confirm" type="password" required autoComplete="new-password" />
        </div>
      </ActionForm>
    </>
  );
}
