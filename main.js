// Detect if device is mobile
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
  alpha: true,
  antialias: !isMobile,
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

const starCount = isMobile ? 150 : 400;
Array(starCount).fill().forEach(addStar);

// ========== SCROLL ANIMATIONS (Windows Compatible) ==========
const hiElement = document.querySelector('.hi');
const navElement = document.querySelector('nav');
const backgroundElement = document.querySelector('.background');

let scrollTimeout;
let lastScrollTop = 0;

const moveCamera = () => {
  clearTimeout(scrollTimeout);
  
  scrollTimeout = setTimeout(() => {
    const t = document.body.getBoundingClientRect().top;
    const scrollTop = Math.abs(t);
    
    // Only update if scroll has actually changed
    if (Math.abs(scrollTop - lastScrollTop) > 1) {
      camera.position.z = 25 + t * 0.1;
      lastScrollTop = scrollTop;
    }

    // ========== SMOOTH FADE ANIMATIONS ==========
    const windowHeight = window.innerHeight;
    const scrollPercent = scrollTop / windowHeight;

    // Nav fade out (0% to 10% scroll)
    if (scrollPercent <= 0.1) {
      const navOpacity = 1 - (scrollPercent / 0.1);
      navElement.style.opacity = navOpacity;
    } else {
      navElement.style.opacity = 0;
    }

    // Hi section slide out and fade (0% to 10% scroll)
    if (scrollPercent <= 0.1) {
      const progress = scrollPercent / 0.1; // 0 to 1
      const opacity = 1 - progress;
      const translateX = -50 * progress; // Slide to -50px
      
      hiElement.style.opacity = opacity;
      hiElement.style.transform = `translate3d(${translateX}px, 0, 0)`;
      hiElement.style.visibility = 'visible';
    } else {
      hiElement.style.opacity = 0;
      hiElement.style.transform = 'translate3d(-50px, 0, 0)';
      hiElement.style.visibility = 'hidden';
    }

    // Background fade in (0% to 30% scroll)
    if (scrollPercent <= 0.3) {
      const bgOpacity = scrollPercent / 0.3; // 0 to 1
      backgroundElement.style.opacity = bgOpacity;
    } else {
      backgroundElement.style.opacity = 1;
    }

  }, isMobile ? 10 : 5);
};

// Support multiple scroll events for cross-platform compatibility
document.body.addEventListener('scroll', moveCamera, { passive: true });
window.addEventListener('scroll', moveCamera, { passive: true });
document.addEventListener('touchmove', moveCamera, { passive: true });

// ========== INTERSECTION OBSERVER FOR LANGUAGES ==========
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
    } else {
      entry.target.classList.remove('show');
    }
  });
}, { threshold: 0.1 });

const hiddenElements = document.querySelectorAll('.hidden');
hiddenElements.forEach(el => observer.observe(el));

// ========== RESIZE HANDLER ==========
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

// Pause animations when page is not visible
let isAnimating = true;
document.addEventListener('visibilitychange', () => {
  isAnimating = !document.hidden;
});

// ========== ANIMATION LOOP ==========
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

// ========== EMAIL FUNCTION ==========
const sendEmail = () => {
  let fullName = document.getElementsByName("name")[0].value;
  let company = document.getElementsByName("company-name")[0].value;
  let emailAddress = document.getElementsByName("email-address")[0].value;
  let phoneNumber = document.getElementsByName("phone-number")[0].value;
  let message = document.getElementsByName("message")[0].value;

  let subject = "Message from " + fullName + " @ " + company;
  let body = "Name: " + fullName + "\n" +
            "Company: " + company + "\n" +
            "Email Address: " + emailAddress + "\n" +
            "Phone Number: " + phoneNumber + "\n" +
            "Message:\n" + message;

  subject = encodeURIComponent(subject);
  body = encodeURIComponent(body);

  let mailtoUrl = "mailto:richardamador26@gmail.com" + 
                  "?subject=" + subject + 
                  "&body=" + body;

  window.location.href = mailtoUrl;
};