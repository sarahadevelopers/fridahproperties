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

    // Form submission (WhatsApp + email)
    const form = document.getElementById('propertyInquiryForm');
    const successMsg = document.getElementById('successMessage');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const firstName = document.getElementById('firstName')?.value || '';
            const phone = document.getElementById('phone')?.value || '';
            const propertyType = document.getElementById('propertyType')?.value || '';
            const location = document.getElementById('location')?.value || '';
            const message = document.getElementById('message')?.value || '';
            let whatsappMsg = `Hello Property by Fridah,%0A%0AI'm interested in property consultation.%0AName: ${firstName}%0APhone: ${phone}%0A`;
            if (propertyType) whatsappMsg += `Property Type: ${propertyType}%0A`;
            if (location) whatsappMsg += `Location: ${location}%0A`;
            whatsappMsg += `Message: ${message}%0A%0APlease contact me with available properties.`;
            window.open(`https://wa.me/254721911181?text=${whatsappMsg}`, '_blank');
            if (successMsg) successMsg.style.display = 'block';
            form.reset();
            setTimeout(() => { if (successMsg) successMsg.style.display = 'none'; }, 5000);
            const email = document.getElementById('email')?.value;
            if (email) localStorage.setItem('propertyByFridahEmail', email);
        });
        const savedEmail = localStorage.getItem('propertyByFridahEmail');
        if (savedEmail && document.getElementById('email')) document.getElementById('email').value = savedEmail;
    }