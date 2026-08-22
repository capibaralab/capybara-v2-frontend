<script setup>
import { useRouter } from 'vue-router'
import logo from '../assets/logo.png'
import CapyIllustration from '../components/CapyIllustration.vue'

const router = useRouter()

function getStarted() {
  router.push('/onboarding/account-type')
}
</script>

<template>
  <main class="welcome">
    <section class="hero">
      <img :src="logo" alt="Capybara Lab AI logo" class="hero-logo" />
      <h1>Capybara is the matchmaker influencer & brand marketing was missing.</h1>
      <p class="hero-sub">
        Capybara is a marketplace connecting brands with the right-fit influencers — no cold
        outreach, no guesswork, no obvious ads.
      </p>
      <button type="button" class="btn btn-primary hero-cta" @click="getStarted">
        Get started with Capybara →
      </button>
    </section>

    <section class="block">
      <div class="block-inner">
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
      </div>
    </section>

    <section class="block block-alt">
      <div class="block-inner">
        <h2>The problem we saw</h2>
        <p>
          Brands were burning budget on influencer partnerships that looked good on paper and
          fell flat in practice — audiences that didn't match, content that felt bolted-on,
          results nobody could tie back to spend. Influencers, meanwhile, were fielding generic
          pitches from brands that never bothered to check if their audience even cared.
        </p>
        <p>Both sides were guessing. We built Capybara to fix that.</p>
      </div>
    </section>

    <section class="block">
      <div class="block-inner">
        <h2>What we do</h2>
        <p>
          We match brands with influencers whose audience already fits — using real audience
          data, not vibes. Then we help blend the product into content that already works, so
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
      </div>
    </section>

    <section class="block block-alt">
      <div class="block-inner">
        <h2>Where we're headed</h2>
        <p>
          We're just getting started. Every match we make teaches us more about what actually
          works — and we're building that into the product every day.
        </p>
      </div>
    </section>

    <section class="final-cta">
      <h2>Ready to find your match?</h2>
      <button type="button" class="btn btn-primary hero-cta" @click="getStarted">
        Get started with Capybara →
      </button>
    </section>
  </main>
</template>

<style scoped>
.welcome {
  --accent: var(--brand-red);
  --accent-bg: var(--brand-red-bg);
  --accent-border: var(--brand-red-border);
}
.hero {
  min-height: 60svh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 64px 24px 38px;
  background:
    radial-gradient(ellipse 80% 55% at 50% -10%, var(--brand-red-bg), transparent),
    #f6fffe;
}
.hero-logo {
  width: 88px;
  height: auto;
  margin-bottom: 20px;
}
.hero h1 {
  max-width: 720px;
  font-family: 'Nunito', var(--heading);
  font-size: 40px;
  line-height: 1.2;
  margin: 0 0 20px;
}
.hero-sub {
  max-width: 560px;
  font-size: 17px;
  color: var(--text);
  margin: 0 0 32px;
}
.hero-cta.btn-primary {
  background: var(--brand-red);
  color: #fff;
  border-color: transparent;
  padding: 14px 28px;
  font-size: 16px;
  margin-top: 20px;
}
.block {
  padding: 72px 24px;
}
.hero + .block {
  padding-top: 18px;
}
.block-alt {
  background: var(--code-bg);
}
.block-inner {
  max-width: 760px;
  margin: 0 auto;
  text-align: center;
}
.block h2 {
  font-family: 'Nunito', var(--heading);
  font-size: 28px;
  margin: 0 0 20px;
}
.block p {
  font-size: 16px;
  line-height: 1.6;
  color: var(--text);
  margin: 0 0 14px;
}
.block p:last-child {
  margin-bottom: 0;
}
.audience-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 32px;
  text-align: left;
}
.audience-card h3 {
  margin: 0 0 10px;
  font-size: 22px;
}
.audience-card p {
  margin: 0;
  font-size: 14px;
}
.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3px;
  margin-top: 8px;
  text-align: left;
}
.feature-card {
  border-radius: 12px;
  padding: 20px;
  background: var(--bg-raised);
}
.feature-card h3 {
  font-size: 19px;
  margin: 0 0 8px;
  color: var(--brand-red);
}
.feature-card p {
  font-size: 14px;
  margin: 0;
}
.final-cta {
  padding: 80px 24px;
  text-align: center;
  background:
    radial-gradient(ellipse 80% 55% at 50% 110%, var(--brand-red-bg), transparent),
    #f6fffe;
}
.final-cta h2 {
  font-family: 'Nunito', var(--heading);
  font-size: 28px;
  margin: 0 0 24px;
}
@media (max-width: 640px) {
  .hero h1 {
    font-size: 30px;
  }
  .audience-grid,
  .feature-grid {
    grid-template-columns: 1fr;
  }
}
</style>
