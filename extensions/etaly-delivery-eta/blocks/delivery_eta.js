/**
 * ETAly - Delivery ETA Block JavaScript
 * Fetches and displays delivery estimates from the app
 */

(function() {
  'use strict';

  // Configuration
  const API_ENDPOINT = '/apps/etaly/api/storefront/calculate-eta';

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    const blocks = document.querySelectorAll('[data-etaly-block]');
    blocks.forEach(block => initBlock(block));
  }

  async function initBlock(block) {
    const productId = block.dataset.productId;
    const variantId = block.dataset.variantId;
    const style = block.dataset.style || 'success';
    const showCutoff = block.dataset.showCutoff === 'true';

    if (!productId) {
      showError(block);
      return;
    }

    try {
      // Get customer's country from Shopify
      const countryCode = await getCustomerCountry();

      // Fetch ETA
      const eta = await fetchETA({
        productId,
        variantId,
        countryCode
      });

      if (eta && eta.success) {
        displayETA(block, eta.eta, style, showCutoff);
        trackImpression(productId, variantId, eta.eta.ruleId);
      } else {
        showError(block);
      }
    } catch (error) {
      console.error('ETAly: Error fetching delivery estimate', error);
      showError(block);
    }
  }

  async function fetchETA(params) {
    const formData = new FormData();
    formData.append('productId', params.productId);
    formData.append('variantId', params.variantId);
    formData.append('countryCode', params.countryCode);

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      body: formData,
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch ETA');
    }

    return await response.json();
  }

  function displayETA(block, eta, style, showCutoff) {
    const loadingEl = block.querySelector('.etaly-eta-loading');
    const contentEl = block.querySelector('.etaly-eta-content');
    const textEl = block.querySelector('.etaly-eta-text');
    const cutoffEl = block.querySelector('.etaly-cutoff-timer');

    // Hide loading, show content
    loadingEl.style.display = 'none';
    contentEl.style.display = 'flex';

    // Set message
    textEl.textContent = eta.message;

    // Apply style
    block.classList.add(`etaly-style-${style}`);

    // Show cutoff timer if enabled and available
    if (showCutoff && cutoffEl && eta.cutoffTime) {
      cutoffEl.style.display = 'inline';
      startCutoffTimer(cutoffEl, eta.cutoffTime);
    }
  }

  function showError(block) {
    const loadingEl = block.querySelector('.etaly-eta-loading');
    const errorEl = block.querySelector('.etaly-eta-error');

    loadingEl.style.display = 'none';
    errorEl.style.display = 'block';
  }

  async function getCustomerCountry() {
    // Try to get from Shopify.country if available
    if (typeof Shopify !== 'undefined' && Shopify.country) {
      return Shopify.country;
    }

    // Try to get from localization
    if (typeof Shopify !== 'undefined' && Shopify.Checkout && Shopify.Checkout.country) {
      return Shopify.Checkout.country;
    }

    // Fallback to IP geolocation endpoint
    try {
      const response = await fetch('/apps/etaly/api/storefront/detect-country');
      const data = await response.json();
      return data.countryCode || 'US';
    } catch (error) {
      console.warn('ETAly: Could not detect country, defaulting to US');
      return 'US';
    }
  }

  function startCutoffTimer(element, cutoffTime) {
    // Parse cutoff time (HH:mm format)
    const [hours, minutes] = cutoffTime.split(':').map(Number);

    function updateTimer() {
      const now = new Date();
      const cutoff = new Date();
      cutoff.setHours(hours, minutes, 0, 0);

      if (now > cutoff) {
        element.textContent = 'Order by tomorrow for next-day delivery';
        return;
      }

      const diff = cutoff - now;
      const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
      const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      element.textContent = `Order within ${hoursLeft}h ${minutesLeft}m for same-day processing`;
    }

    updateTimer();
    setInterval(updateTimer, 60000); // Update every minute
  }

  function trackImpression(productId, variantId, ruleId) {
    // Track impression for analytics
    const trackData = new FormData();
    trackData.append('eventType', 'impression');
    trackData.append('productId', productId);
    trackData.append('variantId', variantId);
    trackData.append('ruleId', ruleId);
    trackData.append('pageType', 'product');

    fetch('/apps/etaly/api/storefront/track', {
      method: 'POST',
      body: trackData,
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    }).catch(err => {
      console.warn('ETAly: Failed to track impression', err);
    });
  }

  // Listen for variant changes
  if (typeof Shopify !== 'undefined') {
    document.addEventListener('change', function(e) {
      if (e.target.name === 'id' || e.target.classList.contains('product-form__variant')) {
        const blocks = document.querySelectorAll('[data-etaly-block]');
        blocks.forEach(block => {
          block.dataset.variantId = e.target.value;
          initBlock(block);
        });
      }
    });
  }
})();
