// ==========================================
// 1. البيانات الأساسية وحالة المتجر (State)
// ==========================================

// مصفوفة المنتجات: كل عنصر يمثل تفاصيل منتج معين.
const products = [
 {id:1,name:"Notebook",price:50,category:"School",image:"images/notebook.jpg"},
 {id:2,name:"Story Book",price:100,category:"Books",image:"images/book.jpg"},
 {id:3,name:"Headphones",price:350,category:"Electronics",image:"images/headphones.jpg"},
 {id:4,name:"Pen",price:15,category:"School",image:"images/pen.jpg"},
 {id:5,name:"Backpack",price:250,category:"School",image:"images/backpack.jpg"},
 {id:6,name:"Colored Pencils",price:120,category:"Art",image:"images/pencils.jpg"},
 {id:7,name:"Wireless Mouse",price:200,category:"Electronics",image:"images/mouse.jpg"},
 {id:8,name:"Water Bottle",price:80,category:"Accessories",image:"images/water-bottle.jpg"},
 {id:9,name:"Shoes",price:450,category:"Accessories",image:"images/shoes.jpg"},
 {id:10,name:"Coffee Mug",price:70,category:"Accessories",image:"images/mug.jpg"}
];

// دالة لقراءة البيانات بأمان من الذاكرة المحلية (LocalStorage) لمنع حدوث أخطاء.
function readSaved(key, fallback) {
 try { const value = localStorage.getItem(key); return value === null ? fallback : JSON.parse(value); }
 catch (error) { return fallback; }
}

// تحميل السلة ومعدل الخصم المحفوظين مسبقاً.
let cart = readSaved("miniStoreCart", []);
let discountRate = readSaved("miniStoreDiscount", 0);

// حفظ حالة السلة والخصم في الذاكرة المحلية لكي تعمل عبر جميع صفحات المتجر.
function saveState() {
 localStorage.setItem("miniStoreCart", JSON.stringify(cart));
 localStorage.setItem("miniStoreDiscount", JSON.stringify(discountRate));
}

// دالة لتنسيق الأرقام لعرضها كعملة (EGP) مع تقريب الكسور.
function money(value) { return Number(value).toFixed(2).replace(/\.00$/, "") + " EGP"; }

// تحديث عداد المنتجات في الهيدر (Navbar) لجميع الصفحات.
function updateHeader() {
 document.querySelectorAll(".cart-count").forEach(function (element) {
  element.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
 });
}


// ==========================================
// 2. صفحة المنتجات (Products Page)
// ==========================================

// عرض المنتجات مع تطبيق خيارات البحث، التصفية (Category)، والترتيب (Sort).
function showProducts() {
 const grid = document.getElementById("productsGrid");
 if (!grid) return;
 
 const searchText = document.getElementById("search").value.trim().toLowerCase();
 const category = document.getElementById("category").value;
 const sort = document.getElementById("sort").value;

 // تصفية المنتجات بناءً على البحث والفئة.
 let results = products.filter(function (product) {
  const matchesName = product.name.toLowerCase().includes(searchText);
  const matchesCategory = category === "All" || product.category === category;
  return matchesName && matchesCategory;
 });

 // ترتيب المنتجات حسب السعر أو الاسم إذا طُلب ذلك.
 if (sort === "low") results.sort((a,b) => a.price - b.price);
 if (sort === "high") results.sort((a,b) => b.price - a.price);
 if (sort === "name") results.sort((a,b) => a.name.localeCompare(b.name));

 grid.replaceChildren();
 document.getElementById("productCount").textContent = results.length + " products";
 document.getElementById("noProducts").classList.toggle("hidden", results.length > 0);

 // بناء وتوليد بطاقات المنتجات في الصفحة ديناميكياً.
 results.forEach(function (product) {
  const card = document.createElement("article");
  card.className = "product";
  
  const image = document.createElement("img");
  image.src = product.image; image.alt = product.name; image.loading = "lazy";
  
  const title = document.createElement("h3"); title.textContent = product.name;
  const type = document.createElement("p"); type.textContent = product.category;
  
  const price = document.createElement("p"); 
  price.className = "price"; 
  price.textContent = money(product.price);
  
  const button = document.createElement("button"); 
  button.className = "btn"; 
  button.textContent = "Add to cart";
  
  // الحدث عند النقر على زر "إضافة إلى السلة".
  button.addEventListener("click", function () { 
    addToCart(product.id); 
    button.textContent = "Added ✓"; 
    setTimeout(() => button.textContent = "Add to cart", 700); 
  });
  
  card.append(image, title, type, price, button);
  grid.appendChild(card);
 });
}

