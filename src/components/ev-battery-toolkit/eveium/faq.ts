// Short answers for EVeium battery questions. Only what a recorded source
// states, or what the toolkit itself does — no unsupported repair claims.
export const EVEIUM_FAQ: { q: string; a: string }[] = [
  { q: "What battery does the EVeium Cosmo use?", a: "EVeium publishes a 72 V, 30 Ah lithium-ion battery for the Cosmo. 72 V × 30 Ah = 2.16 kWh nominal energy, calculated — not a measured usable energy." },
  { q: "What battery does the EVeium Comet use?", a: "EVeium publishes a 72 V, 50 Ah lithium-ion battery for the Comet: 3.60 kWh nominal energy, calculated from the published voltage and capacity." },
  { q: "What is the EVeium Czar battery capacity?", a: "Sources disagree. EVeium's website states 72 V 40 Ah (2.88 kWh calculated); 2022 launch coverage reported 72 V 42 Ah (3.02 kWh). Read the rated capacity from the pack label." },
  { q: "Is the EVeium battery removable?", a: "EVeium's specifications list a lithium-ion swappable battery. The battery location and removal procedure are not published; confirm them by inspection and authorised service documentation." },
  { q: "How do I diagnose an EVeium scooter that is not charging?", a: "After the safety screen: measure battery open-circuit voltage and charger output, observe the charge response, measure pack voltage and current during charging, then check BMS charge enable, connectors, temperature and fault codes. Do not blame the charger or the BMS without that evidence." },
  { q: "What causes range loss on a 72 V scooter battery?", a: "Ageing, low usable capacity, a weak cell group, cell imbalance, high internal resistance, SOC estimation error, thermal limitation or connector resistance. A range complaint alone never justifies battery replacement; measured evidence does." },
  { q: "Which BMS protocol does EVeium use?", a: "Not publicly verified. Record CAN, UART, BLE or other only if you have confirmed it physically on the vehicle." },
  { q: "Does this toolkit connect to the EVeium BMS?", a: "No. V1 supports manual entry and CSV / JSON import from a tester or BMS export. There is no live EVeium BMS connection." },
];
