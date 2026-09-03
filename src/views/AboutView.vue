<script setup>
import { ref } from 'vue'
import logo from '../assets/logo.png'
import CapyIllustration from '../components/CapyIllustration.vue'

const copied = ref(false)

async function shareCapybara() {
  const url = `${window.location.origin}/welcome`
  try {
    await navigator.clipboard.writeText(url)
  } catch {
    window.prompt('Copy this link:', url)
  }
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>

<template>
  <main class="container about">
    <header class="about-header">
      <img :src="logo" alt="Capybara Lab AI logo" class="about-logo" />
      <h1>About Capybara</h1>
    </header>

    <section class="block block-alt">
      <p>
        Brands were burning budget on influencer partnerships that looked good on paper and fell
        flat in practice — audiences that didn't match, content that felt bolted-on, results
        nobody could tie back to spend. Influencers, meanwhile, were fielding generic pitches from
        brands that never bothered to check if their audience even cared.
      </p>
      <p>Both sides were guessing. We built Capybara to fix that.</p>
    </section>

    <section class="block">
      <h2>What we do</h2>
      <p>
        We match brands with influencers whose audience already fits — using real audience data,
        not vibes. Then we help blend the product into content that already works, so
        partnerships read as native placements, not interruptions.
      </p>
      <div class="audience-grid">
        <div class="audience-card card">
          <CapyIllustration variant="brand" />
          <h3>For brands</h3>
          <p>
            Find creators whose followers are already your target audience, launch campaigns
            faster, and see performance in one place.
          </p>
        </div>
        <div class="audience-card card">
          <CapyIllustration variant="influencer" />
          <h3>For influencers</h3>
          <p>
            Get matched with brands your audience actually wants to hear from, collaborate on
            your terms, and get paid without the back-and-forth.
          </p>
        </div>
      </div>
    </section>

    <section class="block feature-block">
      <div class="feature-grid">
        <div class="feature-card">
          <h3>Audience fit over follower count.</h3>
          <p>Bigger isn't always better — relevance is.</p>
        </div>
        <div class="feature-card">
          <h3>Keep content native.</h3>
          <p>
            The best-performing partnerships don't look like ads. We help make sure yours don't
            either.
          </p>
        </div>
        <div class="feature-card">
          <h3>Make collaboration simple.</h3>
          <p>From first match to final payment, everything happens in one place.</p>
        </div>
      </div>
    </section>

    <section class="share-cta">
      <h2>Know someone who'd be a great fit?</h2>
      <p>Send them straight to Capybara.</p>
      <button type="button" class="btn btn-primary btn-create" @click="shareCapybara">
        {{ copied ? 'Link Copied!' : 'Share Capybara' }}
      </button>
    </section>
  </main>
</template>

<style scoped>
.about {
  --accent: var(--brand-red);
  --accent-bg: var(--brand-red-bg);
  --accent-border: var(--brand-red-border);
  position: relative;
  padding-top: 16px;
  padding-bottom: 64px;
}
/* .about shares .container's max-width:900px, so a plain background would only color that
   centered column — this pseudo-element covers the full viewport behind it instead. */
.about::before {
  content: '';
  position: fixed;
  inset: 0;
  background: #f6fffe;
  z-index: -1;
}
.about-header {
  text-align: center;
  padding: 32px 0 8px;
}
.about-logo {
  width: 64px;
  height: auto;
  margin-bottom: 16px;
}
.about-header h1 {
  font-family: 'Nunito', var(--heading);
  font-size: 32px;
  margin: 0;
}
.block {
  padding: 40px 0;
}
.feature-block {
  padding: 16px 0;
}
.block-alt {
  padding: 24px 0 0;
}
.block-alt + .block {
  padding-top: 56px;
}
.block h2 {
  font-family: 'Nunito', var(--heading);
  font-size: 24px;
  margin: 0 0 16px;
  text-align: center;
}
.block > p,
.block-alt > p {
  font-size: 15px;
  line-height: 1.6;
  color: var(--text);
  margin: 0 0 14px;
  text-align: left;
}
.block > p:last-child,
.block-alt > p:last-child {
  margin-bottom: 0;
}
.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3px;
  text-align: left;
}
.feature-card {
  padding: 20px;
}
.feature-card h3 {
  font-size: 20px;
  margin: 0 0 8px;
  color: var(--brand-red);
}
.feature-card p {
  font-size: 16px;
  line-height: 1.5;
  margin: 0;
  color: var(--text);
}
.audience-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 56px;
  text-align: left;
}
.audience-card h3 {
  margin: 0 0 10px;
  font-size: 20px;
}
.audience-card p {
  margin: 0;
  font-size: 15px;
  line-height: 1.6;
  color: var(--text);
}
.share-cta {
  margin-top: 24px;
  padding: 48px 24px;
  border-radius: 16px;
  text-align: center;
  background: radial-gradient(ellipse 80% 100% at 50% 110%, var(--brand-red-bg), transparent), var(--bg-raised);
}
.share-cta h2 {
  font-family: 'Nunito', var(--heading);
  font-size: 22px;
  margin: 0 0 8px;
}
.share-cta p {
  font-size: 14px;
  color: var(--text);
  margin: 0 0 20px;
}
.share-cta :deep(.btn-primary) {
  background: var(--brand-red);
}

@media (max-width: 640px) {
  .about-header h1 {
    font-size: 26px;
  }
  .feature-grid,
  .audience-grid {
    grid-template-columns: 1fr;
  }
}
</style>
