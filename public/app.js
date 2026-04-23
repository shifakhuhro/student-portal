const form = document.getElementById('student-form');
const idInput = document.getElementById('student-id');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const courseInput = document.getElementById('course');
const submitButton = document.getElementById('submit-button');
const cancelEditButton = document.getElementById('cancel-edit');
const studentsBody = document.getElementById('students-body');
const message = document.getElementById('message');

function showMessage(text, isError = false) {
  message.textContent = text;
  message.style.color = isError ? '#c62828' : '#2e7d32';
}

async function loadStudents() {
  const response = await fetch('/api/students');
  const students = await response.json();

  studentsBody.innerHTML = '';
  for (const student of students) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${student.name}</td>
      <td>${student.email}</td>
      <td>${student.course}</td>
      <td>
        <button data-action="edit" data-id="${student.id}" class="secondary">Edit</button>
        <button data-action="delete" data-id="${student.id}">Delete</button>
      </td>
    `;
    studentsBody.appendChild(row);
  }
}

function resetForm() {
  idInput.value = '';
  form.reset();
  submitButton.textContent = 'Add Student';
  cancelEditButton.hidden = true;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const payload = {
    name: nameInput.value,
    email: emailInput.value,
    course: courseInput.value
  };

  const id = idInput.value;
  const isEditing = Boolean(id);
  const url = isEditing ? `/api/students/${id}` : '/api/students';
  const method = isEditing ? 'PUT' : 'POST';

  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json();
    showMessage(error.error || 'Unexpected error', true);
    return;
  }

  showMessage(isEditing ? 'Student updated' : 'Student added');
  resetForm();
  await loadStudents();
});

studentsBody.addEventListener('click', async (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  const id = button.dataset.id;
  const action = button.dataset.action;

  if (action === 'delete') {
    const response = await fetch(`/api/students/${id}`, { method: 'DELETE' });
    if (response.status === 204) {
      showMessage('Student deleted');
      await loadStudents();
    }
    return;
  }

  if (action === 'edit') {
    const row = button.closest('tr');
    idInput.value = id;
    nameInput.value = row.children[0].textContent;
    emailInput.value = row.children[1].textContent;
    courseInput.value = row.children[2].textContent;
    submitButton.textContent = 'Update Student';
    cancelEditButton.hidden = false;
  }
});

cancelEditButton.addEventListener('click', () => {
  resetForm();
  showMessage('Edit canceled');
});

loadStudents().catch(() => {
  showMessage('Unable to load students', true);
});
