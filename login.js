const togglePw = document.getElementById('togglePw');
const passInput = document.getElementById('passInput');
const eyeOff = document.getElementById('eyeOff');
const eyeOn = document.getElementById('eyeOn');

togglePw.addEventListener('click', () => {
  const hidden = passInput.type === 'password';
  passInput.type = hidden ? 'text' : 'password';
  eyeOff.style.display = hidden ? 'none' : '';
  eyeOn.style.display = hidden ? '' : 'none';
});

function clearErrors() {
  ['emailInput', 'passInput'].forEach((id) => document.getElementById(id).classList.remove('error'));
  ['emailError', 'passError'].forEach((id) => document.getElementById(id).classList.remove('show'));
}

function showError(inputId, errorId) {
  const input = document.getElementById(inputId);
  const err = document.getElementById(errorId);
  input.classList.add('error');
  err.classList.add('show');
  input.addEventListener(
    'input',
    () => {
      input.classList.remove('error');
      err.classList.remove('show');
    },
    { once: true }
  );
}

function handleSignin() {
  clearErrors();
  const email = document.getElementById('emailInput').value.trim();
  const pass = document.getElementById('passInput').value;
  let valid = true;

  if (!email) {
    showError('emailInput', 'emailError');
    valid = false;
  }
  if (!pass) {
    showError('passInput', 'passError');
    valid = false;
  }

  if (!valid) {
    const card = document.querySelector('.card');
    card.classList.add('shake');
    setTimeout(() => card.classList.remove('shake'), 500);
    return;
  }

  const btn = document.getElementById('signinBtn');
  const btnText = document.getElementById('btnText');
  const spinner = document.getElementById('spinner');
  btn.disabled = true;
  btnText.textContent = 'Signing in...';
  spinner.style.display = 'block';

  setTimeout(() => {
    const userId = createUserId(email);
    const categories = [
      'Health',
      'Nutrition',
      'Other',
      'Physical Characteristics'
    ];

    sessionStorage.setItem('userId', userId);
    sessionStorage.setItem('userCategories', JSON.stringify(categories));
    window.location.href = 'profile.html';
  }, 1800);
}

function createUserId(email) {
  const cleaned = email.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
  const suffix = cleaned || 'USER0001';
  return `USR-${suffix}`;
}

function handleSignup() {
  alert('Redirecting to Sign Up...');
}

function handleForgot(e) {
  e.preventDefault();
  alert('A reset link will be sent to your email.');
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleSignin();
});
