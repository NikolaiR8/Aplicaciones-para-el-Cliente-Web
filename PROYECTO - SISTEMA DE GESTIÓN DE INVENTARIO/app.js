document.addEventListener('DOMContentLoaded', () => {
    
    // --- LÓGICA DE LOGIN ---
    const loginForm = document.getElementById('loginForm');
    const loginScreen = document.getElementById('loginScreen');
    const dashboardScreen = document.getElementById('dashboardScreen');
    const loginError = document.getElementById('loginError');
    const btnLogout = document.getElementById('btnLogout');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('username').value.trim();
        const pass = document.getElementById('password').value.trim();

        if (user === 'admin' && pass === '1234') {
            loginScreen.classList.add('hidden');
            dashboardScreen.classList.remove('hidden');
            loginForm.reset();
            loginError.textContent = '';
        } else {
            loginError.textContent = 'Usuario o contraseña incorrectos.';
        }
    });

    btnLogout.addEventListener('click', () => {
        dashboardScreen.classList.add('hidden');
        loginScreen.classList.remove('hidden');
    });

    // --- LÓGICA DEL MENÚ LATERAL (Navegación SPA) ---
    const menuItems = document.querySelectorAll('.menu-item');
    const viewSections = document.querySelectorAll('.view-section');
    const headerTitle = document.getElementById('headerTitle');

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault(); // Evitar que el link salte

            // 1. Quitar 'active' de todos los botones y ponérselo al cliqueado
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // 2. Ocultar todas las secciones
            viewSections.forEach(section => section.classList.add('hidden'));

            // 3. Mostrar la sección correspondiente
            const targetId = item.getAttribute('data-target');
            document.getElementById(targetId).classList.remove('hidden');

            // 4. Cambiar el título principal
            headerTitle.textContent = item.textContent.replace(/[💻➕🛠️📊]/g, '').trim(); // Quita los emojis del título
        });
    });


    // --- LÓGICA DEL INVENTARIO (CRUD y Actualización de Vistas) ---
    const form = document.getElementById('inventoryForm');
    const tableBody = document.getElementById('tableBody');
    const maintTableBody = document.getElementById('maintTableBody');
    const btnCancel = document.getElementById('btnCancel');
    const formTitle = document.getElementById('formTitle');
    const btnSubmit = document.getElementById('btnSubmit');
    
    // Base de datos simulada
    let machines = [
        { id: 'LAB1-PC01', user: 'Clase Redes', status: 'Optimo', date: '2026-08-15' },
        { id: 'LAB1-PC02', user: 'Desconocido', status: 'Danado', date: '2026-05-30' },
        { id: 'LAB3-PC15', user: 'Laboratorio Libre', status: 'Mantenimiento', date: '2026-06-10' }
    ];

    let isEditing = false;
    let currentEditId = null;

    // Función principal que actualiza todo el sistema
    function updateSystemViews() {
        // 1. Actualizar Tabla Principal
        tableBody.innerHTML = '';
        
        // 2. Actualizar Tabla de Mantenimientos
        maintTableBody.innerHTML = '';

        // Contadores para reportes
        let countOptimo = 0, countMaint = 0, countDanado = 0;

        machines.forEach(machine => {
            // Formatear estado
            let statusText = '';
            if (machine.status === 'Optimo') { statusText = 'Óptimo'; countOptimo++; }
            else if (machine.status === 'Mantenimiento') { statusText = 'Mantenimiento'; countMaint++; }
            else if (machine.status === 'Danado') { statusText = 'Dañado'; countDanado++; }

            // Llenar tabla principal
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${machine.id}</strong></td>
                <td>${machine.user}</td>
                <td><span class="badge bg-${machine.status}">${statusText}</span></td>
                <td>${machine.date}</td>
                <td>
                    <button class="btn-primary btn-sm" onclick="editMachine('${machine.id}')">Actualizar</button>
                </td>
            `;
            tableBody.appendChild(tr);

            // Llenar tabla de mantenimientos solo si no está óptima
            if (machine.status !== 'Optimo') {
                const trMaint = document.createElement('tr');
                trMaint.innerHTML = `
                    <td><strong>${machine.id}</strong></td>
                    <td><span class="badge bg-${machine.status}">${statusText}</span></td>
                    <td>${machine.date}</td>
                `;
                maintTableBody.appendChild(trMaint);
            }
        });

        // 3. Actualizar Reportes
        document.getElementById('statTotal').textContent = machines.length;
        document.getElementById('statOptimos').textContent = countOptimo;
        document.getElementById('statMaint').textContent = countMaint;
        document.getElementById('statDañados').textContent = countDanado;
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');

        const id = document.getElementById('machineId').value.trim().toUpperCase();
        const user = document.getElementById('lastUser').value.trim();
        const status = document.getElementById('machineStatus').value;
        const date = document.getElementById('maintDate').value;

        let isValid = true;
        if (id === '') { document.getElementById('errorId').textContent = 'Obligatorio.'; isValid = false; }
        if (user === '') { document.getElementById('errorUser').textContent = 'Obligatorio.'; isValid = false; }
        if (status === '') { document.getElementById('errorStatus').textContent = 'Obligatorio.'; isValid = false; }
        if (date === '') { document.getElementById('errorDate').textContent = 'Obligatorio.'; isValid = false; }

        if (isValid) {
            if (isEditing) {
                const index = machines.findIndex(m => m.id === currentEditId);
                machines[index] = { id, user, status, date };
                alert('¡Estado actualizado!');
                exitEditMode();
            } else {
                if (machines.some(m => m.id === id)) {
                    document.getElementById('errorId').textContent = 'Este ID ya existe.';
                    return;
                }
                machines.push({ id, user, status, date });
                alert('¡Máquina registrada!');
                form.reset();
            }
            // Actualizar todas las pantallas y saltar al Control
            updateSystemViews();
            document.querySelector('[data-target="view-control"]').click(); 
        }
    });

    // Cargar datos en el formulario
    window.editMachine = function(id) {
        const machine = machines.find(m => m.id === id);
        if (machine) {
            document.getElementById('machineId').value = machine.id;
            document.getElementById('machineId').disabled = true; 
            document.getElementById('lastUser').value = machine.user;
            document.getElementById('machineStatus').value = machine.status;
            document.getElementById('maintDate').value = machine.date;
            
            isEditing = true;
            currentEditId = machine.id;
            
            formTitle.textContent = 'Actualizar Estado de Máquina';
            btnSubmit.textContent = 'Guardar Cambios';
            btnCancel.classList.remove('hidden');
            
            // Simular clic en el menú "Registrar/Editar PC" para ir a esa pantalla automáticamente
            document.querySelector('[data-target="view-registrar"]').click();
        }
    };

    function exitEditMode() {
        form.reset();
        isEditing = false;
        currentEditId = null;
        document.getElementById('machineId').disabled = false;
        formTitle.textContent = 'Registrar Nueva Máquina';
        btnSubmit.textContent = 'Guardar Máquina';
        btnCancel.classList.add('hidden');
        document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
    }

    btnCancel.addEventListener('click', exitEditMode);

    // Iniciar el sistema dibujando todo por primera vez
    updateSystemViews();
});