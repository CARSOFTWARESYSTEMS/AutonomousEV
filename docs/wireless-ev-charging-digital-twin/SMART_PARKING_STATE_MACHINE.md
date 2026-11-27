# Smart Parking — session state machine (SP-CTRL-001)

Generated from `src/lib/wireless-charging/smart-parking/lifecycle.ts`. A transition happens only if it is in the table below and its guard holds; any other request is refused and logged on the session (`refused`), never applied. Timers are model quantities (processing times, timeouts, driver actions), never a visual stand-in for a state change. The parking session hands a charging session to the bay's own Station state machine (WPT-CTRL-001), whose 19 phases and 13 abnormal states run unchanged.

## Normal lifecycle (25 states)

| Step | State | Meaning | May go to |
|---|---|---|---|
| 1 | Vehicle approaching (`approaching`) | On the entry road, decelerating toward the stop line. | `detected`, `abandoned` |
| 2 | Detected (`detected`) | The presence detector at the stop line confirmed a vehicle; a session is opened (once per detection event). | `identifying`, `camera-fault`, `gateway-unavailable`, `tailgating` |
| 3 | Identification pending (`identifying`) | The camera pipeline is reading the plate on the edge computer. | `identified`, `id-uncertain`, `unknown-vehicle`, `camera-fault` |
| 4 | Identified (`identified`) | An identity is established: a confident plate read, an RFID tag, a QR code, a visitor ticket or an operator. | `authorizing` |
| 5 | Authorisation pending (`authorizing`) | The identity is checked against the local access list and reservations. | `authorized`, `unauthorized` |
| 6 | Authorised (`authorized`) | The vehicle may enter. | `allocating` |
| 7 | Slot allocation (`allocating`) | The allocation engine evaluates every bay against the hard constraints and the policy. | `reserved`, `no-bay`, `no-charging-bay`, `reservation-conflict`, `environmental-alarm` |
| 8 | Slot reserved (`reserved`) | The chosen bay is reserved atomically for this session. | `entry-permitted`, `environmental-alarm` |
| 9 | Entry permitted (`entry-permitted`) | Local safety checks passed; the guidance display shows the bay. | `barrier-opening`, `environmental-alarm` |
| 10 | Barrier opening (`barrier-opening`) | The entry barrier is opening; the vehicle waits for it. | `entering`, `environmental-alarm` |
| 11 | Entering (`entering`) | The vehicle drives through the gate. | `barrier-closing`, `barrier-obstructed` |
| 12 | Barrier closing (`barrier-closing`) | The clear zone is verified empty; the barrier closes behind the vehicle. | `navigating`, `barrier-obstructed`, `tailgating` |
| 13 | Navigating (`navigating`) | Driving along the aisle following the guidance to the bay. | `parking`, `wrong-bay` |
| 14 | Parking (`parking`) | Turning into the bay and stopping. | `confirming`, `wrong-bay` |
| 15 | Occupancy confirmation (`confirming`) | Waiting for the fused bay sensors to confirm the vehicle. | `parked`, `occupancy-disagreement`, `wrong-bay` |
| 16 | Parked (`parked`) | The bay's sensors confirm the vehicle; parking time runs. | `eligibility`, `departure-requested`, `occupancy-disagreement` |
| 17 | Charging eligibility (`eligibility`) | Occupancy, compatibility, transmitter, authorisation, alignment, battery and safety are verified. | `charging`, `parked` |
| 18 | Charging (`charging`) | A charging session is attached and handed to the Station charging state machine. | `charged`, `charging-fault`, `departure-requested`, `charging-stopping` |
| 19 | Charging complete (`charged`) | The Station reached the target or stopped; the vehicle stays parked. | `departure-requested` |
| 20 | Departure requested (`departure-requested`) | The driver asked to leave (or the planned departure time came). | `charging-stopping`, `billing` |
| 21 | Charging stopping safely (`charging-stopping`) | The Station ramps power down and de-energises the pad before the vehicle may move. | `billing` |
| 22 | Billing finalised (`billing`) | Parking and charging are settled in separate ledgers. | `exit-authorized`, `payment-pending` |
| 23 | Exit authorised (`exit-authorized`) | Payment settled (or deferred by policy); the vehicle may leave. | `exiting` |
| 24 | Exiting (`exiting`) | Leaving the bay and driving to the exit gate. | `released` |
| 25 | Released (`released`) | The vehicle has left; the bay was released after verified departure. | — (final) |

