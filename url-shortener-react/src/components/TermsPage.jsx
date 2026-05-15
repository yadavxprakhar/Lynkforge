import { motion } from "framer-motion";
import { useStoreContext } from "../contextApi/ContextApi";
import { easeSmooth } from "../utils/motionVariants";
import HomeSpaceBackground from "./HomeSpaceBackground";

const TermsPage = () => {
  const { theme } = useStoreContext();
  const isDark = theme === "dark";

  return (
    <div className="relative w-full">
      {isDark ? <HomeSpaceBackground /> : null}

      <div className="lx-page-inner lx-section-y">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: easeSmooth }}
          className="mx-auto max-w-3xl"
        >
          <h1 className="text-4xl font-extrabold tracking-tight text-[#0f172a] dark:text-[#f8fafc]">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm font-semibold text-slate-500 dark:text-[#94a3b8]">
            Effective May 3, 2026
          </p>

          <div className="mt-8 space-y-8 text-[0.95rem] leading-relaxed text-slate-700 dark:text-[#cbd5e1]">
          <section className="space-y-2">
            <h2 className="text-lg font-bold tracking-tight text-[#0f172a] dark:text-[#f8fafc]">
              1) Acceptance
            </h2>
            <p>
              By accessing or using Lynkforge, you agree to these Terms. If you do not agree, do not
              use the site or services.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold tracking-tight text-[#0f172a] dark:text-[#f8fafc]">
              2) Changes
            </h2>
            <p>
              We may update these Terms from time to time. Updates take effect when posted with a new
              effective date. Continued use means you accept the updated Terms.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold tracking-tight text-[#0f172a] dark:text-[#f8fafc]">
              3) Eligibility & accounts
            </h2>
            <p>
              You must be at least 18 years old (or the age of majority where you live) to use the
              services. You’re responsible for maintaining accurate account information and for any
              activity under your account (including authorized users you invite).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold tracking-tight text-[#0f172a] dark:text-[#f8fafc]">
              4) Acceptable use
            </h2>
            <p>
              You agree not to use Lynkforge for unlawful, harmful, abusive, or misleading purposes,
              including spam, malware, or content that infringes others’ rights. We may suspend or
              terminate access if we reasonably believe you violate these Terms or applicable law.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold tracking-tight text-[#0f172a] dark:text-[#f8fafc]">
              5) Subscriptions & billing (if applicable)
            </h2>
            <p>
              Paid plans (if offered) are billed using the payment method you provide. Trials or
              promotional periods may automatically renew unless you cancel. You can cancel at any
              time; access typically continues until the end of the billing period.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold tracking-tight text-[#0f172a] dark:text-[#f8fafc]">
              6) Content & intellectual property
            </h2>
            <p>
              Lynkforge and its branding, software, and site content are protected by intellectual
              property laws. You may use the service for your personal or business needs as intended,
              but you may not copy, resell, or exploit the service or content without permission.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold tracking-tight text-[#0f172a] dark:text-[#f8fafc]">
              7) Third‑party links
            </h2>
            <p>
              Lynkforge may include links to third‑party sites. We don’t control those sites and aren’t
              responsible for their content or practices.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold tracking-tight text-[#0f172a] dark:text-[#f8fafc]">
              8) Disclaimers & limitation of liability
            </h2>
            <p>
              The service is provided “as is” and “as available” without warranties of any kind. To the
              maximum extent allowed by law, Lynkforge is not liable for indirect, incidental, special,
              consequential, or punitive damages, or loss of data/profits arising from your use of the
              service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold tracking-tight text-[#0f172a] dark:text-[#f8fafc]">
              9) Termination
            </h2>
            <p>
              You may stop using Lynkforge at any time. We may suspend or terminate access if we
              believe you violate these Terms. Certain sections (like disclaimers and limits of
              liability) survive termination.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold tracking-tight text-[#0f172a] dark:text-[#f8fafc]">
              10) Privacy
            </h2>
            <p>
              Your use of Lynkforge is also governed by our Privacy Policy.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold tracking-tight text-[#0f172a] dark:text-[#f8fafc]">
              11) Disputes
            </h2>
            <p>
              If you have a dispute, please contact us first to try to resolve it informally. If we
              can’t resolve it, disputes may be handled through arbitration or a court process,
              depending on applicable law and local requirements.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold tracking-tight text-[#0f172a] dark:text-[#f8fafc]">
              12) Contact
            </h2>
            <p>
              Questions about these Terms? Contact us via the email listed in the footer.
            </p>
          </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsPage;

