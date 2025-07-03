// DOM Elements
const views = {
  home: document.getElementById('home-view'),
  restaurant: document.getElementById('restaurant-view'),
  admin: document.getElementById('admin-panel'),
  cart: document.getElementById('cart-view'),
  payment: document.getElementById('payment-view')
};

const modal = document.getElementById('login-modal');
const menuToggle = document.getElementById('menu-toggle');
const nav = document.getElementById('main-nav');
const searchBar = document.getElementById('search-bar');
const restaurantList = document.getElementById('restaurant-list');
const cartCount = document.getElementById('cart-count');
const toast = document.getElementById('toast');

// App State
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let userRole = null;
let selectedImageBase64 = '';
let currentRestaurantIndex = null;

// Sample Data
const defaultRestaurants = [
  {
    name: "Mama's Kitchen",
    cuisine: "African",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60",
    menu: [
      { name: "Ugali", price: 200 },
      { name: "Sukuma Wiki", price: 150 },
      { name: "Nyama Choma", price: 300 }
    ]
  },
  {
    name: "Pizza Hub",
    cuisine: "Italian",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=60",
    menu: [
      { name: "Margherita", price: 500 },
      { name: "Pepperoni", price: 600 },
      { name: "Veggie", price: 450 }
    ]
  },
  {
    name: "Wok & Roll",
    cuisine: "Asian",
    image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&auto=format&fit=crop&q=60",
    menu: [
      { name: "Noodles", price: 350 },
      { name: "Fried Rice", price: 300 },
      { name: "Spring Rolls", price: 250 }
    ]
  },
  {
    name: "Burger Place",
    cuisine: "American",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60",
    menu: [
      { name: "Hamburger", price: 400 },
      { name: "Cheeseburger", price: 450 },
      { name: "Chicken Nuggets", price: 300 }
    ]
  }
];

// Initialize App
function init() {
  setupEventListeners();
  loadRestaurants();
  updateCartCount();
}

// Event Listeners
function setupEventListeners() {
  // Navigation
  menuToggle.addEventListener('click', toggleMobileNav);
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const view = e.target.getAttribute('data-view');
      showView(view);
      if (nav.classList.contains('active')) toggleMobileNav();
    });
  });

  document.querySelectorAll('.back-button').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const view = e.target.getAttribute('data-view');
      showView(view);
    });
  });

  // Search
  searchBar.addEventListener('input', (e) => {
    loadRestaurants(e.target.value);
  });

  // Image Upload
  document.getElementById('res-image-file').addEventListener('change', handleImageUpload);

  // Payment Methods
  document.querySelectorAll('.payment-method').forEach(method => {
    method.addEventListener('click', selectPaymentMethod);
  });

  // Login Modal
  document.querySelector('.close-modal').addEventListener('click', () => {
    hideModal('login-modal');
  });
}

// View Management
function showView(viewName) {
  // Hide all views
  Object.values(views).forEach(view => {
    view.classList.remove('active');
  });

  // Show selected view
  if (views[viewName]) {
    views[viewName].classList.add('active');
  }

  // Special cases
  if (viewName === 'login') {
    showModal('login-modal');
    showView('home');
  } else if (viewName === 'cart') {
    renderCart();
  }
}

function showModal(modalId) {
  document.getElementById(modalId).classList.add('active');
}

function hideModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

// Restaurant Functions
function loadRestaurants(filter = '') {
  const savedRestaurants = JSON.parse(localStorage.getItem('restaurants')) || [];
  const restaurants = [...defaultRestaurants, ...savedRestaurants];
  
  // Filter restaurants
  const filtered = restaurants.filter(restaurant => {
    const searchTerm = filter.toLowerCase();
    return (
      restaurant.name.toLowerCase().includes(searchTerm) ||
      restaurant.cuisine.toLowerCase().includes(searchTerm)
    );
  });

  renderRestaurants(filtered);
}

