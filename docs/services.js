   document.getElementById("currentYear").textContent = new Date().getFullYear();

    // Mobile menu toggle (same as index)
    const menuToggle = document.querySelector(".menu-toggle");
    const mobileMenuDiv = document.getElementById("mobileMenu");
    const mobileOverlayDiv = document.getElementById("mobileOverlay");
    const mobileCloseBtn = document.getElementById("closeMobileMenu");
    function openMobileMenu() { mobileMenuDiv.classList.add("active"); mobileOverlayDiv.classList.add("active"); document.body.style.overflow = 'hidden'; }
    function closeMobileMenu() { mobileMenuDiv.classList.remove("active"); mobileOverlayDiv.classList.remove("active"); document.body.style.overflow = ''; }
    if (menuToggle) menuToggle.addEventListener("click", openMobileMenu);
    if (mobileCloseBtn) mobileCloseBtn.addEventListener("click", closeMobileMenu);
    if (mobileOverlayDiv) mobileOverlayDiv.addEventListener("click", closeMobileMenu);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && mobileMenuDiv.classList.contains("active")) closeMobileMenu(); });

    // Tabs functionality
    const tabs = document.querySelectorAll('.tab-btn');
    const details = document.querySelectorAll('.service-detail');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            details.forEach(d => d.classList.remove('active'));
            document.getElementById(`${tabId}-content`).classList.add('active');
        });
    });

    // Swiper for Why Choose Us
    new Swiper(".whySwiper", {
        loop: true, spaceBetween: 24, autoplay: { delay: 4000, disableOnInteraction: false },
        pagination: { el: ".swiper-pagination", clickable: true },
        breakpoints: { 0: { slidesPerView: 1 }, 768: { slidesPerView: 2 }, 1200: { slidesPerView: 3 } }
    });

    // Testimonial slider (auto-rotate)
    const testimonials = document.querySelectorAll('.testimonial');
    let currentTestimonial = 0;
    setInterval(() => {
        testimonials[currentTestimonial].classList.remove('active');
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
        testimonials[currentTestimonial].classList.add('active');
    }, 5000);