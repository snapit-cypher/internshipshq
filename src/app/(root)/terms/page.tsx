import { BottomCta } from "@/components/common/bottom-cta";
import { PageWrapper, Wrapper } from "@/wrappers";

export default function Page() {
	return (
		<PageWrapper>
			<Wrapper className="border-lines">
				<Wrapper className="max-w-sub-container border-x-2 bg-background px-content-sm py-10 pb-content">
					<h1 className="mb-8 text-heading-h2">
						InternshipsHQ – Terms & Conditions
					</h1>
					<p className="font-semibold text-paragraph-lg italic">
						Last Updated: September 15, 2025
					</p>
					<p className="mt-4 text-paragraph-lg leading-relaxed">
						Welcome to <strong>InternshipsHQ</strong>.
					</p>
					<div className="space-y-8">
						<p className="text-paragraph-lg leading-relaxed">
							By accessing or using our website, products, or services, you
							agree to the following Terms &amp; Conditions. If you do not
							agree, please do not use InternshipsHQ.
						</p>

						<section className="space-y-4">
							<h2 className="font-semibold text-2xl text-gray-900">
								1. Overview
							</h2>
							<p className="text-paragraph-lg leading-relaxed">
								InternshipsHQ (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;)
								provides job aggregation, job alerts, curated job listings, and
								related search tools. We collect job listings from verified
								public sources, company career pages, and direct submissions.
							</p>
							<p className="text-paragraph-lg leading-relaxed">
								InternshipsHQ is{" "}
								<strong>not an employer, not a recruiter</strong>, and does not
								guarantee job placement.
							</p>
						</section>

						<section className="space-y-4">
							<h2 className="font-semibold text-2xl text-gray-900">
								2. Eligibility
							</h2>
							<p className="text-paragraph-lg leading-relaxed">
								To use InternshipsHQ, you must:
							</p>
							<ul className="list-inside list-disc space-y-2 text-paragraph-lg">
								<li>Be at least 16 years old</li>
								<li>
									Have the legal capacity to enter into binding agreements
								</li>
								<li>Use the service for lawful purposes only</li>
							</ul>
						</section>

						<section className="space-y-4">
							<h2 className="font-semibold text-2xl text-gray-900">
								3. Services Provided
							</h2>
							<p className="text-paragraph-lg leading-relaxed">
								InternshipsHQ offers:
							</p>
							<ul className="list-inside list-disc space-y-2 text-paragraph-lg">
								<li>Access to job listings posted within the last 24 hours</li>
								<li>Email alerts for new roles</li>
								<li>Search filters (e.g., location, salary, remote)</li>
								<li>Saved jobs and tracking tools</li>
								<li>Paid premium access with unlimited viewing</li>
							</ul>
							<p className="text-paragraph-lg leading-relaxed">
								We reserve the right to modify, suspend, or discontinue any part
								of the service at any time without notice.
							</p>
						</section>

						<section className="space-y-4">
							<h2 className="font-semibold text-2xl text-gray-900">
								4. User Accounts
							</h2>
							<p className="text-paragraph-lg leading-relaxed">
								When creating an account, you agree to:
							</p>
							<ul className="list-inside list-disc space-y-2 text-paragraph-lg">
								<li>Provide accurate information</li>
								<li>Keep your account secure</li>
								<li>Not share your login with others</li>
								<li>Notify us immediately of any unauthorized use</li>
							</ul>
							<p className="text-paragraph-lg leading-relaxed">
								We may suspend or terminate accounts that violate these Terms.
							</p>
						</section>

						<section className="space-y-4">
							<h2 className="font-semibold text-2xl text-gray-900">
								5. Subscription &amp; Payments
							</h2>
							<p className="text-paragraph-lg leading-relaxed">
								InternshipsHQ may offer:
							</p>
							<ul className="list-inside list-disc space-y-2 text-paragraph-lg">
								<li>Lifetime access (one-time payment)</li>
								<li>Monthly or annual subscriptions</li>
								<li>Promotional pricing or discounts</li>
							</ul>
							<p className="text-paragraph-lg leading-relaxed">
								All payments are processed securely through third-party
								providers (e.g., Stripe).
							</p>
							<p className="text-paragraph-lg leading-relaxed">
								All fees are <strong>non-refundable</strong>, except where
								required by law.
							</p>
							<p className="text-paragraph-lg leading-relaxed">
								You authorize us to charge your selected payment method for
								recurring subscriptions until canceled.
							</p>
						</section>

						<section className="space-y-4">
							<h2 className="font-semibold text-2xl text-gray-900">
								6. Content Accuracy &amp; Availability
							</h2>
							<p className="text-paragraph-lg leading-relaxed">
								InternshipsHQ aggregates job information from external sources.
								We do not guarantee:
							</p>
							<ul className="list-inside list-disc space-y-2 text-paragraph-lg">
								<li>The accuracy of job descriptions</li>
								<li>The availability of positions</li>
								<li>That employers will respond or hire</li>
							</ul>
							<p className="text-paragraph-lg leading-relaxed">
								Job listings may be removed, filled, or changed without notice.
							</p>
						</section>

						<section className="space-y-4">
							<h2 className="font-semibold text-2xl text-gray-900">
								7. Acceptable Use
							</h2>
							<p className="text-paragraph-lg leading-relaxed">
								You agree not to:
							</p>
							<ul className="list-inside list-disc space-y-2 text-paragraph-lg">
								<li>Scrape, copy, reproduce, or redistribute our listings</li>
								<li>Automate access or reverse-engineer the platform</li>
								<li>Upload harmful, defamatory, or illegal content</li>
								<li>
									Impersonate another person or misrepresent your identity
								</li>
							</ul>
							<p className="text-paragraph-lg leading-relaxed">
								Violations may result in suspension or legal action.
							</p>
						</section>

						<section className="space-y-4">
							<h2 className="font-semibold text-2xl text-gray-900">
								8. Intellectual Property
							</h2>
							<p className="text-paragraph-lg leading-relaxed">
								All content on InternshipsHQ, including branding, design, text,
								data compilation, and code, is owned by InternshipsHQ and
								protected by copyright and trademark laws.
							</p>
							<p className="text-paragraph-lg leading-relaxed">
								You may not use our materials without written permission.
							</p>
						</section>

						<section className="space-y-4">
							<h2 className="font-semibold text-2xl text-gray-900">
								9. Third-Party Links
							</h2>
							<p className="text-paragraph-lg leading-relaxed">
								Job listings may link to external employer websites. We are not
								responsible for:
							</p>
							<ul className="list-inside list-disc space-y-2 text-paragraph-lg">
								<li>External site content</li>
								<li>Privacy practices</li>
								<li>Hiring decisions or employer behavior</li>
							</ul>
							<p className="text-paragraph-lg leading-relaxed">
								Use third-party sites at your own risk.
							</p>
						</section>

						<section className="space-y-4">
							<h2 className="font-semibold text-2xl text-gray-900">
								10. Disclaimer of Warranties
							</h2>
							<p className="text-paragraph-lg leading-relaxed">
								InternshipsHQ is provided <strong>&quot;as is&quot;</strong> and{" "}
								<strong>&quot;as available&quot;</strong> without warranties of
								any kind. We do not guarantee that:
							</p>
							<ul className="list-inside list-disc space-y-2 text-paragraph-lg">
								<li>Jobs will remain available</li>
								<li>You will receive interviews or offers</li>
								<li>The service will be error-free or uninterrupted</li>
							</ul>
							<p className="text-paragraph-lg leading-relaxed">
								Your use of the platform is at your own risk.
							</p>
						</section>

						<section className="space-y-4">
							<h2 className="font-semibold text-2xl text-gray-900">
								11. Limitation of Liability
							</h2>
							<p className="text-paragraph-lg leading-relaxed">
								To the fullest extent permitted by law, InternshipsHQ is not
								liable for:
							</p>
							<ul className="list-inside list-disc space-y-2 text-paragraph-lg">
								<li>Loss of job opportunities</li>
								<li>Inaccurate listings</li>
								<li>Downtime or technical issues</li>
								<li>
									Damages arising from use or inability to use the service
								</li>
							</ul>
							<p className="text-paragraph-lg leading-relaxed">
								Our total liability shall not exceed the amount paid for access
								in the previous 12 months.
							</p>
						</section>

						<section className="space-y-4">
							<h2 className="font-semibold text-2xl text-gray-900">
								12. Cancellation &amp; Termination
							</h2>
							<p className="text-paragraph-lg leading-relaxed">
								You may cancel your subscription at any time through your
								account settings.
								<br />
								Cancellation stops future charges, but does not refund past
								payments.
							</p>
							<p className="text-paragraph-lg leading-relaxed">
								We may terminate or restrict access at our discretion if you
								violate these Terms.
							</p>
						</section>

						<section className="space-y-4">
							<h2 className="font-semibold text-2xl text-gray-900">
								13. Privacy
							</h2>
							<p className="text-paragraph-lg leading-relaxed">
								Your use of InternshipsHQ is also governed by our{" "}
								<strong>Privacy Policy</strong>. <br />
								By using the service, you consent to data collection and
								processing as described in that policy.
							</p>
						</section>

						<section className="space-y-4">
							<h2 className="font-semibold text-2xl text-gray-900">
								14. Changes to Terms
							</h2>
							<p className="text-paragraph-lg leading-relaxed">
								We may update these Terms from time to time. Continued use of
								the service after changes means you accept the revised Terms.
							</p>
						</section>

						<section className="space-y-4">
							<h2 className="font-semibold text-2xl text-gray-900">
								15. Contact Us
							</h2>
							<p className="text-paragraph-lg leading-relaxed">
								If you have questions, you can reach us at:
							</p>
							<p className="text-paragraph-lg leading-relaxed">
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
