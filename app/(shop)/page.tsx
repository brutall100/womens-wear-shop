import { HomeView } from "@/components/views/home-view";
import { listCategories, listProducts, shopConfig } from "@/lib/db";

export default function HomePage() {
  return <HomeView products={listProducts({ publishedOnly: true })} categories={listCategories()} shop={shopConfig()} />;
}
