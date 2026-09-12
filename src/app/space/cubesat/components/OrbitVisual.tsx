"use client";
import { useEffect, useId, useRef } from "react";
import { useSimulation } from "./SimulationProvider";
import styles from "../cubetwin.module.css";
// Analytic ray/sphere rendering only. All orbit state is supplied by the numerical engine.
const vertex = `attribute vec2 position; void main(){gl_Position=vec4(position,0.,1.);}`;
const fragment = `precision mediump float;
uniform vec2 resolution;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){return .5*noise(p)+.25*noise(p*2.)+.125*noise(p*4.)+.0625*noise(p*8.);}
void main(){vec2 uv=(gl_FragCoord.xy/resolution-.5)*2.;float d=length(uv);if(d>1.){gl_FragColor=vec4(.1,.65,.85,pow(max(0.,1.-(d-1.)*14.),3.)*.18);return;}
vec3 n=vec3(uv,sqrt(1.-d*d));vec3 light=normalize(vec3(-.9,.65,.65));float day=max(0.,dot(n,light));
vec2 map=vec2(atan(n.x,n.z)*2.3,asin(n.y)*2.3);float land=smoothstep(.47,.51,fbm(map*2.4+vec2(7.2,5.6)));float detail=fbm(map*19.);
vec3 sea=mix(vec3(.015,.08,.16),vec3(.025,.26,.37),detail);vec3 terrain=mix(vec3(.13,.24,.21),vec3(.39,.42,.29),detail);vec3 color=mix(sea,terrain,land);
float clouds=smoothstep(.58,.73,fbm(map*4.+vec2(2,8)));color=mix(color,vec3(.76,.87,.91),clouds*.8);color*=.10+day*1.2;
float rim=pow(1.-n.z,3.);color+=vec3(.05,.45,.65)*rim*(.1+day);gl_FragColor=vec4(color,1.);}`;
export default function OrbitVisual() {
  const { result, cursor } = useSimulation(),
    sample = result.samples[cursor],
    canvas = useRef<HTMLCanvasElement>(null),
    id = useId().replace(/:/g, "");
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    let gl: WebGLRenderingContext | null = null;
    let program: WebGLProgram | null = null;
    let buffer: WebGLBuffer | null = null;
    const shaders: WebGLShader[] = [];
    try {
      gl = c.getContext("webgl", {
        alpha: true,
        antialias: false,
        preserveDrawingBuffer: true,
      });
      if (!gl) return;
      const context = gl;
      const compile = (type: number, source: string) => {
        const shader = context.createShader(type)!;
        shaders.push(shader);
        context.shaderSource(shader, source);
        context.compileShader(shader);
        if (!context.getShaderParameter(shader, context.COMPILE_STATUS))
          throw new Error("Shader unavailable");
        return shader;
      };
      program = gl.createProgram()!;
      gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        throw new Error("Renderer unavailable");
      gl.useProgram(program);
      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        gl.STATIC_DRAW,
      );
      const position = gl.getAttribLocation(program, "position");
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      const draw = () => {
        if (document.hidden) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        c.width = c.height = Math.min(
          720,
          Math.max(240, Math.round(c.clientWidth * dpr)),
        );
        context.viewport(0, 0, c.width, c.height);
        context.uniform2f(
          context.getUniformLocation(program!, "resolution"),
          c.width,
          c.height,
        );
        context.drawArrays(context.TRIANGLES, 0, 6);
        c.dataset.ready = "true";
      };
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) draw();
      });
      observer.observe(c);
      window.addEventListener("resize", draw);
      document.addEventListener("visibilitychange", draw);
      const lost = (event: Event) => {
        event.preventDefault();
        delete c.dataset.ready;
      };
      c.addEventListener("webglcontextlost", lost);
      draw();
      return () => {
        observer.disconnect();
        window.removeEventListener("resize", draw);
        document.removeEventListener("visibilitychange", draw);
        c.removeEventListener("webglcontextlost", lost);
        if (buffer) context.deleteBuffer(buffer);
        if (program) context.deleteProgram(program);
        shaders.forEach((s) => context.deleteShader(s));
      };
    } catch {
      delete c.dataset.ready;
      if (gl) {
        if (buffer) gl.deleteBuffer(buffer);
        if (program) gl.deleteProgram(program);
        shaders.forEach((s) => gl!.deleteShader(s));
      }
    }
  }, []);
  const angle = sample.orbitPhase * 2 * Math.PI - 0.8,
    x = 310 + 260 * Math.cos(angle),
    y = 255 + 112 * Math.sin(angle);
  return (
    <div
      className={styles.orbitVisual}
      role="img"
      aria-label={`Illustrative 3D Earth and 3U CubeSat. Orbit ${sample.orbitNumber}, ${sample.sunlight ? "sunlight" : "eclipse"}, ${sample.mode}. Not to scale; procedural terrain is illustrative.`}
    >
      <div className={styles.stars} />
      <div className={styles.orbitTop}>
        <span>
          <i /> ORBITAL VIEW
        </span>
        <span>3U · LEO</span>
      </div>
      <svg className={styles.orbitSvg} viewBox="0 0 620 510" aria-hidden="true">
        <defs>
          <radialGradient id={`${id}earth`} cx="28%" cy="30%">
            <stop stopColor="#426c79" />
            <stop offset=".4" stopColor="#163d53" />
            <stop offset=".8" stopColor="#0b2033" />
            <stop offset="1" stopColor="#060e1b" />
          </radialGradient>
          <linearGradient id={`${id}metal`}>
            <stop stopColor="#f4dab0" />
            <stop offset=".4" stopColor="#a89575" />
            <stop offset="1" stopColor="#584a3b" />
          </linearGradient>
        </defs>
        <ellipse
          cx="310"
          cy="255"
          rx="260"
          ry="112"
          fill="none"
          stroke="#6cbad8"
          strokeOpacity=".15"
          strokeDasharray="3 8"
        />
        <ellipse
          cx="310"
          cy="255"
          rx="278"
          ry="139"
          fill="none"
          stroke="#64bddb"
          strokeOpacity=".08"
        />
        <circle
          cx="310"
          cy="255"
          r="167"
          fill={`url(#${id}earth)`}
          stroke="#69aabc"
          strokeOpacity=".35"
        />
        <ellipse
          cx="310"
          cy="255"
          rx="167"
          ry="55"
          fill="none"
          stroke="#5ea1b0"
          strokeOpacity=".16"
        />
        <ellipse
          cx="310"
          cy="255"
          rx="67"
          ry="167"
          fill="none"
          stroke="#5ea1b0"
          strokeOpacity=".16"
        />
      </svg>
      <canvas ref={canvas} className={styles.earthCanvas} aria-hidden="true" />
      <svg className={styles.orbitSvg} viewBox="0 0 620 510" aria-hidden="true">
        <path
          d="M 51 260 A 260 112 0 0 0 562 285"
          fill="none"
          stroke="#73d9df"
          strokeWidth="1"
          strokeOpacity=".65"
        />
        <g transform={`translate(${x} ${y}) rotate(-24)`}>
          <circle r="53" fill="#79eeee" opacity=".035" />
          <path
            d="M-75-18H-20V18H-75Z M20-18H75V18H20Z"
            fill="#103a60"
            stroke="#83bad1"
            strokeWidth="1.1"
          />
          {[-65, -52, -39, 30, 43, 56].map((a) => (
            <path
              key={a}
              d={`M${a} -17V17`}
              stroke="#5187a9"
              strokeWidth=".7"
            />
          ))}
          <path d="M-75 0H75" stroke="#74aec9" strokeWidth=".7" />
          <path
            d="M-17-35L16-25V38L-17 29Z"
            fill={`url(#${id}metal)`}
            stroke="#eddfbf"
          />
          <path d="M16-25L26-34V28L16 38Z" fill="#645b4a" stroke="#d0b891" />
          <path
            d="M-17-35L-7-43L26-34L16-25Z"
            fill="#e1cfab"
            stroke="#f4e8cf"
          />
          <path
            d="M-13-13L12-6 M-13 7L12 15"
            stroke="#524d3f"
            strokeWidth="2"
          />
          <rect x="-9" y="-25" width="13" height="10" fill="#14384c" />
          <circle
            cx="5"
            cy="26"
            r="2"
            fill={sample.sunlight ? "#b1fbc7" : "#f3c276"}
          />
          <path d="M-7-43L-18-62 M26 28L40 43" stroke="#d0c4ae" />
        </g>
        <text
          x="43"
          y="433"
          fill="#8b9cac"
          fontFamily="monospace"
          fontSize="10"
        >
          ILLUSTRATIVE · NOT TO SCALE
        </text>
      </svg>
      <div className={styles.orbitLabel}>
        <span className={styles.statusDot} />{" "}
        {sample.sunlight ? "SUNLIGHT" : "ECLIPSE"}
        <small>{result.scenario.orbit.altitudeKm} km above Earth</small>
      </div>
      <div className={styles.orbitBottom}>
        <span>
          ALTITUDE{" "}
          <b>
            {result.scenario.orbit.altitudeKm} <small>km</small>
          </b>
        </span>
        <span>
          ORBITAL PERIOD{" "}
          <b>
            {(result.periodSeconds / 60).toFixed(1)} <small>min</small>
          </b>
        </span>
        <span>
          INCLINATION{" "}
          <b>
            {result.scenario.orbit.inclinationDeg} <small>°</small>
          </b>
        </span>
      </div>
    </div>
  );
}
