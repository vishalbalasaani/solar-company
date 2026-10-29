(() => {
  // -------------------------------------------------------------------------
  // 1. High-Performance Canvas Scroll Animation
  // -------------------------------------------------------------------------
  const TOTAL_FRAMES = 299;
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d', { alpha: false });

  const frames = [];
  let isLoopRunning = false;
  let targetFrame = 0;
  let currentFrame = 0;
  let lastDrawnFrameIndex = -1;

  function getFrameUrl(index) {
    const frameNumber = String(index + 1).padStart(4, '0');
    return `frames/frame_${frameNumber}.jpg`;
  }

  function setupCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const displayWidth = window.innerWidth;
    const displayHeight = window.innerHeight;

    if (canvas.width !== Math.floor(displayWidth * dpr) || canvas.height !== Math.floor(displayHeight * dpr)) {
      canvas.width = Math.floor(displayWidth * dpr);
      canvas.height = Math.floor(displayHeight * dpr);
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const bestFrame = findBestLoadedFrame(Math.round(currentFrame));
    if (bestFrame) {
      renderImage(bestFrame.img);
    }
  }

  function renderImage(img) {
    if (!img || !img.naturalWidth || !img.naturalHeight) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    const scale = Math.max(cw / iw, ch / ih);
    const sw = iw * scale;
    const sh = ih * scale;
    const sx = (cw - sw) / 2;
    const sy = (ch - sh) / 2;

    ctx.drawImage(img, sx, sy, sw, sh);
  }

  function findBestLoadedFrame(desiredIndex) {
    desiredIndex = Math.max(0, Math.min(TOTAL_FRAMES - 1, desiredIndex));

    if (frames[desiredIndex] && frames[desiredIndex].loaded) {
      return frames[desiredIndex];
    }

    let offset = 1;
    while (desiredIndex - offset >= 0 || desiredIndex + offset < TOTAL_FRAMES) {
      if (desiredIndex - offset >= 0 && frames[desiredIndex - offset]?.loaded) {
        return frames[desiredIndex - offset];
      }
      if (desiredIndex + offset < TOTAL_FRAMES && frames[desiredIndex + offset]?.loaded) {
        return frames[desiredIndex + offset];
      }
      offset++;
    }

    return null;
  }

  function updateTargetFrameFromScroll() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrollFraction = maxScroll > 0 ? Math.min(Math.max(window.scrollY / maxScroll, 0), 1) : 0;
    targetFrame = scrollFraction * (TOTAL_FRAMES - 1);

    startRenderLoop();
  }

  function renderLoop() {
    const delta = targetFrame - currentFrame;

    if (Math.abs(delta) < 0.001) {
      currentFrame = targetFrame;
    } else {
      currentFrame += delta * 0.12;
    }

    const frameIndexToDraw = Math.round(currentFrame);

    if (frameIndexToDraw !== lastDrawnFrameIndex) {
      const frameObj = findBestLoadedFrame(frameIndexToDraw);
      if (frameObj) {
        renderImage(frameObj.img);
        lastDrawnFrameIndex = frameIndexToDraw;
      }
    }

    if (Math.abs(targetFrame - currentFrame) >= 0.001) {
      requestAnimationFrame(renderLoop);
    } else {
      isLoopRunning = false;
    }
  }

  function startRenderLoop() {
    if (!isLoopRunning) {
      isLoopRunning = true;
      requestAnimationFrame(renderLoop);
    }
  }

  function initPreloader() {
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      frames.push({
        img: img,
        loaded: false,
        index: i,
        url: getFrameUrl(i)
      });
    }

    function loadSingleFrame(index) {
      return new Promise((resolve) => {
        const item = frames[index];
        if (item.loaded) {
          resolve(item);
          return;
        }

        item.img.onload = () => {
          item.loaded = true;
          if (index === 0 && lastDrawnFrameIndex === -1) {
            setupCanvas();
            renderImage(item.img);
            lastDrawnFrameIndex = 0;
          } else if (Math.round(currentFrame) === index) {
            renderImage(item.img);
            lastDrawnFrameIndex = index;
          }
          resolve(item);
        };

        item.img.onerror = () => {
          resolve(null);
        };

        item.img.src = item.url;
      });
    }

    loadSingleFrame(0).then(() => {
      const keyframeIndices = [];
      for (let i = 10; i < TOTAL_FRAMES; i += 10) {
        keyframeIndices.push(i);
      }
      keyframeIndices.push(TOTAL_FRAMES - 1);

      const remainingIndices = [];
      for (let i = 1; i < TOTAL_FRAMES; i++) {
        if (!keyframeIndices.includes(i)) {
          remainingIndices.push(i);
        }
      }

      const queue = [...keyframeIndices, ...remainingIndices];
      const CONCURRENCY = 12;
      let activeCount = 0;
      let queueIndex = 0;

      function processQueue() {
        while (activeCount < CONCURRENCY && queueIndex < queue.length) {
          const nextIndex = queue[queueIndex++];
          activeCount++;
          loadSingleFrame(nextIndex).finally(() => {
            activeCount--;
            processQueue();
          });
        }
      }

      processQueue();
    });
  }

  window.addEventListener('resize', setupCanvas, { passive: true });
  window.addEventListener('scroll', updateTargetFrameFromScroll, { passive: true });

  setupCanvas();
  initPreloader();
  updateTargetFrameFromScroll();

  // -------------------------------------------------------------------------
  // 2. Interactive Web Page Components & Modals
  // -------------------------------------------------------------------------

  // Toast Notification
  const toastEl = document.getElementById('toast');
  const toastText = document.getElementById('toast-text');
  let toastTimeout = null;

  function showToast(message) {
    if (!toastEl || !toastText) return;
    toastText.textContent = message;
    toastEl.classList.remove('hidden');

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastEl.classList.add('hidden');
    }, 3200);
  }

  // Mobile Navigation Menu Toggle
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const menuOpenIcon = document.querySelector('.menu-open-icon');
  const menuCloseIcon = document.querySelector('.menu-close-icon');

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const isClosed = mobileDrawer.classList.contains('hidden');
      if (isClosed) {
        mobileDrawer.classList.remove('hidden');
        if (menuOpenIcon) menuOpenIcon.classList.add('hidden');
        if (menuCloseIcon) menuCloseIcon.classList.remove('hidden');
      } else {
        mobileDrawer.classList.add('hidden');
        if (menuOpenIcon) menuOpenIcon.classList.remove('hidden');
        if (menuCloseIcon) menuCloseIcon.classList.add('hidden');
      }
    });

    mobileDrawer.querySelectorAll('.mobile-nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.add('hidden');
        if (menuOpenIcon) menuOpenIcon.classList.remove('hidden');
        if (menuCloseIcon) menuCloseIcon.classList.add('hidden');
      });
    });
  }

  // Modals Controller
  const quoteModal = document.getElementById('quote-modal');
  const directoryModal = document.getElementById('directory-modal');

  function openModal(modal) {
    if (!modal) return;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  function closeAllModals() {
    closeModal(quoteModal);
    closeModal(directoryModal);
  }

  document.querySelectorAll('[data-modal="quote"]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal(directoryModal);
      openModal(quoteModal);
    });
  });

  document.querySelectorAll('[data-modal="directory"]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const filter = btn.getAttribute('data-filter') || 'all';
      setDirectoryFilter(filter);
      closeModal(quoteModal);
      openModal(directoryModal);
    });
  });

  document.querySelectorAll('[data-close-modal]').forEach((btn) => {
    btn.addEventListener('click', () => {
      closeAllModals();
    });
  });

  [quoteModal, directoryModal].forEach((modal) => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(modal);
        }
      });
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
    }
  });

  // Interactive Live Quote Calculator
  const billSlider = document.getElementById('bill-slider');
  const billDisplay = document.getElementById('bill-display');
  const statSystem = document.getElementById('stat-system');
  const statSavings = document.getElementById('stat-savings');
  const statCo2 = document.getElementById('stat-co2');

  function updateCalculator(bill) {
    if (billDisplay) billDisplay.textContent = `$${bill}/mo`;

    const systemKw = Math.round((bill / 22) * 10) / 10;
    const savings25Yr = Math.round(bill * 12 * 25 * 0.72);
    const co2Offset = Math.round(systemKw * 1.4 * 10) / 10;

    if (statSystem) statSystem.textContent = `${systemKw} kW`;
    if (statSavings) statSavings.textContent = `$${savings25Yr.toLocaleString()}`;
    if (statCo2) statCo2.textContent = `${co2Offset} T/yr`;
  }

  if (billSlider) {
    billSlider.addEventListener('input', (e) => {
      const val = Number(e.target.value);
      updateCalculator(val);
    });
    updateCalculator(Number(billSlider.value));
  }

  // Property Type Buttons
  const propertyBtns = document.querySelectorAll('.property-btn');
  let selectedPropertyType = 'residential';
  propertyBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      propertyBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedPropertyType = btn.getAttribute('data-type');
    });
  });

  // Quote Form Submission
  const quoteForm = document.getElementById('quote-form');
  const quoteFormView = document.getElementById('quote-form-view');
  const quoteSuccessView = document.getElementById('quote-success-view');
  const successDesc = document.getElementById('success-desc');
  const successEmailBox = document.getElementById('success-email-box');
  const quoteSubmitBtn = document.getElementById('quote-submit-btn');

  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('quote-name')?.value || 'Valued Client';
      const email = document.getElementById('quote-email')?.value || 'your email';
      const bill = billSlider ? Number(billSlider.value) : 220;
      const systemKw = Math.round((bill / 22) * 10) / 10;
      const savings = Math.round(bill * 12 * 25 * 0.72);

      if (quoteSubmitBtn) {
        quoteSubmitBtn.disabled = true;
        quoteSubmitBtn.textContent = 'Calculating Proposal...';
      }

      setTimeout(() => {
        if (quoteFormView) quoteFormView.classList.add('hidden');
        if (quoteSuccessView) quoteSuccessView.classList.remove('hidden');

        if (successDesc) {
          successDesc.innerHTML = `Thank you, <strong style="color:#0f172a;">${name}</strong>. Our clean energy engineers have prepared your assessment for a <strong>${systemKw} kW</strong> ${selectedPropertyType} system with estimated 25-year savings of <strong>$${savings.toLocaleString()}</strong>.`;
        }

        if (successEmailBox) {
          successEmailBox.innerHTML = `A detailed PDF engineering proposal has been generated and sent to <strong style="color:#0f172a;">${email}</strong>.`;
        }

        if (quoteSubmitBtn) {
          quoteSubmitBtn.disabled = false;
          quoteSubmitBtn.textContent = 'Request Free Engineering Assessment';
        }

        showToast('Quote proposal generated successfully!');
      }, 500);
    });
  }

  // Directory Modal Filter Tabs
  const filterTabs = document.querySelectorAll('.filter-tab');
  const projectCards = document.querySelectorAll('.project-card');

  function setDirectoryFilter(category) {
    filterTabs.forEach((tab) => {
      if (tab.getAttribute('data-filter') === category) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    projectCards.forEach((card) => {
      const cardCategory = card.getAttribute('data-category');
      if (category === 'all' || cardCategory === category) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  }

  filterTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const cat = tab.getAttribute('data-filter');
      setDirectoryFilter(cat);
    });
  });

  // Project Inquire Buttons
  document.querySelectorAll('[data-inquire]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const projName = btn.getAttribute('data-inquire');
      closeModal(directoryModal);
      openModal(quoteModal);
      const notesInput = document.getElementById('quote-notes');
      if (notesInput) {
        notesInput.value = `Inquiring about project specifications similar to: ${projName}`;
      }
      showToast(`Selected project: ${projName}`);
    });
  });

  // Feature Card 3: Expand Details Toggle
  const expandBestBtn = document.getElementById('expand-best-btn');
  const expandDetails = document.getElementById('expand-details');
  if (expandBestBtn && expandDetails) {
    expandBestBtn.addEventListener('click', () => {
      expandDetails.classList.toggle('hidden');
    });
  }

  // Tag Pill Clicks
  document.querySelectorAll('.tag-pill').forEach((tag) => {
    tag.addEventListener('click', () => {
      const tagText = tag.getAttribute('data-tag');
      showToast(`Filtered by ${tagText}`);
    });
  });

  // Partner items click toast
  document.querySelectorAll('.partner-item').forEach((item) => {
    item.addEventListener('click', () => {
      const name = item.getAttribute('data-partner');
      showToast(`Partner verified: ${name}`);
    });
  });

  // Metric items click toast
  document.querySelectorAll('.metric-item').forEach((item) => {
    item.addEventListener('click', () => {
      const label = item.getAttribute('data-metric');
      showToast(`Viewing verified details for ${label}`);
    });
  });

  // Navigation click notifications
  document.querySelectorAll('[data-nav]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const navTarget = link.getAttribute('data-nav');
      showToast(`Navigated to ${navTarget.toUpperCase()} section`);
    });
  });

  // Rotating Seal Icon hover / click
  const sealBtn = document.getElementById('seal-btn');
  const sealSvg = document.getElementById('seal-svg');
  if (sealBtn && sealSvg) {
    let rot = 0;
    sealBtn.addEventListener('click', () => {
      rot += 180;
      sealSvg.style.transform = `rotate(${rot}deg)`;
      showToast('Verified Clean Energy Certification');
    });
  }
})();
