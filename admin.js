const API_URL = 'https://backendanber.onrender.com/api';

function getAuthHeaders() {
  const token = localStorage.getItem('anber_admin_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

function handleUnauthorizedResponse(response) {
  if (response.status === 401) {
    localStorage.removeItem('anber_admin_token');
    checkLogin();
    return true;
  }
  return false;
}

// --- NAVIGATION ---
const navProducts = document.getElementById('navProducts');
const navPromos = document.getElementById('navPromos');
const navOrders = document.getElementById('navOrders');
const navClients = document.getElementById('navClients');

const productsTableSection = document.getElementById('productsTableSection');
const promosSection = document.getElementById('promosSection');
const ordersSection = document.getElementById('ordersSection');
const clientsSection = document.getElementById('clientsSection');

function showSection(section) {
  [productsTableSection, promosSection, ordersSection, clientsSection].forEach(s => s.style.display = 'none');
  section.style.display = 'block';
}

navProducts.addEventListener('click', () => {
  showSection(productsTableSection);
  fetchAdminProducts();
});

navPromos.addEventListener('click', () => {
  showSection(promosSection);
  fetchAdminPromos();
});

navOrders.addEventListener('click', () => {
  showSection(ordersSection);
  fetchAdminOrders();
});

navClients.addEventListener('click', () => {
  showSection(clientsSection);
  fetchAdminClients();
});
const loginOverlay = document.getElementById('loginOverlay');
const adminPanel = document.getElementById('adminPanel');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const emailInput = document.getElementById('adminEmail');
const pwdInput = document.getElementById('adminPassword');
const loginError = document.getElementById('loginError');

function checkLogin() {
  const token = localStorage.getItem('anber_admin_token');
  if (token) {
    loginOverlay.style.display = 'none';
    adminPanel.style.display = 'flex';
    fetchAdminProducts();
  } else {
    loginOverlay.style.display = 'flex';
    adminPanel.style.display = 'none';
  }
}

loginBtn.addEventListener('click', async () => {
  const email = emailInput.value;
  const password = pwdInput.value;
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (data.success && data.user.role === 'admin') {
      localStorage.setItem('anber_admin_token', data.token);
      loginError.style.display = 'none';
      checkLogin();
    } else {
      loginError.style.display = 'block';
      loginError.textContent = data.error || 'Accès refusé';
    }
  } catch (error) {
    loginError.style.display = 'block';
    loginError.textContent = 'Erreur de connexion';
  }
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('anber_admin_token');
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

// --- CLIENTS ---
async function fetchAdminClients() {
  const tbody = document.getElementById('clientsTableBody');
  tbody.innerHTML = '<tr><td colspan="6" class="text-center">Chargement...</td></tr>';
  try {
    const res = await fetch(`${API_URL}/admin/clients`, {
      headers: getAuthHeaders()
    });
    if (handleUnauthorizedResponse(res)) return;
    const data = await res.json();
    const users = data.success ? data.users : [];
    tbody.innerHTML = '';
    if (users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center">Aucun client.</td></tr>';
      return;
    }
    users.forEach(user => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${user.userCode}</td>
        <td>${user.firstName} ${user.lastName}</td>
        <td>${user.email}</td>
        <td>${user.points}</td>
        <td>${new Date(user.createdAt).toLocaleDateString('fr-FR')}</td>
        <td><button class="action-btn" onclick="showClientDetail('${user._id}')">Voir détails</button></td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">Erreur de chargement.</td></tr>';
  }
}

async function showClientDetail(userId) {
  try {
    const res = await fetch(`${API_URL}/admin/clients/${userId}/orders`, {
      headers: getAuthHeaders()
    });
    if (handleUnauthorizedResponse(res)) return;
    const orders = await res.json();
    // Assuming orders is an array
    const panel = document.getElementById('clientDetailPanel');
    // Populate panel with user details and orders
    // For simplicity, just show orders
    const ordersList = document.getElementById('clientOrdersList');
    ordersList.innerHTML = orders.map(order => `<p>Commande ${order.orderNumber} - ${order.totalAmount} MAD</p>`).join('');
    panel.style.display = 'block';
  } catch (err) {
    alert("Erreur de chargement des détails");
  }
}
async function fetchAdminOrders() {
  const container = document.getElementById('ordersListContainer');
  container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 40px;">Chargement...</p>';
  try {
    const res = await fetch(`${API_URL}/admin/orders`, {
      headers: getAuthHeaders()
    });
    if (handleUnauthorizedResponse(res)) return;
    const data = await res.json();
    const orders = data.success ? data : [];
    container.innerHTML = '';
    if (orders.length === 0) {
      container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 40px;">Aucune commande.</p>';
      return;
    }
    orders.forEach(order => {
      const orderDiv = document.createElement('div');
      orderDiv.className = 'order-card';
      orderDiv.innerHTML = `
        <div class="order-header">
          <h3>Commande ${order.orderNumber}</h3>
          <span class="order-status status-${order.status}">${order.status}</span>
        </div>
        <div class="order-details">
          <p><strong>Client:</strong> ${order.customer.firstName} ${order.customer.lastName}</p>
          <p><strong>Email:</strong> ${order.customer.email}</p>
          <p><strong>Total:</strong> ${order.totalAmount} MAD</p>
          <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
        </div>
        <div class="order-actions">
          <select onchange="updateOrderStatus('${order._id}', this.value)">
            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>En attente</option>
            <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmée</option>
            <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Expédiée</option>
            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Livrée</option>
          </select>
        </div>
      `;
      container.appendChild(orderDiv);
    });
  } catch (err) {
    container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 40px;">Erreur de chargement.</p>';
  }
}

async function updateOrderStatus(orderId, status) {
  try {
    const res = await fetch(`${API_URL}/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (data.success) {
      fetchAdminOrders();
    } else {
      alert("Erreur: " + data.error);
    }
  } catch (err) {
    alert("Erreur réseau");
  }
}
async function fetchAdminPromos() {
  const tbody = document.getElementById('promosTableBody');
  tbody.innerHTML = '<tr><td colspan="3" class="text-center">Chargement...</td></tr>';
  try {
    const res = await fetch(`${API_URL}/admin/promos`, {
      headers: getAuthHeaders()
    });
    if (handleUnauthorizedResponse(res)) return;
    const promos = await res.json();
    tbody.innerHTML = '';
    if (promos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" class="text-center">Aucun code promo.</td></tr>';
      return;
    }
    promos.forEach(promo => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${promo.code}</strong></td>
        <td>${promo.discountPercentage}%</td>
        <td><button class="delete-btn" data-id="${promo._id}">Supprimer</button></td>
      `;
      tbody.appendChild(tr);
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if (confirm('Supprimer ce code promo ?')) {
          const id = e.target.getAttribute('data-id');
          await deletePromo(id);
        }
      });
    });
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="3" class="text-center">Erreur de chargement.</td></tr>';
  }
}

async function deletePromo(id) {
  try {
    const res = await fetch(`${API_URL}/admin/promos/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (handleUnauthorizedResponse(res)) return;
    const data = await res.json();
    if (data.success) {
      fetchAdminPromos();
    } else {
      alert("Erreur: " + data.error);
    }
  } catch (err) {
    alert("Erreur réseau");
  }
}

document.getElementById('addPromoForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const code = document.getElementById('promoCodeInput').value.toUpperCase();
  const discountPercentage = document.getElementById('promoPercentageInput').value;
  try {
    const res = await fetch(`${API_URL}/admin/promos`, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, discountPercentage })
    });
    if (handleUnauthorizedResponse(res)) return;
    const data = await res.json();
    if (data.success) {
      document.getElementById('addPromoForm').reset();
      fetchAdminPromos();
    } else {
      alert("Erreur: " + data.error);
    }
  } catch (err) {
    alert("Erreur réseau");
  }
});
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
        <td>${displayPrice} MAD</td>
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
        if (product) {
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
      headers: getAuthHeaders(),
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
      headers: getAuthHeaders(),
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
    const res = await fetch(`${API_URL}/admin/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (handleUnauthorizedResponse(res)) return;
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

document.getElementById('clientSearch').addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  const rows = document.querySelectorAll('#clientsTableBody tr');
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(query) ? '' : 'none';
  });
});

// Init
checkLogin();
