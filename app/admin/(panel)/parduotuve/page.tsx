import { ShopSettingsForm } from "@/components/SettingsForms";
import { shopConfig } from "@/lib/db";

export default function ShopSettingsPage() {
  const shop = shopConfig();
  const free = (shop.freeShippingCents / 100).toFixed(2).replace(".", ",");
  return <ShopSettingsForm email={shop.email} phone={shop.phone} pickup={shop.pickup} freeShipping={free} />;
}
