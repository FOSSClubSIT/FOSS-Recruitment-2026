"use client";

import DeveloperTheme from "./themes/DeveloperTheme";
import ModernTheme from "./themes/ModernTheme";
import CorporateTheme from "./themes/CorporateTheme";
import AINeonTheme from "./themes/AINeonTheme";
import type { ThemeData } from "./themes/theme-types";

type PortfolioRendererProps = {
  template?: string;
  data: ThemeData;
};

export default function PortfolioRenderer({
  template = "developer",
  data,
}: PortfolioRendererProps) {
  switch (template) {
    case "modern":
      return <ModernTheme data={data} />;

    case "corporate":
      return <CorporateTheme data={data} />;

    case "ai":
      return <AINeonTheme data={data} />;

    case "developer":
    default:
      return <DeveloperTheme data={data} />;
  }
}