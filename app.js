// Supabase initialization (optional). Create `config.js` from `config.example.js` with your project values,
// or generate `config.js` at build time in Vercel using environment variables.
let supabaseClient = null;
if (window.SUPABASE_URL && window.SUPABASE_ANON_KEY && window.supabase && typeof window.supabase.createClient === 'function') {
  try {
    supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
    console.log('Supabase client initialized');
    (async () => {
      try {
        const { data, error } = await supabaseClient.from('workshops').select('*').limit(1);
        console.log('Supabase test query result:', { data, error });
      } catch (err) {
        console.error('Supabase test query failed:', err);
      }
    })();
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
  }
} else {
  console.warn('Supabase not configured. To enable, create `config.js` from `config.example.js` or set up a build step to generate it on Vercel.');
}

const storage = {
  get(key) {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

const defaultWorkshops = [
  {
    id: 'ws-1',
    name: 'Classroom Technology for Primary Teachers',
    description: 'Hands-on session to use educational tech in lesson planning.',
    date: '2026-07-10',
    time: '09:00 AM - 11:00 AM',
    location: 'Room A1',
    instructor: 'Ms. Tan Mei',
    capacity: 20,
    status: 'Open'
  },
  {
    id: 'ws-2',
    name: 'Student Assessment & Feedback Strategies',
    description: 'Build effective formative and summative assessment plans.',
    date: '2026-07-10',
    time: '12:00 PM - 02:00 PM',
    location: 'Room B2',
    instructor: 'Mr. Lim Wei',
    capacity: 20,
    status: 'Open'
  },
  {
    id: 'ws-3',
    name: 'Curriculum Design for Inquiry-Based Learning',
    description: 'Design a lesson sequence that engages student inquiry.',
    date: '2026-07-11',
    time: '09:00 AM - 11:00 AM',
    location: 'Room C3',
    instructor: 'Ms. Wong Li',
    capacity: 20,
    status: 'Open'
  },
  {
    id: 'ws-4',
    name: 'Classroom Management & Inclusion',
    description: 'Practical strategies for managing diverse learner needs.',
    date: '2026-07-11',
    time: '12:00 PM - 02:00 PM',
    location: 'Room D4',
    instructor: 'Dr. Chen Yu',
    capacity: 20,
    status: 'Open'
  }
];

const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');
const registerBox = document.getElementById('register-box');
const loginBox = document.getElementById('login-box');
const showRegisterBtn = document.getElementById('show-register');
const showLoginBtn = document.getElementById('show-login');
const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');
const registerMessage = document.getElementById('register-message');
const loginMessage = document.getElementById('login-message');
const welcomeText = document.getElementById('welcome-text');
const registrationCountText = document.getElementById('registration-count');
const workshopsList = document.getElementById('workshops-list');
const registeredList = document.getElementById('registered-list');
const logoutButton = document.getElementById('logout-button');
const confirmationCard = document.getElementById('confirmation-card');
const confirmationDetails = document.getElementById('confirmation-details');

const currentUserKey = 'currentTeacherEmail';

function loadWorkshops() {
  let workshops = storage.get('workshops');
  if (!workshops) {
    storage.set('workshops', defaultWorkshops);
    workshops = defaultWorkshops;
  }
  return workshops;
}

function getTeachers() {
  return storage.get('teachers') || [];
}

function saveTeacher(teacher) {
  const teachers = getTeachers();
  teachers.push(teacher);
  storage.set('teachers', teachers);
}

function getRegistrations() {
  return storage.get('registrations') || [];
}

function saveRegistrations(registrations) {
  storage.set('registrations', registrations);
}

function getCurrentTeacherEmail() {
  return localStorage.getItem(currentUserKey);
}

function setCurrentTeacherEmail(email) {
  localStorage.setItem(currentUserKey, email);
}

function clearCurrentTeacher() {
  localStorage.removeItem(currentUserKey);
}

function getCurrentTeacher() {
  const email = getCurrentTeacherEmail();
  if (!email) return null;
  return getTeachers().find((teacher) => teacher.email === email) || null;
}

function findRegistration(email, workshopId) {
  return getRegistrations().find((reg) => reg.teacherEmail === email && reg.workshopId === workshopId);
}

function getTeacherRegistrations(email) {
  return getRegistrations().filter((reg) => reg.teacherEmail === email);
}

function countConfirmedRegistrations(email) {
  return getTeacherRegistrations(email).filter((reg) => reg.status === 'Registered').length;
}

function isWorkshopFull(workshop) {
  const registrations = getRegistrations().filter((reg) => reg.workshopId === workshop.id && reg.status === 'Registered');
  return registrations.length >= workshop.capacity;
}

function getWaitlistCount(workshop) {
  return getRegistrations().filter((reg) => reg.workshopId === workshop.id && reg.status === 'Waitlisted').length;
}

function updateDisplay() {
  const currentTeacher = getCurrentTeacher();
  if (!currentTeacher) {
    authSection.classList.remove('hidden');
    appSection.classList.add('hidden');
    return;
  }

  authSection.classList.add('hidden');
  appSection.classList.remove('hidden');

  welcomeText.textContent = `Welcome, ${currentTeacher.name}`;

  const confirmedCount = countConfirmedRegistrations(currentTeacher.email);
  registrationCountText.textContent = `Registered for ${confirmedCount}/2 workshops`;

  const workshops = loadWorkshops();
  workshopsList.innerHTML = workshops.map((workshop) => renderWorkshopCard(workshop, currentTeacher)).join('');
  registeredList.innerHTML = renderRegistrationList(currentTeacher.email);
}

function renderWorkshopCard(workshop, teacher) {
  const registration = findRegistration(teacher.email, workshop.id);
  const stillAvailable = !isWorkshopFull(workshop);
  const registeredCount = getRegistrations().filter((reg) => reg.workshopId === workshop.id && reg.status === 'Registered').length;
  const spotsLeft = Math.max(workshop.capacity - registeredCount, 0);
  const registeredWorkshopsCount = countConfirmedRegistrations(teacher.email);

  let statusBadge = `<span class="badge available">${stillAvailable ? 'Open' : 'Full'}</span>`;
  if (workshop.status !== 'Open') {
    statusBadge = `<span class="badge full">${workshop.status}</span>`;
  }

  let actionButton = '';
  if (registration?.status === 'Registered') {
    actionButton = `<button class="unregister-button" onclick="handleUnregister('${workshop.id}')">Unregister</button>`;
  } else if (registration?.status === 'Waitlisted') {
    actionButton = `<span class="badge waitlisted">Waitlisted (${getWaitlistCount(workshop)} in queue)</span>`;
  } else if (confirmedWorkshopsCount >= 2) {
    actionButton = `<button disabled>Limit reached</button>`;
  } else if (stillAvailable) {
    actionButton = `<button class="workshop-button" onclick="handleRegister('${workshop.id}')">Register</button>`;
  } else {
    actionButton = `<button class="workshop-button" onclick="handleWaitlist('${workshop.id}')">Join Waitlist</button>`;
  }

  return `
    <div class="workshop-card">
      <h3>${workshop.name}</h3>
      <div class="workshop-meta">${workshop.date} · ${workshop.time} · ${workshop.location}</div>
      <p>${workshop.description}</p>
      <p><strong>Instructor:</strong> ${workshop.instructor}</p>
      <p><strong>Remaining spots:</strong> ${spotsLeft}</p>
      ${statusBadge}
      <div style="margin-top: 14px;">${actionButton}</div>
    </div>
  `;
}

function renderRegistrationList(email) {
  const registrations = getTeacherRegistrations(email);
  if (registrations.length === 0) {
    return '<p>No workshop registrations yet.</p>';
  }

  return registrations
    .map((reg) => {
      const workshop = loadWorkshops().find((item) => item.id === reg.workshopId);
      if (!workshop) return '';
      const statusTag = reg.status === 'Registered' ? 'Registered' : 'Waitlisted';
      return `
        <div class="registration-card">
          <h3>${workshop.name}</h3>
          <p>${workshop.date} · ${workshop.time}</p>
          <p><strong>Status:</strong> ${statusTag}</p>
          <p><strong>Confirmation:</strong> ${reg.confirmationId}</p>
          <button class="unregister-button" onclick="handleUnregister('${workshop.id}')">Unregister</button>
        </div>
      `;
    })
    .join('');
}

function showTab(tab) {
  if (tab === 'register') {
    showRegisterBtn.classList.add('active');
    showLoginBtn.classList.remove('active');
    registerBox.classList.remove('hidden');
    loginBox.classList.add('hidden');
  } else {
    showRegisterBtn.classList.remove('active');
    showLoginBtn.classList.add('active');
    registerBox.classList.add('hidden');
    loginBox.classList.remove('hidden');
  }
}

function handleRegisterSubmit(event) {
  event.preventDefault();
  const formData = new FormData(registerForm);
  const teacher = {
    id: `teacher-${Date.now()}`,
    name: String(formData.get('name') || '').trim(),
    email: String(formData.get('email') || '').trim().toLowerCase(),
    phone: String(formData.get('phone') || '').trim(),
    school: String(formData.get('school') || '').trim(),
    gradeLevel: String(formData.get('gradeLevel') || '').trim(),
    createdAt: new Date().toISOString()
  };

  if (!teacher.name || !teacher.email || !teacher.phone || !teacher.school || !teacher.gradeLevel) {
    registerMessage.textContent = 'Please fill out every field.';
    return;
  }

  const teachers = getTeachers();
  if (teachers.some((entry) => entry.email === teacher.email)) {
    registerMessage.textContent = 'This email is already registered. Please log in instead.';
    return;
  }

  saveTeacher(teacher);
  setCurrentTeacherEmail(teacher.email);
  registerMessage.textContent = 'Registration successful. You are now logged in.';
  setTimeout(() => {
    registerMessage.textContent = '';
    updateDisplay();
  }, 800);
  registerForm.reset();
}

function handleLoginSubmit(event) {
  event.preventDefault();
  const email = String(new FormData(loginForm).get('email') || '').trim().toLowerCase();
  const teacher = getTeachers().find((entry) => entry.email === email);
  if (!teacher) {
    loginMessage.textContent = 'No account found with that email. Please register first.';
    return;
  }

  setCurrentTeacherEmail(email);
  loginMessage.textContent = 'Login successful.';
  setTimeout(() => {
    loginMessage.textContent = '';
    updateDisplay();
  }, 600);
  loginForm.reset();
}

function handleRegister(workshopId) {
  const teacher = getCurrentTeacher();
  if (!teacher) return;

  const confirmedCount = countConfirmedRegistrations(teacher.email);
  if (confirmedCount >= 2) {
    showConfirmation('Registration failed', 'You can only register for up to 2 workshops.');
    return;
  }

  const registrationExists = findRegistration(teacher.email, workshopId);
  if (registrationExists) {
    showConfirmation('Already signed up', 'You are already registered for this workshop.');
    return;
  }

  const workshops = loadWorkshops();
  const workshop = workshops.find((item) => item.id === workshopId);
  if (!workshop) return;

  const workshopRegistrations = getRegistrations().filter((reg) => reg.workshopId === workshopId && reg.status === 'Registered');
  const status = workshopRegistrations.length >= workshop.capacity ? 'Waitlisted' : 'Registered';

  const newRegistration = {
    id: `registration-${Date.now()}`,
    teacherEmail: teacher.email,
    workshopId,
    status,
    registrationDate: new Date().toISOString(),
    confirmationId: `CONF-${Math.random().toString(36).slice(2, 10).toUpperCase()}`
  };

  const registrations = getRegistrations();
  registrations.push(newRegistration);
  saveRegistrations(registrations);

  showConfirmation(
    status === 'Registered' ? 'Registration Complete' : 'Added to Waitlist',
    `Workshop: ${workshop.name}<br>Status: ${status}<br>Confirmation number: ${newRegistration.confirmationId}`
  );

  updateDisplay();
}

function handleWaitlist(workshopId) {
  handleRegister(workshopId);
}

function handleUnregister(workshopId) {
  const teacher = getCurrentTeacher();
  if (!teacher) return;

  const registrations = getRegistrations();
  const index = registrations.findIndex((reg) => reg.teacherEmail === teacher.email && reg.workshopId === workshopId);
  if (index === -1) return;

  const removed = registrations.splice(index, 1)[0];
  saveRegistrations(registrations);
  promoteWaitlist(workshopId);

  showConfirmation('Unregistered', `You have been removed from ${removed.workshopId}.`);
  updateDisplay();
}

function promoteWaitlist(workshopId) {
  const registrations = getRegistrations();
  const nextWaitlisted = registrations.find((reg) => reg.workshopId === workshopId && reg.status === 'Waitlisted');
  if (!nextWaitlisted) return;

  nextWaitlisted.status = 'Registered';
  nextWaitlisted.confirmationId = `CONF-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
  saveRegistrations(registrations);
}

function showConfirmation(title, message) {
  confirmationCard.classList.remove('hidden');
  confirmationDetails.innerHTML = `<p><strong>${title}</strong></p><p>${message}</p>`;
}

function handleLogout() {
  clearCurrentTeacher();
  confirmationCard.classList.add('hidden');
  updateDisplay();
}

window.handleRegister = handleRegister;
window.handleWaitlist = handleWaitlist;
window.handleUnregister = handleUnregister;

showRegisterBtn.addEventListener('click', () => showTab('register'));
showLoginBtn.addEventListener('click', () => showTab('login'));
registerForm.addEventListener('submit', handleRegisterSubmit);
loginForm.addEventListener('submit', handleLoginSubmit);
logoutButton.addEventListener('click', handleLogout);

loadWorkshops();
updateDisplay();
