import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Session } from "next-auth";

export function UserMenu({ user }: { user: Session["user"] }) {
	return (
		<div className="flex items-center justify-end">
			<Button
				variant="outline"
				className="group flex cursor-default items-center gap-1 border-none! bg-none px-2 shadow-none!"
				aria-label="User menu"
			>
				<Avatar>
					<span className="flex size-full items-center justify-center bg-primary font-medium text-primary-foreground text-sm">
						{user.email?.charAt(0) + user.email?.charAt(1)}
					</span>
				</Avatar>
			</Button>
		</div>
	);
}
