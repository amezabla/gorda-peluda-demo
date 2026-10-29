const purchaseSeed = [
  {
    reference: 'CMP-001',
    date: '2026-10-02',
    provider: 'Proveedor Alfa',
    description: 'Material de papelería para oficina',
    amount: 120.5
  },
  {
    reference: 'CMP-002',
    date: '2026-10-08',
    provider: 'Casa Beta',
    description: 'Compra de muebles para sala',
    amount: 845.75
  },
  {
    reference: 'CMP-003',
    date: '2026-10-12',
    provider: 'Muebles Gamma',
    description: 'Suministros de limpieza',
    amount: 230.1
  }
];

const state = {
  currentView: 'inicio',
  purchases: [...purchaseSeed],
  selectedPurchaseReference: null,
  searchTerm: '',
  controlRange: { start: '', end: '' }
};

const navButtons = Array.from(document.querySelectorAll('.nav-btn'));
const views = {
  inicio: document.getElementById('inicio-view'),
  compras: document.getElementById('compras-view'),
  'nueva-compra': document.getElementById('nueva-compra-view'),
  'detalle-compra': document.getElementById('detalle-compra-view'),
  control: document.getElementById('control-view'),
  ventas: document.getElementById('ventas-view'),
  bancos: document.getElementById('bancos-view')
};

const purchaseListEl = document.getElementById('purchase-list');
const purchaseForm = document.getElementById('purchase-form');
const purchaseSearchEl = document.getElementById('purchase-search');
const newPurchaseBtn = document.getElementById('new-purchase-btn');
const cancelPurchaseBtn = document.getElementById('cancel-purchase-btn');
const purchaseDetailEl = document.getElementById('purchase-detail');
const controlStartEl = document.getElementById('control-start');
const controlEndEl = document.getElementById('control-end');
const controlSummaryEl = document.getElementById('control-summary');
const controlListEl = document.getElementById('control-list');

function formatCurrency(value) {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(value));
}

function openView(viewName) {
  state.currentView = viewName;

  Object.entries(views).forEach(([key, element]) => {
    element.classList.toggle('active', key === viewName);
  });

  navButtons.forEach((button) => {
    const isActive = button.dataset.view === viewName;
    button.classList.toggle('active', isActive);
  });

  if (viewName === 'compras') {
    renderPurchaseList();
  }

  if (viewName === 'inicio') {
    renderHomeSummary();
  }

  if (viewName === 'control') {
    renderControlReport();
  }

  if (viewName === 'detalle-compra') {
    renderPurchaseDetail();
  }
}

function renderHomeSummary() {
  const count = state.purchases.length;
  const total = state.purchases.reduce((sum, purchase) => sum + Number(purchase.amount), 0);

  const countEl = document.getElementById('home-purchase-count');
  const totalEl = document.getElementById('home-purchase-total');

  countEl.textContent = String(count);
  totalEl.textContent = `${formatCurrency(total)} visual`;
}