function renderRestaurants(restaurants) {
  restaurantList.innerHTML = '';

  if (restaurants.length === 0) {
    restaurantList.innerHTML = '<p class="no-results">No restaurants found</p>';
    return;
  }

  restaurants.forEach((restaurant, index) => {
    const card = document.createElement('div');
    card.className = 'restaurant-card';
    card.innerHTML = `
      <img src="${restaurant.image}" alt="${restaurant.name}" class="restaurant-image">
      <div class="restaurant-info">
        <h3>${restaurant.name}</h3>
        <p>${restaurant.cuisine}</p>
        <button class="primary-btn" onclick="viewRestaurant(${index})">View Menu</button>
        ${userRole === 'owner' && index >= defaultRestaurants.length ? `
          <div class="admin-actions">
            <button class="secondary-btn" onclick="editRestaurant(${index})">Edit</button>
            <button class="danger-btn" onclick="deleteRestaurant(${index})">Delete</button>
          </div>
        ` : ''}
      </div>
    `;
    restaurantList.appendChild(card);
  });
}

function viewRestaurant(index) {
  currentRestaurantIndex = index;
  const savedRestaurants = JSON.parse(localStorage.getItem('restaurants')) || [];
  const restaurants = [...defaultRestaurants, ...savedRestaurants];
  const restaurant = restaurants[index];

  // Update restaurant details
  document.getElementById('restaurant-name').textContent = restaurant.name;
  document.getElementById('restaurant-cuisine').textContent = restaurant.cuisine;
  document.getElementById('restaurant-cover').src = restaurant.image;

  // Render menu
  const menuList = document.getElementById('restaurant-menu-list');
  menuList.innerHTML = '';
  
  restaurant.menu.forEach(item => {
    const menuItem = document.createElement('div');
    menuItem.className = 'menu-item';
    menuItem.innerHTML = `
      <div class="menu-item-info">
        <h4>${item.name}</h4>
        <p>$${item.price.toFixed(2)}</p>
      </div>
      <button class="primary-btn" onclick="addToCart(${index}, ${JSON.stringify(item).replace(/"/g, '&quot;')})">
        Add to Cart
      </button>
    `;
    menuList.appendChild(menuItem);
  });

  showView('restaurant');
}

// Cart Functions
function addToCart(restaurantIndex, item) {
  // Add restaurant index to item for reference
  item.restaurantIndex = restaurantIndex;
  cart.push(item);
  saveCart();
  updateCartCount();
  showToast(`${item.name} added to cart`);
}

function renderCart() {
  const cartItems = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  cartItems.innerHTML = '';

  // Group items by name and restaurant
  const itemGroups = {};
  cart.forEach(item => {
    const key = `${item.name}-${item.restaurantIndex}`;
    if (!itemGroups[key]) {
      itemGroups[key] = { ...item, quantity: 0 };
    }
    itemGroups[key].quantity += 1;
  });

  // Calculate total and render items
  let total = 0;
  Object.values(itemGroups).forEach(group => {
    const subtotal = group.price * group.quantity;
    total += subtotal;

    const li = document.createElement('li');
    li.innerHTML = `
      <div class="cart-item-info">
        <span>${group.name} x${group.quantity}</span>
        <span>$${subtotal.toFixed(2)}</span>
      </div>
      <button class="remove-btn" onclick="removeFromCart('${group.name}', ${group.restaurantIndex})">
        <i class="fas fa-trash"></i>
      </button>
    `;
    cartItems.appendChild(li);
  });

  cartTotal.textContent = total.toFixed(2);
}

function removeFromCart(name, restaurantIndex) {
  // Find and remove the first matching item
  const index = cart.findIndex(item => 
    item.name === name && item.restaurantIndex === restaurantIndex
  );
  
  if (index !== -1) {
    cart.splice(index, 1);
    saveCart();
    updateCartCount();
    renderCart();
    showToast(`${name} removed from cart`);
  }
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
  cartCount.textContent = cart.length;
}

// Admin Functions
function addMenuItem() {
  const container = document.getElementById('menu-items-container');
  const newItem = document.createElement('div');
  newItem.className = 'menu-item-input';
  newItem.innerHTML = `
    <input type="text" class="menu-item-name" placeholder="Item Name">
    <input type="number" class="menu-item-price" placeholder="Price" min="0" step="0.01">
    <button class="remove-item-btn" onclick="this.parentElement.remove()">×</button>
  `;
  container.appendChild(newItem);
}

