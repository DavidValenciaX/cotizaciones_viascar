const initialData = {
    "documento": {
        "tipo": "Cotización",
        "fecha_emision": "2025-11-14" // Format YYYY-MM-DD for input type=date
    },
    "emisor": {
        "empresa": "VIASCAR Ingeniería S.A.S.",
        "representante_legal": "Carolina Valencia Álvarez",
        "nit": "901728845-0",
        "contacto": {
            "email": "viascar.ing@gmail.com",
            "telefono": "(305) 322-9035"
        }
    },
    "receptor": {
        "empresa": "<Ingrese el nombre de la empresa>"
    },
    "items": [
        {
            "descripcion": "Hospedaje de <Ingrese el nombre de la persona>\nDel <Ingrese la fecha de inicio> al <Ingrese la fecha de fin> del año <Ingrese el año>",
            "cantidad": "<Ingrese la cantidad de noches>",
            "unidad": "Noches",
            "total_linea": ""
        }
    ],
    "financiero": {
        "moneda": "COP",
        "subtotal": "",
        "total": ""
    },
    "notas": [
        "La cotización es válida por 7 días.",
        "La fecha de ejecución del servicio se coordinará según disponibilidad.",
        "<Ingrese cualquier otra nota adicional>"
    ]
};

document.addEventListener('DOMContentLoaded', function () {
    loadInitialData();
    calculateTotals();

    // Event delegation for inputs
    document.getElementById('quote-table').addEventListener('input', function (e) {
        if (e.target.classList.contains('qty-input') || e.target.classList.contains('price-input')) {
            updateRowTotal(e.target.closest('tr'));
            calculateTotals();
        }
    });
});

function loadInitialData() {
    // Header Data
    document.getElementById('company-name').textContent = "VIASCAR"; // Hardcoded in HTML but good to know
    // Use current date
    const now = new Date();
    // Format as YYYY-MM-DD for consistency if needed, but here we just need the string for formatDate
    // Actually, formatDate now handles the date object creation better, so we can pass the ISO string or just the date object if we adjusted formatDate.
    // But let's stick to passing a string that works with the new formatDate, or just pass the current date object and adjust formatDate?
    // The user provided specific code for formatDate that takes a string.
    // Let's generate a string in YYYY-MM-DD format for today to be safe and consistent with previous usage.
    const todayString = now.toISOString().split('T')[0];
    document.getElementById('quote-date-display').textContent = formatDate(todayString);

    // Sender Data
    document.getElementById('sender-rep').textContent = initialData.emisor.representante_legal;
    document.getElementById('sender-nit').textContent = initialData.emisor.nit;
    document.getElementById('sender-email').textContent = initialData.emisor.contacto.email;
    document.getElementById('sender-phone').textContent = initialData.emisor.contacto.telefono;

    // Recipient Data
    document.getElementById('recipient-name').value = initialData.receptor.empresa;

    // Footer Contact
    document.getElementById('footer-phone').textContent = initialData.emisor.contacto.telefono;
    document.getElementById('footer-email').textContent = initialData.emisor.contacto.email;

    // Signature
    document.getElementById('sig-name').textContent = initialData.emisor.representante_legal;
    document.getElementById('sig-nit').textContent = "NIT: " + initialData.emisor.nit;

    // Notes
    const notesContainer = document.getElementById('notes-content');
    notesContainer.innerHTML = initialData.notas.map(note => `<p>${note}</p>`).join('');

    // Items
    const tbody = document.querySelector('#quote-table tbody');
    tbody.innerHTML = ''; // Clear existing
    initialData.items.forEach(item => {
        addItemRow(item);
    });
}

function addItemRow(item = {}) {
    const tbody = document.querySelector('#quote-table tbody');
    const newRow = document.createElement('tr');

    // Calculate unit price if not provided but total is
    let unitPrice = 0;
    if (item.total_linea && item.cantidad) {
        unitPrice = item.total_linea / item.cantidad;
    }

    newRow.innerHTML = `
        <td class="col-desc"><textarea rows="2">${item.descripcion || ''}</textarea></td>
        <td class="col-qty"><input type="number" value="${item.cantidad || 1}" min="1" class="qty-input"></td>
        <td class="col-unit"><input type="text" value="${item.unidad || 'Und'}" class="unit-input"></td>
        <td class="col-price"><input type="number" value="${unitPrice}" class="price-input"></td>
        <td class="col-total">${formatCurrency(item.total_linea || 0)}</td>
        <td class="col-action no-print"><button class="btn-remove" onclick="removeRow(this)">×</button></td>
    `;

    // Store raw total for calculation
    newRow.dataset.total = item.total_linea || 0;

    tbody.appendChild(newRow);
}

function addRow() {
    addItemRow();
    calculateTotals();
}

function removeRow(button) {
    const row = button.closest('tr');
    row.remove();
    calculateTotals();
}

function updateRowTotal(row) {
    const qty = parseFloat(row.querySelector('.qty-input').value) || 0;
    const price = parseFloat(row.querySelector('.price-input').value) || 0;
    const total = qty * price;
    row.querySelector('.col-total').textContent = formatCurrency(total);
    row.dataset.total = total;
}

function calculateTotals() {
    let subtotal = 0;
    const rows = document.querySelectorAll('#quote-table tbody tr');

    rows.forEach(row => {
        subtotal += parseFloat(row.dataset.total) || 0;
    });

    // In this specific case, subtotal = total (no IVA displayed separately in screenshot/JSON)
    // But we keep the variables for flexibility
    const total = subtotal;

    document.getElementById('subtotal-display').textContent = formatCurrency(subtotal);
    document.getElementById('total-display').textContent = formatCurrency(total);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);
}

function formatDate(dateString) {
    // Basic formatting, can be improved
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    // Fix for timezone issues with simple dates, append T12:00:00
    const date = new Date(dateString.includes('T') ? dateString : dateString + 'T12:00:00');
    return date.toLocaleDateString('es-ES', options);
}
