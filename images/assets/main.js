// Tab switching
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', function () {
    document.querySelectorAll('.tab').forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    this.classList.add('active');
    this.setAttribute('aria-selected', 'true');
  });
});

// Search form submit
document.querySelector('.search-box input').addEventListener('keydown', function (e) {
  if (e.key === 'Enter' && this.value.trim()) {
    const query = encodeURIComponent(this.value.trim());
    window.location.href = `https://www.google.com/search?tbm=isch&q=${query}`;
  }
});

document.querySelectorAll('.btn-google').forEach((btn, i) => {
  btn.addEventListener('click', function () {
    const input = document.querySelector('.search-box input');
    const query = encodeURIComponent(input.value.trim() || '');
    if (i === 0) {
      window.location.href = `https://www.google.com/search?tbm=isch&q=${query}`;
    } else {
      window.location.href = `https://images.google.com/`;
    }
  });
});
