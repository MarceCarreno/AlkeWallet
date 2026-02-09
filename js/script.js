
// VARIABLES GLOBALES

let saldo = localStorage.getItem("saldo")
  ? parseInt(localStorage.getItem("saldo"))
  : 60000;

let contactoSeleccionado = null;


// FUNCIONES STORAGE

function guardarSaldo() {
  localStorage.setItem("saldo", saldo);
}

function obtenerContactos() {
  let contactos = localStorage.getItem("contactos");

  if (!contactos) {
    contactos = JSON.stringify([
      { id: 1, nombre: "John Doe" },
      { id: 2, nombre: "Jane Smith" },
      { id: 3, nombre: "Carlos Pérez" }
    ]);

    localStorage.setItem("contactos", contactos);
  }

  return JSON.parse(contactos);
}

function guardarContactos(contactos) {
  localStorage.setItem("contactos", JSON.stringify(contactos));
}

function obtenerTransacciones() {
  let transacciones = localStorage.getItem("transacciones");

  if (!transacciones) {
    transacciones = JSON.stringify([]);
    localStorage.setItem("transacciones", transacciones);
  }

  return JSON.parse(transacciones);
}

function agregarTransaccion(tipo, monto, concepto = "") {
  let transacciones = obtenerTransacciones();

  transacciones.unshift({
    tipo,
    monto,
    concepto,
    fecha: new Date().toLocaleDateString()
  });

  localStorage.setItem("transacciones", JSON.stringify(transacciones));
}

// FUNCIONES UI

function cargarContactos() {

  let contactos = obtenerContactos();
  let html = "";

  contactos.forEach(c => {
    html += `
      <li class="list-group-item contact-item" 
          data-id="${c.id}" 
          data-nombre="${c.nombre}">
          ${c.nombre}
      </li>`;
  });

  $("#contactList").html(html);

  $(".contact-item").click(function () {

    $(".contact-item").removeClass("selected");
    $(this).addClass("selected");

    contactoSeleccionado = {
      id: $(this).data("id"),
      nombre: $(this).data("nombre")
    };

  });

  //  AUTO SELECCIONAR PRIMER CONTACTO
  let primer = $(".contact-item").first();

  if (primer.length) {
    primer.addClass("selected");

    contactoSeleccionado = {
      id: primer.data("id"),
      nombre: primer.data("nombre")
    };
  }
}


function cargarTransacciones() {

  let transacciones = obtenerTransacciones();
  let html = "";

  transacciones.forEach(t => {

    let signo = t.tipo === "deposito" ? "+" : "-";
    let color = t.tipo === "deposito"
      ? "text-success"
      : "text-danger";

    html += `
      <li class="list-group-item d-flex justify-content-between">
        <span>${t.concepto}</span>
        <span class="${color}">
          ${signo}$${t.monto.toLocaleString()}
        </span>
      </li>`;
  });

  $("#transactionsList").html(html);
}


// DOCUMENT READY
$(document).ready(function () {

  console.log("✔ script cargado");


  // LOGIN
  $("#loginForm").submit(function (e) {

    e.preventDefault();

    let email = $("#email").val().trim();
    let pass = $("#password").val();

    if (email === "admin@gmail.com" && pass === "1234") {

      guardarSaldo();
      window.location = "menu.html";

    } else {
      alert("Credenciales incorrectas");
    }
  });


  // MENU
  if ($("#balance").length) {

    $("#balance").text("$" + saldo.toLocaleString());
    $("#menu").hide().fadeIn(800);
  }


  // DEPOSITO
  $("#depositForm").submit(function (e) {

    e.preventDefault();

    let monto = parseInt($("#depositAmount").val());

    if (!monto || monto <= 0) {
      alert("Monto inválido");
      return;
    }

    saldo += monto;
    guardarSaldo();

    agregarTransaccion("deposito", monto, "Depósito");

    alert("Depósito realizado");
    window.location = "menu.html";
  });


  // CONTACTOS
  if ($("#contactList").length) {
    cargarContactos();
  }

  // AGREGAR CONTACTO NUEVO
$("#addContactForm").submit(function (e) {

  e.preventDefault();

  let nombre = $("#newContactName").val().trim();

  if (!nombre) {
    alert("Ingrese un nombre");
    return;
  }

  let contactos = obtenerContactos();

  let nuevo = {
    id: Date.now(),
    nombre: nombre
  };

  contactos.push(nuevo);

  guardarContactos(contactos);

  $("#newContactName").val("");

  cargarContactos();

});


  // ENVIAR DINERO
  $("#sendForm").submit(function (e) {

    e.preventDefault();

    if (!contactoSeleccionado) {
      alert("Seleccione un contacto");
      return;
    }

    let monto = parseInt($("#sendAmount").val());
    let concepto = $("#concepto").val();

    if (!monto || monto <= 0) {
      alert("Monto inválido");
      return;
    }

    if (saldo < monto) {
      alert("Saldo insuficiente");
      return;
    }

    saldo -= monto;
    guardarSaldo();

    agregarTransaccion(
      "envio",
      monto,
      concepto || "Envío a " + contactoSeleccionado.nombre
    );

    alert("Transferencia enviada");
    window.location = "menu.html";
  });


  // BUSCAR CONTACTOS
  $("#searchContact").keyup(function () {

    let value = $(this).val().toLowerCase();

    $("#contactList li").filter(function () {

      $(this).toggle(
        $(this).text().toLowerCase().indexOf(value) > -1
      );

    });

  });


  // TRANSACCIONES
  if ($("#transactionsList").length) {
    cargarTransacciones();
  }

});
