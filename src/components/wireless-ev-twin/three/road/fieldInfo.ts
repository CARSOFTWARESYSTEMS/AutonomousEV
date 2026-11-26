// What the road field view last computed, for the legend and the instruments.
// Written by the 3D view each frame (from WPT-EM-005), read by the interface.
// No three.js here: the interface may import it.
export const roadFieldInfo = {
  /** The per-ampere basis for the present geometry is built. */
  ready: false,
  /** RMS |B| at mid-gap under the receiver centre, T. */
  atReceiver: 0,
  /** Peak RMS |B| in the section, T, and the linear scale's top, T. */
  max: 0,
  full: 1e-3,
  /** Energised transmitter segments contributing to the field. */
  active: 0,
  /** Segment the fixed section is centred on (−1: following the receiver). */
  segment: -1,
  /** Electrical phase of the field lines, rad. */
  theta: 0,
};

/** What the station's field view last computed (WPT-EM-002). */
export const stationFieldInfo = { centre: 0, max: 0, live: false, lines: 0, full: 1e-3 };
