const SUPABASE_URL      = 'https://mbueufdoeeedmhuehazp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1idWV1ZmRvZWVlZG1odWVoYXpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2NjUyNDksImV4cCI6MjA5NTI0MTI0OX0.cLsVOnix51QDvnlaNUDkIJOIkTBOU_3E_RKYz2-lB-E';

const { createClient } = window.supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function showAlert(msg, type) {
  const box = document.getElementById('alertBox');
  const icons = { error: '⚠️', success: '✅' };
  box.className = 'alert ' + type + ' show';
  box.innerHTML = '<span>' + icons[type] + '</span><span>' + msg + '</span>';
  if (type === 'success') setTimeout(() => box.className = 'alert', 4000);
}

function setLoading(isLogin, loading) {
  const btn = isLogin ? 'loginBtn' : 'registerBtn';
  const spinner = isLogin ? 'loginSpinner' : 'registerSpinner';
  const text = isLogin ? 'loginBtnText' : 'registerBtnText';
  document.getElementById(btn).disabled = loading;
  document.getElementById(spinner).style.display = loading ? 'block' : 'none';
  document.getElementById(text).textContent = loading
    ? (isLogin ? 'Verificando...' : 'Creando cuenta...')
    : (isLogin ? 'Ingresar' : 'Crear cuenta');
}

function switchTab(tab) {
  document.getElementById('alertBox').className = 'alert';
  const isLogin = tab === 'login';
  document.getElementById('loginForm').style.display = isLogin ? '' : 'none';
  document.getElementById('registerForm').style.display = isLogin ? 'none' : '';
  document.querySelectorAll('.tab-btn')[0].classList.toggle('active', isLogin);
  document.querySelectorAll('.tab-btn')[1].classList.toggle('active', !isLogin);
}

function showMenu(user) {
  document.getElementById('welcomeUser').textContent = 'Bienvenido/a, ' + user.nombre + ' ' + user.apellido;
  document.getElementById('welcomeBar').textContent = '✅ Sesión iniciada como ' + user.email;
  document.getElementById('authView').classList.add('hidden');
  document.getElementById('menuView').classList.add('active');
}

async function doLogin() {
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const pass  = document.getElementById('loginPass').value;
  if (!email || !pass) { showAlert('Completa todos los campos.', 'error'); return; }
  setLoading(true, true);
  try {
    const { data, error } = await db.from('usuarios').select('*').eq('email', email).single();
    if (error || !data) { showAlert('Correo no registrado.', 'error'); return; }
    if (data.password !== pass) { showAlert('Contraseña incorrecta.', 'error'); return; }
    showMenu(data);
  } catch(e) {
    showAlert('Error de conexión. Revisa la consola (F12).', 'error');
    console.error(e);
  } finally {
    setLoading(true, false);
  }
}

async function doRegister() {
  const nombre   = document.getElementById('regNombre').value.trim();
  const apellido = document.getElementById('regApellido').value.trim();
  const usuario  = document.getElementById('regUsuario').value.trim().toLowerCase();
  const edad     = document.getElementById('regEdad').value.trim();
  const email    = document.getElementById('regEmail').value.trim().toLowerCase();
  const pass     = document.getElementById('regPass').value;
  const pass2    = document.getElementById('regPass2').value;

  if (!nombre || !apellido || !usuario || !edad || !email || !pass || !pass2) {
    showAlert('Completa todos los campos.', 'error'); return;
  }
  if (pass.length < 6) { showAlert('La contraseña debe tener al menos 6 caracteres.', 'error'); return; }
  if (pass !== pass2)  { showAlert('Las contraseñas no coinciden.', 'error'); return; }

  setLoading(false, true);
  try {
    const { data: emailExiste } = await db.from('usuarios').select('id').eq('email', email).maybeSingle();
    if (emailExiste) { showAlert('Este correo ya está registrado.', 'error'); return; }

    const { data: userExiste } = await db.from('usuarios').select('id').eq('usuario', usuario).maybeSingle();
    if (userExiste) { showAlert('Ese usuario ya está en uso.', 'error'); return; }

    const { error } = await db.from('usuarios').insert([{ nombre, apellido, usuario, edad: parseInt(edad), email, password: pass }]);
    if (error) { showAlert('Error al crear cuenta: ' + error.message, 'error'); console.error(error); return; }

    showAlert('¡Cuenta creada! Ya puedes iniciar sesión.', 'success');
    ['regNombre','regApellido','regUsuario','regEdad','regEmail','regPass','regPass2'].forEach(id => document.getElementById(id).value = '');
    setTimeout(() => switchTab('login'), 1800);
  } catch(e) {
    showAlert('Error inesperado. Revisa la consola (F12).', 'error');
    console.error(e);
  } finally {
    setLoading(false, false);
  }
}

function doLogout() {
  document.getElementById('authView').classList.remove('hidden');
  document.getElementById('menuView').classList.remove('active');
  document.getElementById('loginEmail').value = '';
  document.getElementById('loginPass').value = '';
}

function menuAction(section) {
  const names = { citas:'Citas', mascotas:'Mis mascotas', historial:'Historial médico', vacunas:'Vacunas', recetas:'Recetas', contacto:'Contacto' };
  alert('📌 ' + names[section] + '\n(Disponible en la versión completa)');
}

document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    document.getElementById('loginForm').style.display !== 'none' ? doLogin() : doRegister();
  }
});
