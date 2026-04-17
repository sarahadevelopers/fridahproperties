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

    // Areas tabs functionality
    const tabs = document.querySelectorAll('.area-tab');
    const details = document.querySelectorAll('.area-detail');
    const areaImage = document.getElementById('areaImage');
    const areaImages = {
        'kitengela': 'https://i0.wp.com/shiftersmovers.com/wp-content/uploads/2025/03/Best-movers-in-kitengela-best-estates-in-Kitengela-best-apartments-in-kitengela-house-prices-in-kitengela-cost-of-living-in-kitengela-1.jpeg?ssl=1',
        'ngong': 'https://propscout.co.ke/storage/properties/files/6-bedroom-maisonette-for-sale-in-ngong-tdutp.jpg',
        'syokimau': 'https://propscout.co.ke/storage/properties/files/flat-and-apartments/webp/3-bedroom-apartment-for-rent-in-syokimau-ossxw.webp',
        'ongata-rongai': 'https://images.kenyapropertycentre.com/properties/images/thumbs/42609/067684898d4def-luxurious-3-4-bedroom-townhouse-for-sale-ongata-rongai-kajiado.jpeg',
        'athi-river': 'https://images.kenyapropertycentre.com/properties/images/thumbs/33930/0665f19a74d9c3-luxury-3-and-4-bedroom-with-dsq-in-gated-community-for-rent-athi-river-machakos.jpg',
        'kilimani': 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSw9VtuEPh1uOKkadR3G4ZX5o5blkYNtiCirQogiMPg59N5J8vieNxLbtdtwsEYH8WUpAz4kb0K18T7mmee777xKQX7-hPqpSf4d1L6eILbRcae93mjf8tFIv4QAMqVIXm1Y-No=s680-w680-h510-rw'
    };
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const area = tab.dataset.area;
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            details.forEach(d => d.classList.remove('active'));
            document.getElementById(`${area}-content`).classList.add('active');
            if (areaImages[area]) areaImage.src = areaImages[area];
        });
    });