<template>
  <div class="auth-shell">
    <!-- Sol panel: atmosferik marka alanı -->
    <section class="auth-hero">
      <div class="auth-hero-texture"></div>
      <div class="auth-hero-content">
        <div class="brand-badge">
          <span class="material-symbols-outlined">local_library</span>
          <span class="brand-name">Terra Library</span>
        </div>
        <h1>{{ title }}</h1>
        <p>{{ subtitle }}</p>
      </div>

      <div class="hero-footnote">
        <div class="footnote-item">
          <span class="material-symbols-outlined">park</span>
          <span>Sürdürülebilir</span>
        </div>
        <div class="footnote-item">
          <span class="material-symbols-outlined">auto_stories</span>
          <span>Geniş Arşiv</span>
        </div>
        <div class="footnote-item">
          <span class="material-symbols-outlined">diversity_3</span>
          <span>Topluluk</span>
        </div>
      </div>
    </section>

    <!-- Sağ panel: form -->
    <section class="auth-form-section">
      <div class="auth-form-wrapper">
        <slot />
      </div>
    </section>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
})
</script>

<style scoped>
.auth-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ---- Sol: Hero panel ---- */
.auth-hero {
  position: relative;
  min-height: 320px;
  padding: 40px 32px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
  color: white;
  /* Fotoğraf yerine: var(--color-primary)'den türetilmiş organik gradient */
  background: linear-gradient(
    160deg,
    color-mix(in srgb, var(--color-primary) 55%, black) 0%,
    var(--color-primary) 55%,
    color-mix(in srgb, var(--color-primary) 70%, white) 100%
  );
}

/* Dokusal detay: kod.txt'teki nokta deseni motifinden esinlenildi */
.auth-hero-texture {
  position: absolute;
  inset: 0;
  opacity: 0.25;
  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.4) 1.5px, transparent 1.5px);
  background-size: 22px 22px;
  pointer-events: none;
}

.auth-hero-content {
  position: relative;
  z-index: 1;
  max-width: 480px;
}

.brand-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 1.3rem;
}

.brand-badge .material-symbols-outlined {
  background: rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-sm);
  padding: 6px;
}

.auth-hero-content h1 {
  color: white;
  font-size: 2.2rem;
  line-height: 1.2;
  margin: 0 0 12px;
}

.auth-hero-content p {
  color: rgba(255, 255, 255, 0.88);
  font-size: 1rem;
  margin: 0;
  max-width: 380px;
}

.hero-footnote {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 32px;
  margin-top: 32px;
  opacity: 0.7;
}

.footnote-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ---- Sağ: Form paneli ---- */
.auth-form-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  background-color: var(--color-surface);
}

.auth-form-wrapper {
  width: 100%;
  max-width: 420px;
}

/* Masaüstünde yan yana */
@media (min-width: 900px) {
  .auth-shell {
    flex-direction: row;
  }

  .auth-hero {
    width: 50%;
    min-height: 100vh;
    padding: 64px;
  }

  .auth-hero-content h1 {
    font-size: 3rem;
  }

  .auth-form-section {
    width: 50%;
    padding: 48px;
  }
}
</style>