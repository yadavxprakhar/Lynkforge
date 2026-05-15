import { motion } from "framer-motion";
import { useStoreContext } from "../contextApi/ContextApi";
import { easeSmooth } from "../utils/motionVariants";
import HomeSpaceBackground from "./HomeSpaceBackground";

const PrivacyPage = () => {
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
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm font-semibold text-slate-500 dark:text-[#94a3b8]">
            Effective May 3, 2026
          </p>
          <p className="mt-6 text-[0.95rem] leading-relaxed text-slate-700 dark:text-[#cbd5e1]">
            This Privacy Policy explains how Lynkforge (“we”, “us”, “our”) collects, uses, shares,
            and protects information when you use our URL shortening and analytics service.
          </p>

        <div className="mt-10 space-y-8 text-[0.95rem] leading-relaxed text-slate-700 dark:text-[#cbd5e1]">
          <section className="space-y-2">
            <h2 className="text-lg font-bold tracking-tight text-[#0f172a] dark:text-[#f8fafc]">
              Information we collect
            </h2>
            <p>We collect the minimum information needed to operate Lynkforge:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <span className="font-semibold text-slate-900 dark:text-[#e2e8f0]">Account data</span>
                : username and email (if you create an account).
              </li>
              <li>
                <span className="font-semibold text-slate-900 dark:text-[#e2e8f0]">Link data</span>
                : the original URL you submit and the short link we generate.
              </li>
              <li>
                <span className="font-semibold text-slate-900 dark:text-[#e2e8f0]">Usage/analytics</span>
                : clicks, timestamps, and basic device/browser info used to measure performance and
                prevent abuse.
              </li>
              <li>
                <span className="font-semibold text-slate-900 dark:text-[#e2e8f0]">Cookies</span>
                : small files used for session, preferences (like theme), and service protection.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold tracking-tight text-[#0f172a] dark:text-[#f8fafc]">
              What we don’t collect
            </h2>
            <p>
              We do not intentionally collect sensitive personal data (e.g., government IDs, health
              data). If payments are offered, payment details are handled by a payment provider — we
              don’t store full card data on our servers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold tracking-tight text-[#0f172a] dark:text-[#f8fafc]">
              How we use information
            </h2>
            <p>
              We use information to provide the service, generate analytics, communicate with you
              (support and service updates), and detect/prevent fraud and abuse.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold tracking-tight text-[#0f172a] dark:text-[#f8fafc]">
              Sharing & disclosures
            </h2>
            <p>
              We do not sell your personal information. We may share data with service providers who
              help us run Lynkforge (hosting, analytics, email) under confidentiality obligations. We
              may also disclose information if required by law or to protect our rights and users.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold tracking-tight text-[#0f172a] dark:text-[#f8fafc]">
              Retention
            </h2>
            <p>
              We keep personal data only as long as needed to provide the service, comply with legal
              obligations, and resolve disputes.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold tracking-tight text-[#0f172a] dark:text-[#f8fafc]">
              Your choices & rights
            </h2>
            <p>
              Depending on where you live, you may request access, correction, or deletion of your
              data, or object to certain processing. Contact us to make a request.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold tracking-tight text-[#0f172a] dark:text-[#f8fafc]">
              Security
            </h2>
            <p>
              We use reasonable technical and organizational measures to protect your data, but no
              system is 100% secure. If you believe your account is compromised, contact us.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold tracking-tight text-[#0f172a] dark:text-[#f8fafc]">
              Not directed to children
            </h2>
            <p>
              Lynkforge is not intended for people under 18, and we do not knowingly collect personal
              data from minors.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold tracking-tight text-[#0f172a] dark:text-[#f8fafc]">
              Changes to this policy
            </h2>
            <p>
              We may update this policy from time to time. When we do, we’ll update the effective
              date above.
            </p>
          </section>
        </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPage;
