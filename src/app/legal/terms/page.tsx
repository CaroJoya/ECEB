export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-500 mb-8">
        Last updated: January 2026 • Academic Demonstration Project
      </p>

      <div className="space-y-6 text-sm text-gray-300 leading-relaxed">
        <Section title="1. Acceptance of Terms">
          By accessing or using Music Creator Platform (&quot;the
          Platform&quot;), you agree to be bound by these Terms of Service. If
          you do not agree, do not use the Platform. This is an academic
          demonstration project.
        </Section>

        <Section title="2. Eligibility">
          You must be at least 13 years old to use the Platform. By using it,
          you represent that you meet this requirement and have the legal
          capacity to enter into these Terms.
        </Section>

        <Section title="3. Account & Authentication">
          Authentication on this Platform is simulated. You select a
          pre-seeded account from a list; no real password or OAuth credential
          is used. You are responsible for any activity under your selected
          account within the demo environment.
        </Section>

        <Section title="4. Content Ownership">
          You retain full ownership of any music, audio, images, text, or other
          content you upload. By uploading, you grant the Platform a
          non-exclusive, worldwide, royalty-free license to host, store,
          stream, and display your content strictly for operating the service.
        </Section>

        <Section title="5. Content Standards">
          You agree NOT to upload: (a) content you do not own or have rights
          to; (b) infringing, defamatory, or illegal material; (c) malware or
          harmful code; (d) spam or misleading content. Violations may result
          in suspension.
        </Section>

        <Section title="6. Licensing Types">
          The Platform offers six license types: Open Collab, Credit Only,
          Non-Commercial, Commercial, All Rights Reserved, and Custom. Each
          license grants specific rights. Licensees must comply with the terms
          associated with each license.
        </Section>

        <Section title="7. Payments & Commission">
          Payment functionality is simulated. No real money is processed.
          In-app balances, commissions, and prices are illustrative only. Real
          commercial use of any track requires direct agreement with the
          creator.
        </Section>

        <Section title="8. Commission Structure">
          Creator commissions are: Free Creator 20%, Pro Creator 15%, Studio
          Creator 10%, Label 10%. These rates are for demonstration only and
          do not reflect real transactions.
        </Section>

        <Section title="9. Collaboration">
          The Platform facilitates collaboration through matchmaking and
          real-time chat. Any agreement between collaborators is between them.
          The Platform is not a party to such agreements and is not
          responsible for their performance.
        </Section>

        <Section title="10. Prohibited Conduct">
          You may not: (a) attempt to breach Platform security; (b) scrape or
          harvest user data; (c) impersonate others; (d) interfere with other
          users&apos; enjoyment; (e) use the Platform for unlawful purposes.
        </Section>

        <Section title="11. Moderation & Suspension">
          Administrators may suspend accounts, remove content, or resolve
          disputes at their discretion. Suspended users lose access to
          Platform features. Appeals may be filed through the dispute system.
        </Section>

        <Section title="12. Dispute Resolution">
          Disputes between users follow a three-stage process: (1) Filing, (2)
          Mediation, (3) Appeal within 7 days. Administrators mediate in good
          faith. Decisions are final within the demo environment.
        </Section>

        <Section title="13. Disclaimer of Warranties">
          The Platform is provided &quot;as is&quot; without warranties of any
          kind. As an academic project, it may contain bugs, downtime, or
          incomplete features. Use at your own risk.
        </Section>

        <Section title="14. Limitation of Liability">
          To the maximum extent permitted by law, the Platform and its
          operators are not liable for any indirect, incidental, or
          consequential damages arising from your use of the service.
        </Section>

        <Section title="15. Termination">
          We may terminate or suspend your access at any time, without notice,
          for conduct that violates these Terms or harms other users or the
          Platform.
        </Section>

        <Section title="16. Changes to Terms">
          We may modify these Terms at any time. Continued use after changes
          constitutes acceptance. Material changes will be announced on the
          Platform.
        </Section>

        <Section title="17. Governing Law">
          These Terms are governed by the laws of India. Any disputes will be
          subject to the exclusive jurisdiction of courts in India, solely for
          academic evaluation purposes.
        </Section>

        <Section title="18. Contact">
          For questions about these Terms, contact admin@demo.music. This is an
          academic project and responses may be delayed.
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