
const vertexShader = `
varying vec2 v_texcoord;
void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    v_texcoord = uv;
}
`;

const fragmentShader = `
varying vec2 v_texcoord;

uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_aspect;

uniform float u_shapeSize;
uniform float u_roundness;
uniform float u_borderSize;
uniform float u_circleSize;
uniform float u_circleEdge;

#ifndef PI
#define PI 3.1415926535897932384626433832795
#endif
#ifndef TWO_PI
#define TWO_PI 6.2831853071795864769252867665590
#endif

#ifndef VAR
#define VAR 0
#endif

#ifndef FNC_COORD
#define FNC_COORD
vec2 coord(in vec2 p) {
    p = p / u_resolution.xy;
    if (u_resolution.x > u_resolution.y) {
        p.x *= u_resolution.x / u_resolution.y;
        p.x += (u_resolution.y - u_resolution.x) / u_resolution.y / 2.0;
    } else {
        p.y *= u_resolution.y / u_resolution.x;
        p.y += (u_resolution.x - u_resolution.y) / u_resolution.x / 2.0;
    }
    p -= 0.5;
    p *= vec2(-1.0, 1.0);
    return p;
}
#endif

#define st0 coord(gl_FragCoord.xy)
#define mx coord(u_mouse * u_pixelRatio)

float sdRoundRect(vec2 p, vec2 b, float r) {
    vec2 d = abs(p - 0.5) * 4.2 - b + vec2(r);
    return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - r;
}
float sdCircle(in vec2 st, in vec2 center) {
    return length(st - center) * 2.0;
}
float sdPoly(in vec2 p, in float w, in int sides) {
    float a = atan(p.x, p.y) + PI;
    float r = TWO_PI / float(sides);
    float d = cos(floor(0.5 + a / r) * r - a) * length(max(abs(p) * 1.0, 0.0));
    return d * 2.0 - w;
}

float aastep(float threshold, float value) {
    float afwidth = length(vec2(dFdx(value), dFdy(value))) * 0.70710678118654757;
    return smoothstep(threshold - afwidth, threshold + afwidth, value);
}
float fill(in float x) { return 1.0 - aastep(0.0, x); }
float fill(float x, float size, float edge) {
    return 1.0 - smoothstep(size - edge, size + edge, x);
}
float stroke(in float d, in float t) { return (1.0 - aastep(t, abs(d))); }
float stroke(float x, float size, float w, float edge) {
    float d = smoothstep(size - edge, size + edge, x + w * 0.5) - smoothstep(size - edge, size + edge, x - w * 0.5);
    return clamp(d, 0.0, 1.0);
}

float strokeAA(float x, float size, float w, float edge) {
    float afwidth = length(vec2(dFdx(x), dFdy(x))) * 0.70710678;
    float d = smoothstep(size - edge - afwidth, size + edge + afwidth, x + w * 0.5)
            - smoothstep(size - edge - afwidth, size + edge + afwidth, x - w * 0.5);
    return clamp(d, 0.0, 1.0);
}

void main() {
    vec2 st = st0 + 0.5;
    vec2 posMouse = mx * vec2(1., -1.) + 0.5;

    float size = u_shapeSize;
    float roundness = u_roundness;
    float borderSize = u_borderSize;
    float circleSize = u_circleSize;
    float circleEdge = u_circleEdge;

    float sdfCircle = fill(
        sdCircle(st, posMouse),
        circleSize,
        circleEdge
    );

    float sdf;
    if (VAR == 0) {
        vec2 shapeDims = vec2(size * u_aspect, size);
        sdf = sdRoundRect(st, shapeDims, roundness);
        sdf = strokeAA(sdf, 0.0, borderSize, sdfCircle) * 4.0;
    } else if (VAR == 1) {
        sdf = sdCircle(st, vec2(0.5));
        sdf = fill(sdf, 0.6, sdfCircle) * 1.2;
    } else if (VAR == 2) {
        sdf = sdCircle(st, vec2(0.5));
        sdf = strokeAA(sdf, 0.58, 0.02, sdfCircle) * 4.0;
    } else if (VAR == 3) {
        sdf = sdPoly(st - vec2(0.5, 0.45), 0.3, 3);
        sdf = fill(sdf, 0.05, sdfCircle) * 1.4;
    }

    vec3 color = vec3(1.0);
    float alpha = sdf;
    gl_FragColor = vec4(color.rgb, alpha);
}
`;

