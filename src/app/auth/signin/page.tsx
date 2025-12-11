import {
	AuthContainer,
	AuthDivider,
	AuthFooter,
	AuthHeader,
	AuthStats,
	GoogleAuthButton,
	SigninForm,
} from "@/components/views/auth";

export default function SigninPage() {
	return (
		<AuthContainer variant="page">
			<AuthHeader
				title="Welcome Back"
				subtitle="Welcome back, ready to dive in?"
			/>
			<SigninForm />
			<AuthDivider />
			<GoogleAuthButton mode="signin" />
			<AuthStats />
			<AuthFooter />
		</AuthContainer>
	);
}
