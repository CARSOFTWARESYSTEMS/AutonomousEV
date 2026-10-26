// The hero's visual: what the product does, shown rather than told. A
// fictitious part drawing whose characteristics are ballooned one by one,
// each balloon lighting its row in a Form 3-style table. It plays once, in
// CSS, and stands still with reduced motion. Safe to render on the server.
import css from "../site.module.css";

const ROWS = [
  { no: 1, name: "Length", req: "120 ±0.1" },
  { no: 2, name: "Height", req: "60 ±0.05" },
  { no: 3, name: "Bore", req: "Ø12 H7" },
  { no: 4, name: "Holes", req: "2× Ø6" },
  { no: 5, name: "Corner radius", req: "R4" },
] as const;

/** Where each balloon sits, and the point its leader line touches. */
const BALLOONS = [
  { cx: 262, cy: 30, tx: 224, ty: 46 },
  { cx: 26, cy: 204, tx: 42, ty: 176 },
  { cx: 392, cy: 128, tx: 258, ty: 134 },
  { cx: 186, cy: 266, tx: 146, ty: 232 },
  { cx: 392, cy: 40, tx: 366, ty: 64 },
] as const;

export default function BalloonDrawing() {
  return (
    <figure className={css.drawing} aria-labelledby="rv-drawing-caption">
      <div className={css.drawingHead} aria-hidden="true">
        <span>Fictitious drawing</span>
        <span>Ballooned</span>
      </div>
      <div className={css.drawingBody}>
        <svg className={css.drawingSvg} viewBox="0 0 420 300" role="img" aria-label="A part drawing with five numbered balloons, each linked to a dimension.">
          {/* The part: a plate with a bore, two holes and one rounded corner. */}
          <path className={css.drawingPart} d="M80 70 H330 Q340 70 340 80 V214 H80 Z" />
          <circle className={css.drawingPart} cx="230" cy="138" r="28" />
          <circle className={css.drawingPart} cx="126" cy="190" r="10" />
          <circle className={css.drawingPart} cx="286" cy="190" r="10" />
          <path className={css.drawingCentre} d="M230 100 V176 M192 138 H268" />
          {/* Dimensions. */}
          <path className={css.drawingDim} d="M80 58 H340 M80 52 V64 M340 52 V64 M56 70 V214 M50 70 H62 M50 214 H62" />
          <text className={css.drawingText} x="196" y="52" textAnchor="middle">
            120 ±0.1
          </text>
          <text className={css.drawingText} x="46" y="146" textAnchor="middle" transform="rotate(-90 46 146)">
            60 ±0.05
          </text>
          <text className={css.drawingText} x="230" y="190" textAnchor="middle">
            Ø12 H7
          </text>
          <text className={css.drawingText} x="126" y="232" textAnchor="middle">
            2× Ø6
          </text>
          <text className={css.drawingText} x="352" y="74">
            R4
          </text>
          {/* Balloons, in the order they are placed. */}
          {BALLOONS.map((balloon, i) => (
            <g key={i} className={css.balloon} style={{ ["--i" as string]: i }}>
              <path className={css.balloonLeader} d={`M${balloon.cx} ${balloon.cy} L${balloon.tx} ${balloon.ty}`} />
              <circle className={css.balloonCircle} cx={balloon.cx} cy={balloon.cy} r="13" />
              <text className={css.balloonNo} x={balloon.cx} y={balloon.cy + 4.5} textAnchor="middle">
                {i + 1}
              </text>
            </g>
          ))}
        </svg>
        <table className={css.drawingTable}>
          <caption className={css.srOnly}>The characteristics, numbered as ballooned</caption>
          <thead>
            <tr>
              <th scope="col">No.</th>
              <th scope="col">Characteristic</th>
              <th scope="col">Requirement</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => (
              <tr key={row.no} style={{ ["--i" as string]: i }}>
                <td>{row.no}</td>
                <td>{row.name}</td>
                <td>{row.req}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <figcaption id="rv-drawing-caption" className={css.drawingCaption}>
        Ballooning links every characteristic on a drawing to a numbered row in the FAI report. FAI Engineer helps prepare both.
      </figcaption>
    </figure>
  );
}
