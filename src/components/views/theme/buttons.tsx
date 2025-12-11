import { Button } from "@/components/ui/button";
import { TitleWrapper } from "@/wrappers";

export const Buttons = () => {
	return (
		<TitleWrapper
			title="Buttons"
			className="py-content-sm"
			para="Explore our button variants and styles. Each button is designed for specific use cases and interactions."
		>
			<div className="flex flex-wrap gap-5">
				<Button variant="default" size="lg">
					Default Variant
				</Button>
				<Button variant="secondary" size="lg">
					Secondary Variant
				</Button>
				<Button variant="ghost" size="lg">
					Ghost Variant
				</Button>
				<Button variant="link">Link Variant</Button>
			</div>
		</TitleWrapper>
	);
};
