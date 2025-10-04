// Detect if device is mobile
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
  alpha: true,
  antialias: !isMobile, // Disable antialiasing on mobile for performance
  powerPreference: isMobile ? 'low-power' : 'high-performance'
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
const material = new THREE.MeshBasicMaterial({ color: 0xff7659, wireframe: true });
const torus = new THREE.Mesh(geometry, material);
scene.add(torus);

const pointLight = new THREE.PointLight(0xffffff, 100000);
pointLight.position.set(100, 100, 100);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(pointLight, ambientLight);

const lightHelper = new THREE.PointLightHelper(pointLight);
scene.add(lightHelper);

const addStar = () => {
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(200));
  star.position.set(x, y, z);
  scene.add(star);
};

// Reduce star count on mobile for better performance
const starCount = isMobile ? 150 : 400;
Array(starCount).fill().forEach(addStar);

// Improved scroll handling for all devices
let scrollTimeout;
let lastScrollTop = 0;

const moveCamera = () => {
  clearTimeout(scrollTimeout);
  
  scrollTimeout = setTimeout(() => {
    const t = document.body.getBoundingClientRect().top;
    const scrollTop = Math.abs(t);
    
    // Only update if scroll has actually changed (prevents jittery mobile scrolling)
    if (Math.abs(scrollTop - lastScrollTop) > 1) {
      camera.position.z = 25 + t * 0.1;
      lastScrollTop = scrollTop;
    }
  }, isMobile ? 10 : 5);
};

// Support multiple scroll events for cross-platform compatibility
document.body.addEventListener('scroll', moveCamera, { passive: true });
window.addEventListener('scroll', moveCamera, { passive: true });
// Touch scrolling support
document.addEventListener('touchmove', moveCamera, { passive: true });

// Improved resize handler with debouncing
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }, 100);
});

// Handle orientation changes on mobile
window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }, 200);
});

// Pause animations when page is not visible (saves battery on mobile)
let isAnimating = true;
document.addEventListener('visibilitychange', () => {
  isAnimating = !document.hidden;
});

// Slower rotation on mobile to reduce battery drain
const rotationSpeed = isMobile ? 0.5 : 1;

const animate = () => {
  requestAnimationFrame(animate);

  if (isAnimating) {
    torus.rotation.x += 0.01 * rotationSpeed;
    torus.rotation.y += 0.005 * rotationSpeed;
    torus.rotation.z += -0.005 * rotationSpeed;

    renderer.render(scene, camera);
  }
};

animate();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  renderer.dispose();
  geometry.dispose();
  material.dispose();
});