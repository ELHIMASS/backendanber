const API_URL = 'https://backendanber.onrender.com/api'; // Modifier pour du dev local si besoin

// --- LOGIN LOGIC ---
const loginOverlay = document.getElementById('loginOverlay');
const adminPanel = document.getElementById('adminPanel');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const pwdInput = document.getElementById('adminPassword');
const loginError = document.getElementById('loginError');

// Simple sécurité front-end (juste pour bloquer la vue, la vraie sécu se ferait côté backend)
const ADMIN_SECRET = "anber2026";

function checkLogin() {
  if (localStorage.getItem('anber_admin_auth') === 'true') {
    loginOverlay.style.display = 'none';
    adminPanel.style.display = 'flex';
    fetchAdminProducts();
  } else {
    loginOverlay.style.display = 'flex';
    adminPanel.style.display = 'none';
  }
}

loginBtn.addEventListener('click', () => {
  if (pwdInput.value === ADMIN_SECRET) {
    localStorage.setItem('anber_admin_auth', 'true');
    loginError.style.display = 'none';
    checkLogin();
  } else {
    loginError.style.display = 'block';
  }
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('anber_admin_auth');
  checkLogin();
});

// Init check moved to end of file

// --- UI LOGIC ---
const showAddFormBtn = document.getElementById('showAddFormBtn');
const cancelAddBtn = document.getElementById('cancelAddBtn');
const addProductSection = document.getElementById('addProductSection');
const addProductForm = document.getElementById('addProductForm');

const editProductSection = document.getElementById('editProductSection');
const editProductForm = document.getElementById('editProductForm');
const cancelEditBtn = document.getElementById('cancelEditBtn');

cancelEditBtn.addEventListener('click', () => {
  editProductSection.style.display = 'none';
  editProductForm.reset();
});

let currentProducts = [];

showAddFormBtn.addEventListener('click', () => {
  addProductSection.style.display = 'block';
});
cancelAddBtn.addEventListener('click', () => {
  addProductSection.style.display = 'none';
  addProductForm.reset();
});

// --- DATA LOGIC ---
const tbody = document.getElementById('productsTableBody');
const productCount = document.getElementById('productCount');

async function fetchAdminProducts() {
  tbody.innerHTML = '<tr><td colspan="5" class="text-center">Chargement...</td></tr>';
  try {
    const res = await fetch(`${API_URL}/products`);
    const products = await res.json();
    currentProducts = products;

    productCount.textContent = products.length;
    tbody.innerHTML = '';

    if (products.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center">Aucun produit dans la base.</td></tr>';
      return;
    }

    products.forEach(p => {
      const displayPrice = p.prices ? p.prices['50ml'] || p.prices['100ml'] || 'N/A' : 'N/A';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><img src="${p.image}" class="prod-img" alt="${p.name}"></td>
        <td><strong>${p.name}</strong><br><small>${p.sub}</small></td>
        <td>${p.collectionName || p.category}</td>
        <td>${displayPrice} €</td>
        <td>
          <button class="action-btn edit-btn" style="background-color: #b89758; color: white; border: none; margin-right: 5px; cursor: pointer; padding: 5px 10px; border-radius: 4px;" data-id="${p.id}">Modifier</button>
          <button class="action-btn delete-btn" data-id="${p.id}">Supprimer</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Add Delete Listeners
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce parfum définitivement ?')) {
          const id = e.target.getAttribute('data-id');
          await deleteProduct(id);
        }
      });
    });

    // Add Edit Listeners
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.getAttribute('data-id'));
        const product = currentProducts.find(p => p.id === id);
        if(product) {
          document.getElementById('edit-id').value = product.id;
          document.getElementById('edit-name').value = product.name;
          document.getElementById('edit-slug').value = product.slug;
          document.getElementById('edit-collectionName').value = product.collectionName || '';
          document.getElementById('edit-category').value = product.category || 'orient';
          document.getElementById('edit-sub').value = product.sub || '';
          document.getElementById('edit-desc').value = product.desc || '';
          document.getElementById('edit-notes').value = product.notes ? product.notes.join(', ') : '';
          
          document.getElementById('edit_price_30ml').value = '';
          document.getElementById('edit_price_50ml').value = '';
          document.getElementById('edit_price_75ml').value = '';
          document.getElementById('edit_price_100ml').value = '';
          
          if (product.prices) {
            for (const [size, price] of Object.entries(product.prices)) {
              const input = document.getElementById(`edit_price_${size}`);
              if (input) input.value = price;
            }
          }
          
          document.getElementById('edit-badge').value = product.badge || '';
          
          editProductSection.style.display = 'block';
          window.scrollTo(0, 0);
        }
      });
    });

  } catch (err) {
    console.error(err);
    tbody.innerHTML = '<tr><td colspan="5" class="text-center" style="color:red;">Erreur de connexion au serveur.</td></tr>';
  }
}

