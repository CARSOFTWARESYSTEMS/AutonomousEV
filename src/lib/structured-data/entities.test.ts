import { describe, expect, it } from "vitest";
import {
  WEBSITE_ID,
  EV_ENGINEER_BRAND_ID,
  ITELEMATICS_ID,
  EV_SOCIETY_ID,
  THASMAI_ID,
  PERSON_ID,
  evEngineerBrandNode,
  itelematicsOrgNode,
  evSocietyOrgNode,
  thasmaiOrgNode,
  websiteNode,
} from "./entities";
import { EV_ENGINEER, ITELEMATICS, EV_SOCIETY, THASMAI_INFOTECH, SUDARSHANA_KARKALA } from "@/data/public-entities";

describe("shared entity node builders", () => {
  it("mirror the same @id used in the public-entities registry for each entity", () => {
    expect(EV_ENGINEER_BRAND_ID).toBe(EV_ENGINEER.id);
    expect(ITELEMATICS_ID).toBe(ITELEMATICS.id);
    expect(EV_SOCIETY_ID).toBe(EV_SOCIETY.id);
    expect(THASMAI_ID).toBe(THASMAI_INFOTECH.id);
    expect(PERSON_ID).toBe(SUDARSHANA_KARKALA.id);
  });

  it("every builder emits a node whose own @id matches the exported constant", () => {
    expect(evEngineerBrandNode()["@id"]).toBe(EV_ENGINEER_BRAND_ID);
    expect(itelematicsOrgNode()["@id"]).toBe(ITELEMATICS_ID);
    expect(evSocietyOrgNode()["@id"]).toBe(EV_SOCIETY_ID);
    expect(thasmaiOrgNode()["@id"]).toBe(THASMAI_ID);
    expect(websiteNode()["@id"]).toBe(WEBSITE_ID);
  });

  it("calling a builder twice produces deep-equal (stable) nodes", () => {
    expect(websiteNode()).toEqual(websiteNode());
    expect(itelematicsOrgNode()).toEqual(itelematicsOrgNode());
  });

  it("the WebSite node's publisher points at iTelematics, verified via /contact and /", () => {
    const site = websiteNode() as Record<string, unknown>;
    expect(site.publisher).toEqual({ "@id": ITELEMATICS_ID });
  });

  it("never places distinct entities in a shared sameAs list", () => {
    const nodes = [evEngineerBrandNode(), itelematicsOrgNode(), evSocietyOrgNode(), thasmaiOrgNode(), websiteNode()];
    expect(JSON.stringify(nodes)).not.toMatch(/"sameAs"/);
  });
});