function renderPurchaseList() {
  const filteredPurchases = state.purchases.filter((purchase) => {
    const query = state.searchTerm.trim().toLowerCase();
    if (!query) return true;

    return (
      purchase.reference.toLowerCase().includes(query) ||
      purchase.provider.toLowerCase().includes(query)
    );
  });

  purchaseListEl.innerHTML = '';

  if (filteredPurchases.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'No hay resultados. Intenta otra búsqueda o crea una compra nueva.';
    purchaseListEl.appendChild(empty);
    return;
  }

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  const headRow = document.createElement('tr');
  ['Referencia', 'Fecha', 'Proveedor', 'Descripción', 'Importe', 'Detalle'].forEach((label) => {
    const th = document.createElement('th');
    th.textContent = label;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  filteredPurchases.forEach((purchase) => {
    const row = document.createElement('tr');

    const referenceCell = document.createElement('td');
    referenceCell.textContent = purchase.reference;

    const dateCell = document.createElement('td');
    dateCell.textContent = purchase.date;

    const providerCell = document.createElement('td');
    providerCell.textContent = purchase.provider;

    const descriptionCell = document.createElement('td');
    descriptionCell.textContent = purchase.description;

    const amountCell = document.createElement('td');
    amountCell.textContent = formatCurrency(purchase.amount);

    const actionCell = document.createElement('td');
    const actionButton = document.createElement('button');
    actionButton.type = 'button';
    actionButton.className = 'table-action';
    actionButton.textContent = 'Ver detalle';
    actionButton.addEventListener('click', () => {
      state.selectedPurchaseReference = purchase.reference;
      openView('detalle-compra');
    });
    actionCell.appendChild(actionButton);

    row.append(referenceCell, dateCell, providerCell, descriptionCell, amountCell, actionCell);
    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  purchaseListEl.appendChild(table);
}

function showFormErrors(errors) {
  const fields = ['reference', 'date', 'provider', 'description', 'amount'];

  fields.forEach((fieldName) => {
    const field = document.getElementById(fieldName);
    const errorEl = document.querySelector(`[data-error-for="${fieldName}"]`);

    if (!field || !errorEl) return;

    const fieldError = errors[fieldName] || '';
    errorEl.textContent = fieldError;
    field.classList.toggle('error-input', Boolean(fieldError));
  });
}

function resetFormState() {
  purchaseForm.reset();
  showFormErrors({});
}

function validatePurchase(formData) {
  const errors = {};

  if (!formData.reference || !formData.reference.trim()) {
    errors.reference = 'La referencia es obligatoria.';
  }

  if (!formData.date) {
    errors.date = 'La fecha es obligatoria.';
  }

  if (!formData.provider) {
    errors.provider = 'Selecciona un proveedor ficticio.';
  }

  if (!formData.description || !formData.description.trim()) {
    errors.description = 'La descripción es obligatoria.';
  }

  const amountValue = Number(formData.amount);
  if (formData.amount === '' || formData.amount === null || formData.amount === undefined) {
    errors.amount = 'El importe es obligatorio.';
  } else if (!Number.isFinite(amountValue) || amountValue <= 0) {
    errors.amount = 'El importe debe ser un número mayor que cero.';
  }

  return errors;
}

function handlePurchaseSubmit(event) {
  event.preventDefault();

  const formData = {
    reference: document.getElementById('reference').value.trim(),
    date: document.getElementById('date').value,
    provider: document.getElementById('provider').value,
    description: document.getElementById('description').value.trim(),
    amount: document.getElementById('amount').value
  };

  const errors = validatePurchase(formData);
  showFormErrors(errors);

  if (Object.keys(errors).length > 0) {
    return;
  }

  state.purchases.unshift({
    reference: formData.reference,
    date: formData.date,
    provider: formData.provider,
    description: formData.description,
    amount: Number(formData.amount)
  });

  const successMessage = document.createElement('div');
  successMessage.className = 'message-box';
  successMessage.textContent = 'Compra guardada correctamente. La compra se ha añadido a la vista de compras.';

  const purchaseView = document.getElementById('compras-view');
  purchaseView.insertBefore(successMessage, purchaseView.firstChild);

  resetFormState();
  openView('compras');
  state.searchTerm = '';
  purchaseSearchEl.value = '';
}

function renderPurchaseDetail() {
  const purchase = state.purchases.find((entry) => entry.reference === state.selectedPurchaseReference);

  if (!purchase) {
    purchaseDetailEl.innerHTML = '<div class="empty-state">No se seleccionó una compra.</div>';
    return;
  }

  purchaseDetailEl.innerHTML = '';

  const title = document.createElement('h3');
  title.textContent = `Compra ${purchase.reference}`;

  const detailGrid = document.createElement('div');
  detailGrid.className = 'detail-grid';

  const fields = [
    ['Referencia', purchase.reference],
    ['Fecha', purchase.date],
    ['Proveedor', purchase.provider],
    ['Descripción', purchase.description],
    ['Importe', `${formatCurrency(purchase.amount)}`],
    ['Estado', 'Ejemplo visual']
  ];

  fields.forEach(([label, value]) => {
    const item = document.createElement('div');
    item.className = 'detail-item';

    const labelEl = document.createElement('span');
    labelEl.className = 'detail-label';
    labelEl.textContent = label;

    const valueEl = document.createElement('p');
    valueEl.className = 'detail-value';
    valueEl.textContent = value;

    item.append(labelEl, valueEl);
    detailGrid.appendChild(item);
  });

  const backButton = document.createElement('button');
  backButton.type = 'button';
  backButton.className = 'secondary-btn';
  backButton.textContent = 'Volver al listado';
  backButton.addEventListener('click', () => openView('compras'));

  purchaseDetailEl.append(title, detailGrid, backButton);
}

function renderControlReport() {
  const startDate = controlStartEl.value;
  const endDate = controlEndEl.value;
  const filteredPurchases = state.purchases.filter((purchase) => {
    if (!startDate && !endDate) return true;

    if (startDate && purchase.date < startDate) return false;
    if (endDate && purchase.date > endDate) return false;
    return true;
  });

  if (startDate && endDate && startDate > endDate) {
    controlSummaryEl.innerHTML = '';
    const message = document.createElement('div');
    message.className = 'message-box';
    message.textContent = 'La fecha inicial no puede ser posterior a la final.';
    controlSummaryEl.appendChild(message);
    controlListEl.innerHTML = '<div class="empty-state">No hay resultados para mostrar con ese rango.</div>';
    return;
  }

  const total = filteredPurchases.reduce((sum, purchase) => sum + Number(purchase.amount), 0);
  controlSummaryEl.innerHTML = '';

  const summaryItems = [
    { label: 'Compras filtradas', value: String(filteredPurchases.length) },
    { label: 'Suma de importes', value: `${formatCurrency(total)}` },
    { label: 'Rango', value: startDate || endDate ? `${startDate || '—'} a ${endDate || '—'}` : 'Sin filtros' }
  ];

  summaryItems.forEach((item) => {
    const wrapper = document.createElement('div');
    const strong = document.createElement('strong');
    const value = document.createElement('span');
    strong.textContent = item.label;
    value.textContent = item.value;
    wrapper.append(strong, value);
    controlSummaryEl.appendChild(wrapper);
  });

  if (filteredPurchases.length === 0) {
    controlListEl.innerHTML = '<div class="empty-state">No hay compras para este filtro.</div>';
    return;
  }

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  const headRow = document.createElement('tr');
  ['Referencia', 'Fecha', 'Proveedor', 'Importe'].forEach((label) => {
    const th = document.createElement('th');
    th.textContent = label;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  filteredPurchases.forEach((purchase) => {
    const row = document.createElement('tr');
    [purchase.reference, purchase.date, purchase.provider, formatCurrency(purchase.amount)].forEach((cellValue) => {
      const td = document.createElement('td');
      td.textContent = cellValue;
      row.appendChild(td);
    });
    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  controlListEl.innerHTML = '';
  controlListEl.appendChild(table);
}

navButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const target = button.dataset.view;
    if (target === 'compras') {
      state.searchTerm = '';
      purchaseSearchEl.value = '';
    }
    openView(target);
  });
});

newPurchaseBtn.addEventListener('click', () => {
  resetFormState();
  openView('nueva-compra');
});

cancelPurchaseBtn.addEventListener('click', () => {
  resetFormState();
  openView('compras');
});
purchaseSearchEl.addEventListener('input', (event) => {
  state.searchTerm = event.target.value;
  renderPurchaseList();
});
purchaseForm.addEventListener('submit', handlePurchaseSubmit);
document.getElementById('apply-control-filter').addEventListener('click', () => {
  state.controlRange.start = controlStartEl.value;
  state.controlRange.end = controlEndEl.value;
  renderControlReport();
});
document.getElementById('clear-control-filter').addEventListener('click', () => {
  controlStartEl.value = '';
  controlEndEl.value = '';
  state.controlRange = { start: '', end: '' };
  renderControlReport();
});

renderHomeSummary();
renderPurchaseList();
renderControlReport();
openView('inicio');
