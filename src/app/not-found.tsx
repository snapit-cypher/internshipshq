import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { BottomCta } from "@/common/bottom-cta";
import { Header } from "@/common/header";
import { Button } from "@/components/ui/button";
import { PageWrapper, Wrapper } from "@/wrappers";

export default function Page() {
	return (
		<PageWrapper>
			<Header />
			<Wrapper className="border-lines">
				<div className="mx-auto flex min-h-[calc(100vh-70px)] max-w-sub-container flex-col items-center justify-center border-x-2 bg-background px-content-sm py-content">
					<div className="text-center">
						<Button asChild variant="link" className="text-dark" size="lg">
							<Link href="/jobs" className="text-sm">
								<ArrowLeft strokeWidth={3} /> Go back
							</Link>
						</Button>
						<div className="h-[265px] w-full">
							<iframe
								title="not-found"
								src="https://lottie.host/embed/7ee94493-1f8d-49ae-96f8-30989824dee7/1hU5CsGz1X.lottie"
								className="h-full"
							/>
						</div>
						<h1 className="mx-auto mt-5 mb-2 font-bold text-heading-h5">
							Oops! Something went wrong.
						</h1>
						<p className="text-base">We couldn&apos;t find this page.</p>
					</div>
				</div>
				<BottomCta />
			</Wrapper>
		</PageWrapper>
	);
}
