/**
 * High-performance WebGL Face Deformation Renderer.
 *
 * Applies genuine mathematical face deformations directly to video frames:
 * - None: Clean passthrough
 * - Big Head: Comic balloon head magnification
 * - Tiny Face: Comical pinched micro-face
 * - Alien: Cranium expansion & extraterrestrial green tint
 * - Mega Chin: Exaggerated Gigachad superhero jawline
 * - Swirl: Carnival vortex funhouse warp
 * - Jelly: Liquid gelatin wobble ripple
 * - Cyclops: Central eye & nose bulge
 * - AR Props (dog, cat, thug life, disguise, devil, angel): Clean pass-through with AR SVG
 * - Random: Cycles through wacky warps
 */

export type FilterType =
  | 'none'
  | 'dog_face'
  | 'cat_face'
  | 'thug_life'
  | 'disguise'
  | 'devil_horns'
  | 'angel_halo'
  | 'big_head'
  | 'tiny_face'
  | 'alien'
  | 'mega_chin'
  | 'swirl'
  | 'jelly'
  | 'cyclops'
  | 'random';

export interface FaceCoordinates {
  x: number; // normalized [0, 1] (0 is left, 1 is right)
  y: number; // normalized [0, 1] (0 is top, 1 is bottom)
  scaleX: number; // normalized scale [0, 1]
  scaleY: number; // normalized scale [0, 1]
  confidence: number; // 0.0 to 1.0
}

const VERTEX_SHADER_SRC = `
attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_uv;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_uv = a_texCoord;
}
`;

const FRAGMENT_SHADER_SRC = `
precision highp float;

uniform sampler2D u_video;
uniform vec2 u_faceCenter;
uniform vec2 u_faceScale;
uniform int u_filter; // 0: None/AR, 1: Big Head, 2: Tiny Face, 3: Alien, 4: Mega Chin, 5: Swirl, 6: Jelly, 7: Cyclops
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_confidence;
uniform float u_aspect;
uniform float u_intensity;

varying vec2 v_uv;

void main() {
    vec2 uv = v_uv;

    if (u_filter > 0 && u_confidence > 0.05) {
        // Center offset corrected for video aspect ratio to preserve circular symmetry
        vec2 d = (uv - u_faceCenter) * vec2(u_aspect, 1.0);
        float dist = length(d);

        if (u_filter == 1) {
            // === BIG HEAD (Spherical Balloon Bulge) ===
            float radius = max(u_faceScale.x, u_faceScale.y) * 1.55;
            if (dist < radius && dist > 0.0001) {
                float norm = dist / radius;
                float power = 1.0 + 0.85 * u_intensity;
                float factor = pow(norm, power);
                vec2 warpedD = (d / dist) * factor * radius;
                uv = u_faceCenter + vec2(warpedD.x / u_aspect, warpedD.y);
            }
        } else if (u_filter == 2) {
            // === TINY FACE (Spherical Micro-Face Pinch) ===
            float radius = max(u_faceScale.x, u_faceScale.y) * 1.35;
            if (dist < radius && dist > 0.0001) {
                float norm = dist / radius;
                float power = 1.0 / (1.0 + 1.15 * u_intensity);
                float factor = pow(norm, power);
                vec2 warpedD = (d / dist) * factor * radius;
                uv = u_faceCenter + vec2(warpedD.x / u_aspect, warpedD.y);
            }
        } else if (u_filter == 3) {
            // === ALIEN CRANIUM & EYES ===
            vec2 foreheadCenter = u_faceCenter - vec2(0.0, u_faceScale.y * 0.28);
            vec2 fd = (uv - foreheadCenter) * vec2(u_aspect, 1.0);
            float fdist = length(fd);
            float fradius = u_faceScale.x * 1.4;
            if (fdist < fradius && fdist > 0.0001) {
                float fnorm = 1.0 - smoothstep(0.0, fradius, fdist);
                vec2 disp = vec2(fd.x * 0.65, -u_faceScale.y * 0.38) * u_intensity;
                uv -= disp * fnorm * 0.8;
            }
        } else if (u_filter == 4) {
            // === MEGA CHIN / GIGACHAD JAW ===
            vec2 chinCenter = u_faceCenter + vec2(0.0, u_faceScale.y * 0.35);
            vec2 cd = (uv - chinCenter) * vec2(u_aspect, 1.0);
            float cdist = length(cd);
            float cradius = u_faceScale.y * 1.1;
            if (cdist < cradius && cdist > 0.0001) {
                float cnorm = 1.0 - smoothstep(0.0, cradius, cdist);
                vec2 disp = vec2(cd.x * 0.55, u_faceScale.y * 0.42) * u_intensity;
                uv -= disp * cnorm * 0.8;
            }
        } else if (u_filter == 5) {
            // === CARNIVAL SWIRL VORTEX ===
            float radius = max(u_faceScale.x, u_faceScale.y) * 1.35;
            if (dist < radius && dist > 0.0001) {
                float percent = (radius - dist) / radius;
                float theta = percent * percent * 2.8 * sin(u_time * 2.2) * u_intensity;
                float s = sin(theta);
                float c = cos(theta);
                vec2 rotated = vec2(d.x * c - d.y * s, d.x * s + d.y * c);
                uv = u_faceCenter + vec2(rotated.x / u_aspect, rotated.y);
            }
        } else if (u_filter == 6) {
            // === JELLY WOBBLE (Funhouse Liquid Ripple) ===
            float radius = max(u_faceScale.x, u_faceScale.y) * 1.5;
            if (dist < radius) {
                float wave = sin(d.y * 22.0 + u_time * 5.0) * 0.03 * u_intensity;
                float falloff = 1.0 - smoothstep(0.0, radius, dist);
                uv.x += wave * falloff;
            }
        } else if (u_filter == 7) {
            // === CYCLOPS / NOSE BULGE ===
            float radius = max(u_faceScale.x, u_faceScale.y) * 0.85;
            if (dist < radius && dist > 0.0001) {
                float norm = dist / radius;
                float factor = pow(norm, 1.0 + 1.2 * u_intensity);
                vec2 warpedD = (d / dist) * factor * radius;
                uv = u_faceCenter + vec2(warpedD.x / u_aspect, warpedD.y);
            }
        }
    }

    // Safety clamp prevents sampling outside video texture bounds
    uv = clamp(uv, vec2(0.002), vec2(0.998));
    vec4 col = texture2D(u_video, uv);

    if (u_filter == 3) {
        // Alien extraterrestrial emerald glow
        col.rgb = vec3(col.r * 0.82, col.g * 1.14, col.b * 0.88);
    }

    gl_FragColor = col;
}
`;

