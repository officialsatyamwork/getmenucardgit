import { useNavigate } from 'react-router-dom';
import SiteNav from './SiteNav';
import { useOwnerAuth } from './owner/OwnerAuthContext';
// import { PRICING_PLANS } from './owner/ownerApi';
import useReveal from './useReveal';
import './HomePage.css';
import './PricingPage.css';

/*
function formatPrice(plan) {
  if (!plan.price) return '₹0';
  return `₹${plan.price.toLocaleString('en-IN')}`;
}
*/

export default function PricingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useOwnerAuth();
  useReveal();

  /*
  const pickPlan = (planId) => {
    if (isAuthenticated) {
      navigate('/dashboard', { state: { tab: 'plan', plan: planId } });
      return;
    }
    navigate('/signup', { state: { plan: planId } });
  };
  */

  return (
    <div className="hp pricing-page">
      <SiteNav active="/pricing" scrolled ctaLabel="Sign up free" />

      <main className="pricing-main">
        <section className="pricing-hero reveal">
          <span className="pricing-eyebrow">Subscription</span>
          <h1>Pricing</h1>
          <p>Paid plans are on the way. For now, every restaurant runs on the free tier.</p>
        </section>

        <section className="pricing-coming-soon reveal">
          <span className="pricing-coming-soon-badge">Coming soon</span>
          <h2>Simple pricing for every restaurant.</h2>
          <p>
            We&apos;re finishing plans for branding, deeper analytics, and multi-location support.
            You can keep building your menu today — upgrades will unlock here soon.
          </p>
          <div className="pricing-note-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}
            >
              {isAuthenticated ? 'Go to dashboard' : 'Create free account'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/contact')}>
              Talk to us
            </button>
          </div>
        </section>

        {/*
        <section className="pricing-grid">
          {PRICING_PLANS.map((plan) => (
            <article
              key={plan.id}
              className={`pricing-card reveal${plan.popular ? ' is-popular' : ''}`}
            >
              {plan.popular && <span className="pricing-popular">Most popular</span>}
              <h2>{plan.id}</h2>
              <p className="pricing-blurb">{plan.blurb}</p>
              <div className="pricing-price">
                <strong>{formatPrice(plan)}</strong>
                <span>/{plan.period}</span>
              </div>
              <ul>
                {plan.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <button
                type="button"
                className={plan.popular ? 'btn btn-primary' : 'btn btn-outline'}
                onClick={() => pickPlan(plan.id)}
              >
                {isAuthenticated ? `Switch to ${plan.id}` : plan.cta}
              </button>
            </article>
          ))}
        </section>

        <section className="pricing-note reveal">
          <h3>No surprise fees</h3>
          <p>
            Guests never pay to open your menu. You only pay for the plan that fits your restaurant.
            Change or cancel anytime from your dashboard.
          </p>
          <div className="pricing-note-actions">
            <button type="button" className="btn btn-primary" onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}>
              {isAuthenticated ? 'Go to dashboard' : 'Create free account'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/contact')}>
              Talk to us
            </button>
          </div>
        </section>
        */}
      </main>
    </div>
  );
}
