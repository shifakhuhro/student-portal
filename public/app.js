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
    row.dataset.name = student.name;
    row.dataset.email = student.email;
    row.dataset.course = student.course;
    const nameCell = document.createElement('td');
    nameCell.textContent = student.name;

    const emailCell = document.createElement('td');
    emailCell.textContent = student.email;

    const courseCell = document.createElement('td');
    courseCell.textContent = student.course;

    const actionsCell = document.createElement('td');
    const editButton = document.createElement('button');
    editButton.dataset.action = 'edit';
    editButton.dataset.id = String(student.id);
    editButton.className = 'secondary';
    editButton.textContent = 'Edit';

    const deleteButton = document.createElement('button');
    deleteButton.dataset.action = 'delete';
    deleteButton.dataset.id = String(student.id);
    deleteButton.textContent = 'Delete';

    actionsCell.appendChild(editButton);
    actionsCell.appendChild(document.createTextNode(' '));
    actionsCell.appendChild(deleteButton);

    row.appendChild(nameCell);
    row.appendChild(emailCell);
    row.appendChild(courseCell);
    row.appendChild(actionsCell);
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
    nameInput.value = row.dataset.name || '';
    emailInput.value = row.dataset.email || '';
    courseInput.value = row.dataset.course || '';
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
