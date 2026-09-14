export type Persona = "family" | "student" | "farmer" | "fisherman" | "business" | "professional" | "government";

export const PERSONAS: { id: Persona; label: string }[] = [
  { id: "family", label: "Family" },
  { id: "student", label: "Student" },
  { id: "farmer", label: "Farmer" },
  { id: "fisherman", label: "Fisherman" },
  { id: "business", label: "Small Business" },
  { id: "professional", label: "Professional" },
  { id: "government", label: "Government" },
];

export type ApplicationCategory =
  | "everyday-life"
  | "agriculture"
  | "safety"
  | "mobility"
  | "connectivity"
  | "public-services"
  | "business";

export const CATEGORIES: { id: ApplicationCategory; label: string }[] = [
  { id: "everyday-life", label: "Everyday Life" },
  { id: "agriculture", label: "Agriculture" },
  { id: "safety", label: "Safety" },
  { id: "mobility", label: "Mobility" },
  { id: "connectivity", label: "Connectivity" },
  { id: "public-services", label: "Public Services" },
  { id: "business", label: "Business" },
];

export interface Application {
  id: string;
  name: string;
  category: ApplicationCategory;
  relevantPersonas: Persona[];
  problem: string;
  spaceCapability: string;
  behindTheScenes: string;
  citizenReceives: string;
  whoBenefits: string;
  benefitType: "direct" | "indirect" | "both";
  indiaExample: string;
  futureOpportunity: string;
  engineering: { capabilities: string[]; dataProcessing: string; groundSegment: string };
  business: { customers: string; valueAddedLayer: string; businessModels: string[]; validationNeeded: string };
}