// إضافة منتج للسلة أو زيادة الكمية إذا كان موجوداً مسبقاً.
function addToCart(id) {
 const product = products.find(item => item.id === id);
 const existing = cart.find(item => item.id === id);
 if (existing) existing.quantity++;
 else cart.push({...product, quantity:1});
 saveState(); 
 updateHeader();
}


// ==========================================
// 3. حسابات الأسعار (Price Calculations)
// ==========================================

function subtotal() { return cart.reduce((sum, item) => sum + item.price * item.quantity, 0); }
function discount() { return subtotal() * discountRate; }
function total() { return subtotal() - discount(); }


// ==========================================
// 4. صفحة السلة (Cart Page)
// ==========================================

// عرض محتويات السلة والتحكم في كميات المنتجات أو إزالتها.
function showCart() {
 const container = document.getElementById("cartItems");
 if (!container) return;
 
 container.replaceChildren();
 document.getElementById("emptyCart").classList.toggle("hidden", cart.length > 0);
 document.getElementById("cartSummary").classList.toggle("hidden", cart.length === 0);

 cart.forEach(function (item) {
  const row = document.createElement("article"); 
  row.className = "cart-row";
  
  const img = document.createElement("img"); 
  img.src = item.image; 
  img.alt = item.name;
  
  const info = document.createElement("div");
  const name = document.createElement("h3"); name.textContent = item.name;
  const price = document.createElement("p"); price.textContent = money(item.price) + " each";
  info.append(name, price);
  
  // أزرار التحكم بالكمية (+ و -).
  const qty = document.createElement("div"); qty.className = "qty";
  const minus = document.createElement("button"); minus.textContent = "−"; minus.setAttribute("aria-label","Decrease quantity");
  minus.addEventListener("click", () => changeQuantity(item.id, -1));
  
  const number = document.createElement("span"); number.textContent = item.quantity;
  
  const plus = document.createElement("button"); plus.textContent = "+"; plus.setAttribute("aria-label","Increase quantity");
  plus.addEventListener("click", () => changeQuantity(item.id, 1));
  
  qty.append(minus, number, plus);
  
  const lineTotal = document.createElement("b"); 
  lineTotal.textContent = money(item.price * item.quantity);
  
  // زر إزالة المنتج من السلة.
  const remove = document.createElement("button"); 
  remove.className = "remove"; 
  remove.textContent = "Remove";
  remove.addEventListener("click", () => removeItem(item.id));
  
  row.append(img, info, qty, lineTotal, remove); 
  container.appendChild(row);
 });
 
 updateCartPrices(); 
 updateHeader();
}

// تعديل كمية المنتج (زيادة أو نقصان).
function changeQuantity(id, change) {
 const item = cart.find(product => product.id === id);
 if (!item) return;
 item.quantity += change;
 if (item.quantity <= 0) cart = cart.filter(product => product.id !== id);
 saveState(); 
 showCart();
}

// إزالة منتج بالكامل من السلة.
function removeItem(id) { 
 cart = cart.filter(item => item.id !== id); 
 saveState(); 
 showCart(); 
}

// تحديث أسعار الملخص في صفحة السلة (المجموع، الخصم، الإجمالي).
function updateCartPrices() {
 const a = document.getElementById("subtotal"), 
       b = document.getElementById("discount"), 
       c = document.getElementById("total");
 if (a) a.textContent = money(subtotal());
 if (b) b.textContent = "- " + money(discount());
 if (c) c.textContent = money(total());
}

// تطبيق كود الخصم (مثل SAVE10 للحصول على خصم 10%).
function applyCoupon() {
 const message = document.getElementById("couponMessage");
 const code = document.getElementById("coupon").value.trim().toUpperCase();
 
 if (code === "SAVE10") { 
   discountRate = 0.10; 
   message.textContent = "Coupon applied! You saved 10%."; 
   message.classList.remove("error"); 
 } else { 
   discountRate = 0; 
   message.textContent = "Invalid code. Try SAVE10."; 
   message.classList.add("error"); 
 }
 saveState(); 
 updateCartPrices();
}


