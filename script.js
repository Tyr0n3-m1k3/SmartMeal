let cart = JSON.parse(localStorage.getItem("cart") || "[]");
let userRole = null; // "customer" or "owner"
let selectedImageBase64 = "";

const defaultRestaurants = [
  {
    name: "Mama's Kitchen",
    cuisine: "African",
    image: "assets/ugali.png",
    menu: [
      { name: "Ugali", price: 200 },
      { name: "Sukuma Wiki", price: 150 },
      { name: "Nyama Choma", price: 300 }
    ]
  },
  {
    name: "Pizza Hub",
    cuisine: "Italian",
    image: "assets/pizza.png",
    menu: [
      { name: "Margherita", price: 500 },
      { name: "Pepperoni", price: 600 },
      { name: "Veggie", price: 450 }
    ]
  },
  {
    name: "Wok & Roll",
    cuisine: "Asian",
    image: "assets/noodles.png",
    menu: [
      { name: "Noodles", price: 350 },
      { name: "Fried Rice", price: 300 },
      { name: "Spring Rolls", price: 250 }
    ]
  },
  {
    name: "Burger Place",
    cuisine: "American",
    image: "assets/burger.png",
    menu: [
      { name: "Hamburger", price: 400 },
      { name: "Cheeseburger", price: 450 },
      { name: "Chicken Nuggets", price: 300 }
    ]
  },
  {
    name: "Shake Joint",
    cuisine: "Global",
    image: "assets/shake.png",
    menu: [
      { name: "Chocolate", price: 200 },
      { name: "Strawberry", price: 200 },
      { name: "Vanilla", price: 180 }
    ]
  },
  {
    name: "Sushi Palace",
    cuisine: "Seafood",
    image: "assets/sushi.png",
    menu: [
      { name: "Crab", price: 600 },
      { name: "Shrimp", price: 650 },
      { name: "Sushi", price: 700 }
    ]
  }
];

document.getElementById("menu-toggle")?.addEventListener("click", () => {
  document.querySelector("nav").classList.toggle("show");
});

function toggleLogin() {
  document.getElementById("login-modal").classList.remove("hidden");
}

function handleLogin() {
  const role = document.getElementById("login-role").value;
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;
  const errorField = document.getElementById("login-error");

  if (role === "owner") {
    if (username === "admin" && password === "admin123") {
      userRole = "owner";
      showAdminPanel();
      showToast("Logged in as Restaurant Owner");
    } else {
      errorField.textContent = "Invalid owner credentials.";
      return;
    }
  } else if (role === "customer") {
    if (username.trim() && password.trim()) {
      userRole = "customer";
      showHome();
      showToast("Logged in as Customer");
    } else {
      errorField.textContent = "Enter a valid username and password.";
      return;
    }
  }

  document.getElementById("login-modal").classList.add("hidden");
  loadRestaurants();
}

function showHome() {
  document.getElementById("home-view").classList.remove("hidden");
  document.getElementById("restaurant-view").classList.add("hidden");
  document.getElementById("admin-panel").classList.add("hidden");
}

function showAdminPanel() {
  document.getElementById("home-view").classList.add("hidden");
  document.getElementById("restaurant-view").classList.add("hidden");
  document.getElementById("admin-panel").classList.remove("hidden");
}

function loadRestaurants(filter = "") {
  const container = document.getElementById("restaurant-list");
  container.innerHTML = "";
  const savedRestaurants = JSON.parse(localStorage.getItem("restaurants") || "[]");
  const restaurants = [...defaultRestaurants, ...savedRestaurants];

  restaurants
    .filter(res => {
      const search = filter.toLowerCase();
      return res.name.toLowerCase().includes(search) || res.cuisine.toLowerCase().includes(search);
    })
    .forEach((res, index) => {
      const div = document.createElement("div");
      div.className = "restaurant";
      const menuNames = res.menu.map(item => (typeof item === "string" ? item : item.name));
      div.innerHTML = `
        <img src="${res.image}" alt="${res.name}" />
        <h2>${res.name}</h2>
        <p><strong>Cuisine:</strong> ${res.cuisine}</p>
        <p><strong>Menu:</strong> ${menuNames.join(", ")}</p>
        <button onclick='viewRestaurant(${JSON.stringify(JSON.stringify(res))})'>Order from ${res.name}</button>
        ${
          userRole === "owner" && index >= defaultRestaurants.length
            ? `<button onclick="editRestaurant(${index})">Edit</button>
               <button onclick="deleteRestaurant(${index})">Delete</button>`
            : ""
        }
      `;
      container.appendChild(div);
    });
}

function viewRestaurant(resJsonStr) {
  const restaurant = JSON.parse(JSON.parse(resJsonStr));

  const formattedMenu = restaurant.menu.map(item =>
    typeof item === "string" ? { name: item, price: 100 } : item
  );

  document.getElementById("home-view").classList.add("hidden");
  document.getElementById("admin-panel").classList.add("hidden");
  document.getElementById("restaurant-view").classList.remove("hidden");

  document.getElementById("restaurant-cover").src = restaurant.image;
  document.getElementById("restaurant-name").textContent = restaurant.name;
  document.getElementById("restaurant-cuisine").textContent = `Cuisine: ${restaurant.cuisine}`;

  const menuList = document.getElementById("restaurant-menu-list");
  menuList.innerHTML = "";

  formattedMenu.forEach(item => {
    const itemStr = encodeURIComponent(JSON.stringify(item));
    const div = document.createElement("div");
    div.className = "menu-item";
    div.innerHTML = `
      <p><strong>${item.name}</strong> - $${item.price}</p>
      <button onclick="addItemToCart('${itemStr}')">Add to Cart</button>
    `;
    menuList.appendChild(div);
  });
}

// ... continue with cart handling, add/edit/delete restaurant, toast handling etc.