export const APPLICATIONS: Application[] = [
  {
    id: "weather",
    name: "Weather & Extreme Weather",
    category: "everyday-life",
    relevantPersonas: ["family", "farmer", "fisherman", "professional", "government"],
    problem: "Will it rain heavily tomorrow? Is a heatwave or cyclone coming, and when should I prepare?",
    spaceCapability: "Watching the atmosphere and oceans from above, continuously, over the whole country at once.",
    behindTheScenes:
      "Meteorological satellites observe cloud patterns, temperature and moisture. This is combined with ground weather stations and forecast models to predict how weather will develop.",
    citizenReceives: "A daily forecast, a heat or heavy-rain warning, or a cyclone track and landfall estimate.",
    whoBenefits: "Everyone planning a day, a farmer deciding when to sow or harvest, a city preparing for extreme heat.",
    benefitType: "both",
    indiaExample:
      "India's meteorological satellites and IMD's forecasting together give advance warning of cyclones approaching the coast, giving days of lead time for evacuation.",
    futureOpportunity: "More frequent, hyperlocal forecasts (down to a neighbourhood or a single farm) as satellite revisit rates and AI forecasting models improve.",
    engineering: {
      capabilities: ["Geostationary and polar-orbiting meteorological imaging", "Atmospheric sounding", "Numerical weather prediction assimilation"],
      dataProcessing: "Satellite imagery is combined with ground and ocean-buoy observations inside numerical weather models to produce forecasts and warnings.",
      groundSegment: "National meteorological ground stations and forecasting centres receive, process and issue public advisories.",
    },
    business: {
      customers: "Agri-tech platforms, logistics companies, insurers, media weather services, event and construction planners.",
      valueAddedLayer: "Hyperlocal forecast APIs, weather-risk scoring, and automated alerting layered on top of public weather data.",
      businessModels: ["API subscription", "Embedded weather-risk features in other apps", "Advisory/consulting for weather-sensitive operations"],
      validationNeeded: "Forecast accuracy at the hyperlocal scale, and real willingness to pay for precision beyond what free public forecasts already offer.",
    },
  },
  {
    id: "navigation",
    name: "Navigation & Maps",
    category: "mobility",
    relevantPersonas: ["family", "professional", "business", "student"],
    problem: "Which route should I take? Where exactly am I, and how do I get somewhere I've never been?",
    spaceCapability: "Knowing precise location and time, anywhere, from satellites overhead.",
    behindTheScenes:
      "Navigation satellites broadcast precise timing signals; a receiver (in a phone or vehicle) uses signals from multiple satellites to calculate its own position.",
    citizenReceives: "A route, an estimated arrival time, or a simple 'you are here' on a map.",
    whoBenefits: "Commuters, delivery riders, travellers, emergency responders, anyone navigating an unfamiliar place.",
    benefitType: "direct",
    indiaExample: "India operates its own regional navigation system, NavIC, alongside global systems like GPS, both used by positioning receivers in and around India.",
    futureOpportunity: "Wider direct NavIC support in everyday consumer devices, and more precise positioning for dense urban and indoor environments.",
    engineering: {
      capabilities: ["Regional and global satellite navigation constellations", "Precise timing broadcast", "Multi-constellation receiver positioning"],
      dataProcessing: "Receivers compute position by measuring signal travel time from several satellites simultaneously (trilateration).",
      groundSegment: "A network of ground stations tracks and corrects satellite orbits and clocks to keep signals accurate.",
    },
    business: {
      customers: "Mapping and navigation apps, fleet and delivery platforms, ride-hailing services, surveying firms.",
      valueAddedLayer: "Turn-by-turn routing, live traffic overlays, and precision positioning services built on top of raw satellite signals.",
      businessModels: ["Consumer app monetisation (ads/subscription)", "B2B fleet-routing SaaS", "Precision-positioning licensing for surveying/agriculture"],
      validationNeeded: "Signal reliability in dense cities and indoors, and whether precision beyond standard GPS is actually needed by the target customer.",
    },
  },
  {
    id: "disaster-preparedness",
    name: "Disaster Preparedness",
    category: "safety",
    relevantPersonas: ["family", "government", "farmer", "fisherman"],
    problem: "Is a flood, cyclone or wildfire coming — and once it happens, where exactly did it hit?",
    spaceCapability: "Seeing the same ground area repeatedly, before and after a disaster, to track change.",
    behindTheScenes:
      "Earth-observation satellites image an area before a disaster, then again during and after — the before/after comparison shows exactly what changed (flooded area, burnt forest, damaged structures).",
    citizenReceives: "An early warning, an evacuation advisory, or a flood/damage extent map used to plan the response.",
    whoBenefits: "Residents in at-risk areas, disaster-response agencies, insurers assessing losses, local governments planning relief.",
    benefitType: "both",
    indiaExample: "ISRO's Bhuvan geoportal hosts thematic disaster-mapping layers, and satellite imagery is used by Indian disaster-management agencies to assess flood and cyclone-affected areas.",
    futureOpportunity: "Faster (near real-time) damage mapping using more satellites revisiting the same area more often, combined with AI-based automatic change detection.",
    engineering: {
      capabilities: ["Optical and radar Earth observation", "Change detection", "Rapid-mapping for emergency response"],
      dataProcessing: "Before/after satellite images are compared computationally to automatically flag flooded, burnt or damaged areas.",
      groundSegment: "Disaster-management authorities and geospatial agencies receive and distribute mapped products to response teams.",
    },
    business: {
      customers: "Insurance companies, disaster-response NGOs, state disaster-management authorities, infrastructure operators.",
      valueAddedLayer: "Automated damage-extent dashboards and risk-zone mapping built on top of raw satellite imagery.",
      businessModels: ["Government/NGO service contracts", "Insurance-risk-assessment tooling", "Subscription disaster-monitoring dashboards"],
      validationNeeded: "Speed and accuracy of automated damage detection compared to ground survey, and procurement cycles with public agencies.",
    },
  },
  {
    id: "agriculture",
    name: "Agriculture",
    category: "agriculture",
    relevantPersonas: ["farmer", "government", "business"],
    problem: "Is my crop stressed or diseased? How much water does my field actually have, and when should I plant or harvest?",
    spaceCapability: "Watching how land and crops change colour and health over a growing season.",
    behindTheScenes:
      "Satellites measure how plants reflect light, which changes as crops grow, get stressed, or ripen — this is combined with weather and soil-moisture data.",
    citizenReceives: "A crop-health advisory, an irrigation recommendation, or an estimate of expected yield.",
    whoBenefits: "Individual farmers, agricultural extension officers, crop insurers, government food-security planning.",
    benefitType: "indirect",
    indiaExample:
      "ISRO's Resourcesat series provides land and vegetation imagery used in Indian agricultural monitoring and land-use assessment.",
    futureOpportunity: "Field-level (not just regional) crop advisories delivered directly to a farmer's phone, combining satellite data with local sensors.",
    engineering: {
      capabilities: ["Multispectral vegetation imaging", "Land-use and land-cover classification", "Time-series crop monitoring"],
      dataProcessing: "Vegetation-index calculations from satellite imagery are tracked over the growing season and compared against historical norms.",
      groundSegment: "Agricultural research and remote-sensing centres process imagery into usable advisories for extension services.",
    },
    business: {
      customers: "Farmer cooperatives, agri-input companies, crop insurers, agri-fintech lenders.",
      valueAddedLayer: "Field-level crop-health scoring, yield estimation, and insurance-claim verification built on satellite vegetation data.",
      businessModels: ["Per-acre advisory subscription", "Insurance-claim-verification services", "Lending risk-scoring for agri-finance"],
      validationNeeded: "Advisory accuracy at small-farm scale, and affordability/last-mile delivery to smallholder farmers.",
    },
  },
  {
    id: "fisheries",
    name: "Fisheries & Coastal Safety",
    category: "safety",
    relevantPersonas: ["fisherman", "government"],
    problem: "Where are the fish today, and is it safe to go out to sea?",
    spaceCapability: "Watching ocean colour, temperature, waves and currents from above.",
    behindTheScenes:
      "Ocean-observing satellites detect where nutrient-rich water (which attracts fish) is located, and track wave height and sea conditions.",
    citizenReceives: "A Potential Fishing Zone advisory pointing to likely fishing areas, and an ocean-state/rough-sea warning.",
    whoBenefits: "Fishing communities (fuel savings from not searching blindly, and safety from storm warnings), coast guard, fisheries departments.",
    benefitType: "direct",
    indiaExample:
      "INCOIS issues Potential Fishing Zone advisories and Ocean State Forecasts to Indian fisherfolk, distributed via SMS, village information centres and local broadcast.",
    futureOpportunity: "More frequent, higher-resolution ocean advisories reaching smaller and more remote fishing communities directly on mobile phones.",
    engineering: {
      capabilities: ["Ocean-colour and sea-surface-temperature imaging", "Wave and current modelling", "Ocean-state forecasting"],
      dataProcessing: "Satellite ocean data is combined with buoy observations and ocean models to generate fishing-zone and sea-state advisories.",
      groundSegment: "National ocean-information centres process and disseminate advisories to coastal communities.",
    },
    business: {
      customers: "Fishing cooperatives, coastal logistics operators, marine insurers.",
      valueAddedLayer: "Localized, app-based fishing-zone and safety alerts building on public ocean advisories.",
      businessModels: ["Freemium mobile advisory app", "Cooperative-level subscription service"],
      validationNeeded: "Smartphone/connectivity access among target fishing communities, and trust in a new (vs. established government) advisory channel.",
    },
  },
  {
    id: "connectivity",
    name: "Connectivity",
    category: "connectivity",
    relevantPersonas: ["family", "student", "government", "business"],
    problem: "Can a remote village, ship or disaster-hit area stay connected when there's no ground network?",
    spaceCapability: "Relaying communication signals over very large or remote areas, including where ground infrastructure doesn't reach.",
    behindTheScenes:
      "Communication satellites receive a signal from one location and relay it across a wide footprint, reaching areas fibre or mobile towers can't economically cover.",
    citizenReceives: "A phone or broadband connection, broadcast TV/radio access, or an emergency communication link.",
    whoBenefits: "Remote and rural communities, ships and aircraft, disaster-response teams needing communication when local infrastructure is down.",
    benefitType: "direct",
    indiaExample: "India's INSAT/GSAT satellite series has long supported television broadcasting, telecommunication and distance-education relay across the country.",
    futureOpportunity: "Direct-to-device satellite connectivity that lets an ordinary phone connect straight to a satellite without special ground equipment (an emerging capability, not yet mainstream).",
    engineering: {
      capabilities: ["Geostationary communication relay", "Broadcast and broadband transponders", "VSAT ground terminals"],
      dataProcessing: "Signals are received, amplified and retransmitted by the satellite to a wide ground footprint.",
      groundSegment: "Ground earth stations and VSAT terminals send and receive the relayed signals.",
    },
    business: {
      customers: "Telecom operators, broadcasters, rural connectivity programmes, maritime and aviation operators.",
      valueAddedLayer: "Managed satellite-connectivity services and hybrid satellite/terrestrial network products.",
      businessModels: ["Bandwidth resale", "Managed connectivity contracts for rural/enterprise", "Satellite IoT connectivity"],
      validationNeeded: "Cost-per-user versus terrestrial alternatives, and regulatory spectrum/licensing requirements.",
    },
  },
  {
    id: "logistics",
    name: "Logistics & Delivery",
    category: "mobility",
    relevantPersonas: ["business", "professional", "family"],
    problem: "Where is my delivery right now, and what's the most efficient route for a fleet of vehicles?",
    spaceCapability: "Tracking location continuously and combining it with weather and traffic context.",
    behindTheScenes: "Vehicles and packages carry positioning receivers; fleet-management software combines this location data with route and weather information.",
    citizenReceives: "A live delivery-tracking map, an estimated arrival time, or an optimised delivery route.",
    whoBenefits: "Delivery and logistics companies, e-commerce customers, supply-chain planners.",
    benefitType: "direct",
    indiaExample: "Satellite navigation (NavIC and GPS) underlies the positioning layer used by logistics and delivery platforms operating across India.",
    futureOpportunity: "Weather- and disruption-aware route planning that automatically re-routes shipments around developing storms or floods.",
    engineering: {
      capabilities: ["Satellite positioning integration", "Fleet telematics", "Route optimisation"],
      dataProcessing: "Continuous position reports are combined with traffic, weather and road data to optimise routing in real time.",
      groundSegment: "Fleet-management platforms and telematics providers aggregate and process vehicle location data.",
    },
    business: {
      customers: "E-commerce and logistics companies, last-mile delivery platforms, freight operators.",
      valueAddedLayer: "Fleet-optimisation and tracking software layered on satellite positioning and weather data.",
      businessModels: ["SaaS fleet-management subscription", "Per-shipment tracking API fees"],
      validationNeeded: "Integration complexity with existing fleet systems, and measurable efficiency gains customers will pay for.",
    },
  },
  {
    id: "water-resources",
    name: "Water Resources",
    category: "public-services",
    relevantPersonas: ["farmer", "government", "family"],
    problem: "Is there enough water in our reservoirs and groundwater for the season ahead?",
    spaceCapability: "Measuring how much water is visible on the surface and how land moisture changes over time.",
    behindTheScenes: "Satellites track reservoir and river water levels and surface moisture over time, which water-resource planners combine with rainfall data.",
    citizenReceives: "A drought advisory, a reservoir-level update, or input into local water-supply planning.",
    whoBenefits: "Water-utility planners, farmers dependent on irrigation, drought-prone communities.",
    benefitType: "indirect",
    indiaExample: "ISRO's Earth-observation satellites (including Resourcesat) contribute imagery used in Indian water-resource and drought-monitoring assessments.",
    futureOpportunity: "Near-real-time groundwater and reservoir monitoring at a resolution useful for local, not just regional, water planning.",
    engineering: {
      capabilities: ["Surface-water and soil-moisture remote sensing", "Multi-temporal reservoir monitoring"],
      dataProcessing: "Surface-water extent is measured from imagery over time and combined with rainfall and groundwater data.",
      groundSegment: "Water-resource and remote-sensing agencies process and publish monitoring products.",
    },
    business: {
      customers: "Municipal water utilities, irrigation departments, agri-insurance providers.",
      valueAddedLayer: "Water-stress dashboards and early drought-warning tools built on satellite hydrology data.",
      businessModels: ["Government service contracts", "Subscription water-risk dashboards"],
      validationNeeded: "Resolution and update-frequency limits versus what local water planning actually requires.",
    },
  },
  {
    id: "infrastructure-cities",
    name: "Infrastructure & Cities",
    category: "public-services",
    relevantPersonas: ["government", "professional", "business"],
    problem: "Where should a new road, bridge or housing development be built, and is existing infrastructure ageing safely?",
    spaceCapability: "Mapping land use and detecting small changes in the ground or structures over time.",
    behindTheScenes: "High-resolution imagery maps existing land use and infrastructure; repeated observations can reveal subsidence or structural change over time.",
    citizenReceives: "Better-planned infrastructure, and (indirectly) safer roads, bridges and buildings.",
    whoBenefits: "Urban planners, infrastructure operators, engineers doing site assessment.",
    benefitType: "indirect",
    indiaExample: "ISRO's Cartosat series provides high-resolution mapping imagery used in Indian urban planning and infrastructure-mapping applications.",
    futureOpportunity: "Continuous, automated monitoring of critical infrastructure (bridges, dams, rail corridors) for early signs of stress.",
    engineering: {
      capabilities: ["High-resolution optical imaging", "3D terrain mapping", "Radar-based ground-deformation monitoring"],
      dataProcessing: "High-resolution imagery is turned into detailed maps and 3D models; repeated radar passes can detect millimetre-scale ground movement.",
      groundSegment: "Mapping and geospatial agencies process imagery into planning-ready map products.",
    },
    business: {
      customers: "Urban local bodies, infrastructure developers, engineering consultancies.",
      valueAddedLayer: "Geospatial planning tools and infrastructure-health monitoring dashboards built on satellite mapping data.",
      businessModels: ["Government/consultancy service contracts", "SaaS infrastructure-monitoring subscriptions"],
      validationNeeded: "Data resolution adequacy for engineering-grade decisions, and public-procurement sales cycles.",
    },
  },
  {
    id: "land-property",
    name: "Land, Property & Geospatial Services",
    category: "business",
    relevantPersonas: ["business", "professional", "government"],
    problem: "Where exactly are a property's boundaries, and how has land use around it changed?",
    spaceCapability: "Producing accurate, up-to-date maps of land parcels and land-use change.",
    behindTheScenes: "High-resolution satellite imagery is used to verify land boundaries, land use and changes over time, supporting official land records.",
    citizenReceives: "More reliable land records, property verification, and land-use change reports.",
    whoBenefits: "Property buyers and owners, land-records departments, real-estate and geospatial-service businesses.",
    benefitType: "indirect",
    indiaExample: "ISRO's Bhuvan platform hosts land-use and geospatial layers that support Indian land-record and rural-mapping programmes.",
    futureOpportunity: "Faster, satellite-verified digital land records reducing disputes and manual survey time.",
    engineering: {
      capabilities: ["High-resolution cadastral-grade imaging", "GIS integration", "Land-use classification"],
      dataProcessing: "Imagery is geo-rectified and overlaid with existing land records to verify boundaries and detect land-use change.",
      groundSegment: "State land-records and geospatial departments integrate imagery into official mapping systems.",
    },
    business: {
      customers: "Real-estate platforms, land-records departments, geospatial-survey firms.",
      valueAddedLayer: "Property-verification APIs and land-use-change alerts built on satellite and GIS data.",
      businessModels: ["B2B geospatial data licensing", "Property-verification SaaS"],
      validationNeeded: "Legal acceptance of satellite-derived boundaries alongside traditional survey methods.",
    },
  },
  {
    id: "healthcare",
    name: "Healthcare",
    category: "public-services",
    relevantPersonas: ["family", "government", "student"],
    problem: "Can someone in a remote area reach a doctor, and can health authorities see disease patterns early?",
    spaceCapability: "Connecting remote clinics for telemedicine, and mapping environmental factors linked to disease spread.",
    behindTheScenes: "Satellite communication links remote health centres to specialists; Earth-observation data (like water bodies or land use) helps track conditions linked to disease spread.",
    citizenReceives: "Access to a remote consultation, or (indirectly) earlier public-health response in an affected area.",
    whoBenefits: "Rural patients, telemedicine providers, public-health agencies planning disease response.",
    benefitType: "both",
    indiaExample: "Satellite communication (via India's INSAT/GSAT satellites) has supported telemedicine connectivity to remote health centres.",
    futureOpportunity: "Wider satellite-linked telemedicine reach as connectivity becomes cheaper and more available in remote areas.",
    engineering: {
      capabilities: ["Satellite communication for telemedicine links", "Environmental Earth observation for public-health mapping"],
      dataProcessing: "Video/data links are relayed via satellite for consultations; environmental imagery is analysed for disease-risk mapping.",
      groundSegment: "Remote health centres and telemedicine hubs use satellite terminals for connectivity.",
    },
    business: {
      customers: "Telemedicine platforms, rural health NGOs, state health departments.",
      valueAddedLayer: "Managed satellite-linked telemedicine kits and connectivity bundles for remote clinics.",
      businessModels: ["Telemedicine-connectivity service contracts", "NGO/government partnership deployments"],
      validationNeeded: "Cost of satellite connectivity versus patient volume in very remote clinics.",
    },
  },
  {
    id: "education",
    name: "Education",
    category: "public-services",
    relevantPersonas: ["student", "family", "government"],
    problem: "Can a student in a remote village access the same lessons as a student in a city?",
    spaceCapability: "Broadcasting educational content across very large areas, including where internet access is limited.",
    behindTheScenes: "Communication satellites relay televised or digital lessons to remote schools and learning centres.",
    citizenReceives: "Access to broadcast or relayed lessons, distance-education programmes, or remote classroom connectivity.",
    whoBenefits: "Students in remote or under-served areas, distance-education providers, state education departments.",
    benefitType: "direct",
    indiaExample: "India's INSAT/GSAT satellites have supported EDUSAT-era and ongoing educational broadcast and distance-learning initiatives.",
    futureOpportunity: "Interactive, two-way satellite-linked classrooms rather than one-way broadcast, as connectivity improves.",
    engineering: {
      capabilities: ["Geostationary broadcast relay", "Distance-education transponders"],
      dataProcessing: "Educational content is uplinked once and broadcast across a wide satellite footprint to many receiving schools at once.",
      groundSegment: "School-based receive terminals and state education broadcast centres manage content delivery.",
    },
    business: {
      customers: "State education departments, ed-tech companies, rural learning-centre networks.",
      valueAddedLayer: "Curriculum-aligned satellite-broadcast content packages and hybrid satellite/digital learning platforms.",
      businessModels: ["Government education-programme contracts", "Ed-tech content-licensing partnerships"],
      validationNeeded: "Learning-outcome evidence for broadcast versus interactive digital delivery.",
    },
  },
];

