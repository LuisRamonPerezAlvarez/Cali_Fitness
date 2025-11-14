(function () {
  const $ = id => document.getElementById(id);
  const form = $('formRegistro');
  const tabla = $('tablaUsuarios');
  const buscar = $('buscar');
  const notificacion = $('notificacion');
  const modal = $('modalRenovar');
  const modalNombre = $('modalNombre');
  const btnSemana = $('btnSemana');
  const btnMes = $('btnMes');
  const btnCancelar = $('btnCancelar');

  let usuarioRenovarID = null;

  function generarID() {
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    let max = 0;
    usuarios.forEach(u => {
      const num = parseInt(u.id?.replace('CF', ''), 10);
      if (!isNaN(num) && num > max) max = num;
    });
    return 'CF' + String(max + 1).padStart(3, '0');
  }

  function calcularDiasRestantes(fecha, tipo) {
    const hoy = new Date();
    const inicio = new Date(fecha);
    const total = tipo === 'semana' ? 7 : 30;
    const diff = Math.floor((hoy - inicio) / (1000 * 60 * 60 * 24));
    return Math.max(total - diff, 0);
  }

  function mostrarUsuarios(filtro = '') {
    if (!tabla) return;
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const texto = filtro.toLowerCase().trim();
    tabla.innerHTML = '';

    const filtrados = usuarios.filter(u =>
      u.id.toLowerCase().includes(texto) ||
      u.nombre.toLowerCase().includes(texto)
    );

    if (filtrados.length === 0) {
      tabla.innerHTML = `<tr><td colspan="10" style="text-align:center;color:gray;">No hay resultados</td></tr>`;
      return;
    }

    filtrados.forEach(u => {
      const dias = calcularDiasRestantes(u.fechaRegistro, u.suscripcion);
      const tr = document.createElement('tr');
      if (dias === 0) tr.classList.add('vencido');

      tr.innerHTML = `
        <td>${u.id}</td>
        <td>${u.nombre}</td>
        <td>${u.edad}</td>
        <td>${u.sexo}</td>
        <td>${u.telefono}</td>
        <td>${u.correo}</td>
        <td>${u.suscripcion}</td>
        <td>${u.fechaRegistro}</td>
        <td>${dias === 0 ? "<span class='tag-vencido'>Vencido</span>" : dias + " días"}</td>
        <td>
          <button class="btn-renovar" onclick="abrirModalRenovar('${u.id}')">🔄</button>
          <button class="btn-danger btn-delete" onclick="eliminarUsuario('${u.id}')">🗑️</button>
        </td>
      `;
      tabla.appendChild(tr);
    });
  }

  // Registrar usuario
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const nuevo = {
        id: generarID(),
        nombre: $('nombre').value.trim(),
        edad: $('edad').value.trim(),
        sexo: $('sexo').value,
        telefono: $('telefono').value.trim(),
        correo: $('correo').value.trim(),
        suscripcion: $('suscripcion').value,
        fechaRegistro: new Date().toISOString().split('T')[0]
      };
      const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
      usuarios.push(nuevo);
      localStorage.setItem('usuarios', JSON.stringify(usuarios));
      mostrarNotificacion(`✅ Usuario ${nuevo.nombre} registrado (ID ${nuevo.id})`);
      form.reset();
      window.location.href = 'index.html';
    });
  }

  if (buscar) buscar.addEventListener('input', () => mostrarUsuarios(buscar.value));

  window.mostrarUsuarios = mostrarUsuarios;

  window.eliminarUsuario = function (id) {
    if (confirm(`¿Deseas eliminar al usuario ${id}?`)) {
      let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
      usuarios = usuarios.filter(u => u.id !== id);
      localStorage.setItem('usuarios', JSON.stringify(usuarios));
      mostrarUsuarios(buscar ? buscar.value : '');
      mostrarNotificacion(`🗑️ Usuario ${id} eliminado`);
    }
  };

  // ✅ Abrir modal de renovación
  window.abrirModalRenovar = function (id) {
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuario = usuarios.find(u => u.id === id);
    if (!usuario) return;

    usuarioRenovarID = id;
    modalNombre.textContent = `Renovar a: ${usuario.nombre} (${usuario.id})`;
    modal.style.display = 'flex';
  };

  // ✅ Cerrar modal
  function cerrarModal() {
    modal.style.display = 'none';
    usuarioRenovarID = null;
  }

  btnCancelar.addEventListener('click', cerrarModal);

  // ✅ Renovar suscripción (Semana o Mes)
  function renovarSuscripcion(tipo) {
    if (!usuarioRenovarID) return;
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const index = usuarios.findIndex(u => u.id === usuarioRenovarID);
    if (index === -1) return;

    usuarios[index].suscripcion = tipo;
    usuarios[index].fechaRegistro = new Date().toISOString().split('T')[0];

    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    mostrarUsuarios(buscar ? buscar.value : '');
    mostrarNotificacion(`🔄 ${usuarios[index].nombre} renovado con plan ${tipo}`);
    cerrarModal();
  }

  btnSemana.addEventListener('click', () => renovarSuscripcion('semana'));
  btnMes.addEventListener('click', () => renovarSuscripcion('mes'));

  window.borrarDatos = function () {
    if (confirm('¿Seguro que deseas borrar TODOS los usuarios registrados?')) {
      localStorage.removeItem('usuarios');
      mostrarUsuarios();
      mostrarNotificacion('🗑️ Todos los usuarios fueron eliminados');
    }
  };

  function mostrarNotificacion(mensaje) {
    if (!notificacion) return;
    notificacion.textContent = mensaje;
    notificacion.classList.add('visible');
    setTimeout(() => notificacion.classList.remove('visible'), 2000);
  }

  if (tabla) mostrarUsuarios();
})();
