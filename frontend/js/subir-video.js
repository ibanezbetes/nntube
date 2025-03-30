// Variables globales
let currentUser = null;

// Ejecutar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si hay usuario en sesión
    currentUser = checkSession();
    
    if (currentUser) {
        // Mostrar el nombre del usuario
        document.getElementById('user-name').textContent = currentUser.nombre_usuario;
        
        // Cargar categorías
        loadCategorias();
        
        // Configurar eventos
        setupEventListeners();
    }
});

// Verificar si hay una sesión activa
function checkSession() {
    const usuarioJSON = localStorage.getItem('usuario');
    
    if (!usuarioJSON) {
        // Si no hay un usuario en sesión, redireccionar al login
        window.location.href = 'login.html';
        return null;
    }
    
    return JSON.parse(usuarioJSON);
}

// Cargar categorías desde la API
async function loadCategorias() {
    try {
        const response = await fetch(`${API_URL}/generos`);
        
        if (!response.ok) {
            throw new Error('Error al cargar las categorías');
        }
        
        const categorias = await response.json();
        
        // Llenar el select de géneros
        const selectGenero = document.getElementById('id_genero');
        
        categorias.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria.id_genero;
            option.textContent = categoria.nombre;
            selectGenero.appendChild(option);
        });
        
        // Cargar las categorías en la barra lateral
        displayCategoriasLateral(categorias);
    } catch (error) {
        console.error('Error:', error);
        showError('No se pudieron cargar las categorías');
    }
}

// Mostrar categorías en la barra lateral
function displayCategoriasLateral(categorias) {
    const categoriasLista = document.getElementById('categorias-lista');
    const separatorElement = document.querySelector('.separator');
    
    // Mostrar solo las primeras 10 categorías
    const categoriasSlice = categorias.slice(0, 10);
    
    const categoriaItems = categoriasSlice.map(categoria => `
        <li class="categoria-item">
            <a href="../index.html?categoria=${categoria.id_genero}">
                <i class="fas fa-tag"></i> ${categoria.nombre}
            </a>
        </li>
    `).join('');
    
    // Insertar después del separador
    separatorElement.insertAdjacentHTML('afterend', categoriaItems);
}

// Configurar los event listeners
function setupEventListeners() {
    // Evento de cierre de sesión
    document.getElementById('btn-logout').addEventListener('click', handleLogout);
    
    // Evento de cambio en la URL del video para mostrar la vista previa
    const urlVideoInput = document.getElementById('url_video');
    urlVideoInput.addEventListener('blur', updateVideoPreview);
    
    // Evento de cancelar formulario
    document.getElementById('btn-cancel').addEventListener('click', () => {
        window.location.href = 'dashboard.html';
    });
    
    // Evento de envío del formulario
    const uploadForm = document.getElementById('upload-form');
    uploadForm.addEventListener('submit', handleSubmit);
    
    /* Evento de búsqueda
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    
    searchButton.addEventListener('click', () => {
        performSearch(searchInput.value);
    });
    
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            performSearch(searchInput.value);
        }
    });*/
}

// Actualizar la vista previa del video cuando se ingresa una URL
function updateVideoPreview() {
    const urlVideo = document.getElementById('url_video').value.trim();
    const previewContainer = document.getElementById('video-preview');
    
    if (!urlVideo) {
        previewContainer.innerHTML = `
            <div class="preview-placeholder">
                <i class="fas fa-video"></i>
                <p>La miniatura del video se mostrará aquí</p>
            </div>
        `;
        return;
    }
    
    // Validar si es una URL de YouTube válida
    if (isValidYouTubeUrl(urlVideo)) {
        const thumbnailUrl = getYouTubeThumbnail(urlVideo);
        
        previewContainer.innerHTML = `
            <div class="video-thumbnail">
                <img src="${thumbnailUrl}" alt="Vista previa del video">
            </div>
        `;
    } else {
        previewContainer.innerHTML = `
            <div class="preview-placeholder">
                <i class="fas fa-exclamation-circle"></i>
                <p>URL no válida. Ingresa una URL de YouTube.</p>
            </div>
        `;
    }
}

// Validar si la URL es de YouTube
function isValidYouTubeUrl(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    return regExp.test(url);
}

// Manejar el envío del formulario
async function handleSubmit(event) {
    event.preventDefault();
    
    // Obtener los valores del formulario
    const titulo = document.getElementById('titulo').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();
    const url_video = document.getElementById('url_video').value.trim();
    const id_genero = document.getElementById('id_genero').value;
    
    // Validar campos
    if (!titulo || !url_video || !id_genero) {
        showError('Por favor, completa todos los campos obligatorios');
        return;
    }
    
    // Validar URL de YouTube
    if (!isValidYouTubeUrl(url_video)) {
        showError('La URL del video no es válida. Debe ser una URL de YouTube.');
        return;
    }
    
    // Deshabilitar el botón de envío para evitar múltiples envíos
    const submitButton = document.getElementById('btn-submit');
    submitButton.disabled = true;
    submitButton.textContent = 'Subiendo...';
    
    try {
        // Crear el objeto de datos del video
        const videoData = {
            id_usuario: currentUser.id_usuario,
            id_genero,
            titulo,
            descripcion,
            url_video
        };
        
        // Enviar la petición al servidor
        const response = await fetch(`${API_URL}/videos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(videoData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al subir el video');
        }
        
        // Obtener los datos del video creado
        const nuevoVideo = await response.json();
        
        // Mostrar mensaje de éxito y redireccionar
        alert('Video subido correctamente');
        window.location.href = `video.html?id=${nuevoVideo.id_video}`;
    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'Error al subir el video');
        
        // Habilitar nuevamente el botón de envío
        submitButton.disabled = false;
        submitButton.textContent = 'Subir Video';
    }
}

/* Realizar búsqueda
function performSearch(query) {
    if (query.trim()) {
        window.location.href = `../index.html?buscar=${encodeURIComponent(query)}`;
    }
}*/

// Cerrar sesión
function handleLogout(event) {
    event.preventDefault();
    
    // Eliminar datos del usuario de localStorage
    localStorage.removeItem('usuario');
    
    // Redireccionar al inicio
    window.location.href = '../index.html';
}

// Mostrar mensaje de error
function showError(message) {
    alert(message);
}