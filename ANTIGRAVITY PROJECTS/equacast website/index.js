/* ==========================================================================
   Equacast Frontend Interaction Logic (Calculators, Animations, Navs)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Mobile Menu Navigation ---
  const burgerBtn = document.getElementById('nav-burger');
  const navLinks = document.querySelector('.nav-links');

  if (burgerBtn && navLinks) {
    burgerBtn.addEventListener('click', () => {
      burgerBtn.classList.toggle('open');
      navLinks.classList.toggle('mobile-show');
    });

    // Close menu when a link is clicked
    const links = navLinks.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('click', () => {
        burgerBtn.classList.remove('open');
        navLinks.classList.remove('mobile-show');
      });
    });
  }

  // --- 2. Interactive Campaign ROI Estimator ---
  const sliderPosts = document.getElementById('calc-posts');
  const sliderViews = document.getElementById('calc-views');
  
  const labelPosts = document.getElementById('posts-val');
  const labelViews = document.getElementById('views-val');
  
  const resultImpressions = document.getElementById('result-impressions');
  const resultInteractions = document.getElementById('result-interactions');
  const resultClicks = document.getElementById('result-clicks');
  const btnCta = document.getElementById('calc-cta');

  const ENGAGEMENT_RATE = 0.085; // 8.5% average engagement rate
  const CLICK_RATE = 0.02;       // 2.0% average click-through rate

  function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function calculateCampaignMetrics() {
    if (!sliderPosts || !sliderViews) return;

    const posts = parseInt(sliderPosts.value);
    const views = parseInt(sliderViews.value);

    // Update range slider labels
    if (labelPosts) labelPosts.textContent = posts;
    if (labelViews) labelViews.textContent = formatNumber(views);

    // Calculate metrics
    const impressions = posts * views;
    const interactions = Math.round(impressions * ENGAGEMENT_RATE);
    const clicks = Math.round(impressions * CLICK_RATE);

    // Render results
    if (resultImpressions) resultImpressions.textContent = formatNumber(impressions);
    if (resultInteractions) resultInteractions.textContent = formatNumber(interactions);
    if (resultClicks) resultClicks.textContent = formatNumber(clicks);

    // Update CTA button text dynamically
    if (btnCta) {
      btnCta.textContent = `Book Campaign — ${formatNumber(impressions)} Est. Impressions →`;
      btnCta.href = `mailto:equabodmon@gmail.com?subject=Equacast%20Campaign%20Booking&body=I%20am%20interested%20in%20a%20campaign%20consisting%20of%20${posts}%20clips%20with%20an%20expected%20reach%20of%20${formatNumber(impressions)}%20total%20impressions.`;
    }
  }

  // Event Listeners for Estimator Sliders
  if (sliderPosts && sliderViews) {
    sliderPosts.addEventListener('input', calculateCampaignMetrics);
    sliderViews.addEventListener('input', calculateCampaignMetrics);
    // Run initial calculation
    calculateCampaignMetrics();
  }

  // --- 3. Scroll Reveal Animations ---
  const revealElements = document.querySelectorAll('.reveal');

  function checkReveal() {
    const triggerBottom = window.innerHeight * 0.85;

    revealElements.forEach(el => {
      const elementTop = el.getBoundingClientRect().top;

      if (elementTop < triggerBottom) {
        el.classList.add('active');
      } else {
        // Optionally remove if you want scroll-out animation (kept off for standard feel)
        // el.classList.remove('active');
      }
    });
  }

  window.addEventListener('scroll', checkReveal);
  // Run once initially to show elements already in view
  checkReveal();
});