export class FaceDeformationRenderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private texture: WebGLTexture | null = null;
  private positionBuffer: WebGLBuffer | null = null;
  private texCoordBuffer: WebGLBuffer | null = null;

  // Uniform locations
  private uVideoLoc: WebGLUniformLocation | null = null;
  private uFaceCenterLoc: WebGLUniformLocation | null = null;
  private uFaceScaleLoc: WebGLUniformLocation | null = null;
  private uFilterLoc: WebGLUniformLocation | null = null;
  private uTimeLoc: WebGLUniformLocation | null = null;
  private uResolutionLoc: WebGLUniformLocation | null = null;
  private uConfidenceLoc: WebGLUniformLocation | null = null;
  private uAspectLoc: WebGLUniformLocation | null = null;
  private uIntensityLoc: WebGLUniformLocation | null = null;

  private currentFace: FaceCoordinates = {
    x: 0.5,
    y: 0.42,
    scaleX: 0.35,
    scaleY: 0.35,
    confidence: 0.85,
  };

  private randomSubFilter: number = 1;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.initGL();
  }

  private initGL() {
    try {
      const gl = this.canvas.getContext('webgl', {
        alpha: false,
        antialias: false,
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance',
      });

      if (!gl) {
        console.error('WebGL not supported on canvas');
        return;
      }
      this.gl = gl;

      const vertShader = this.compileShader(gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
      const fragShader = this.compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);
      if (!vertShader || !fragShader) return;

      const program = gl.createProgram();
      if (!program) return;
      gl.attachShader(program, vertShader);
      gl.attachShader(program, fragShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
        return;
      }
      this.program = program;

      // Full screen quad geometry
      const positions = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
      this.positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

      // Texture UVs (top-left is 0,0, bottom-right is 1,1)
      const texCoords = new Float32Array([0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0]);
      this.texCoordBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

      // Create video texture
      this.texture = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      // Cache uniforms
      this.uVideoLoc = gl.getUniformLocation(program, 'u_video');
      this.uFaceCenterLoc = gl.getUniformLocation(program, 'u_faceCenter');
      this.uFaceScaleLoc = gl.getUniformLocation(program, 'u_faceScale');
      this.uFilterLoc = gl.getUniformLocation(program, 'u_filter');
      this.uTimeLoc = gl.getUniformLocation(program, 'u_time');
      this.uResolutionLoc = gl.getUniformLocation(program, 'u_resolution');
      this.uConfidenceLoc = gl.getUniformLocation(program, 'u_confidence');
      this.uAspectLoc = gl.getUniformLocation(program, 'u_aspect');
      this.uIntensityLoc = gl.getUniformLocation(program, 'u_intensity');

      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.CULL_FACE);
    } catch (e) {
      console.error('Failed to init WebGL in FaceDeformationRenderer:', e);
    }
  }

  private compileShader(type: number, source: string): WebGLShader | null {
    if (!this.gl) return null;
    const shader = this.gl.createShader(type);
    if (!shader) return null;
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  public setRandomSubFilter(subFilterId: number) {
    this.randomSubFilter = subFilterId;
  }

  public renderFrame(
    video: HTMLVideoElement,
    filter: FilterType,
    rawFace: FaceCoordinates | null,
    timestampSeconds: number,
    intensity: number = 1.0,
  ): boolean {
    const gl = this.gl;
    if (!gl || !this.program || !this.texture) return false;
    if (video.readyState < 2 || video.videoWidth < 10 || video.videoHeight < 10) return false;

    try {
      // Sync canvas dimensions
      if (this.canvas.width !== video.videoWidth || this.canvas.height !== video.videoHeight) {
        this.canvas.width = video.videoWidth;
        this.canvas.height = video.videoHeight;
        gl.viewport(0, 0, video.videoWidth, video.videoHeight);
      }

      // Smooth coordinates
      const LERP = 0.22;
      if (rawFace && rawFace.confidence > 0.05) {
        this.currentFace.x += (rawFace.x - this.currentFace.x) * LERP;
        this.currentFace.y += (rawFace.y - this.currentFace.y) * LERP;
        this.currentFace.scaleX += (rawFace.scaleX - this.currentFace.scaleX) * LERP;
        this.currentFace.scaleY += (rawFace.scaleY - this.currentFace.scaleY) * LERP;
        this.currentFace.confidence += (rawFace.confidence - this.currentFace.confidence) * LERP;
      }

      let filterId = 0;
      if (filter === 'big_head') filterId = 1;
      else if (filter === 'tiny_face') filterId = 2;
      else if (filter === 'alien') filterId = 3;
      else if (filter === 'mega_chin') filterId = 4;
      else if (filter === 'swirl') filterId = 5;
      else if (filter === 'jelly') filterId = 6;
      else if (filter === 'cyclops') filterId = 7;
      else if (filter === 'random') filterId = this.randomSubFilter;
      // Note: AR prop filters (dog_face, cat_face, etc.) use filterId = 0 (clean WebGL frame, AR layer overlays)

      gl.useProgram(this.program);

      // Upload frame to Texture Unit 0
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);

      // Explicitly tell shader to sample from Texture Unit 0
      gl.uniform1i(this.uVideoLoc, 0);

      // Geometry attributes
      const aPosLoc = gl.getAttribLocation(this.program, 'a_position');
      gl.enableVertexAttribArray(aPosLoc);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
      gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, 0, 0);

      const aTexLoc = gl.getAttribLocation(this.program, 'a_texCoord');
      gl.enableVertexAttribArray(aTexLoc);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
      gl.vertexAttribPointer(aTexLoc, 2, gl.FLOAT, false, 0, 0);

      // Uniforms
      const aspect = video.videoWidth / video.videoHeight;
      gl.uniform2f(this.uFaceCenterLoc, this.currentFace.x, this.currentFace.y);
      gl.uniform2f(this.uFaceScaleLoc, this.currentFace.scaleX, this.currentFace.scaleY);
      gl.uniform1i(this.uFilterLoc, filterId);
      gl.uniform1f(this.uTimeLoc, timestampSeconds);
      gl.uniform2f(this.uResolutionLoc, video.videoWidth, video.videoHeight);
      gl.uniform1f(this.uConfidenceLoc, this.currentFace.confidence);
      gl.uniform1f(this.uAspectLoc, aspect);
      gl.uniform1f(this.uIntensityLoc, intensity);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      return true;
    } catch (e) {
      console.warn('Error in renderFrame:', e);
      return false;
    }
  }

  public destroy() {
    const gl = this.gl;
    if (!gl) return;
    try {
      if (this.texture) gl.deleteTexture(this.texture);
      if (this.positionBuffer) gl.deleteBuffer(this.positionBuffer);
      if (this.texCoordBuffer) gl.deleteBuffer(this.texCoordBuffer);
      if (this.program) gl.deleteProgram(this.program);
    } catch (e) {
      // Ignore cleanup error
    }
    this.gl = null;
  }
}