export interface EverydayQuestion {
  id: string;
  question: string;
  problem: string;
  howSpaceHelps: string;
  whatYouReceive: string;
  whoUsesIt: string;
  futureOpportunity: string;
}

export const QUESTIONS: EverydayQuestion[] = [
  { id: "rain-tomorrow", question: "Will it rain heavily tomorrow?", problem: "Planning a day, a journey or a harvest depends on knowing what the weather will do.", howSpaceHelps: "Meteorological satellites track clouds and moisture, feeding forecast models.", whatYouReceive: "A daily forecast and heavy-rain warning.", whoUsesIt: "Everyone — families, farmers, event planners, transport operators.", futureOpportunity: "More hyperlocal, neighbourhood-level forecasts." },
  { id: "cyclone-coming", question: "Is a cyclone coming?", problem: "Coastal communities need advance warning to evacuate and prepare.", howSpaceHelps: "Satellites track cyclone formation and path over the ocean where ground sensors can't reach.", whatYouReceive: "A cyclone track, intensity estimate and landfall warning.", whoUsesIt: "Coastal residents, fishing communities, disaster-management authorities.", futureOpportunity: "Earlier, more precise landfall and intensity predictions." },
  { id: "which-route", question: "Which route should I take?", problem: "Choosing the fastest or safest way to get somewhere.", howSpaceHelps: "Navigation satellites provide the precise positioning that routing apps rely on.", whatYouReceive: "A recommended route and arrival time.", whoUsesIt: "Commuters, travellers, delivery riders.", futureOpportunity: "Weather- and disruption-aware routing." },
  { id: "delivery-location", question: "Where is my delivery?", problem: "Knowing when a package or ride will actually arrive.", howSpaceHelps: "Satellite positioning tracks the vehicle carrying it in real time.", whatYouReceive: "A live tracking map and estimated arrival time.", whoUsesIt: "Online shoppers, logistics companies.", futureOpportunity: "Tighter, more reliable delivery-time predictions." },
  { id: "crop-stress", question: "Can a farmer detect crop stress?", problem: "Crop problems are often invisible from the ground until it's too late to act.", howSpaceHelps: "Satellites detect changes in how crops reflect light, signalling stress before it's visible to the eye.", whatYouReceive: "A crop-health advisory.", whoUsesIt: "Farmers, agricultural extension officers.", futureOpportunity: "Field-level advisories sent directly to a farmer's phone." },
  { id: "enough-water", question: "Is there enough water?", problem: "Communities and farms need to plan around available water in reservoirs and groundwater.", howSpaceHelps: "Satellites monitor surface-water extent and land moisture over time.", whatYouReceive: "Drought advisories and reservoir-level updates.", whoUsesIt: "Water utilities, farmers, local governments.", futureOpportunity: "Near-real-time, local-scale water monitoring." },
  { id: "where-infrastructure", question: "Where should new infrastructure be built?", problem: "Planners need accurate, current maps of land use to decide where to build.", howSpaceHelps: "High-resolution imagery maps land use and terrain in detail.", whatYouReceive: "Better-informed infrastructure and urban plans.", whoUsesIt: "Urban planners, infrastructure developers.", futureOpportunity: "Continuous monitoring of infrastructure health, not just one-time planning." },
  { id: "ocean-conditions", question: "Can fishermen know dangerous ocean conditions?", problem: "Going to sea in rough or unpredictable conditions is dangerous.", howSpaceHelps: "Ocean-observing satellites track waves, currents and sea-surface temperature.", whatYouReceive: "Ocean State Forecasts and fishing-zone advisories.", whoUsesIt: "Fishing communities, coast guard.", futureOpportunity: "More frequent, localized ocean-safety alerts." },
  { id: "remote-connectivity", question: "Can remote villages stay connected?", problem: "Ground network infrastructure doesn't reach every remote area economically.", howSpaceHelps: "Communication satellites relay signals across wide, remote footprints.", whatYouReceive: "Phone, broadcast or broadband access.", whoUsesIt: "Remote and rural communities.", futureOpportunity: "Direct-to-device satellite connectivity for ordinary phones." },
  { id: "flooding-mapped", question: "Can authorities see where flooding occurred?", problem: "Disaster responders need to know exactly which areas are affected, fast.", howSpaceHelps: "Before/after satellite imagery reveals the exact flooded extent.", whatYouReceive: "A flood-extent map guiding relief and response.", whoUsesIt: "Disaster-management authorities, relief agencies.", futureOpportunity: "Near real-time flood mapping using more frequent satellite revisits." },
  { id: "forest-fires", question: "Can we detect forest fires sooner?", problem: "Fires spread fast; early detection saves forest and lives.", howSpaceHelps: "Satellites detect heat signatures and smoke from fires as they start.", whatYouReceive: "Early fire alerts for forest and disaster-management teams.", whoUsesIt: "Forest departments, disaster responders.", futureOpportunity: "Faster alerting as more satellites revisit fire-prone areas more often." },
  { id: "insurance-assessment", question: "Can satellite information improve insurance assessment?", problem: "Verifying crop or property damage claims manually is slow and inconsistent.", howSpaceHelps: "Before/after imagery objectively shows the extent of damage.", whatYouReceive: "Faster, more consistent claim assessment.", whoUsesIt: "Insurers, policyholders.", futureOpportunity: "Automated, near-instant claim verification for large-scale disasters." },
  { id: "pollution-monitoring", question: "How can we monitor pollution and environmental change?", problem: "Air quality and environmental change are hard to track everywhere, all the time, from the ground alone.", howSpaceHelps: "Satellites observe atmospheric composition and land/forest cover change over time.", whatYouReceive: "Pollution and environmental-change monitoring data feeding public advisories.", whoUsesIt: "Environmental agencies, researchers, the public.", futureOpportunity: "Finer-resolution, more frequent air-quality and deforestation monitoring." },
  { id: "remote-education", question: "Can remote students access education?", problem: "Students far from cities may not have access to the same teachers or content.", howSpaceHelps: "Communication satellites broadcast lessons across wide areas.", whatYouReceive: "Access to broadcast or relayed lessons.", whoUsesIt: "Students and schools in remote areas.", futureOpportunity: "Interactive, two-way satellite-linked classrooms." },
  { id: "remote-healthcare", question: "Can healthcare reach remote locations?", problem: "Specialist doctors are concentrated in cities, far from many patients.", howSpaceHelps: "Satellite communication links remote clinics to specialists for telemedicine.", whatYouReceive: "Access to a remote medical consultation.", whoUsesIt: "Rural patients, telemedicine providers.", futureOpportunity: "Wider, cheaper satellite-linked telemedicine reach." },
];

