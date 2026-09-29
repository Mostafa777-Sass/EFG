import type { Metadata } from "next";
import { getSettings } from "@/lib/content";
import { mailEnabled } from "@/lib/mail";
import { PageHeader } from "@/components/admin/page-header";
import { SettingsForm } from "@/components/admin/settings-form";
import { PasswordForm } from "@/components/admin/password-form";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsAdminPage() {
  const settings = await getSettings();
  const smtp = mailEnabled();

  return (
    <>
      <PageHeader title="Settings" description="Company details, contact information and site options." />

      <div className="mb-6 rounded-xl border border-mist-200 bg-white px-4 py-3 text-sm text-ink-700">
        Email notifications for new inquiries are{" "}
        {smtp ? (
          <span className="font-semibold text-emerald-700">enabled</span>
        ) : (
          <>
            <span className="font-semibold text-brand-red">not configured</span> on this server. Set the SMTP variables in the
            environment file to enable them. Inquiries are always saved in the admin.
          </>
        )}
      </div>

      <SettingsForm settings={settings} />

      <section className="mt-12 max-w-xl rounded-2xl border border-mist-200 bg-white p-6 shadow-card">
        <h2 className="text-lg">Change password</h2>
        <p className="mb-5 mt-1 text-sm text-ink-500">Choose a strong password. You stay signed in after changing it.</p>
        <PasswordForm />
      </section>
    </>
  );
}
