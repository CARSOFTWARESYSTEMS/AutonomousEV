# Smart Parking — internationalisation and regional adapters

Requirements SP-E11, SP-X01, SP-X02 and SP-X03. Implemented in `src/lib/wireless-charging/smart-parking/billing.ts` (tariffs, locales, payment adapters) and `vehicles.ts` (plate formats). The region is an input in Engineer mode.

**Nothing here is a statement of any jurisdiction's law, tax rate or tariff.** All values are representative placeholders, to be set by the site operator for a real deployment.

## 1. Regions

| Setting | India (IN, default) | United States (US) | China (CN) |
|---|---|---|---|
| Locale for numbers, money and time | en-IN | en-US | zh-CN |
| Time zone for display | Asia/Kolkata | America/Los_Angeles | Asia/Shanghai |
| Interface languages | English | English | Chinese (declared) and English |
| Currency and minor unit | INR, 100 paise | USD, 100 cents | CNY, 100 fen |
| Plate format (synthetic) | State series `ZZ 07 EV 4821` or BH series; unissued code ZZ | 5–7 alphanumerics starting with 0, e.g. `0EVT 482` | Test character 测 + letter + 5–6 characters, e.g. `测A·D4821` |
| Payment adapter (simulated) | UPI-class | Card-network | Mobile-wallet |

How these settings take effect:

- **Storage and display:** time is stored as UTC milliseconds and converted to the site's time zone only for display. Money is formatted with `Intl.NumberFormat` in the region's locale.
- **Interface text:** it is English in every region. The `zh-CN` language is declared in the locale table, but the interface has not been translated. Translation is a planned item.

## 2. Tariffs (representative)

All amounts are in minor units.

| Field | IN | US | CN |
|---|---|---|---|
| Grace period | 10 min | 10 min | 15 min |
| First block | 60 min for 3,000 (₹30) | 60 min for 300 ($3) | 60 min for 1,000 (¥10) |
| Each further block | 30 min for 1,500 (₹15) | 30 min for 150 ($1.50) | 30 min for 500 (¥5) |
| Daily cap | 25,000 (₹250) | 2,500 ($25) | 8,000 (¥80) |
| Reservation fee | 2,000 (₹20) | 200 ($2) | 500 (¥5) |
| Member discount | 10 % | 10 % | 10 % |
| Accessible-bay discount | 50 % | 0 % | 50 % |
| Charging energy price | 1,800 per kWh (₹18) | 45 per kWh ($0.45) | 160 per kWh (¥1.60) |
| Charging metering boundary | Grid-side | Grid-side | Grid-side |
| Tax (placeholder) | 18 % | 8 % | 6 % |
| Final rounding | to 100 (whole rupee), half up | to 1 cent, half up | to 10 fen, half up |

Rules (check SP-A07, verified with the IN tariff):

- **Integer arithmetic:** every amount is an integer of minor units. Percentages are exact rationals rounded half up to one minor unit, and only the final amount is rounded to the region's step.
- **Billable time:** a started minute counts.
- **Separate bills:** the parking bill and the charging bill stay separate, each with its own tax (SP-B17).
- **Energy price bands:** the energy cost to the facility uses off-peak, standard and peak bands. This is the facility's own cost, not what the driver pays.

## 3. Data retention and residency (SP-X02 — designed, not enforced)

The simulation stores nothing outside the visitor's browser and holds no personal data. A deployment would configure, per region:

| Setting | Purpose | Example values to be set by the operator |
|---|---|---|
| `retention.sessions` | How long session records with an identity reference are kept | Shortest period the operator's legal basis allows |
| `retention.plateText` | How long the plain plate text is kept (a keyed hash is kept for matching) | Hours to days, or only for the access list |
| `retention.images` | Recognition images | Not kept after recognition, except for declared evaluation datasets with consent |
| `retention.audit` | Audit log | Security policy period |
| `residency.region` | Where the cloud data platform stores personal data | Within the deployment country where required |
| `export.anonymised` | Research exports | Aggregated or pseudonymised only |

Before any deployment, the operator must decide each value with qualified legal advice for that jurisdiction. The twin makes no claim of compliance with any data-protection law.

## 4. Interoperability (SP-X03 — planned evaluation)

| Interface | Purpose | Status |
|---|---|---|
| Parking data standards (for example the Alliance for Parking Data Standards specification) | Exchange of facility, rate and occupancy data with navigation and city platforms | Listed for evaluation; nothing implemented |
| Charge-point management protocols (for example OCPP) | Charging-session management between chargers and a back end | Listed for evaluation, for session records and tariffs only |
| Vehicle-to-charger communication (for example ISO 15118 and wireless-charging extensions) | Identification and authorisation of a vehicle at a charger | Listed for evaluation |

None of these is treated as a real-time control channel for wireless power transfer. The charger's local controller keeps the safety functions.

The editions and applicability of these documents have not been verified. They are named as candidates, not as standards the twin follows.

## 5. Adding a region

1. Add the region to the `Region` type and the plate-format table. Choose a synthetic marker that cannot collide with an issued plate.
2. Add a tariff, a locale, a time zone, the interface languages and a payment adapter name.
3. Add hand-computed bills for the new region to SP-A07, which today checks the arithmetic with the IN tariff, add it to the plate-format test's region list, and run the checks.