export interface DayStage {
  id: string;
  time: string;
  activity: string;
  spaceCapability: string;
  service: string;
  benefit: string;
}

export const DAY_IN_LIFE: DayStage[] = [
  { id: "morning-weather", time: "6:30 AM", activity: "Checking the weather forecast", spaceCapability: "Meteorological satellite observation", service: "A weather forecast app or broadcast", benefit: "Deciding what to wear, whether to carry an umbrella, or whether to delay a trip." },
  { id: "commute", time: "8:00 AM", activity: "Navigating to office or school", spaceCapability: "Satellite navigation (positioning and timing)", service: "A maps/navigation app", benefit: "A faster, more confident route with a reliable arrival time." },
  { id: "delivery", time: "10:30 AM", activity: "Tracking a delivery", spaceCapability: "Satellite positioning on the delivery vehicle", service: "A live delivery-tracking map", benefit: "Knowing when a package or meal will actually arrive." },
  { id: "food-supply", time: "1:00 PM", activity: "Food reaching the table", spaceCapability: "Satellite-informed agricultural and weather monitoring", service: "Crop advisories and food-supply planning upstream in the chain", benefit: "More reliable food availability and pricing — an indirect, upstream benefit." },
  { id: "connectivity", time: "4:00 PM", activity: "Staying connected", spaceCapability: "Satellite communication relay", service: "Broadcast TV, radio or satellite-backed connectivity in under-served areas", benefit: "Information and connectivity that would otherwise not reach a remote area." },
  { id: "broadcast", time: "6:30 PM", activity: "Watching the evening news", spaceCapability: "Satellite broadcast relay", service: "Television and radio broadcast distribution", benefit: "Access to information and entertainment across the whole country at once." },
  { id: "evening-navigation", time: "8:00 PM", activity: "Finding a nearby restaurant or service", spaceCapability: "Satellite navigation and location services", service: "A maps/search app showing nearby places", benefit: "Discovering and reaching a destination without prior knowledge of the area." },
  { id: "emergency", time: "Emergency", activity: "A flood, cyclone or other disaster strikes", spaceCapability: "Earth observation, weather satellites and satellite communication", service: "Warnings, damage-extent maps and emergency communication links", benefit: "Faster warning, faster response, and communication even where ground networks fail." },
];

