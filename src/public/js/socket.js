// Cliente de Socket.io: escucha los cambios del servidor y actualiza la vista sin recargar.
const socket = io();
const page = document.body.dataset.page;
const liveStatus = document.getElementById('live-status');

const escapeHtml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const formatPrice = (value) => `$${Number(value).toLocaleString('es-AR')}`;

// ---------- Estado de la conexión ----------

socket.on('connect', () => {
  if (liveStatus) {
    liveStatus.textContent = 'En vivo';
    liveStatus.classList.add('online');
  }
});

socket.on('disconnect', () => {
  if (liveStatus) {
    liveStatus.textContent = 'Sin conexión';
    liveStatus.classList.remove('online');
  }
});

// Texto visible de una fila, sin espacios de más, para comparar si cambió.
const rowText = (row) => row.textContent.replace(/\s+/g, ' ').trim();

// Resalta las filas nuevas o modificadas comparando con lo que se mostraba antes.
function renderRows(tbody, items, renderRow, emptyRow) {
  const previous = new Map(
    [...tbody.querySelectorAll('tr[data-id]')].map((row) => [row.dataset.id, rowText(row)])
  );

  tbody.innerHTML = items.length > 0 ? items.map(renderRow).join('') : emptyRow;

  tbody.querySelectorAll('tr[data-id]').forEach((row) => {
    if (previous.get(row.dataset.id) !== rowText(row)) {
      row.classList.add('highlight');
    }
  });
}

// ---------- Vista de servicios ----------

const servicesBody = document.getElementById('services-body');

const renderService = (service) => `
  <tr data-id="${escapeHtml(service.id)}">
    <td>${escapeHtml(service.name)}</td>
    <td>${escapeHtml(service.description)}</td>
    <td>${escapeHtml(service.duration)} min</td>
    <td>${formatPrice(service.price)}</td>
    <td>${escapeHtml(service.category)}</td>
    <td>
      <span class="badge ${service.available ? 'yes' : 'no'}">
        ${service.available ? 'Disponible' : 'No disponible'}
      </span>
    </td>
    <td>
      <button type="button" class="small" data-toggle="${escapeHtml(service.id)}" data-available="${service.available}">
        Cambiar disponibilidad
      </button>
    </td>
  </tr>`;

if (page === 'services' && servicesBody) {
  socket.on('services:updated', (services) => {
    renderRows(
      servicesBody,
      services,
      renderService,
      '<tr><td colspan="7" class="empty">Todavía no hay servicios cargados.</td></tr>'
    );
  });

  // Cambiar disponibilidad: usa la API REST. El servidor avisa por socket a todos los navegadores.
  servicesBody.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-toggle]');
    if (!button) return;

    button.disabled = true;
    try {
      const response = await fetch(`/api/services/${button.dataset.toggle}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: button.dataset.available !== 'true' }),
      });
      if (!response.ok) {
        const { error } = await response.json();
        alert(error);
      }
    } finally {
      button.disabled = false;
    }
  });

  // Crear servicio: también usa la API REST.
  const form = document.getElementById('service-form');
  const formMessage = document.getElementById('form-message');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    formMessage.textContent = '';

    const data = Object.fromEntries(new FormData(form));
    const body = {
      ...data,
      duration: Number(data.duration),
      price: Number(data.price),
      available: form.elements.available.checked,
    };

    const response = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      form.reset();
    } else {
      const { error } = await response.json();
      formMessage.textContent = error;
    }
  });
}

// ---------- Vista de reservas ----------

const bookingsBody = document.getElementById('bookings-body');

const renderBookingItem = (item) =>
  item.service
    ? `<li>${escapeHtml(item.service.name)} × ${item.quantity} (${formatPrice(item.service.price)} c/u)</li>`
    : `<li>Servicio eliminado × ${item.quantity}</li>`;

const renderBooking = (booking) => `
  <tr data-id="${escapeHtml(booking.id)}">
    <td>${escapeHtml(booking.clientName)}</td>
    <td>${escapeHtml(booking.clientEmail)}</td>
    <td>${escapeHtml(booking.date)}</td>
    <td>${escapeHtml(booking.time)}</td>
    <td><span class="badge status">${escapeHtml(booking.status)}</span></td>
    <td>
      ${
        booking.services.length > 0
          ? `<ul class="items">${booking.services.map(renderBookingItem).join('')}</ul>`
          : 'Sin servicios'
      }
    </td>
  </tr>`;

if (page === 'bookings' && bookingsBody) {
  socket.on('bookings:updated', (bookings) => {
    renderRows(
      bookingsBody,
      bookings,
      renderBooking,
      '<tr><td colspan="6" class="empty">Todavía no hay reservas.</td></tr>'
    );
  });
}
