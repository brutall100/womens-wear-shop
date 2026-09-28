import { SebSettingsForm } from "@/components/SettingsForms";
import { getSetting, keyStatus, sebConfig } from "@/lib/db";
import { SEB_GATEWAY_HINT } from "@/lib/seb";

export default function SebPage() {
  const config = sebConfig();
  const keys = keyStatus();
  return (
    <SebSettingsForm
      merchantId={getSetting("seb_merchant_id")}
      gatewayUrl={config.gatewayUrl}
      bankId={config.bankId}
      live={config.live}
      merchantBits={keys.merchantBits}
      bankSubject={keys.bankSubject}
      hint={SEB_GATEWAY_HINT}
    />
  );
}
