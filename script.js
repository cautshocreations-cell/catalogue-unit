const STORAGE_KEY = 'unitProductsData';
const FIRESTORE_COLLECTION = 'catalogue';
const FIRESTORE_DOC = 'catalogue-data';

function isFirebaseReady() {
    return isFirebaseConfigured();
}

function normalizeProductsData(data) {
    return {
        appartements: Array.isArray(data?.appartements) ? data.appartements : [],
        motos: Array.isArray(data?.motos) ? data.motos : [],
        vehicules: Array.isArray(data?.vehicules) ? data.vehicules : []
    };
}

function getFirestore() {
    if (!isFirebaseReady()) return null;
    if (!firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
    }
    return firebase.firestore();
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

function getStoredProductsData() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? normalizeProductsData(JSON.parse(stored)) : null;
}

function setStoredProductsData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeProductsData(data)));
}

window.addEventListener('storage', function(event) {
    if (event.key === STORAGE_KEY) {
        const data = getStoredProductsData();
        if (data) {
            loadPageProducts(data);
        }
    }
});

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
        if (data) {
            setStoredProductsData(data);
            watchFirestoreProducts(latestData => loadPageProducts(latestData));
        }
    }

    if (!data) {
        data = getStoredProductsData();
    }

    if (!data) {
        data = await fetch('products.json')
            .then(response => response.json())
            .catch(error => {
                console.error('Erreur lors du chargement des produits:', error);
                return { appartements: [], motos: [], vehicules: [] };
            });

        setStoredProductsData(data);
        if (isFirebaseReady()) {
            await saveFirestoreProducts(data);
            watchFirestoreProducts(latestData => loadPageProducts(latestData));
        }
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