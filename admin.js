let productsData = {};

document.addEventListener('DOMContentLoaded', function() {
    loadProductsData();
    displayProducts();

    const modal = document.getElementById('modal');
    const addProductBtn = document.getElementById('addProductBtn');
    const closeBtn = document.querySelector('.close');
    const form = document.getElementById('productForm');
    const sectionSelect = document.getElementById('sectionSelect');
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const importFile = document.getElementById('importFile');

    addProductBtn.addEventListener('click', function() {
        document.getElementById('modalTitle').textContent = 'Ajouter Produit';
        document.getElementById('productId').value = '';
        form.reset();
        updateTypeSelect();
        modal.style.display = 'block';
    });

    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    sectionSelect.addEventListener('change', function() {
        displayProducts();
        updateTypeSelect();
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const section = sectionSelect.value;
        const id = document.getElementById('productId').value;
        const product = {
            id: id ? parseInt(id) : Date.now(),
            name: document.getElementById('name').value,
            description: document.getElementById('description').value,
            price: document.getElementById('price').value,
            category: document.getElementById('category').value,
            type: document.getElementById('type').value,
            image: document.getElementById('image').value
        };

        if (id) {
            // Edit
            const index = productsData[section].findIndex(p => p.id == id);
            if (index !== -1) {
                productsData[section][index] = product;
            }
        } else {
            // Add
            productsData[section].push(product);
        }

        saveProductsData();
        displayProducts();
        modal.style.display = 'none';
    });

    exportBtn.addEventListener('click', function() {
        const dataStr = JSON.stringify(productsData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'products.json';
        link.click();
    });

    importBtn.addEventListener('click', function() {
        const file = importFile.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    productsData = JSON.parse(e.target.result);
                    saveProductsData();
                    displayProducts();
                    alert('Import réussi');
                } catch (err) {
                    alert('Erreur lors de l\'import');
                }
            };
            reader.readAsText(file);
        }
    });
});

function loadProductsData() {
    return new Promise((resolve) => {
        if (isFirebaseReady()) {
            if (!firebase.apps.length) {
                firebase.initializeApp(FIREBASE_CONFIG);
            }
            const db = firebase.firestore();
            db.collection(FIRESTORE_COLLECTION).doc(FIRESTORE_DOC).get()
                .then(doc => {
                    if (doc.exists) {
                        productsData = normalizeProductsData(doc.data());
                    } else {
                        productsData = { appartements: [], motos: [], vehicules: [] };
                    }
                    resolve();
                })
                .catch(() => {
                    const stored = localStorage.getItem(STORAGE_KEY);
                    if (stored) {
                        productsData = normalizeProductsData(JSON.parse(stored));
                    } else {
                        productsData = { appartements: [], motos: [], vehicules: [] };
                    }
                    resolve();
                });
        } else {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                productsData = normalizeProductsData(JSON.parse(stored));
            } else {
                fetch('products.json')
                    .then(response => response.json())
                    .then(data => {
                        productsData = normalizeProductsData(data);
                        saveProductsData();
                        resolve();
                    })
                    .catch(() => {
                        productsData = { appartements: [], motos: [], vehicules: [] };
                        resolve();
                    });
            }
        }
    });
}

function saveProductsData() {
    if (isFirebaseReady()) {
        if (!firebase.apps.length) {
            firebase.initializeApp(FIREBASE_CONFIG);
        }
        const db = firebase.firestore();
        db.collection(FIRESTORE_COLLECTION).doc(FIRESTORE_DOC).set(normalizeProductsData(productsData));
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeProductsData(productsData)));
}

function normalizeProductsData(data) {
    return {
        appartements: Array.isArray(data?.appartements) ? data.appartements : [],
        motos: Array.isArray(data?.motos) ? data.motos : [],
        vehicules: Array.isArray(data?.vehicules) ? data.vehicules : []
    };
}

function updateTypeSelect() {
    const section = document.getElementById('sectionSelect').value;
    const typeSelect = document.getElementById('type');
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
    const section = document.getElementById('sectionSelect').value;
    const container = document.getElementById('productsList');
    container.innerHTML = '';
    if (productsData[section]) {
        productsData[section].forEach(product => {
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
}

function editProduct(id) {
    const section = document.getElementById('sectionSelect').value;
    const product = productsData[section].find(p => p.id == id);
    if (product) {
        document.getElementById('modalTitle').textContent = 'Modifier Produit';
        document.getElementById('productId').value = product.id;
        document.getElementById('name').value = product.name;
        document.getElementById('description').value = product.description;
        document.getElementById('price').value = product.price;
        document.getElementById('category').value = product.category;
        updateTypeSelect();
        if (product.type) {
            document.getElementById('type').value = product.type;
        }
        document.getElementById('image').value = product.image;
        document.getElementById('modal').style.display = 'block';
    }
}

function deleteProduct(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
        const section = document.getElementById('sectionSelect').value;
        productsData[section] = productsData[section].filter(p => p.id != id);
        saveProductsData();
        displayProducts();
    }
}