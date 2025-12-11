import { BottomCta } from "@/components/common/bottom-cta";
import { PageWrapper, Wrapper } from "@/wrappers";

export default function Page() {
	return (
		<PageWrapper>
			<Wrapper className="border-lines">
				<Wrapper className="max-w-sub-container border-x-2 bg-background px-content-sm py-10 pb-content">
					<h1 className="mb-8 text-heading-h2">
						InternshipsHQ – Privacy Policy
					</h1>
					<p className="mb-2 font-semibold text-paragraph-lg italic">
						Last Updated: September 20th, 2025
					</p>
					<div className="mb-content-sm space-y-8">
						<p className="text-paragraph-lg leading-relaxed">
							InternshipsHQ (&quot;we,&quot; &quot;our,&quot; &quot;us&quot;) is
							committed to protecting your privacy.
							<br /> This Privacy Policy explains how we collect, use, and
							safeguard your information when you use our website, mobile site,
							and related services (collectively, &quot;Services&quot;). <br />{" "}
							<br /> By using InternshipsHQ, you consent to the practices
							described below.
						</p>

						<section className="space-y-4">
							<h2 className="font-semibold text-2xl text-gray-900">
								1. Information We Collect
							</h2>
							<p className="text-paragraph-lg leading-relaxed">
								We collect information in the following ways:
							</p>
							<div className="space-y-5">
								<div className="space-y-2">
									<h3 className="font-semibold text-gray-900 text-xl">
										1.1 Information You Provide
									</h3>
									<ul className="list-inside list-disc space-y-2 text-paragraph-lg">
										<li>
											<strong>Email address</strong> (for account creation,
											alerts, receipts, newsletters)
										</li>
										<li>
											<strong>Password</strong> (securely hashed; we never store
											plaintext)
										</li>
										<li>
											<strong>Profile preferences</strong> (location, job types,
											keywords)
										</li>
										<li>
											<strong>Payment information</strong> (handled securely by
											Stripe — we never see or store card numbers)
										</li>
										<li>
											<strong>Saved jobs, filters, searches</strong>
										</li>
									</ul>
								</div>
								<div className="space-y-2">
									<h3 className="font-semibold text-gray-900 text-xl">
										1.2 Information Collected Automatically
									</h3>
									<p className="text-paragraph-lg leading-relaxed">
										When you use the site, we may automatically collect:
									</p>
									<ul className="list-inside list-disc space-y-2 text-paragraph-lg">
										<li>IP address</li>
										<li>Browser type and device information</li>
										<li>Pages you visit</li>
										<li>Time spent on site</li>
										<li>Click actions (e.g., viewing a job post)</li>
									</ul>
								</div>
								<div className="space-y-2">
									<h3 className="font-semibold text-gray-900 text-xl">
										1.3 Cookies &amp; Tracking
									</h3>
									<p className="text-paragraph-lg leading-relaxed">We use:</p>
									<ul className="list-inside list-disc space-y-2 text-paragraph-lg">
										<li>Essential cookies (site functionality)</li>
										<li>Analytics cookies (usage insights)</li>
										<li>Preference cookies (saved filters, login sessions)</li>
									</ul>
									<p className="text-paragraph-lg leading-relaxed">
										You can disable cookies anytime in your browser settings.
									</p>
								</div>
							</div>
						</section>

						<section className="space-y-4">
							<h2 className="font-semibold text-2xl text-gray-900">
								2. How We Use Your Information
							</h2>
							<p className="text-paragraph-lg leading-relaxed">
								We use your information to:
							</p>
							<div className="space-y-5">
								<div className="space-y-2">
									<h3 className="font-semibold text-gray-900 text-xl">
										2.1 Provide &amp; Improve the Service
									</h3>
									<ul className="list-inside list-disc space-y-2 text-paragraph-lg">
										<li>Deliver job listings and alert emails</li>
										<li>Personalize your feed (location, job type, recency)</li>
										<li>Save your job searches and preferences</li>
									</ul>
								</div>
								<div className="space-y-2">
									<h3 className="font-semibold text-gray-900 text-xl">
										2.2 Communication
									</h3>
									<ul className="list-inside list-disc space-y-2 text-paragraph-lg">
										<li>Send daily job digests</li>
										<li>Notify you of new roles matching your filters</li>
										<li>Provide support or account updates</li>
										<li>Send transactional emails (payments, receipts)</li>
									</ul>
									<p className="text-paragraph-lg leading-relaxed">
										You can unsubscribe from non-transactional emails anytime.
									</p>
								</div>
								<div className="space-y-2">
									<h3 className="font-semibold text-gray-900 text-xl">
										2.3 Security &amp; Fraud Prevention
									</h3>
									<ul className="list-inside list-disc space-y-2 text-paragraph-lg">
										<li>Protect accounts</li>
										<li>Detect suspicious activity</li>
										<li>Maintain service integrity</li>
									</ul>
								</div>
								<div className="space-y-2">
									<h3 className="font-semibold text-gray-900 text-xl">
										2.4 Analytics
									</h3>
									<p className="text-paragraph-lg leading-relaxed">
										We may use analytics tools (e.g., Pirsch) to understand how
										users interact with the site.
									</p>
								</div>
							</div>
						</section>

						<section className="space-y-4">
							<h2 className="font-semibold text-2xl text-gray-900">
								3. How We Share Your Information
							</h2>
							<p className="text-paragraph-lg leading-relaxed">
								We do not sell your data. We may share information with trusted
								partners only when necessary:
							</p>
							<div className="space-y-3">
								<div className="space-y-2">
									<h3 className="font-semibold text-gray-900 text-xl">
										3.1 Service Providers
									</h3>
									<ul className="list-inside list-disc space-y-2 text-paragraph-lg">
										<li>
											<strong>Stripe</strong> (payments)
										</li>
										<li>
											<strong>Email providers</strong> (sending alerts)
										</li>
										<li>
											<strong>Analytics tools</strong>
										</li>
									</ul>
									<p className="text-paragraph-lg leading-relaxed">
										These partners only access what they need to operate the
										service.
									</p>
								</div>
								<div className="space-y-2">
									<h3 className="font-semibold text-gray-900 text-xl">
										3.2 Legal Requirements
									</h3>
									<p className="text-paragraph-lg leading-relaxed">
										We may disclose information if required by law, court order,
										or governmental request.
									</p>
								</div>
								<div className="space-y-2">
									<h3 className="font-semibold text-gray-900 text-xl">
										3.3 Business Transfers
									</h3>
									<p className="text-paragraph-lg leading-relaxed">
										If InternshipsHQ is acquired or merged, your information may
										be transferred as part of the transaction. You will be
										notified if this occurs.
									</p>
								</div>
							</div>
						</section>

						<section className="space-y-4">
							<h2 className="font-semibold text-2xl text-gray-900">
								4. Data Retention
							</h2>
							<p className="text-paragraph-lg leading-relaxed">
								We keep your information for as long as your account is active
								or as needed to provide the Service.
							</p>
							<p className="text-paragraph-lg leading-relaxed">
								You may delete your account at any time; this permanently
								removes your personal information from our systems, except where
								retention is required by law (e.g., payment records).
							</p>
						</section>

						<section className="space-y-4">
							<h2 className="font-semibold text-2xl text-gray-900">
								5. Data Security
							</h2>
							<p className="text-paragraph-lg leading-relaxed">
								We use industry-standard safeguards to protect your data:
							</p>
							<ul className="list-inside list-disc space-y-2 text-paragraph-lg">
								<li>HTTPS encryption</li>
								<li>Hashed passwords</li>
								<li>Secure payment processing (PCI-compliant Stripe)</li>
								<li>Access controls and monitoring</li>
							</ul>
							<p className="text-paragraph-lg leading-relaxed">
								No system is 100% secure, but we take every reasonable step to
								protect your information.
							</p>
						</section>

						<section className="space-y-4">
							<h2 className="font-semibold text-2xl text-gray-900">
								6. Your Rights
							</h2>
							<p className="text-paragraph-lg leading-relaxed">
								Depending on your location (e.g., GDPR, CCPA), you may have the
								right to:
							</p>
							<ul className="list-inside list-disc space-y-2 text-paragraph-lg">
								<li>Access your personal data</li>
								<li>Request correction or deletion</li>
								<li>Export your data</li>
								<li>Opt out of marketing emails</li>
								<li>Restrict or object to processing</li>
								<li>
									Not be discriminated against for exercising privacy rights
								</li>
							</ul>
							<p className="text-paragraph-lg leading-relaxed">
								To exercise any rights, email us at{" "}
								<strong>support@internshipshq.com</strong>.
							</p>
						</section>

						<section className="space-y-4">
							<h2 className="font-semibold text-2xl text-gray-900">
								7. International Data Transfers
							</h2>
							<p className="text-paragraph-lg leading-relaxed">
								Your information may be processed on servers located outside
								your country. We use appropriate safeguards (e.g., Standard
								Contractual Clauses) when transferring data internationally.
							</p>
						</section>

						<section className="space-y-4">
							<h2 className="font-semibold text-2xl text-gray-900">
								8. Children&apos;s Privacy
							</h2>
							<p className="text-paragraph-lg leading-relaxed">
								InternshipsHQ is not intended for users under age 16. We do not
								knowingly collect personal information from children.
							</p>
						</section>

						<section className="space-y-4">
							<h2 className="font-semibold text-2xl text-gray-900">
								9. Links to Third-Party Sites
							</h2>
							<p className="text-paragraph-lg leading-relaxed">
								Job listings often redirect to employer websites. We are not
								responsible for:
							</p>
							<ul className="list-inside list-disc space-y-2 text-paragraph-lg">
								<li>Their content</li>
								<li>Their privacy practices</li>
								<li>Their data usage</li>
							</ul>
							<p className="text-paragraph-lg leading-relaxed">
								Please review their policies before providing information.
							</p>
						</section>

						<section className="space-y-4">
							<h2 className="font-semibold text-2xl text-gray-900">
								10. Updates to This Policy
							</h2>
							<p className="text-paragraph-lg leading-relaxed">
								We may update this Privacy Policy from time to time. When we do,
								we will update the “Last Updated” date. Continued use of the
								Service means you accept the revised policy.
							</p>
						</section>

						<section className="space-y-4">
							<h2 className="font-semibold text-2xl text-gray-900">
								11. Contact Us
							</h2>
							<p className="text-paragraph-lg leading-relaxed">
								If you have questions, concerns, or requests, contact us at:
							</p>
							<p className="text-gray-700 leading-relaxed">
								📧 <strong>support@internshipshq.com</strong>
							</p>
						</section>
					</div>
				</Wrapper>
				<BottomCta />
			</Wrapper>
		</PageWrapper>
	);
}
