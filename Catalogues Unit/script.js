document.addEventListener('DOMContentLoaded', function() {
    initializeAndLoadProducts();

    // Admin button
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        adminBtn.addEventListener('click', function() {
            const password = prompt('Mot de passe admin:');
            if (password === 'Vyjeve00') {
                window.location.href = 'admin.html';
            } else {
                alert('Mot de passe incorrect');
            }
        });
    }

    // Category buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const section = this.closest('section');
            const category = this.dataset.category;
            filterProducts(section.id, category);
            section.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Type buttons for apartments and vehicles
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const section = this.closest('section');
            const type = this.dataset.type;
            filterByType(section.id, type);
            section.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
});

function initializeAndLoadProducts() {
    const stored = localStorage.getItem('productsData');
    if (stored) {
        // Données déjà en localStorage, charger directement
        const data = JSON.parse(stored);
        loadPageProducts(data);
    } else {
        // Premier chargement : charger depuis products.json et sauvegarder
        fetch('products.json')
            .then(response => response.json())
            .then(data => {
                localStorage.setItem('productsData', JSON.stringify(data));
                loadPageProducts(data);
            })
            .catch(error => console.error('Erreur lors du chargement des produits:', error));
    }
}

function loadPageProducts(data) {
    const path = window.location.pathname;
    if (path.includes('appartements.html')) {
        displayProducts('appartements', data.appartements || []);
    } else if (path.includes('motos.html')) {
        displayProducts('motos', data.motos || []);
    } else if (path.includes('vehicules.html')) {
        displayProducts('vehicules', data.vehicules || []);
    } else {
        // index.html
        displayProducts('appartements', data.appartements || []);
        displayProducts('motos', data.motos || []);
        displayProducts('vehicules', data.vehicules || []);
    }
}

function displayProducts(sectionId, products) {
    const container = document.getElementById('products-' + sectionId);
    container.innerHTML = '';
    products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product';
        productDiv.dataset.category = product.category;
        if (product.type) {
            productDiv.dataset.type = product.type;
        }
        productDiv.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p>Prix: ${product.price}</p>
        `;
        container.appendChild(productDiv);
    });
}

function filterProducts(sectionId, category) {
    const container = document.getElementById('products-' + sectionId);
    const products = container.querySelectorAll('.product');
    products.forEach(product => {
        if (category === 'all' || product.dataset.category === category) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
}

function filterByType(sectionId, type) {
    const container = document.getElementById('products-' + sectionId);
    const products = container.querySelectorAll('.product');
    products.forEach(product => {
        if (type === 'all' || product.dataset.type === type) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
}

function filterVehiclesByType(sectionId, type) {
    filterByType(sectionId, type);
}