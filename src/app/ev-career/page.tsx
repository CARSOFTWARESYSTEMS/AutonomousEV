import type { Metadata } from "next";
import EVCareerContent from "./EVCareerContent";

export const metadata: Metadata = {
  title: "EV Career Opportunities | EV.ENGINEER™",
  description: "Explore global career opportunities in electric vehicles, EV batteries, energy systems, cell manufacturing, autonomous driving, and automotive software through EV.ENGINEER™. Discover EV engineering roles, skills, and competencies for ITI, Diploma, BE/BTech, MTech, MBA, and PhD graduates.",
  keywords: [
    'EV Career', 'EV Engineering Roles', 'EV Competency Matrix', 'BMS Engineer Career',
    'Battery Intelligence Engineer', 'EV Internship India', 'EV Career Guide',
    'Electric Vehicle Jobs India', 'Automotive Software Engineer', 'Embedded Systems EV',
    'Telematics Engineer', 'EV Battery Jobs', 'EV Technical Architect',
  ],
  openGraph: {
    title: "EV.ENGINEER™ - Career Opportunities & Competency Matrix",
    description: "Building World-Class EV Engineers & Technical Leaders. Explore industry-aligned roles, skills, and competency frameworks.",
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
