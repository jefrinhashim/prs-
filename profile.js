const userIdEl = document.getElementById('userId');
const categoryListEl = document.getElementById('categoryList');

const userId = sessionStorage.getItem('userId') || 'USR-USER0001';
let categories = [];
try {
  categories = JSON.parse(sessionStorage.getItem('userCategories') || '[]');
} catch (e) {
  categories = [];
}

userIdEl.textContent = userId;

const fallbackCategories = [
  'Health',
  'Nutrition',
  'Other',
  'Physical Characteristics'
];

const visibleCategories = categories.length ? categories : fallbackCategories;

categoryListEl.innerHTML = '';

visibleCategories.forEach((category, index) => {
  const li = document.createElement('li');
  const btn = document.createElement('button');
  const cardClass = `category-${(index % 4) + 1}`;
  btn.className = `category-link ${cardClass}`;
  btn.type = 'button';
  btn.innerHTML = `
    <span class="category-title">${category}</span>
    <span class="category-note">Tap to open report</span>
  `;
  btn.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
  });
  li.appendChild(btn);
  categoryListEl.appendChild(li);
});