export interface SpaceSystemSource {
  id: string;
  question: string;
  name: string;
  explanation: string;
  officialSourceLabel: string;
  officialSourceUrl: string;
  verifiedOn: string;
}

export const VERIFIED_ON = "2026-09-14";

export const SPACE_SYSTEMS: SpaceSystemSource[] = [
  {
    id: "navic",
    question: "Where am I, and what time is it — precisely?",
    name: "NavIC",
    explanation: "India's own regional satellite navigation system, providing position, velocity and timing information across India and the surrounding region, alongside global systems like GPS.",
    officialSourceLabel: "ISRO — Satellite Navigation Services",
    officialSourceUrl: "https://www.isro.gov.in/",
    verifiedOn: VERIFIED_ON,
  },
  {
    id: "insat-gsat",
    question: "How can information reach large or remote regions at once?",
    name: "INSAT / GSAT",
    explanation: "India's series of geostationary communication satellites, supporting broadcasting, telecommunications and distance-education relay across the country.",
    officialSourceLabel: "ISRO — Communication Satellites",
    officialSourceUrl: "https://www.isro.gov.in/",
    verifiedOn: VERIFIED_ON,
  },
  {
    id: "cartosat",
    question: "What does a place look like from above, in detail?",
    name: "Cartosat",
    explanation: "A series of Indian Earth-observation satellites providing high-resolution imagery for mapping, urban planning and infrastructure applications.",
    officialSourceLabel: "ISRO — Earth Observation",
    officialSourceUrl: "https://www.isro.gov.in/",
    verifiedOn: VERIFIED_ON,
  },
  {
    id: "resourcesat",
    question: "What is changing across land, crops and resources?",
    name: "Resourcesat",
    explanation: "Indian Earth-observation satellites (Resourcesat-2 and 2A) providing data for agriculture, land use, forestry and water-resource monitoring.",
    officialSourceLabel: "ISRO — Earth Observation",
    officialSourceUrl: "https://www.isro.gov.in/",
    verifiedOn: VERIFIED_ON,
  },
  {
    id: "oceansat",
    question: "What is happening in the ocean?",
    name: "Oceansat",
    explanation: "An Indian satellite (Oceansat-3) tracking ocean colour, winds and waves — directly supporting fisheries advisories and monsoon-related ocean monitoring.",
    officialSourceLabel: "ISRO — Ocean Observation",
    officialSourceUrl: "https://www.isro.gov.in/",
    verifiedOn: VERIFIED_ON,
  },
  {
    id: "risat",
    question: "What can we see through clouds, rain or at night?",
    name: "RISAT",
    explanation: "Indian radar Earth-observation satellites that image the ground regardless of weather or daylight, supporting flood mapping and crop and soil monitoring.",
    officialSourceLabel: "ISRO — Earth Observation",
    officialSourceUrl: "https://www.isro.gov.in/",
    verifiedOn: VERIFIED_ON,
  },
  {
    id: "mosdac",
    question: "Where does weather and ocean satellite data actually go?",
    name: "MOSDAC",
    explanation: "The Meteorological & Oceanographic Satellite Data Archival Centre — ISRO's data centre for receiving, processing and distributing weather and ocean satellite data.",
    officialSourceLabel: "MOSDAC official site",
    officialSourceUrl: "https://www.mosdac.gov.in/",
    verifiedOn: VERIFIED_ON,
  },
  {
    id: "bhuvan",
    question: "How can I explore India's satellite maps myself?",
    name: "Bhuvan",
    explanation: "ISRO's public geoportal for exploring thematic maps — disaster mapping, agriculture, water resources, land cover — built from Indian satellite data.",
    officialSourceLabel: "Bhuvan geoportal",
    officialSourceUrl: "https://bhuvan.nrsc.gov.in/",
    verifiedOn: VERIFIED_ON,
  },
  {
    id: "incois",
    question: "How do fishing communities get ocean safety advisories?",
    name: "INCOIS",
    explanation: "The Indian National Centre for Ocean Information Services issues Potential Fishing Zone advisories and Ocean State Forecasts to fisherfolk, using satellite ocean data.",
    officialSourceLabel: "INCOIS official site",
    officialSourceUrl: "https://incois.gov.in/",
    verifiedOn: VERIFIED_ON,
  },
  {
    id: "inspace",
    question: "Who enables private companies to build space-based services in India?",
    name: "IN-SPACe",
    explanation: "The Indian National Space Promotion and Authorisation Centre — a single-window government agency that promotes, permits and oversees space activities by non-government entities.",
    officialSourceLabel: "IN-SPACe official site",
    officialSourceUrl: "https://www.inspace.gov.in/",
    verifiedOn: VERIFIED_ON,
  },
  {
    id: "ndma",
    question: "Who coordinates India's disaster response using this data?",
    name: "NDMA",
    explanation: "The National Disaster Management Authority — India's apex disaster-management body, coordinating policy, planning and response including geospatial disaster information.",
    officialSourceLabel: "NDMA official site",
    officialSourceUrl: "https://ndma.gov.in/",
    verifiedOn: VERIFIED_ON,
  },
];

