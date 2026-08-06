import { DOWNLOAD_TEMPLATES } from "@/lib/battery-cybersecurity/data/downloadTemplates";
import { SectionHeader } from "../SectionHeader";
import { DownloadCard } from "./downloads/DownloadCard";

export function DownloadsSection() {
  return (
    <section className="section" id="downloads" aria-labelledby="downloads-heading">
      <div className="container">
        <SectionHeader label="Engineering Downloads" title="Templates You Can Use Today" headingId="downloads-heading">
          <p>
            Generic, reusable engineering templates, generated and downloaded entirely in your browser as Markdown — no account,
            no server call.
          </p>
        </SectionHeader>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
          {DOWNLOAD_TEMPLATES.map((template) => (
            <DownloadCard
              key={template.id}
              id={template.id}
              title={template.title}
              description={template.description}
              filename={template.filename}
              markdown={template.buildMarkdown()}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
