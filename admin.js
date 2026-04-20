const FIRESTORE_COLLECTION = 'catalogue';
const FIRESTORE_DOC = 'catalogue-data';
let productsData = { appartements: [], motos: [], vehicules: [] };

function isFirebaseReady() {
    return isFirebaseConfigured();
}

function getFirestore() {
    if (!isFirebaseReady()) return null;
    if (!firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
    }
    return firebase.firestore();
}

function normalizeProductsData(data) {
    return {
        appartements: Array.isArray(data?.appartements) ? data.appartements : [],
        motos: Array.isArray(data?.motos) ? data.motos : [],
        vehicules: Array.isArray(data?.vehicules) ? data.vehicules : []
    };
}

async function loadDefaults() {
    try {
        const response = await fetch('products.json');
        const data = await response.json();
        return normalizeProductsData(data);
    } catch (error) {
        console.error('Erreur lors du chargement de products.json :', error);
        return { appartements: [], motos: [], vehicules: [] };
    }
}

async function loadProductsData() {
    if (isFirebaseReady()) {
        try {
            const db = getFirestore();
            const doc = await db.collection(FIRESTORE_COLLECTION).doc(FIRESTORE_DOC).get();
            if (doc.exists) {
                productsData = normalizeProductsData(doc.data());
                return;
            }
            productsData = await loadDefaults();
            await saveProductsData();
        } catch (error) {
            console.error('Erreur Firebase :', error);
            productsData = await loadDefaults();
        }
    } else {
        productsData = await loadDefaults();
    }
}

async function saveProductsData() {
    if (isFirebaseReady()) {
        try {
            const db = getFirestore();
            await db.collection(FIRESTORE_COLLECTION).doc(FIRESTORE_DOC).set(normalizeProductsData(productsData));
        } catch (error) {
            console.error('Erreur enregistrement Firebase :', error);
        }
    } else {
        console.warn('Firebase non configuré : les modifications ne seront pas partagées entre utilisateurs.');
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    await loadProductsData();
    displayProducts();
    updateTypeSelect();

    const modal = document.getElementById('modal');
    const addProductBtn = document.getElementById('addProductBtn');
    const closeBtn = document.querySelector('.close');
    const form = document.getElementById('productForm');
    const sectionSelect = document.getElementById('sectionSelect');
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const importFile = document.getElementById('importFile');
    const clearBtn = document.getElementById('clearBtn');

    addProductBtn?.addEventListener('click', function() {
        document.getElementById('modalTitle').textContent = 'Ajouter Produit';
        document.getElementById('productId').value = '';
        form.reset();
        updateTypeSelect();
        modal.style.display = 'block';
    });

    closeBtn?.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    sectionSelect?.addEventListener('change', function() {
        displayProducts();
        updateTypeSelect();
    });

    form?.addEventListener('submit', async function(e) {
        e.preventDefault();
        const section = sectionSelect.value;
        const id = document.getElementById('productId').value;
        const product = {
            id: id ? parseInt(id, 10) : Date.now(),
            name: document.getElementById('name').value,
            description: document.getElementById('description').value,
            price: document.getElementById('price').value,
            category: document.getElementById('category').value,
            type: document.getElementById('type').value,
            image: document.getElementById('image').value
        };

        if (!productsData[section]) {
            productsData[section] = [];
        }

        if (id) {
            const idx = productsData[section].findIndex(p => p.id === parseInt(id, 10));
            if (idx !== -1) {
                productsData[section][idx] = product;
            }
        } else {
            productsData[section].push(product);
        }

        await saveProductsData();
        displayProducts();
        modal.style.display = 'none';
        alert('Produit sauvegardé !');
    });

    exportBtn?.addEventListener('click', function() {
        const blob = new Blob([JSON.stringify(productsData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'products.json';
        a.click();
    });

    importBtn?.addEventListener('click', function() {
        const file = importFile.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async function(e) {
            try {
                productsData = normalizeProductsData(JSON.parse(e.target.result));
                await saveProductsData();
                displayProducts();
                alert('Import réussi !');
            } catch (err) {
                alert('Erreur lors de l\'import');
            }
        };
        reader.readAsText(file);
    });

    clearBtn?.addEventListener('click', async function() {
        if (!confirm('Êtes-vous sûr de vouloir supprimer TOUTES les données ?')) return;
        productsData = { appartements: [], motos: [], vehicules: [] };
        await saveProductsData();
        displayProducts();
        alert('Toutes les données ont été supprimées !');
    });
});

function updateTypeSelect() {
    const section = document.getElementById('sectionSelect')?.value || 'appartements';
    const typeSelect = document.getElementById('type');
    if (!typeSelect) return;

    typeSelect.innerHTML = '';
    let types = [];

    if (section === 'appartements') {
        types = ['appartements', 'maisons', 'villa'];
    } else if (section === 'motos') {
        types = ['sportive', 'routière', 'trail', 'cruiser'];
    } else if (section === 'vehicules') {
        types = ['compact', 'SUV', 'tout terrain', 'sport', 'supercar', 'camions'];
    }

    types.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
        typeSelect.appendChild(option);
    });
}

function displayProducts() {
    const section = document.getElementById('sectionSelect')?.value || 'appartements';
    const container = document.getElementById('productsList');
    if (!container) return;

    container.innerHTML = '';
    const products = productsData[section] || [];
    if (products.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999;">Aucun produit</p>';
        return;
    }

    products.forEach(product => {
        const div = document.createElement('div');
        div.className = 'product-item';
        div.innerHTML = `
            <div>
                <strong>${product.name}</strong><br>
                ${product.description}<br>
                Prix: ${product.price} | Catégorie: ${product.category}
            </div>
            <div>
                <button onclick="editProduct(${product.id})">Modifier</button>
                <button onclick="deleteProduct(${product.id})">Supprimer</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function editProduct(id) {
    const section = document.getElementById('sectionSelect')?.value || 'appartements';
    const product = (productsData[section] || []).find(p => p.id === id);
    if (!product) return;

    document.getElementById('modalTitle').textContent = 'Modifier Produit';
    document.getElementById('productId').value = product.id;
    document.getElementById('name').value = product.name;
    document.getElementById('description').value = product.description;
    document.getElementById('price').value = product.price;
    document.getElementById('category').value = product.category;
    document.getElementById('image').value = product.image;
    if (product.type) {
        updateTypeSelect();
        document.getElementById('type').value = product.type;
    }
    document.getElementById('modal').style.display = 'block';
}

function deleteProduct(id) {
    if (!confirm('Êtes-vous sûr ?')) return;
    const section = document.getElementById('sectionSelect')?.value || 'appartements';
    productsData[section] = (productsData[section] || []).filter(p => p.id !== id);
    saveProductsData();
    displayProducts();
}
