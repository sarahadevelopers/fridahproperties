  document.getElementById("currentYear").textContent = new Date().getFullYear();
    
    // Mobile menu toggle (same as index)
    const menuToggle = document.querySelector(".menu-toggle");
    const mobileMenuDiv = document.getElementById("mobileMenu");
    const mobileOverlayDiv = document.getElementById("mobileOverlay");
    const mobileCloseBtn = document.getElementById("closeMobileMenu");
    
    function openMobileMenu() {
        mobileMenuDiv.classList.add("active");
        mobileOverlayDiv.classList.add("active");
        document.body.style.overflow = 'hidden';
    }
    function closeMobileMenu() {
        mobileMenuDiv.classList.remove("active");
        mobileOverlayDiv.classList.remove("active");
        document.body.style.overflow = '';
    }
    if (menuToggle) menuToggle.addEventListener("click", openMobileMenu);
    if (mobileCloseBtn) mobileCloseBtn.addEventListener("click", closeMobileMenu);
    if (mobileOverlayDiv) mobileOverlayDiv.addEventListener("click", closeMobileMenu);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && mobileMenuDiv.classList.contains("active")) closeMobileMenu(); });
    
    // Category filtering
    const categoryFilters = document.querySelectorAll('.category-filter');
    const blogCards = document.querySelectorAll('.blog-card');
    
    categoryFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            categoryFilters.forEach(f => f.classList.remove('active'));
            filter.classList.add('active');
            const category = filter.getAttribute('data-category');
            blogCards.forEach(card => {
                if (category === 'all' || card.getAttribute('data-category') === category) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
    
    // Blog search
    const blogSearchForm = document.getElementById('blogSearchForm');
    if (blogSearchForm) {
        blogSearchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const searchInput = blogSearchForm.querySelector('input');
            const searchTerm = searchInput.value.toLowerCase().trim();
            if (searchTerm) {
                let found = false;
                blogCards.forEach(card => {
                    const title = card.querySelector('h4').textContent.toLowerCase();
                    const excerpt = card.querySelector('p').textContent.toLowerCase();
                    const category = card.querySelector('.blog-card-category').textContent.toLowerCase();
                    if (title.includes(searchTerm) || excerpt.includes(searchTerm) || category.includes(searchTerm)) {
                        card.style.display = 'flex';
                        found = true;
                    } else {
                        card.style.display = 'none';
                    }
                });
                // reset filters to "All"
                categoryFilters.forEach(f => {
                    if (f.getAttribute('data-category') === 'all') f.classList.add('active');
                    else f.classList.remove('active');
                });
                if (!found) alert('No results found. Try different keywords.');
                document.querySelector('.blog-grid-section').scrollIntoView({ behavior: 'smooth' });
            }
        });
    }