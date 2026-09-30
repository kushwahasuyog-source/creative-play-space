import { useEffect, useRef } from "react";

/**
 * ColorBends — flowing color-band shader background (WebGL, no dependencies).
 * Renders soft diagonal bands of the given color drifting slowly; pauses when
 * offscreen or when the user prefers reduced motion.
 */
export function ColorBends({
  color = "#2563EB",
  speed = 0.2,
  bandWidth = 0.14,
  intensity = 1.3,
  className,
}: {
  color?: string;
  speed?: number;
  bandWidth?: number;
  intensity?: number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { alpha: true, antialias: false });
    if (!gl) return;

    const vert = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
    const frag = `
precision mediump float;
uniform vec2 u_res;uniform float u_t;uniform vec3 u_color;
uniform float u_band;uniform float u_int;
void main(){
  vec2 uv=gl_FragCoord.xy/u_res;
  float d=(uv.x+uv.y)*0.5;
  float w=sin((d*6.0+u_t)*6.2831)*0.5+0.5;
  float band=smoothstep(0.5-u_band,0.5,w)*smoothstep(0.5+u_band,0.5,w);
  float glow=smoothstep(0.9,0.0,abs(uv.y-0.55))*0.6+0.4;
  float a=band*glow*0.35*u_int;
  gl_FragColor=vec4(u_color,a);
}`;
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vert));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const uRes = gl.getUniformLocation(prog, "u_res");
    const uT = gl.getUniformLocation(prog, "u_t");
    const uColor = gl.getUniformLocation(prog, "u_color");
    const uBand = gl.getUniformLocation(prog, "u_band");
    const uInt = gl.getUniformLocation(prog, "u_int");

    const hex = color.replace("#", "");
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;
    gl.uniform3f(uColor, r, g, b);
    gl.uniform1f(uBand, bandWidth);
    gl.uniform1f(uInt, intensity);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let visible = true;
    const start = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const { clientWidth: w, clientHeight: h } = canvas;
      canvas.width = Math.max(1, w * dpr);
      canvas.height = Math.max(1, h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      gl.uniform1f(uT, ((performance.now() - start) / 1000) * speed);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const loop = () => {
      if (visible) draw();
      raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(canvas);

    if (reduced) draw();
    else raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [color, speed, bandWidth, intensity]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={className}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}
