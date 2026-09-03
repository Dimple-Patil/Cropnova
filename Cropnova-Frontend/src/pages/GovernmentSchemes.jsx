import React, { useState } from 'react';
import { Building2, ExternalLink, ShieldCheck, CheckCircle2, Search, Filter, Award, CreditCard, Droplets, Sprout, Tractor, HeartHandshake } from 'lucide-react';

export const GovernmentSchemes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const allSchemes = [
    {
      id: 101,
      title: 'PM-Kisan Samman Nidhi Scheme (PM-KISAN)',
      category: 'Direct Benefit Transfer',
      icon: Award,
      subsidyAmount: '₹6,000 / Year Direct Bank Transfer',
      eligibility: 'Small & marginal landholding farmer families with valid land records up to 2 hectares.',
      deadline: 'Ongoing 2026-27',
      description: 'Provides income support to all landholding farmer families across the country to enable them to meet expenses related to agriculture and domestic needs.',
      link: 'https://pmkisan.gov.in'
    },
    {
      id: 102,
      title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
      category: 'Crop Insurance',
      icon: ShieldCheck,
      subsidyAmount: 'Up to 90% Government Premium Subsidy',
      eligibility: 'All farmers (loanee & non-loanee) growing notified food crops, oilseeds, and commercial crops.',
      deadline: '15th Nov 2026 (Rabi Season)',
      description: 'Comprehensive risk insurance coverage against yield losses due to non-preventable natural risks such as drought, dry spells, flood, pest & diseases.',
      link: 'https://pmfby.gov.in'
    },
    {
      id: 103,
      title: 'Kisan Credit Card (KCC) Scheme',
      category: 'Credit & Loans',
      icon: CreditCard,
      subsidyAmount: 'Low-Interest Loan @ 4% Effective Interest',
      eligibility: 'Individual farmers, joint borrowers, tenant farmers, sharecroppers, and Self-Help Groups (SHGs).',
      deadline: 'Open Year-Round',
      description: 'Provides timely short-term credit to farmers for crop production, post-harvest expenses, maintenance of farm assets, and allied activities like dairy/poultry.',
      link: 'https://myscheme.gov.in/schemes/kcc'
    },
    {
      id: 104,
      title: 'Sub-Mission on Agricultural Mechanization (SMAM)',
      category: 'Equipment Subsidy',
      icon: Tractor,
      subsidyAmount: '40% - 80% Subsidy on Tractors & Machinery',
      eligibility: 'Registered small & marginal farmers, women farmers, SC/ST, and Custom Hiring Centers (CHCs).',
      deadline: '31st Dec 2026',
      description: 'Promotes farm mechanization by providing subsidies on tractors, combine harvesters, rotavators, power tillers, and laser land levelers.',
      link: 'https://agrimachinery.nic.in'
    },
    {
      id: 105,
      title: 'Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)',
      category: 'Irrigation & Water',
      icon: Droplets,
      subsidyAmount: '55% to 80% Subsidy on Drip & Sprinkler Systems',
      eligibility: 'Farmers owning agricultural land or registered leaseholders with accessible water source.',
      deadline: 'Ongoing 2026',
      description: '"Per Drop More Crop" initiative offering financial assistance for micro-irrigation systems to maximize water use efficiency.',
      link: 'https://pmksy.gov.in'
    },
    {
      id: 106,
      title: 'Soil Health Card (SHC) Scheme',
      category: 'Soil Advisory',
      icon: Sprout,
      subsidyAmount: '100% Free Soil Testing & Micronutrient Advisory',
      eligibility: 'All agricultural landholders across all districts and states in India.',
      deadline: 'Ongoing Biannual Cycle',
      description: 'Provides personalized soil health cards detailing 12 critical parameters (N, P, K, pH, EC, Organic Carbon, Micronutrients) with tailored fertilizer advice.',
      link: 'https://soilhealth.dac.gov.in'
    },
    {
      id: 107,
      title: 'National Agriculture Market (e-NAM)',
      category: 'Digital Mandi',
      icon: HeartHandshake,
      subsidyAmount: 'Zero Registration Fee & Free Online Trading',
      eligibility: 'Individual farmers, Farmer Producer Organizations (FPOs), and licensed Mandi traders.',
      deadline: 'Pan-India Live',
      description: 'Pan-India electronic trading portal networking existing APMC mandis to create a unified national market for agricultural commodities.',
      link: 'https://www.enam.gov.in'
    },
    {
      id: 108,
      title: 'Paramparagat Krishi Vikas Yojana (PKVY)',
      category: 'Organic Farming',
      icon: Sprout,
      subsidyAmount: '₹50,000 / Hectare Assistance over 3 Years',
      eligibility: 'Farmers formed into cluster groups of 20+ members holding 50 acres total land.',
      deadline: '31st Jan 2027',
      description: 'Encourages organic farming through cluster formation, PGS organic certification, organic input distribution, and marketing support.',
      link: 'https://pgsindia-ncof.dac.gov.in'
    },
    {
      id: 109,
      title: 'PM Kisan Maandhan Yojana (PM-KMY)',
      category: 'Direct Benefit Transfer',
      icon: Award,
      subsidyAmount: 'Assured Pension of ₹3,000 / Month after Age 60',
      eligibility: 'Small & marginal farmers aged 18 to 40 years with cultivable land up to 2 hectares.',
      deadline: 'Open Enrolment',
      description: 'Voluntary and contributory pension scheme securing the old age social security of vulnerable farming families.',
      link: 'https://pmkmy.gov.in'
    },
    {
      id: 110,
      title: 'Agriculture Infrastructure Fund (AIF)',
      category: 'Infrastructure & Credit',
      icon: Building2,
      subsidyAmount: '3% Interest Subvention on Loans up to ₹2 Crores',
      eligibility: 'Primary Agricultural Credit Societies (PACS), FPOs, Agri-entrepreneurs, and Startups.',
      deadline: '2032 Horizon',
      description: 'Financing facility for building post-harvest management infrastructure such as cold storages, warehouses, assaying units, and processing hubs.',
      link: 'https://agriinfra.dac.gov.in'
    },
    {
      id: 111,
      title: 'Rashtriya Krishi Vikas Yojana (RKVY-RAFTAAR)',
      category: 'Infrastructure & Credit',
      icon: Building2,
      subsidyAmount: 'Grant-in-Aid Support up to ₹25 Lakhs for Startups',
      eligibility: 'Agri-startups, rural youth innovators, state agriculture units, and FPOs.',
      deadline: '31st Mar 2027',
      description: 'Aims at making farming a remunerative economic activity through strengthening infrastructure and promoting agri-entrepreneurship.',
      link: 'https://rkvy.nic.in'
    },
    {
      id: 112,
      title: 'PM Matsya Sampada Yojana (PMMSY)',
      category: 'Equipment Subsidy',
      icon: Award,
      subsidyAmount: '40% to 60% Financial Subsidy for Fisheries & Biofloc',
      eligibility: 'Fish farmers, fish workers, fisheries cooperatives, and aquaculture entrepreneurs.',
      deadline: 'Ongoing 2026',
      description: 'Comprehensive scheme to turn India into a fish production hub with modernization of aquaculture technology and cold chain facilities.',
      link: 'https://pmmsy.dof.gov.in'
    }
  ];

  const categories = ['All', 'Direct Benefit Transfer', 'Crop Insurance', 'Credit & Loans', 'Equipment Subsidy', 'Irrigation & Water', 'Organic Farming', 'Digital Mandi', 'Infrastructure & Credit'];

  const filteredSchemes = allSchemes.filter(scheme => {
    const matchesCategory = selectedCategory === 'All' || scheme.category === selectedCategory;
    const matchesSearch = scheme.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          scheme.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          scheme.subsidyAmount.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)', color: '#FFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.8rem', borderRadius: '50%' }}>
            <Building2 size={36} color="#FFF" />
          </div>
          <div>
            <h2 style={{ color: '#FFF', margin: 0, fontSize: '1.6rem' }}>Government Agricultural Schemes & Subsidies 🏛️</h2>
            <p style={{ color: 'rgba(255,255,255,0.9)', margin: '0.3rem 0 0', fontSize: '0.95rem' }}>
              Explore official Central & State agricultural schemes, check eligibility criteria, and apply online through official government portals.
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', minWidth: '300px', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search schemes by name, keyword, or subsidy type..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                fontSize: '0.8rem',
                padding: '0.4rem 0.8rem',
                borderRadius: '20px',
                border: '1px solid var(--primary)',
                background: selectedCategory === cat ? 'var(--primary)' : 'var(--card-bg)',
                color: selectedCategory === cat ? '#FFF' : 'var(--text-primary)',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Schemes Grid */}
      {filteredSchemes.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <h3>No Schemes Found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Try broadening your search term or selecting 'All' categories.</p>
        </div>
      ) : (
        <div className="grid-2">
          {filteredSchemes.map(scheme => {
            const IconComp = scheme.icon || Building2;
            return (
              <div
                key={scheme.id}
                className="card"
                style={{
                  borderLeft: '5px solid var(--primary)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  transition: 'transform 0.2s ease, boxShadow 0.2s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                    <span className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <IconComp size={12} /> {scheme.category}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--warning)', background: 'var(--bg)', padding: '0.2rem 0.6rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                      Deadline: {scheme.deadline}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', margin: '0.4rem 0 0.6rem', lineHeight: 1.3 }}>
                    {scheme.title}
                  </h3>

                  <div style={{ background: 'var(--light-green)', padding: '0.8rem', borderRadius: 'var(--radius-md)', margin: '0.8rem 0', border: '1px solid var(--primary)' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      SUBSIDY / BENEFIT VALUE
                    </span>
                    <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--primary-hover)', marginTop: '2px' }}>
                      {scheme.subsidyAmount}
                    </div>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '0.8rem' }}>
                    {scheme.description}
                  </p>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', background: 'var(--bg)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <strong>Eligibility Criteria:</strong> {scheme.eligibility}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.8rem', borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={15} color="var(--primary)" /> Verified Govt Portal
                  </span>

                  {/* Redirection Link to Official Government Portal */}
                  <a
                    href={scheme.link}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    Apply Online / Portal <ExternalLink size={15} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
