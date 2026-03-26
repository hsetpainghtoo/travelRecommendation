// 1. Floating navbar on scroll
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }
});

// 2. Intersection Observer for fade-in animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
  
  // Custom Cursor
  const cursor = document.getElementById('cursor');
  if (cursor) {
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });

    document.addEventListener('mousedown', () => cursor.style.transform = 'scale(0.8)');
    document.addEventListener('mouseup', () => cursor.style.transform = 'scale(1)');
  }

  // Initialize Particles
  initParticles('hero-canvas');
});

// 3. Canvas particle background
function initParticles(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  window.addEventListener('resize', resize);
  resize();

  const particles = Array.from({ length: 80 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.5 + 0.5,
    dx: (Math.random() - 0.5) * 0.4,
    dy: (Math.random() - 0.5) * 0.4,
    alpha: Math.random() * 0.5 + 0.2
  }));

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201, 168, 76, ${p.alpha})`;
      ctx.fill();
      
      p.x += p.dx;
      p.y += p.dy;
      
      if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
    });
    requestAnimationFrame(animate);
  }
  animate();
}

// 4. Fetch and store data
let travelData = {};
fetch('travel_recommendation_api.json')
  .then(res => res.json())
  .then(data => { 
    travelData = data; 
    console.log('Data loaded:', data); 
  })
  .catch(err => console.error('Fetch error:', err));

// 5. Search logic
document.getElementById('searchBtn')?.addEventListener('click', () => {
  const searchInput = document.getElementById('searchInput');
  const query = searchInput.value.toLowerCase().trim();
  const resultsSection = document.getElementById('resultsSection');
  const resultsGrid = document.getElementById('resultsGrid');
  
  if (!resultsGrid || !resultsSection) return;
  
  resultsGrid.innerHTML = '';
  let results = [];

  if (query.includes('beach')) {
    results = travelData.beaches || [];
  } else if (query.includes('temple')) {
    results = travelData.temples || [];
  } else if (query.includes('countr')) {
    results = (travelData.countries || []).flatMap(c => c.cities);
  }

  if (results.length === 0) {
    resultsGrid.innerHTML = 
      '<p style="color:#c9a84c;text-align:center;grid-column:1/-1;padding:40px">' +
      'No destinations found. Try keywords like "beach", "temple", or "country".</p>';
  } else {
    results.forEach(place => {
      const localTime = place.timeZone
        ? new Date().toLocaleTimeString('en-US', {
            timeZone: place.timeZone,
            hour12: true, hour: 'numeric', minute: 'numeric'
          })
        : '';
        
      const card = document.createElement('div');
      card.className = 'card fade-in';
      card.innerHTML = `
        <img src="${place.imageUrl}" alt="${place.name}" class="card-img">
        <div class="card-body">
          ${localTime ? `<span class="time-badge">🕐 ${localTime}</span>` : ''}
          <h3 class="gold-text">${place.name}</h3>
          <p>${place.description}</p>
          <a href="#" class="explore-link">Explore →</a>
        </div>`;
      resultsGrid.appendChild(card);
      observer.observe(card);
    });
  }

  resultsSection.style.display = 'block';
  resultsSection.scrollIntoView({ behavior: 'smooth' });
});

// 6. Clear logic
document.getElementById('clearBtn')?.addEventListener('click', () => {
  const searchInput = document.getElementById('searchInput');
  const resultsSection = document.getElementById('resultsSection');
  const resultsGrid = document.getElementById('resultsGrid');
  
  if (searchInput) searchInput.value = '';
  if (resultsSection) resultsSection.style.display = 'none';
  if (resultsGrid) resultsGrid.innerHTML = '';
});
