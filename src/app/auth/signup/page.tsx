import {
	AuthContainer,
	AuthDivider,
	AuthFooter,
	AuthHeader,
	AuthStats,
	GoogleAuthButton,
	SignupForm,
} from "@/components/views/auth";

export default function SignupPage() {
	return (
		<AuthContainer variant="page">
			<AuthHeader
				title="Ready to find your next role?"
				subtitle="Easy to use, fast enough to get results."
			/>
			<SignupForm />
			<AuthDivider />
			<GoogleAuthButton mode="signup" />
			<AuthStats />
			<AuthFooter />
		</AuthContainer>
	);
}
