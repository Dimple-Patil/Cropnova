import React, { useState } from 'react';
import { Calculator, Sprout, CheckCircle, Leaf, FlaskConical, Info, RotateCcw } from 'lucide-react';

// Crop-specific NPK ratios per acre (kg)
const CROP_DATABASE = {
  wheat:       { urea: 45, dap: 25, mop: 12, bio: 'Azotobacter @ 250g/acre', zinc: '25 kg ZnSO4/acre (if deficient)', note: 'Split Urea: 50% basal + 25% at CRI + 25% at tillering.' },
  rice:        { urea: 55, dap: 28, mop: 20, bio: 'Azospirillum @ 2kg/acre', zinc: '25 kg ZnSO4/acre before transplanting', note: 'Apply Urea in 3 splits: basal, tillering & panicle initiation.' },
  paddy:       { urea: 55, dap: 28, mop: 20, bio: 'Azospirillum @ 2kg/acre', zinc: '25 kg ZnSO4/acre before transplanting', note: 'Apply Urea in 3 splits: basal, tillering & panicle initiation.' },
  mustard:     { urea: 30, dap: 20, mop: 10, bio: 'Phosphate Solubilizing Bacteria (PSB) @ 1kg/acre', zinc: '10 kg ZnSO4/acre', note: 'Apply full Urea at sowing. Avoid excess Nitrogen — causes lodging.' },
  maize:       { urea: 60, dap: 30, mop: 20, bio: 'Azotobacter + PSB @ 250g each/acre', zinc: '25 kg ZnSO4/acre', note: 'Split Urea: 1/3 basal + 1/3 at knee height + 1/3 at tasseling.' },
  corn:        { urea: 60, dap: 30, mop: 20, bio: 'Azotobacter + PSB @ 250g each/acre', zinc: '25 kg ZnSO4/acre', note: 'Split Urea: 1/3 basal + 1/3 at knee height + 1/3 at tasseling.' },
  cotton:      { urea: 70, dap: 35, mop: 30, bio: 'Mycorrhizal Fungi @ 1kg/acre', zinc: '20 kg ZnSO4/acre', note: 'Apply Urea in 4 splits for best boll set. Excess K improves fibre quality.' },
  sugarcane:   { urea: 80, dap: 40, mop: 50, bio: 'Gluconacetobacter @ 2kg/acre', zinc: '25 kg ZnSO4/acre', note: 'Split fertilizer in 3 doses: planting, tillering, grand growth.' },
  tomato:      { urea: 40, dap: 30, mop: 40, bio: 'VAM Fungi @ 1kg/acre', zinc: '15 kg ZnSO4/acre', note: 'High Potash improves fruit quality. Foliar spray of 0.5% K2SO4 at fruiting.' },
  potato:      { urea: 50, dap: 45, mop: 60, bio: 'Trichoderma @ 2kg/acre', zinc: '20 kg ZnSO4/acre', note: 'Apply full P & K at planting. Split Urea: basal + earthing up.' },
  onion:       { urea: 35, dap: 25, mop: 30, bio: 'PSB @ 1kg/acre', zinc: '10 kg ZnSO4/acre', note: 'Avoid excess Nitrogen near harvest — reduces storability.' },
  soybean:     { urea: 10, dap: 30, mop: 20, bio: 'Rhizobium (Bradyrhizobium) @ 2kg/acre seed treatment', zinc: '15 kg ZnSO4/acre', note: 'Low Urea — Rhizobium fixes Nitrogen. Ensure seed inoculation for best yield.' },
  chickpea:    { urea: 10, dap: 25, mop: 12, bio: 'Rhizobium @ 200g/kg seed', zinc: '10 kg ZnSO4/acre', note: 'Legume — minimal Urea. Rhizobium inoculation is critical. Apply P at sowing.' },
  gram:        { urea: 10, dap: 25, mop: 12, bio: 'Rhizobium @ 200g/kg seed', zinc: '10 kg ZnSO4/acre', note: 'Legume — minimal Urea. Rhizobium inoculation is critical. Apply P at sowing.' },
  sunflower:   { urea: 35, dap: 25, mop: 20, bio: 'PSB + Azotobacter @ 250g each/acre', zinc: '15 kg ZnSO4/acre', note: 'Split Urea: half at sowing, half at square stage. Boron spray at bud stage.' },
  groundnut:   { urea: 10, dap: 30, mop: 25, bio: 'Rhizobium + PSB @ 250g each/acre', zinc: '10 kg ZnSO4/acre', note: 'Calcium (gypsum 200 kg/acre) at pegging is essential for groundnut.' },
  bajra:       { urea: 40, dap: 20, mop: 10, bio: 'Azotobacter @ 250g/acre', zinc: '15 kg ZnSO4/acre', note: 'Apply all P & K at sowing. Urea in 2 splits: at sowing and 30 DAS.' },
  jowar:       { urea: 35, dap: 20, mop: 10, bio: 'Azotobacter @ 250g/acre', zinc: '10 kg ZnSO4/acre', note: 'Tolerates lower fertility — avoid over-fertilizing. Apply basal dose at sowing.' },
  barley:      { urea: 40, dap: 22, mop: 10, bio: 'Azotobacter @ 250g/acre', zinc: '10 kg ZnSO4/acre', note: 'Split Urea: 2/3 at sowing + 1/3 at tillering. Avoid excess N for malting quality.' },
  capsicum:    { urea: 35, dap: 35, mop: 45, bio: 'VAM Fungi @ 1kg/acre', zinc: '15 kg ZnSO4/acre', note: 'High K demand for fruit development. Fertigate if drip irrigation is available.' },
  cabbage:     { urea: 45, dap: 25, mop: 25, bio: 'PSB @ 1kg/acre', zinc: '10 kg ZnSO4/acre', note: 'Top-dress with Urea at head formation stage for better weight.' },
  // Additional crops below
  turmeric:    { urea: 40, dap: 35, mop: 45, bio: 'Azospirillum + PSB @ 2kg/acre', zinc: '10 kg ZnSO4/acre', note: 'Requires high potash for rhizome development. Split N in 3 doses.' },
  ginger:      { urea: 45, dap: 30, mop: 45, bio: 'Trichoderma @ 2kg/acre (prevents rot)', zinc: '10 kg ZnSO4/acre', note: 'Apply P at planting, split N & K at 45 & 90 days.' },
  garlic:      { urea: 40, dap: 35, mop: 40, bio: 'PSB @ 1kg/acre', zinc: '10 kg ZnSO4/acre', note: 'Sulphur is crucial for pungency. Consider adding SSP instead of DAP if possible.' },
  chilli:      { urea: 45, dap: 35, mop: 30, bio: 'Azospirillum @ 2kg/acre', zinc: '15 kg ZnSO4/acre', note: 'Split Urea in 3-4 doses. Foliar spray of K improves fruit size and colour.' },
  coriander:   { urea: 30, dap: 20, mop: 15, bio: 'Azotobacter @ 1kg/acre', zinc: '10 kg ZnSO4/acre', note: 'Mostly applied as basal dose. Low nitrogen requirement.' },
  cumin:       { urea: 25, dap: 20, mop: 15, bio: 'Azotobacter @ 1kg/acre', zinc: '10 kg ZnSO4/acre', note: 'Apply half Urea and full P & K as basal. Rest Urea at 30 days.' },
  brinjal:     { urea: 45, dap: 35, mop: 35, bio: 'VAM Fungi @ 1kg/acre', zinc: '15 kg ZnSO4/acre', note: 'Apply Urea in multiple splits during active growth and fruiting stages.' },
  cauliflower: { urea: 50, dap: 30, mop: 30, bio: 'PSB @ 1kg/acre', zinc: '10 kg ZnSO4/acre', note: 'Boron and Molybdenum are important. Split Urea application.' },
  okra:        { urea: 40, dap: 25, mop: 25, bio: 'Azotobacter @ 1kg/acre', zinc: '10 kg ZnSO4/acre', note: 'Split Urea: basal and at flowering. Avoid excess N which increases vegetative growth.' },
  carrot:      { urea: 30, dap: 25, mop: 40, bio: 'PSB @ 1kg/acre', zinc: '10 kg ZnSO4/acre', note: 'High Potash requirement for root development. Avoid fresh FYM.' },
  radish:      { urea: 25, dap: 20, mop: 30, bio: 'PSB @ 1kg/acre', zinc: '10 kg ZnSO4/acre', note: 'Quick growing, apply most nutrients as basal dose.' },
  spinach:     { urea: 45, dap: 20, mop: 20, bio: 'Azotobacter @ 1kg/acre', zinc: '10 kg ZnSO4/acre', note: 'High nitrogen demand for leafy growth. Apply Urea after each cutting if multi-cut.' },
  cucumber:    { urea: 40, dap: 30, mop: 35, bio: 'VAM Fungi @ 1kg/acre', zinc: '15 kg ZnSO4/acre', note: 'Apply fertilizers in splits or fertigate if using drip.' },
  pumpkin:     { urea: 35, dap: 25, mop: 30, bio: 'Azotobacter @ 1kg/acre', zinc: '15 kg ZnSO4/acre', note: 'Apply nutrients in ring method away from the stem.' },
  banana:      { urea: 150, dap: 50, mop: 200, bio: 'Azospirillum + PSB @ 5kg/acre', zinc: '20 kg ZnSO4/acre', note: 'Heavy feeder. Needs very high Potash. Split into 4-5 applications.' },
  papaya:      { urea: 100, dap: 50, mop: 100, bio: 'VAM Fungi @ 2kg/acre', zinc: '20 kg ZnSO4/acre', note: 'Apply 200g N, 200g P, 250g K per plant/year in 6 split doses.' },
  mango:       { urea: 120, dap: 60, mop: 100, bio: 'VAM + Azotobacter', zinc: 'Foliar spray if deficient', note: 'Apply during monsoon for rainfed. For fruiting trees, apply post-harvest.' },
  citrus:      { urea: 100, dap: 50, mop: 80, bio: 'VAM Fungi', zinc: 'Foliar spray of ZnSO4 (0.5%)', note: 'Micronutrients (Zn, Fe, Mn) are critical. Apply in 2-3 splits.' },
  grapes:      { urea: 120, dap: 80, mop: 150, bio: 'VAM Fungi', zinc: 'Foliar spray', note: 'Apply based on pruning schedule. Very high Potassium requirement.' },
  pigeonpea:   { urea: 10, dap: 25, mop: 15, bio: 'Rhizobium @ 2kg/acre', zinc: '10 kg ZnSO4/acre', note: 'Legume. Needs P & K mostly as basal dose.' },
  arhar:       { urea: 10, dap: 25, mop: 15, bio: 'Rhizobium @ 2kg/acre', zinc: '10 kg ZnSO4/acre', note: 'Legume. Needs P & K mostly as basal dose.' },
  mungbean:    { urea: 10, dap: 20, mop: 10, bio: 'Rhizobium @ 200g/kg seed', zinc: '10 kg ZnSO4/acre', note: 'Legume. Short duration. Apply all fertilizers at sowing.' },
  uradbean:    { urea: 10, dap: 20, mop: 10, bio: 'Rhizobium @ 200g/kg seed', zinc: '10 kg ZnSO4/acre', note: 'Legume. Short duration. Apply all fertilizers at sowing.' },
  lentil:      { urea: 10, dap: 20, mop: 10, bio: 'Rhizobium @ 200g/kg seed', zinc: '10 kg ZnSO4/acre', note: 'Legume. Needs P for good root nodulation.' },
  jute:        { urea: 35, dap: 20, mop: 25, bio: 'Azotobacter @ 1kg/acre', zinc: '10 kg ZnSO4/acre', note: 'Apply Urea in 2 splits (basal and 4-6 weeks after sowing).' },
  tobacco:     { urea: 40, dap: 30, mop: 40, bio: 'Azotobacter @ 1kg/acre', zinc: '10 kg ZnSO4/acre', note: 'Use Potassium Sulphate (SOP) instead of MOP for better leaf burning quality.' },
  castor:      { urea: 35, dap: 25, mop: 15, bio: 'Azospirillum @ 1kg/acre', zinc: '10 kg ZnSO4/acre', note: 'Deep rooted. Apply Urea in splits under irrigated conditions.' }
};

