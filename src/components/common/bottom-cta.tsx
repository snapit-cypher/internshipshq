import Image from "next/image";
import mailIcon from "public/icons/mail.png";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Wrapper } from "@/wrappers";
import Link from "next/link";

export const BottomCta = ({ className }: { className?: string }) => {
	return (
		<Wrapper
			className={cn(
				"mx-auto size-full max-w-sub-container border-x-2 bg-background px-content-sm pb-content lg:px-content",
				className,
			)}
		>
			<Card className="p-0">
				<CardContent className="flex flex-col items-center p-6 pb-12 text-center">
					<Image
						src={mailIcon}
						alt="Email alerts"
						width={150}
						height={100}
						className="mix-blend-multiply"
					/>
					<div className="space-y-3">
						<h2 className="text-heading-h2 tracking-tight">
							Don’t get beat to tomorrow’s openings
						</h2>
						<p className="mx-auto text-muted-foreground text-paragraph-section lg:max-w-[80%]">
							New roles go live every minute and the earliest applicants win.
							Get the freshest, verified listings delivered straight to your
							inbox before most job seekers ever see them.
						</p>
						<Button size="lg" asChild>
							<Link href="/#subscribe-form">👉 Get free daily job posts</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</Wrapper>
	);
};
