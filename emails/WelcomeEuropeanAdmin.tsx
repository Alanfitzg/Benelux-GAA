import { WelcomeEuropeanAdminEmail } from "../src/components/emails/WelcomeEuropeanAdminEmail";

export default function WelcomeEuropeanAdminPreview() {
  return (
    <WelcomeEuropeanAdminEmail
      userName="John Murphy"
      clubName="München Colmcilles GAA"
    />
  );
}