// Ajouter un produit
addProductForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const submitBtn = document.getElementById('submitProductBtn');
  submitBtn.textContent = "Téléversement en cours...";
  submitBtn.disabled = true;

  try {
    const formData = new FormData(addProductForm);
    
    const sizes = [];
    const prices = {};
    ['30ml', '50ml', '75ml', '100ml'].forEach(size => {
      const priceVal = formData.get(`price_${size}`);
      if (priceVal) {
        sizes.push(size);
        prices[size] = Number(priceVal);
      }
      formData.delete(`price_${size}`);
    });
    formData.append('sizes', sizes.join(','));
    formData.append('prices', JSON.stringify(prices));

    const res = await fetch(`${API_URL}/admin/products`, {
      method: 'POST',
      body: formData // N'utilisez pas Content-Type pour FormData (le navigateur le gère)
    });

    const data = await res.json();
    if (data.success) {
      alert("Parfum ajouté avec succès sur Cloudinary et MongoDB !");
      addProductForm.reset();
      addProductSection.style.display = 'none';
      fetchAdminProducts();
    } else {
      alert("Erreur: " + data.error);
    }
  } catch (err) {
    console.error(err);
    alert("Erreur réseau ou serveur.");
  }

  submitBtn.textContent = "Créer le produit";
  submitBtn.disabled = false;
});

// Edit Product Form Submit
editProductForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const submitBtn = document.getElementById('submitEditProductBtn');
  submitBtn.textContent = "Téléversement en cours...";
  submitBtn.disabled = true;

  try {
    const formData = new FormData(editProductForm);
    const id = formData.get('id');

    const sizes = [];
    const prices = {};
    ['30ml', '50ml', '75ml', '100ml'].forEach(size => {
      const priceVal = formData.get(`price_${size}`);
      if (priceVal) {
        sizes.push(size);
        prices[size] = Number(priceVal);
      }
      formData.delete(`price_${size}`);
    });
    formData.append('sizes', sizes.join(','));
    formData.append('prices', JSON.stringify(prices));

    const res = await fetch(`${API_URL}/admin/products/${id}`, {
      method: 'PUT',
      body: formData
    });

    const data = await res.json();
    if (data.success) {
      alert("Parfum modifié avec succès !");
      editProductForm.reset();
      editProductSection.style.display = 'none';
      fetchAdminProducts();
    } else {
      alert("Erreur: " + data.error);
    }
  } catch (err) {
    console.error(err);
    alert("Erreur réseau ou serveur.");
  }

  submitBtn.textContent = "Enregistrer les modifications";
  submitBtn.disabled = false;
});

// Supprimer un produit
async function deleteProduct(id) {
  try {
    const res = await fetch(`${API_URL}/admin/products/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      fetchAdminProducts();
    } else {
      alert("Erreur: " + data.error);
    }
  } catch (err) {
    console.error(err);
    alert("Erreur réseau");
  }
}

// Init check
checkLogin();
