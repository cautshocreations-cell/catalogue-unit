const FIRESTORE_COLLECTION = 'catalogue';
const FIRESTORE_DOC = 'catalogue-data';

function isFirebaseReady() {
    return isFirebaseConfigured();
}

function getFirestore() {
    if (!isFirebaseReady()) {
        console.error('Firebase non prêt sur la page publique : vérifier firebase-config.js et l’ordre des scripts.');
        return null;
    }
    initializeFirebaseApp();
    return firebase.firestore();
}

function getValidImageUrl(image) {
    if (!image || typeof image !== 'string') return 'unit.png';
    if (image.startsWith('images/') || image.startsWith('./images/') || image.startsWith('../images/')) {
        return 'unit.png';
    }
    return image;
}

function normalizeProductsData(data) {
    const normalizeProduct = product => ({
        ...product,
        image: getValidImageUrl(product.image)
    });

    return {
        appartements: Array.isArray(data?.appartements) ? data.appartements.map(normalizeProduct) : [],
        motos: Array.isArray(data?.motos) ? data.motos.map(normalizeProduct) : [],
        vehicules: Array.isArray(data?.vehicules) ? data.vehicules.map(normalizeProduct) : []
    };
}

async function getFirestoreProducts() {
    const db = getFirestore();
    if (!db) return null;
    const doc = await db.collection(FIRESTORE_COLLECTION).doc(FIRESTORE_DOC).get();
    return doc.exists ? normalizeProductsData(doc.data()) : null;
}

async function saveFirestoreProducts(data) {
    const db = getFirestore();
    if (!db) return;
    await db.collection(FIRESTORE_COLLECTION).doc(FIRESTORE_DOC).set(normalizeProductsData(data));
}

function watchFirestoreProducts(callback) {
    const db = getFirestore();
    if (!db) return;
    db.collection(FIRESTORE_COLLECTION).doc(FIRESTORE_DOC)
        .onSnapshot(snapshot => {
            if (snapshot.exists) {
                callback(normalizeProductsData(snapshot.data()));
            }
        });
}

async function fetchProductsJson() {
    try {
        const response = await fetch('products.json');
        const data = await response.json();
        return normalizeProductsData(data);
    } catch (error) {
        console.error('Erreur lors du chargement de products.json:', error);
        return { appartements: [], motos: [], vehicules: [] };
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initializeAndLoadProducts();

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

    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const section = this.closest('section');
            const category = this.dataset.category;
            filterProducts(section.id, category);
            section.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

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

async function initializeAndLoadProducts() {
    let data = null;

    if (isFirebaseReady()) {
        data = await getFirestoreProducts();
        if (!data) {
            data = await fetchProductsJson();
            await saveFirestoreProducts(data);
        } else {
            watchFirestoreProducts(loadPageProducts);
        }
    } else {
        data = await fetchProductsJson();
    }

    loadPageProducts(data);
}

function loadPageProducts(data) {
    const normalized = normalizeProductsData(data);
    const path = window.location.pathname;
    if (path.includes('appartements.html')) {
        displayProducts('appartements', normalized.appartements);
    } else if (path.includes('motos.html')) {
        displayProducts('motos', normalized.motos);
    } else if (path.includes('vehicules.html')) {
        displayProducts('vehicules', normalized.vehicules);
    } else {
        displayProducts('appartements', normalized.appartements);
        displayProducts('motos', normalized.motos);
        displayProducts('vehicules', normalized.vehicules);
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
            <img src="${product.image}" alt="${product.name}" onerror="this.src='unit.png'">
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