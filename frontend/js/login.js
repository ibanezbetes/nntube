// Script para la página de login
document.addEventListener('DOMContentLoaded', () => {
    // Obtener el formulario
    const loginForm = document.getElementById('login-form');
    
    // Agregar evento de envío al formulario
    loginForm.addEventListener('submit', handleLogin);
    
    // Verificar si hay usuario en sesión
    checkSession();
});

// Manejar el envío del formulario de login
async function handleLogin(event) {
    event.preventDefault();
    
    // Obtener los valores del formulario
    const email = document.getElementById('email').value;
    const contrasenia = document.getElementById('contrasenia').value;
    
    // Validar que los campos no estén vacíos
    if (!email || !contrasenia) {
        showError('Por favor, completa todos los campos');
        return;
    }
    
    try {
        // Realizar la petición al backend
        const response = await fetch(`${API_URL}/usuarios/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, contrasenia })
        });
        
        // Convertir la respuesta a JSON
        const data = await response.json();
        
        // Si hay un error en la respuesta
        if (!response.ok) {
            throw new Error(data.error || 'Error al iniciar sesión');
        }
        
        // Guardar los datos del usuario en localStorage
        localStorage.setItem('usuario', JSON.stringify(data));
        
        // Redireccionar al dashboard
        window.location.href = 'dashboard.html';
    } catch (error) {
        console.error('Error:', error);
        showError(error.message);
    }
}

// Verificar si hay una sesión activa
function checkSession() {
    const usuario = localStorage.getItem('usuario');
    
    if (usuario) {
        // Si hay un usuario en sesión, redireccionar al dashboard
        window.location.href = 'dashboard.html';
    }
}

// Mostrar mensaje de error
function showError(message) {
    // Verificar si ya existe un mensaje de error
    let errorElement = document.querySelector('.error-message');
    
    if (!errorElement) {
        // Crear el elemento de error
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        
        // Insertar después del botón
        const submitButton = document.querySelector('.btn-primary');
        submitButton.insertAdjacentElement('afterend', errorElement);
    }
    
    // Actualizar el mensaje de error
    errorElement.textContent = message;
    
    // Ocultar el mensaje después de 5 segundos
    setTimeout(() => {
        errorElement.textContent = '';
    }, 5000);
}