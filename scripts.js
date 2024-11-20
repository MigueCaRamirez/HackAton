// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
  // Referencias a elementos del DOM
  const donationForm = document.getElementById('donationForm');
  const donationAmount = document.getElementById('donationAmount');
  const donationType = document.getElementById('donationType');
  const organizationSelect = document.getElementById('organization');

  // Configuración de cantidades sugeridas por tipo de donación
  const suggestedAmounts = {
      monthly: [10, 25, 50, 100],
      oneTime: [50, 100, 250, 500]
  };

  // Función para validar el correo electrónico
  function isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Función para formatear números como moneda
  function formatCurrency(amount) {
      return new Intl.NumberFormat('es-ES', {
          style: 'currency',
          currency: 'USD'
      }).format(amount);
  }

  // Manejador de eventos para el formulario de donación
  donationForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Recopilar datos del formulario
      const formData = {
          name: document.getElementById('donorName').value,
          email: document.getElementById('email').value,
          amount: donationAmount.value,
          organization: organizationSelect.value,
          type: donationType.value,
          isAnonymous: document.getElementById('anonymous').checked,
          message: document.getElementById('message').value
      };

      // Validar correo electrónico
      if (!isValidEmail(formData.email)) {
          showAlert('Por favor, introduce un correo electrónico válido', 'error');
          return;
      }

      // Validar monto
      if (formData.amount <= 0) {
          showAlert('Por favor, introduce un monto válido', 'error');
          return;
      }

      // Simular envío de donación
      processDonation(formData);
  });

  // Función para procesar la donación
  function processDonation(data) {
      // Aquí iría la lógica de integración con el sistema de pagos
      // Por ahora, solo mostraremos un mensaje de éxito
      showAlert('¡Gracias por tu donación!', 'success');
      donationForm.reset();

      // Actualizar estadísticas
      updateStatistics(data.amount);
  }

  // Función para mostrar alertas
  function showAlert(message, type = 'info') {
      const alertDiv = document.createElement('div');
      alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
      alertDiv.innerHTML = `
          ${message}
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      `;

      donationForm.insertAdjacentElement('beforebegin', alertDiv);

      // Auto-cerrar después de 5 segundos
      setTimeout(() => {
          alertDiv.remove();
      }, 5000);
  }

  // Función para actualizar estadísticas
  function updateStatistics(amount) {
      // Aquí se actualizarían las estadísticas en tiempo real
      // Por ahora, solo animamos los números
      const stats = document.querySelectorAll('.stat-box h3');
      stats.forEach(stat => {
          const currentValue = parseInt(stat.textContent.replace(/[^0-9]/g, ''));
          animateNumber(stat, currentValue, currentValue + 1);
      });
  }

  // Función para animar números
  function animateNumber(element, start, end) {
      let current = start;
      const increment = (end - start) / 30;
      const timer = setInterval(() => {
          current += increment;
          element.textContent = Math.floor(current).toLocaleString();
          if (current >= end) {
              clearInterval(timer);
              element.textContent = end.toLocaleString();
          }
      }, 50);
  }

  // Agregar observador de intersección para animaciones al hacer scroll
  const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              entry.target.classList.add('animate-fade-in');
          }
      });
  });

  // Observar elementos que queremos animar
  document.querySelectorAll('.card, .stat-box, .story-card').forEach(el => {
      observer.observe(el);
  });

  // Función para actualizar sugerencias de monto según el tipo de donación
  donationType.addEventListener('change', function() {
      const amounts = suggestedAmounts[this.value];
      if (amounts) {
          // Actualizar el placeholder con una sugerencia aleatoria
          const randomAmount = amounts[Math.floor(Math.random() * amounts.length)];
          donationAmount.placeholder = `Sugerencia: ${formatCurrency(randomAmount)}`;
      }
  });

  // Inicializar tooltips de Bootstrap
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
  });
});