## Exceptional states (22)

| State | Meaning | Recovery | May go to |
|---|---|---|---|
| Unknown vehicle (`unknown-vehicle`) | No identity could be established. | Visitor ticket, operator verification, or turned away. | `identified`, `manual-verification`, `rejected` |
| Unauthorised vehicle (`unauthorized`) | The identity is not allowed to enter. | Turned away through the turnaround. | `rejected` |
| Identification uncertain (`id-uncertain`) | The plate was read with low confidence: never authorised automatically. | RFID or QR at the reader, or operator verification. | `identified`, `manual-verification`, `unknown-vehicle` |
| Manual verification (`manual-verification`) | Waiting for an operator to verify the vehicle. | Operator approves or refuses; timeout turns the vehicle away. | `identified`, `rejected` |
| Camera failure (`camera-fault`) | The recognition camera is not responding. | RFID or QR at the reader; operator. | `identified`, `manual-verification`, `unknown-vehicle` |
| No available bay (`no-bay`) | No bay satisfies the hard constraints. | Queue until a bay is released. | `queued`, `rejected` |
| No compatible charging bay (`no-charging-bay`) | The EV asked to charge but no wireless bay can be offered. | Offered a conventional bay without charging. | `allocating` |
| Reservation conflict (`reservation-conflict`) | The reserved bay is not available (occupied or out of service). | Reallocated within the reserved class, else queued. | `allocating` |
| Queue waiting (`queued`) | Waiting at the stop line for a bay. | A bay is released → allocation; patience exceeded → abandons. | `allocating`, `abandoned`, `environmental-alarm` |
| Barrier obstruction (`barrier-obstructed`) | Something is under the barrier: it will not close. | Clear zone empty → close. | `barrier-closing`, `navigating` |
| Tailgating detected (`tailgating`) | A second vehicle followed through on one authorisation. | Operator review. | `operator-intervention` |
| Wrong parking bay (`wrong-bay`) | The vehicle stopped in a bay other than its allocation. | Reassigned if that bay is eligible, else operator. | `confirming`, `operator-intervention` |
| Sensor failure (`sensor-fault`) | A bay sensor is not reporting. | Fused from the remaining sensors; maintenance. | `parked`, `confirming` |
| Occupancy disagreement (`occupancy-disagreement`) | The bay's sensors disagree: the bay is uncertain, not assigned. | Sensors agree again, or an operator confirms. | `parked`, `confirming`, `operator-intervention` |
| Communication timeout (`comm-timeout`) | A node's messages stopped arriving. | Messages resume; data marked STALE meanwhile. | `parked`, `confirming` |
| Environmental alarm (`environmental-alarm`) | Smoke or gas alarm: entry suspended, charging stopped, exits open. | Alarm cleared and acknowledged. | `queued`, `allocating`, `rejected`, `abandoned` |
| Charging safety fault (`charging-fault`) | The Station entered an abnormal state. | The Station's own recovery; parking continues. | `charging`, `charged`, `departure-requested` |
| Payment pending (`payment-pending`) | The payment service did not confirm. | Retried; exit allowed on a deferred-payment record by policy. | `exit-authorized` |
| Operator intervention (`operator-intervention`) | Waiting for an authorised operator decision. | Operator approves or refuses. | `parked`, `confirming`, `departure-requested`, `exiting`, `rejected` |
| Gateway unavailable (`gateway-unavailable`) | The edge gateway is down: new entries wait; exits open on local control. | Gateway restored. | `identifying`, `rejected`, `abandoned` |
| Turned away (`rejected`) | Entry refused; the vehicle leaves through the turnaround. | — | — (final) |
| Abandoned the queue (`abandoned`) | Waited longer than the driver's patience and left. | — | — (final) |

## Facility-level conditions that act as guards

- **Environmental alarm** (simulated smoke or gas, local safety controller): allocation and entry suspended (sessions wait in `environmental-alarm`), exit held open for egress, every Station tripped through its own emergency stop; cleared and acknowledged by an operator, the Stations recover through their own reset.
- **Edge gateway down**: new sessions wait in `gateway-unavailable`; the exit opens on local presence (safe egress); payment falls back to a deferred record by policy.
- **Cloud down / payment service down**: the edge continues (store and forward); payment becomes `payment-pending`, exit allowed on a deferred-payment record by policy.
- **Barrier obstruction**: the barrier interlock refuses or reverses closing; the session may pass through `barrier-obstructed`.