export interface DiagramStage {
  id: string;
  plainLabel: string;
  technicalLabel: string;
  description: string;
}

export const SYSTEM_DIAGRAM_STAGES: DiagramStage[] = [
  { id: "rocket", plainLabel: "Rocket", technicalLabel: "Launch Vehicle", description: "Rockets provide access to space — carrying satellites beyond the atmosphere and placing them into orbit." },
  { id: "access", plainLabel: "Access to Space", technicalLabel: "Launch & Orbit Insertion", description: "Once launched, a satellite is placed into an orbit chosen for its mission — some circle the whole Earth repeatedly, others hover over one region." },
  { id: "satellite", plainLabel: "Satellite", technicalLabel: "Spacecraft Platform", description: "The satellite carries instruments (cameras, radar, sensors, communication payloads) and the systems to power, point and operate them." },
  { id: "observation", plainLabel: "Seeing, Knowing & Connecting", technicalLabel: "Observation / Navigation / Communication", description: "Satellites create services from space: Earth observation (seeing), navigation (knowing location) and communication (connecting places)." },
  { id: "data", plainLabel: "Data", technicalLabel: "Raw Satellite Data", description: "Instruments produce raw data — images, signals, measurements — which on its own isn't yet useful to an ordinary person." },
  { id: "intelligence", plainLabel: "Turning Data Into Understanding", technicalLabel: "AI, Analytics & Forecasting", description: "Data becomes valuable only when it improves a decision — processing, analytics and AI turn raw data into forecasts, maps and advisories." },
  { id: "service", plainLabel: "Service", technicalLabel: "Application / Data Product", description: "That understanding is packaged into a service — a weather app, a navigation system, a farming advisory, a disaster alert." },
  { id: "citizen", plainLabel: "Citizen, Farmer, Business or Government", technicalLabel: "End User", description: "The service reaches the person or organisation who needs it — a family, a farmer, a business, or a government agency." },
  { id: "benefit", plainLabel: "Everyday Benefit", technicalLabel: "Outcome", description: "The end result is a better everyday decision — safer travel, better warnings, better planning, reduced uncertainty." },
];

export interface Chapter {
  id: string;
  title: string;
  sections: { href: string; label: string }[];
}

export const CHAPTERS: Chapter[] = [
  {
    id: "understand",
    title: "Understand",
    sections: [
      { href: "#system-diagram", label: "How Space Helps" },
      { href: "#questions", label: "Everyday Questions" },
    ],
  },
  {
    id: "explore-applications",
    title: "Explore Applications",
    sections: [{ href: "#applications", label: "Applications" }],
  },
  {
    id: "day-in-life",
    title: "A Day in Your Life",
    sections: [{ href: "#day-in-life", label: "A Day in the Life" }],
  },
  {
    id: "behind-the-services",
    title: "Behind the Services",
    sections: [
      { href: "#benefits", label: "Direct vs Indirect" },
      { href: "#space-systems", label: "India's Space Systems" },
      { href: "#satellite-to-phone", label: "Satellite to Phone" },
    ],
  },
];