function addRestaurant() {
  const name = document.getElementById('res-name').value.trim();
  const cuisine = document.getElementById('res-cuisine').value.trim();
  
  // Collect menu items
  const menu = [];
  document.querySelectorAll('.menu-item-input').forEach(item => {
    const name = item.querySelector('.menu-item-name').value.trim();
    const price = parseFloat(item.querySelector('.menu-item-price').value);
    if (name && !isNaN(price)) {
      menu.push({ name, price });
    }
  });

  // Validate
  if (!name || !cuisine || menu.length === 0 || !selectedImageBase64) {
    showToast('Please fill in all fields');
    return;
  }

  // Save restaurant
  const savedRestaurants = JSON.parse(localStorage.getItem('restaurants')) || [];
  savedRestaurants.push({
    name,
    cuisine,
    menu,
    image: selectedImageBase64
  });
  localStorage.setItem('restaurants', JSON.stringify(savedRestaurants));

  // Reset form
  document.getElementById('res-name').value = '';
  document.getElementById('res-cuisine').value = '';
  document.getElementById('menu-items-container').innerHTML = `
    <div class="menu-item-input">
      <input type="text" class="menu-item-name" placeholder="Item Name">
      <input type="number" class="menu-item-price" placeholder="Price" min="0" step="0.01">
      <button class="remove-item-btn">×</button>
    </div>
  `;
  document.getElementById('res-image-file').value = '';
  document.getElementById('image-preview').src = '';
  selectedImageBase64 = '';

  showToast('Restaurant added successfully!');
  loadRestaurants();
  showView('home');
}

function handleImageUpload(e) {
  const file = e.target.files[0];
  const preview = document.getElementById('image-preview');
  
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      selectedImageBase64 = event.target.result;
      preview.src = selectedImageBase64;
    };
    reader.readAsDataURL(file);
  }
}

// Payment Functions
function showPayment() {
  if (cart.length === 0) {
    showToast('Your cart is empty!');
    return;
  }
  showView('payment');
}

function selectPaymentMethod(e) {
  const method = e.currentTarget;
  document.querySelectorAll('.payment-method').forEach(m => {
    m.classList.remove('selected');
  });
  method.classList.add('selected');
  
  // Show corresponding payment form
  document.querySelectorAll('.payment-form').forEach(form => {
    form.classList.add('hidden');
  });
  document.getElementById(`${method.dataset.method}-payment`).classList.remove('hidden');
}

function processPayment() {
  const selectedMethod = document.querySelector('.payment-method.selected').dataset.method;
  
  if (selectedMethod === 'card') {
    // Validate card details
    const cardNumber = document.getElementById('card-number').value;
    const cardName = document.getElementById('card-name').value;
    const cardExpiry = document.getElementById('card-expiry').value;
    const cardCvv = document.getElementById('card-cvv').value;
    
    if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
      showToast('Please fill all card details');
      return;
    }
  }
  
  // Process payment
  showToast(`Processing ${selectedMethod} payment...`);
  
  // Simulate payment processing
  setTimeout(() => {
    // Clear cart
    cart = [];
    saveCart();
    updateCartCount();
    
    // Show success and return home
    showToast('Payment successful! Order placed.');
    showView('home');
  }, 2000);
}

// Login Functions
function flipCard() {
  document.querySelector('.flip-card').classList.toggle('flipped');
}

function socialLogin(provider) {
  showToast(`Logging in with ${provider}...`);
  setTimeout(() => {
    userRole = 'customer';
    hideModal('login-modal');
    showToast('Logged in successfully!');
  }, 1000);
}

function ownerLogin() {
  const username = document.getElementById('owner-username').value;
  const password = document.getElementById('owner-password').value;
  
  if (username === 'admin' && password === 'admin123') {
    userRole = 'owner';
    hideModal('login-modal');
    showToast('Logged in as restaurant owner');
  } else {
    document.getElementById('login-error').textContent = 'Invalid credentials';
  }
}

// UI Helpers
function toggleMobileNav() {
  nav.classList.toggle('active');
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Initialize the app
document.addEventListener('DOMContentLoaded', init);