// ==========================================
// 5. صفحة الدفع (Checkout Page)
// ==========================================

// عرض ملخص الطلب في صفحة الـ Checkout.
function showCheckout() {
 const list = document.getElementById("orderItems");
 if (!list) return;
 
 list.replaceChildren();
 
 cart.forEach(function (item) {
  const row = document.createElement("div"); row.className = "order-item";
  const img = document.createElement("img"); img.src = item.image; img.alt = item.name;
  
  const details = document.createElement("div");
  const name = document.createElement("h3"); name.textContent = item.name;
  const qty = document.createElement("p"); qty.textContent = item.quantity + " × " + money(item.price);
  details.append(name, qty);
  
  const price = document.createElement("b"); price.textContent = money(item.price * item.quantity);
  row.append(img, details, price); 
  list.appendChild(row);
 });
 
 document.getElementById("orderSubtotal").textContent = money(subtotal());
 document.getElementById("orderDiscount").textContent = "- " + money(discount());
 document.getElementById("orderTotal").textContent = money(total());
 
 const form = document.getElementById("checkoutForm");
 if (cart.length === 0) {
  form.classList.add("hidden");
  const msg = document.getElementById("checkoutMessage"); 
  msg.textContent = "Your cart is empty. Add products first."; 
  msg.classList.add("error");
 }
}

// معالجة إرسال الطلب وإتمام عملية الشراء التجريبية.
function placeOrder(event) {
 event.preventDefault();
 const message = document.getElementById("checkoutMessage");
 
 if (cart.length === 0) { 
   message.textContent = "Your cart is empty."; 
   message.classList.add("error"); 
   return; 
 }
 
 const customer = document.getElementById("name").value.trim();
 const address = document.getElementById("address").value.trim();
 const phone = document.getElementById("phone").value.trim();
 const email = document.getElementById("email").value.trim();
 const payment = document.querySelector('input[name="payment"]:checked').value;
 
 // التحقق من صحة المدخلات الأساسية.
 if (customer.length < 2 || address.length < 5 || phone.length < 8) {
  message.textContent = "Please check your name, address and phone number."; 
  message.classList.add("error"); 
  return;
 }
 
 // حفظ الطلب الجديد في سجل الطلبات بالذاكرة المحلية.
 const orders = readSaved("miniStoreOrders", []);
 const order = {
   number: "MS" + Date.now().toString().slice(-8), 
   customer, address, phone, email, payment,
   items: cart, subtotal: subtotal(), discount: discount(), total: total(), 
   date: new Date().toLocaleString()
 };
 
 orders.push(order); 
 localStorage.setItem("miniStoreOrders", JSON.stringify(orders));
 
 // تفريغ السلة وإعادة تعيين الخصم بعد نجاح الطلب.
 cart = []; 
 discountRate = 0; 
 saveState(); 
 updateHeader();
 
 // إخفاء النموذج وإظهار رسالة النجاح.
 document.getElementById("checkoutForm").classList.add("hidden");
 document.getElementById("success").classList.remove("hidden");
 document.getElementById("successText").textContent = "Thank you, " + customer + "! Demo order " + order.number + " was saved. Total: " + money(order.total) + ".";
 
 showCheckout();
}


// ==========================================
// 6. تشغيل الدوال بناءً على الصفحة الحالية
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
 updateHeader();
 const page = document.body.dataset.page;
 
 // إذا كنا في صفحة المنتجات
 if (page === "products") {
  showProducts();
  ["search","category","sort"].forEach(id => 
    document.getElementById(id).addEventListener(id === "search" ? "input" : "change", showProducts)
  );
 }
 
 // إذا كنا في صفحة السلة
 if (page === "cart") {
  document.getElementById("applyCoupon").addEventListener("click", applyCoupon);
  if (discountRate > 0) { 
    document.getElementById("coupon").value = "SAVE10"; 
    document.getElementById("couponMessage").textContent = "Coupon SAVE10 is active."; 
  }
  showCart();
 }
 
 // إذا كنا في صفحة الدفع
 if (page === "checkout") {
  showCheckout();
  document.getElementById("checkoutForm").addEventListener("submit", placeOrder);
 }
});