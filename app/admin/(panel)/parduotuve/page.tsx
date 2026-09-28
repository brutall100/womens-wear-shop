import { ShopSettingsForm } from "@/components/admin/settings-forms";
import { shopConfig } from "@/lib/db";
import { centsToInput } from "@/lib/money";

export default function ShopSettingsPage() {
  const shop = shopConfig();
  return <ShopSettingsForm email={shop.email} phone={shop.phone} pickup={shop.pickup} freeShipping={centsToInput(shop.freeShippingCents)} />;
}
