import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MenuImportFlow from '../MenuImportFlow';
import { useOwnerAuth } from './OwnerAuthContext';
import { ownerApi } from './ownerApi';
import './OwnerAuth.css';

export default function CreateMenuPage() {
  const navigate = useNavigate();
  const { owner } = useOwnerAuth();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [seed, setSeed] = useState({
    name: owner?.restaurantName || '',
    restaurantId: owner?.restaurantId || null,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError('');
      if (owner?.restaurantId) {
        setSeed({
          name: owner.restaurantName || '',
          restaurantId: owner.restaurantId,
        });
        if (!cancelled) setReady(true);
        return;
      }
      try {
        const dash = await ownerApi.dashboard();
        if (cancelled) return;
        const restaurantId = dash.restaurant?.id || owner?.restaurantId || null;
        if (!restaurantId) {
          setError('No restaurant is linked to this account yet. Try logging in again.');
          setReady(true);
          return;
        }
        setSeed({
          name: dash.restaurant?.name || owner?.restaurantName || '',
          restaurantId,
        });
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Could not load your restaurant. Please try again.');
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, [owner]);

  const goDashboard = () => navigate('/dashboard', { replace: true });

  if (!ready) {
    return <div className="oa-loading">Preparing your menu…</div>;
  }

  if (!seed.restaurantId) {
    return (
      <div className="oa-loading" style={{ flexDirection: 'column', gap: 12 }}>
        <p>{error || 'Restaurant not found for this account.'}</p>
        <button type="button" className="oa-btn" onClick={goDashboard}>
          Go to dashboard
        </button>
      </div>
    );
  }

  return (
    <MenuImportFlow
      onClose={goDashboard}
      restaurantId={seed.restaurantId}
      initialInfo={{
        name: seed.name,
        tagline: '',
        location: '',
        coverImage: null,
      }}
      donePrimaryLabel="Go to dashboard"
      onDonePrimary={goDashboard}
      mode="onboarding"
    />
  );
}
