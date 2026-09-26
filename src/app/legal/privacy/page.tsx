export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">
        Last updated: January 2026 • Academic Demonstration Project
      </p>

      <div className="space-y-6 text-sm text-gray-300 leading-relaxed">
        <Section title="1. Introduction">
          Music Creator Platform (&quot;we&quot;, &quot;our&quot;, &quot;the
          Platform&quot;) is an academic demonstration project built for
          educational purposes. This Privacy Policy explains how we collect,
          use, and protect your information when you use our service.
        </Section>

        <Section title="2. Information We Collect">
          We collect the following categories of information: (a) account
          information you provide (name, email, avatar, bio); (b) content you
          upload (audio files, cover images, descriptions); (c) usage data
          (tracks played, messages sent, pages visited); and (d) technical data
          (browser type, IP address, device information).
        </Section>

        <Section title="3. How We Use Your Information">
          We use collected information to: operate and improve the Platform;
          enable collaboration between creators; process licensing and
          commission calculations; deliver notifications and messages; display
          analytics to creators; and enforce our Terms of Service.
        </Section>

        <Section title="4. Legal Basis for Processing">
          We process your information based on: (a) your consent (given at
          signup via the legal acceptance modal); (b) performance of a
          contract (delivering Platform features); and (c) legitimate interests
          (preventing fraud, improving the service).
        </Section>

        <Section title="5. Data Storage & Firebase">
          All data is stored on Firebase Realtime Database and Firebase
          Storage, operated by Google. By using the Platform you agree to
          Google&apos;s terms of service. We do not operate our own servers.
        </Section>

        <Section title="6. Demo Mode Disclosure">
          This is an academic demonstration. Authentication and payment
          features are simulated and do NOT process real credentials or real
          money. You should not upload sensitive personal information. Do not
          use real passwords or real payment details.
        </Section>

        <Section title="7. Data Sharing">
          We do not sell your personal data. We may share data: (a) with
          service providers (Firebase, Vercel) strictly to operate the
          Platform; (b) when required by law; and (c) with your consent
          (e.g., when you connect with other creators).
        </Section>

        <Section title="8. Data Retention">
          We retain your data for as long as your account is active or as
          needed to provide the service. In this demo, data is retained
          indefinitely for demonstration purposes. You may request deletion by
          contacting the administrator.
        </Section>

        <Section title="9. Your Rights">
          You have the right to: access your data; correct inaccuracies; delete
          your account and associated data; export your content; and object to
          certain processing. Exercise these rights through the Settings page
          or by contacting the administrator.
        </Section>

        <Section title="10. Cookies & Local Storage">
          We use browser localStorage to remember your selected account
          (currentUserId). We do not use third-party tracking cookies. No
          analytics scripts from external providers are loaded.
        </Section>

        <Section title="11. Children's Privacy">
          The Platform is not intended for users under 13. We do not knowingly
          collect data from children. If you believe a child has provided data,
          contact us for removal.
        </Section>

        <Section title="12. Changes to This Policy">
          We may update this Privacy Policy from time to time. Material changes
          will be announced on the Platform. Continued use after changes
          constitutes acceptance.
        </Section>

        <Section title="13. Contact">
          For privacy-related inquiries, contact the Platform administrator at
          admin@demo.music. This is an academic project and responses may be
          delayed.
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-base font-semibold text-white mb-2">{title}</h2>
      <p>{children}</p>
    </section>
  );
}