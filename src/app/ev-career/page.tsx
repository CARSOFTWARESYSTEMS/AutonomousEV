import type { Metadata } from "next";
import EVCareerContent from "./EVCareerContent";

export const metadata: Metadata = {
  title: "EV Career Opportunities | EV.ENGINEER™",
  description: "Explore global career opportunities in electric vehicles, EV batteries, energy systems, cell manufacturing, autonomous driving, and automotive software through EV.ENGINEER™.",
  openGraph: {
    title: "EV.ENGINEER™ - Career Opportunities",
    description: "Building World-Class Engineers to Solve Energy and EV Battery Challenges.",
  }
};

import fs from 'fs';
import path from 'path';

export default function EVCareerPage() {
  const dataDir = path.join(process.cwd(), 'src/data/ev-companies');
  const categoriesPath = path.join(dataDir, 'categories.json');
  
  let groupedCompanies: Record<string, any[]> = {};
  
  try {
    const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
    for (const category of categoriesData) {
      const filePath = path.join(dataDir, category.fileName);
      if (fs.existsSync(filePath)) {
        const companiesData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        groupedCompanies[category.categoryName] = companiesData;
      }
    }
  } catch (error) {
    console.error("Error loading company data:", error);
  }

  return <EVCareerContent groupedCompanies={groupedCompanies} />;
}
