const numeroWhatsApp = "595986210051";

let carrito = [];
let totalGeneral = 0;

function cambiarCantidad(btn, cambio) {
    const span = btn.parentElement.querySelector(".cantidad");
    if (!span) return;
    let qty = Number(span.textContent);
    qty = Math.max(1, qty + cambio);
    span.textContent = qty;
}

function agregarAlCarrito(btn, nombreBase, precioBase) {
    const card = btn.closest(".item");
    if (!card) return;

    const qtyElem = card.querySelector(".cantidad");
    const qty = qtyElem ? Number(qtyElem.textContent) : 1;

    let extras = [];
    let extraCosto = 0;

    card.querySelectorAll('.extra-check:checked').forEach(check => {
        const extraNombre = check.dataset.extra || "Extra";
        const extraPrecio = Number(check.dataset.precio) || 0;
        extras.push({ nombre: extraNombre, precio: extraPrecio });
        extraCosto += extraPrecio;
        check.checked = false;
    });

    const nombreCompleto = extras.length > 0 
        ? `${nombreBase} + ${extras.map(e => e.nombre).join(', ')}` 
        : nombreBase;

    const subtotal = (precioBase + extraCosto) * qty;

    const existe = carrito.find(item => item.nombre === nombreCompleto);
    if (existe) {
        existe.cantidad += qty;
        existe.total += subtotal;
        existe.extras = extras;
    } else {
        carrito.push({ 
            nombre: nombreCompleto, 
            cantidad: qty, 
            total: subtotal,
            basePrecio: precioBase * qty,
            extrasCosto: extraCosto * qty,
            extras
        });
    }

    totalGeneral += subtotal;
    actualizarCarritoUI();

    btn.style.transform = "scale(1.08)";
    setTimeout(() => btn.style.transform = "scale(1)", 150);
    if (qtyElem) qtyElem.textContent = "1";
}

function actualizarCarritoUI() {
    const lista = document.getElementById("listaCarrito");
    const totalElem = document.getElementById("totalCarrito");
    const contador = document.getElementById("contador-items");
    const enviarBtn = document.getElementById("enviar-btn");
    const vaciarBtn = document.getElementById("vaciar-btn");

    if (!lista || !totalElem || !contador || !enviarBtn || !vaciarBtn) return;

    lista.innerHTML = "";

    carrito.forEach(item => {
        const li = document.createElement("li");
        let texto = `${item.nombre} ×${item.cantidad} — ${item.total.toLocaleString('es-PY')} Gs`;
        if (item.extras && item.extras.length > 0) {
            texto += ` (base ${item.basePrecio.toLocaleString('es-PY')} + extras ${item.extrasCosto.toLocaleString('es-PY')})`;
        }
        li.textContent = texto;
        lista.appendChild(li);
    });

    totalElem.textContent = `Total: ${totalGeneral.toLocaleString('es-PY')} Gs`;
    contador.textContent = carrito.length;
    enviarBtn.disabled = carrito.length === 0;
    vaciarBtn.style.display = carrito.length > 0 ? "block" : "none";
}

function vaciarCarrito() {
    if (confirm("¿Vaciar todo el pedido?")) {
        carrito = [];
        totalGeneral = 0;
        actualizarCarritoUI();
    }
}

function toggleDireccion() {
    const deliveryChecked = document.querySelector('input[name="tipoPedido"][value="delivery"]')?.checked;
    const divDir = document.getElementById("divDireccion");
    if (divDir) {
        divDir.style.display = deliveryChecked ? "block" : "none";
    }
}

function obtenerCoordenadas() {
    const btn = document.getElementById("btn-ubicacion");
    const display = document.getElementById("coords-display");

    if (!btn || !display) return;

    btn.disabled = true;
    btn.textContent = "Obteniendo...";

    if (!navigator.geolocation) {
        alert("Tu dispositivo no permite geolocalización.");
        resetBtn();
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude.toFixed(6);
            const lon = position.coords.longitude.toFixed(6);
            display.value = `${lat}, ${lon}`;
            resetBtn();
        },
        () => {
            alert("No se pudo obtener la ubicación. Permite el acceso en ajustes.");
            resetBtn();
        },
        { enableHighAccuracy: true, timeout: 8000 }
    );
}

function resetBtn() {
    const btn = document.getElementById("btn-ubicacion");
    if (btn) {
        btn.disabled = false;
        btn.textContent = "📍 Obtener coordenadas actuales";
    }
}

function enviarCarrito() {
    if (carrito.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }

    // Lectura segura
    const tipoInput = document.querySelector('input[name="tipoPedido"]:checked');
    const tipoPedido = tipoInput ? tipoInput.value : 'delivery';

    const pagoElem = document.getElementById("pago");
    const pago = pagoElem ? (pagoElem.value || "No especificado") : "No especificado";

    const coordsElem = document.getElementById("coords-display");
    const coords = coordsElem ? coordsElem.value.trim() : "";

    let mensaje = "¡Hola Avalanches! 👋 Quiero hacer este pedido:\n\n";

    carrito.forEach(item => {
        mensaje += `• ${item.nombre} ×${item.cantidad} — ${item.total.toLocaleString('es-PY')} Gs\n`;
    });

    mensaje += `\n💰 Total: ${totalGeneral.toLocaleString('es-PY')} Gs`;
    mensaje += `\n\n📦 Tipo: ${tipoPedido === "delivery" ? "Delivery (a domicilio)" : "Para llevar (paso a buscar)"}`;

    if (tipoPedido === "delivery") {
        if (coords) {
            const linkMaps = `https://maps.google.com/?q=${coords.replace(', ', ',')}`;
            mensaje += `\n\n📍 Coordenadas actuales: ${coords}`;
            mensaje += `\nLink Maps: ${linkMaps}`;
        } else {
            mensaje += `\n\n📍 Ubicación: (coordinar por WhatsApp o llamada – envíame tu ubicación actual)`;
        }
    } else {
        mensaje += `\n\n📍 Retiro en local: Calle 10 frente a Ferretería Caaguazú`;
    }

    mensaje += `\n💳 Pago: ${pago}`;
    mensaje += "\n\n¿En cuánto tiempo aprox lo tienen listo? 🙏 ¡Gracias!";

    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
}

// Inicialización segura
document.addEventListener("DOMContentLoaded", () => {
    actualizarCarritoUI();
    toggleDireccion();
    const btnUbic = document.getElementById("btn-ubicacion");
    if (btnUbic) {
        btnUbic.addEventListener("click", obtenerCoordenadas);
    }
});
