import AccountsPage from "@/components/revenue/accounts/AccountsPage";
import { pageMetadata } from "../seo";

export const metadata = pageMetadata({
  route: "accounts",
  title: "Accounts | Marketing & Sales | EV.ENGINEER™",
  description: "Lightweight account research for the Marketing & Sales framework, saved in your browser.",
  index: false,
});

export default function Page() {
  return <AccountsPage />;
}