class ShapeBlur {
    constructor(element, config = {}) {
        this.element = element;
        this.config = Object.assign({
            variation: 0,
            pixelRatioProp: window.devicePixelRatio || 1,
            shapeSize: 1.2,
            roundness: 0.4,
            borderSize: 0.05,
            circleSize: 0.3,
            circleEdge: 0.5
        }, config);

        this.mount = element;
        this.time = 0;
        this.lastTime = 0;
        this.animationFrameId = null;

        this.vMouse = new THREE.Vector2();
        this.vMouseDamp = new THREE.Vector2();
        this.vResolution = new THREE.Vector2();

        this.init();
    }

    init() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera();
        this.camera.position.z = 1;

        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.renderer.setClearColor(0x000000, 0);

        // Ensure the canvas covers the element
        this.renderer.domElement.style.position = 'absolute';
        this.renderer.domElement.style.top = '0';
        this.renderer.domElement.style.left = '0';
        this.renderer.domElement.style.width = '100%';
        this.renderer.domElement.style.height = '100%';
        this.renderer.domElement.style.pointerEvents = 'none'; // Let clicks pass through
        this.renderer.domElement.style.zIndex = '0'; // Behind content if needed, or adjust based on requirement

        // If we want it to be a border overlay, it should probably be on top but allow pointer events?
        // The user request says "contour de deux bloc", so it's a border effect.
        // Let's keep it absolute. The parent should be relative.

        this.mount.appendChild(this.renderer.domElement);

        const geo = new THREE.PlaneGeometry(1, 1);
        this.material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                u_mouse: { value: this.vMouseDamp },
                u_resolution: { value: this.vResolution },
                u_pixelRatio: { value: this.config.pixelRatioProp },
                u_aspect: { value: 1.0 },
                u_shapeSize: { value: this.config.shapeSize },
                u_roundness: { value: this.config.roundness },
                u_borderSize: { value: this.config.borderSize },
                u_circleSize: { value: this.config.circleSize },
                u_circleEdge: { value: this.config.circleEdge }
            },
            defines: { VAR: this.config.variation },
            transparent: true
        });

        const quad = new THREE.Mesh(geo, this.material);
        this.scene.add(quad);
        this.quad = quad;

        this.bindEvents();
        this.resize();
        this.update();
    }

    bindEvents() {
        this.onPointerMove = this.onPointerMove.bind(this);
        this.resize = this.resize.bind(this);

        // Attach to document to track mouse even when outside the element slightly?
        // Or just the element? React code attached to document.
        document.addEventListener('mousemove', this.onPointerMove);
        document.addEventListener('pointermove', this.onPointerMove);
        window.addEventListener('resize', this.resize);
    }

    onPointerMove(e) {
        const rect = this.mount.getBoundingClientRect();
        // Calculate mouse position relative to the element
        this.vMouse.set(e.clientX - rect.left, e.clientY - rect.top);
    }

    resize() {
        const w = this.mount.clientWidth;
        const h = this.mount.clientHeight;
        const dpr = Math.min(window.devicePixelRatio, 2);

        this.renderer.setSize(w, h);
        this.renderer.setPixelRatio(dpr);

        this.camera.left = -w / 2;
        this.camera.right = w / 2;
        this.camera.top = h / 2;
        this.camera.bottom = -h / 2;
        this.camera.updateProjectionMatrix();

        this.quad.scale.set(w, h, 1);
        this.vResolution.set(w, h).multiplyScalar(dpr);
        this.material.uniforms.u_pixelRatio.value = dpr;
        this.material.uniforms.u_aspect.value = w / h;
    }

    update() {
        this.time = performance.now() * 0.001;
        const dt = this.time - this.lastTime;
        this.lastTime = this.time;

        // Damping
        this.vMouseDamp.x = THREE.MathUtils.damp(this.vMouseDamp.x, this.vMouse.x, 8, dt);
        this.vMouseDamp.y = THREE.MathUtils.damp(this.vMouseDamp.y, this.vMouse.y, 8, dt);

        this.renderer.render(this.scene, this.camera);
        this.animationFrameId = requestAnimationFrame(this.update.bind(this));
    }

    destroy() {
        cancelAnimationFrame(this.animationFrameId);
        window.removeEventListener('resize', this.resize);
        document.removeEventListener('mousemove', this.onPointerMove);
        document.removeEventListener('pointermove', this.onPointerMove);

        if (this.mount && this.renderer.domElement) {
            this.mount.removeChild(this.renderer.domElement);
        }
        this.renderer.dispose();
    }
}