// Fuzzy match crop name to database key
const matchCrop = (input) => {
  if (!input) return null;
  const lower = input.toLowerCase().trim();
  // Exact key match
  if (CROP_DATABASE[lower]) return lower;
  // Partial match
  const keys = Object.keys(CROP_DATABASE);
  for (const key of keys) {
    if (lower.includes(key) || key.includes(lower)) return key;
  }
  return null;
};

// Generic fallback calculator for unknown crops
const genericCalc = (acres) => ({
  urea: Math.round(acres * 40),
  dap:  Math.round(acres * 25),
  mop:  Math.round(acres * 15),
  bio:  'Azotobacter @ 250g/acre (general)',
  zinc: '10–15 kg ZnSO4/acre if zinc deficient',
  note: 'Generic recommendation. For precise dosage, get a soil test done from your nearest KVK lab.'
});

export const FertilizerCalculator = () => {
  const [cropInput, setCropInput] = useState('');
  const [acres, setAcres] = useState('');
  const [result, setResult] = useState(null);
  const [isUnknownCrop, setIsUnknownCrop] = useState(false);

  const handleCalculate = (e) => {
    e.preventDefault();
    const matchedKey = matchCrop(cropInput);
    const acresNum = parseFloat(acres);
    if (!acresNum || acresNum <= 0) return;

    if (matchedKey) {
      const base = CROP_DATABASE[matchedKey];
      setIsUnknownCrop(false);
      setResult({
        crop: cropInput.trim(),
        matchedAs: matchedKey,
        acreSize: acresNum,
        urea:  `${Math.round(base.urea * acresNum)} kg`,
        ureaNote: 'Split in doses for best absorption',
        dap:   `${Math.round(base.dap * acresNum)} kg`,
        dapNote: 'Basal dose at sowing / transplanting',
        mop:   `${Math.round(base.mop * acresNum)} kg`,
        mopNote: 'Basal dose at sowing',
        bio:   base.bio,
        zinc:  base.zinc,
        note:  base.note,
        perAcre: { urea: base.urea, dap: base.dap, mop: base.mop }
      });
    } else {
      const fallback = genericCalc(acresNum);
      setIsUnknownCrop(true);
      setResult({
        crop: cropInput.trim(),
        matchedAs: null,
        acreSize: acresNum,
        urea:  `${fallback.urea} kg`,
        ureaNote: 'Generic estimate',
        dap:   `${fallback.dap} kg`,
        dapNote: 'Generic estimate',
        mop:   `${fallback.mop} kg`,
        mopNote: 'Generic estimate',
        bio:   fallback.bio,
        zinc:  fallback.zinc,
        note:  fallback.note,
        perAcre: { urea: 40, dap: 25, mop: 15 }
      });
    }
  };

  const handleReset = () => {
    setCropInput('');
    setAcres('');
    setResult(null);
    setIsUnknownCrop(false);
  };

  const supportedCrops = ['Wheat', 'Rice/Paddy', 'Mustard', 'Maize', 'Cotton', 'Sugarcane', 'Tomato', 'Potato', 'Onion', 'Soybean', 'Chickpea', 'Sunflower', 'Groundnut', 'Bajra', 'Barley', 'Capsicum'];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2>Fertilizer Dosage & Nutrient Calculator 💊</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Type your crop name and land area — get exact Urea, DAP, and MOP bag requirements with application schedule.
        </p>
      </div>

      <div className="grid-2" style={{ alignItems: 'flex-start' }}>
        {/* Form */}
        <div className="card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '0.2rem' }}>
            <FlaskConical size={20} /> Field Parameters
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>
            Type any crop name — wheat, tomato, soybean, cotton, etc.
          </p>

          <form onSubmit={handleCalculate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', display: 'block', marginBottom: '0.4rem' }}>
                <Sprout size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Crop Name
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Wheat, Tomato, Sugarcane, Mustard..."
                value={cropInput}
                onChange={e => setCropInput(e.target.value)}
                required
                autoComplete="off"
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', display: 'block', marginBottom: '0.4rem' }}>
                <Calculator size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Total Land Area (Acres)
              </label>
              <input
                type="number"
                min="0.25"
                step="0.25"
                className="input-field"
                placeholder="e.g. 2.5"
                value={acres}
                onChange={e => setAcres(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '0.7rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                <Calculator size={16} /> Calculate Requirement
              </button>
              {result && (
                <button type="button" onClick={handleReset} className="btn btn-secondary" title="Reset">
                  <RotateCcw size={16} />
                </button>
              )}
            </div>
          </form>

          {/* Supported crops hint */}
          <div style={{ marginTop: '1.2rem', background: 'var(--light-green)', borderRadius: 'var(--radius-md)', padding: '0.8rem' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '0.4rem' }}>
              <Leaf size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Crop-specific data available for:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {supportedCrops.map(c => (
                <span
                  key={c}
                  onClick={() => setCropInput(c.split('/')[0])}
                  style={{
                    background: 'var(--card-bg)', border: '1px solid var(--primary)',
                    color: 'var(--primary)', borderRadius: '50px',
                    padding: '0.15rem 0.6rem', fontSize: '0.72rem', fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        {result ? (
          <div className="card animate-fade-in" style={{ borderLeft: '4px solid var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span className="badge badge-success" style={{ marginBottom: '0.4rem', display: 'inline-block' }}>
                  {isUnknownCrop ? '⚠️ Generic Estimate' : '✅ Crop-Specific Result'}
                </span>
                <h3 style={{ margin: 0, color: 'var(--primary)' }}>
                  {result.crop} — {result.acreSize} Acre{result.acreSize !== 1 ? 's' : ''}
                </h3>
                {result.matchedAs && result.matchedAs !== result.crop.toLowerCase() && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>
                    Matched as: <strong style={{ textTransform: 'capitalize' }}>{result.matchedAs}</strong>
                  </p>
                )}
              </div>
            </div>

            {isUnknownCrop && (
              <div style={{ background: '#FFF8E1', border: '1px solid var(--warning)', borderRadius: 'var(--radius-md)', padding: '0.7rem 1rem', marginBottom: '1rem', fontSize: '0.82rem', color: '#856404' }}>
                <Info size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Crop not found in database — showing general NPK recommendation. For precision, get a soil test.
              </div>
            )}

            {/* NPK Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{ background: 'var(--light-green)', padding: '0.9rem 1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '0.9rem' }}>🌱 Urea (Nitrogen 46%)</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>{result.perAcre.urea} kg/acre × {result.acreSize} acres</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '800', fontSize: '1.3rem', color: 'var(--primary)' }}>{result.urea}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{result.ureaNote}</div>
                  </div>
                </div>
              </div>

              <div style={{ background: '#FFF8E1', padding: '0.9rem 1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '700', color: 'var(--warning)', fontSize: '0.9rem' }}>🟡 DAP (Phosphorus 46%)</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>{result.perAcre.dap} kg/acre × {result.acreSize} acres</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '800', fontSize: '1.3rem', color: 'var(--warning)' }}>{result.dap}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{result.dapNote}</div>
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--bg)', padding: '0.9rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>🔴 MOP (Potash 60%)</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>{result.perAcre.mop} kg/acre × {result.acreSize} acres</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '800', fontSize: '1.3rem' }}>{result.mop}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{result.mopNote}</div>
                  </div>
                </div>
              </div>

              {/* Micronutrient & Bio */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                <div style={{ background: 'var(--bg)', padding: '0.7rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.8rem' }}>
                  <div style={{ fontWeight: '700', color: 'var(--primary)', marginBottom: '0.2rem' }}>🦠 Bio-Fertilizer</div>
                  <div style={{ color: 'var(--text-secondary)' }}>{result.bio}</div>
                </div>
                <div style={{ background: 'var(--bg)', padding: '0.7rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.8rem' }}>
                  <div style={{ fontWeight: '700', color: 'var(--accent)', marginBottom: '0.2rem' }}>⚗️ Zinc Supplement</div>
                  <div style={{ color: 'var(--text-secondary)' }}>{result.zinc}</div>
                </div>
              </div>

              {/* Application note */}
              <div style={{ background: 'var(--light-green)', borderRadius: 'var(--radius-md)', padding: '0.8rem 1rem', display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                <CheckCircle size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--primary)', fontWeight: '600', lineHeight: '1.5' }}>
                  {result.note}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '300px', textAlign: 'center', border: '2px dashed var(--glass-border)' }}>
            <FlaskConical size={48} color="var(--primary)" style={{ marginBottom: '0.8rem', opacity: 0.5 }} />
            <h4 style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>Results will appear here</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '280px' }}>
              Enter your crop name and land area, then click Calculate.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
