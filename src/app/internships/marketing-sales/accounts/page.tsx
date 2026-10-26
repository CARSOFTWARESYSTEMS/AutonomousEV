import AccountsPage from "@/components/revenue/accounts/AccountsPage";
import { pageMetadata } from "../seo";

export const metadata = pageMetadata({
  route: "accounts",
  title: "Accounts | B2B Revenue Engineering | EV.ENGINEER™",
  description: "Lightweight account research for the B2B Revenue Engineering framework, saved in your browser.",
  index: false,
});

export default function Page() {
  return <AccountsPage />;
}
