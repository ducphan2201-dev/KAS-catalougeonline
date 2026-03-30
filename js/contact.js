/**
 * KAS Catalogue — Contact Form Module
 */
const Contact = (() => {
  function init() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', handleSubmit);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = document.getElementById('form-submit');
    const successMsg = document.getElementById('form-success');

    // Disable button
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Đang gửi...</span>';

    try {
      // Collect form data
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      // Option 1: Send via FormSubmit (free, no backend needed)
      // The form action should be: https://formsubmit.co/noithatKas@gmail.com
      await sendViaFormSubmit(data);

      // Show success
      successMsg.classList.add('visible');
      form.reset();

      // Hide success after 5s
      setTimeout(() => {
        successMsg.classList.remove('visible');
      }, 5000);
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ trực tiếp qua email.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <span>Gửi yêu cầu tư vấn</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      `;
    }
  }

  async function sendViaFormSubmit(data) {
    const response = await fetch(CONFIG.FORM_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.phone || 'Không cung cấp',
        service: data.service || 'Chưa chọn',
        message: data.message || 'Không có mô tả',
        _subject: `[${CONFIG.BRAND.name}] Yêu cầu tư vấn từ ${data.name}`,
      }),
    });

    if (!response.ok) {
      throw new Error('FormSubmit error');
    }
  }

  return { init };
})();
