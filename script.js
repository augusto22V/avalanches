const numeroWhatsApp = "595986210051";
const horarioApertura = 18;
const horarioCierre = 23.5;

let carrito = [];
let totalGeneral = 0;
/*
function estaAbierto() {
    const ahora = new Date();
    const hora = ahora.getHours() + ahora.getMinutes() / 60;
    return hora >= horarioApertura && hora < horarioCierre;
}

function actualizarEstadoLocal() {
    const elem = document.getElementById("estado-local");
    if (estaAbierto()) {
        elem.textContent = "ABIERTO AHORA 🔥";
        elem.className = "estado abierto";
    } else {
        elem.textContent = "CERRADO – Volvemos a las 18:00";
        elem.className = "estado cerrado";
    }
}
actualizarEstadoLocal();
setInterval(actualizarEstadoLocal, 60000);
*/
function cambiarCantidad(btn, cambio) {
    const span = btn.parentElement.querySelector(".cantidad");
    let qty = Number(span.textContent);
    qty = Math.max(1, qty + cambio);
    span.textContent = qty;
}

function agregarAlCarrito(btn, nombreBase, precioBase) {
    const card = btn.closest(".item");
    const qty = Number(card.querySelector(".cantidad").textContent);
    
    let extras = [];
    let extraCosto = 0;
    
    card.querySelectorAll('.extra-check:checked').forEach(check => {
        const extraNombre = check.dataset.extra;
        const extraPrecio = Number(check.dataset.precio);
        extras.push(extraNombre);
        extraCosto += extraPrecio;
        check.checked = false; // reset checkbox
    });
    
    const nombreCompleto = extras.length > 0 
        ? `${nombreBase} + ${extras.join(', ')}` 
        : nombreBase;
    
    const subtotal = (precioBase + extraCosto) * qty;
    
    const existe = carrito.find(item => item.nombre === nombreCompleto);
    if (existe) {
        existe.cantidad += qty;
        existe.total += subtotal;
    } else {
        carrito.push({ nombre: nombreCompleto, cantidad: qty, total: subtotal });
    }
    
    totalGeneral += subtotal;
    actualizarCarritoUI();
    
    btn.style.transform = "scale(1.08)";
    setTimeout(() => btn.style.transform = "scale(1)", 150);
    card.querySelector(".cantidad").textContent = "1";
}

function actualizarCarritoUI() {
    const lista = document.getElementById("listaCarrito");
    const totalElem = document.getElementById("totalCarrito");
    const contador = document.getElementById("contador-items");
    const enviarBtn = document.getElementById("enviar-btn");
    const vaciarBtn = document.getElementById("vaciar-btn");

    lista.innerHTML = "";

    carrito.forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.nombre} ×${item.cantidad} — ${item.total.toLocaleString('es-PY')} Gs`;
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
    const deliveryRadio = document.querySelector('input[name="tipoPedido"][value="delivery"]');
    const divDir = document.getElementById("divDireccion");
    const inputDir = document.getElementById("direccion");

    if (deliveryRadio.checked) {
        divDir.style.display = "block";
    } else {
        divDir.style.display = "none";
        inputDir.value = "";
    }
}

function enviarCarrito() {
    if (carrito.length === 0) return;
/*
    if (!estaAbierto()) {
        alert("¡Estamos cerrados ahora! 😅 Puedes armar el pedido, pero te responderemos cuando abramos a las 18:00.");
    }
*/
    const tipoPedido = document.querySelector('input[name="tipoPedido"]:checked').value;
    const direccion = tipoPedido === "delivery" ? document.getElementById("direccion").value.trim() : "";
    const pago = document.getElementById("pago").value || "No especificado";

    if (tipoPedido === "delivery" && !direccion) {
        alert("Para delivery, por favor ingresa la dirección.");
        return;
    }

    let mensaje = "¡Hola Avalanches! 👋 Quiero hacer este pedido:\n\n";

    carrito.forEach(item => {
        mensaje += `• ${item.nombre} ×${item.cantidad} — ${item.total.toLocaleString('es-PY')} Gs\n`;
    });

    mensaje += `\n💰 Total: ${totalGeneral.toLocaleString('es-PY')} Gs`;
    mensaje += `\n\n📦 Tipo: ${tipoPedido === "delivery" ? "Delivery (a domicilio)" : "Para llevar (paso a buscar)"}`;

    if (tipoPedido === "delivery") {
        mensaje += `\n📍 Dirección: ${direccion}`;
    } else {
        mensaje += `\n📍 Retiro en: Calle 10 frente Ferretería Caaguazú`;
    }

    mensaje += `\n💳 Pago: ${pago}`;
    mensaje += "\n\n¿En cuánto tiempo aprox lo tienen listo? 🙏 ¡Gracias!";

    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
}

// Inicializar
actualizarCarritoUI();
toggleDireccion();