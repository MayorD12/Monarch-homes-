import { useMemo, useState } from 'react';
import {
  Search, MapPin, BedDouble, Bath, Maximize, Heart, Menu, X, ChevronDown,
  ArrowUpRight, ArrowRight, ShieldCheck, KeyRound, Building2, Calculator,
  Users, Phone, Mail, SlidersHorizontal, Home, MessageCircle, UserRound,
  Bell, Bookmark, Plus, Check, Star, Play, Map, LayoutGrid, List, Facebook,
  Instagram, Linkedin, Youtube, Clock3, ChevronRight, Send, BadgeCheck
} from 'lucide-react';
import properties from './data/properties.json';

const money = (n) => '₦' + Number(n).toLocaleString('en-NG');
const navItems = ['Home', 'Buy', 'Rent', 'Sell', 'Agents', 'Mortgage', 'Services', 'About', 'Contact'];

function App() {
  const [activeTab, setActiveTab] = useState('Buy');
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('Any property');
  const [maxPrice, setMaxPrice] = useState('Any price');
  const [bedrooms, setBedrooms] = useState('Any');
  const [sort, setSort] = useState('Recommended');
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('monarch-favorites') || '[]'); } catch { return []; }
  });
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState('Home');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState('');
  const [mortgagePrice, setMortgagePrice] = useState('250000000');
  const [deposit, setDeposit] = useState('50000000');
  const [rate, setRate] = useState('18');
  const [years, setYears] = useState('20');
  const [formSent, setFormSent] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const toggleFavorite = (id) => {
    const next = favorites.includes(id) ? favorites.filter(x => x !== id) : [...favorites, id];
    setFavorites(next);
    localStorage.setItem('monarch-favorites', JSON.stringify(next));
    setToast(next.includes(id) ? 'Added to your saved properties' : 'Removed from saved properties');
    setTimeout(() => setToast(''), 2200);
  };

  const filtered = useMemo(() => {
    let list = properties.filter(p => {
      const query = search.toLowerCase();
      const matchesText = !query || `${p.title} ${p.location} ${p.type}`.toLowerCase().includes(query);
      const matchesLocation = !location || p.location.toLowerCase().includes(location.toLowerCase());
      const matchesTab = activeTab === 'Buy' ? p.status === 'Buy' : activeTab === 'Rent' ? p.status === 'Rent' : true;
      const matchesType = type === 'Any property' || p.type === type;
      const matchesPrice = maxPrice === 'Any price' || p.price <= Number(maxPrice);
      const matchesBeds = bedrooms === 'Any' || p.beds >= Number(bedrooms);
      return matchesText && matchesLocation && matchesTab && matchesType && matchesPrice && matchesBeds;
    });
    if (sort === 'Price: low to high') list.sort((a,b) => a.price-b.price);
    if (sort === 'Price: high to low') list.sort((a,b) => b.price-a.price);
    return list;
  }, [activeTab, search, location, type, maxPrice, bedrooms, sort]);

  const goTo = (name) => {
    setPage(name);
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (name === 'Buy' || name === 'Rent') setActiveTab(name);
  };

  const resetFilters = () => {
    setSearch(''); setLocation(''); setType('Any property'); setMaxPrice('Any price'); setBedrooms('Any'); setSort('Recommended');
  };

  const monthlyPayment = useMemo(() => {
    const principal = Math.max(0, Number(mortgagePrice || 0) - Number(deposit || 0));
    const monthlyRate = Number(rate || 0) / 1200;
    const months = Number(years || 1) * 12;
    if (!principal || !months) return 0;
    if (!monthlyRate) return principal / months;
    return principal * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months));
  }, [mortgagePrice, deposit, rate, years]);

  const PropertyCard = ({ property }) => (
    <article className="property-card">
      <div className="property-image-wrap" onClick={() => setSelected(property)}>
        <img className="property-image" src={property.image} alt={property.title} />
        {property.tag && <span className="property-tag">{property.tag}</span>}
        <button className={`favorite-btn ${favorites.includes(property.id) ? 'is-saved' : ''}`} onClick={(e) => { e.stopPropagation(); toggleFavorite(property.id); }} aria-label="Save property">
          <Heart size={18} fill={favorites.includes(property.id) ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="property-info">
        <div className="property-price-row"><strong>{property.priceLabel}</strong><span className="listing-status">{property.status}</span></div>
        <h3 onClick={() => setSelected(property)}>{property.title}</h3>
        <p className="property-location"><MapPin size={14} />{property.location}</p>
        <div className="property-meta">
          {property.beds > 0 && <span><BedDouble size={16}/>{property.beds} Beds</span>}
          {property.baths > 0 && <span><Bath size={16}/>{property.baths} Baths</span>}
          <span><Maximize size={15}/>{property.area} sqm</span>
        </div>
      </div>
    </article>
  );

  const SearchPanel = () => (
    <div className="search-panel">
      <div className="search-tabs">
        {['Buy', 'Rent', 'Commercial'].map(t => <button key={t} className={activeTab === t ? 'active' : ''} onClick={() => setActiveTab(t)}>{t}</button>)}
      </div>
      <div className="search-fields">
        <label className="search-field location-field"><span>Location</span><div><MapPin size={17}/><input value={location} onChange={e => setLocation(e.target.value)} placeholder="City, neighbourhood or postcode"/></div></label>
        <label className="search-field"><span>Property type</span><select value={type} onChange={e => setType(e.target.value)}><option>Any property</option><option>House</option><option>Apartment</option><option>Land</option><option>Commercial</option></select></label>
        <label className="search-field"><span>Maximum price</span><select value={maxPrice} onChange={e => setMaxPrice(e.target.value)}><option>Any price</option><option value="50000000">₦50 million</option><option value="100000000">₦100 million</option><option value="250000000">₦250 million</option><option value="500000000">₦500 million</option></select></label>
        <button className="search-submit" onClick={() => { goTo('Buy'); document.getElementById('properties')?.scrollIntoView({behavior:'smooth'}); }}><Search size={18}/> Search homes</button>
      </div>
    </div>
  );

  const Header = () => (
    <header className="site-header">
      <div className="header-inner">
        <button className="brand" onClick={() => goTo('Home')} aria-label="Monarch Homes home">
          <span className="brand-mark"><Building2 size={23}/></span><span className="brand-text">monarch<span>homes</span><small>FIND A PLACE TO BELONG</small></span>
        </button>
        <nav className={`main-nav ${mobileMenu ? 'nav-open' : ''}`}>
          {navItems.map(item => <button key={item} className={page === item ? 'nav-active' : ''} onClick={() => goTo(item)}>{item}{['Buy','Rent','Services'].includes(item) && <ChevronDown size={13}/>}</button>)}
          <button className="mobile-account" onClick={() => goTo('Dashboard')}>My account</button>
        </nav>
        <div className="header-actions">
          <button className="sign-in" onClick={() => setAccountOpen(true)}>Sign in</button>
          <button className="primary-btn header-cta" onClick={() => goTo('Sell')}>List your property <ArrowUpRight size={16}/></button>
        </div>
        <button className="menu-toggle" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle navigation">{mobileMenu ? <X/> : <Menu/>}</button>
      </div>
    </header>
  );

  const Footer = () => (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-brand-col">
          <button className="brand brand-light" onClick={() => goTo('Home')}><span className="brand-mark"><Building2 size={23}/></span><span className="brand-text">monarch<span>homes</span><small>FIND A PLACE TO BELONG</small></span></button>
          <p>Thoughtful property choices start with the right people. Find your next home with confidence.</p>
          <div className="socials"><a href="#facebook" aria-label="Facebook"><Facebook size={17}/></a><a href="#instagram" aria-label="Instagram"><Instagram size={17}/></a><a href="#linkedin" aria-label="LinkedIn"><Linkedin size={17}/></a><a href="#youtube" aria-label="YouTube"><Youtube size={17}/></a></div>
        </div>
        <div><h4>Explore</h4><button onClick={() => goTo('Buy')}>Buy a property</button><button onClick={() => goTo('Rent')}>Rent a property</button><button onClick={() => goTo('Sell')}>Sell with us</button><button onClick={() => goTo('Agents')}>Find an agent</button></div>
        <div><h4>Company</h4><button onClick={() => goTo('About')}>About Monarch</button><button onClick={() => goTo('Services')}>Our services</button><a href="#careers">Careers</a><a href="#partners">Partners</a></div>
        <div className="footer-contact"><h4>Get in touch</h4><p><MapPin size={16}/> Lagos, Nigeria</p><p><Phone size={16}/> +234 800 000 0000</p><p><Mail size={16}/> hello@monarchhomes.ng</p><div className="newsletter"><span>Get property updates</span><div><input placeholder="Your email address" type="email"/><button aria-label="Subscribe"><ArrowRight size={17}/></button></div></div></div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} Monarch Homes. All rights reserved.</span><div><a href="#privacy">Privacy</a><a href="#terms">Terms</a><a href="#cookies">Cookies</a></div></div>
    </footer>
  );

  const PropertyModal = () => selected && (
    <div className="modal-backdrop" onClick={() => setSelected(null)}>
      <div className="property-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setSelected(null)}><X/></button>
        <img src={selected.image} alt={selected.title}/>
        <div className="modal-content"><span className="eyebrow">{selected.status} property · {selected.type}</span><h2>{selected.title}</h2><p className="property-location"><MapPin size={15}/>{selected.location}</p><h3 className="modal-price">{selected.priceLabel}</h3><p>{selected.description}</p><div className="property-meta modal-meta">{selected.beds > 0 && <span><BedDouble/>{selected.beds} Bedrooms</span>}{selected.baths > 0 && <span><Bath/>{selected.baths} Bathrooms</span>}<span><Maximize/>{selected.area} sqm</span></div><h4>Property highlights</h4><div className="feature-grid">{selected.features.map(f => <span key={f}><Check size={15}/>{f}</span>)}</div><button className="primary-btn full-btn" onClick={() => { setSelected(null); goTo('Contact'); }}>Request a viewing <ArrowRight size={17}/></button></div>
      </div>
    </div>
  );

  const HomePage = () => (
    <>
      <section className="hero">
        <div className="hero-image"></div><div className="hero-shade"></div>
        <div className="hero-content page-width">
          <div className="hero-kicker"><span></span> A BETTER WAY TO FIND HOME</div>
          <h1>Find a place<br/>to <em>belong.</em></h1>
          <p>Discover exceptional homes, spaces and opportunities. Your next chapter starts here.</p>
          <div className="hero-trust"><span><ShieldCheck size={17}/> Verified property partners</span><span><BadgeCheck size={17}/> Guided every step</span></div>
        </div>
        <div className="hero-search page-width"><SearchPanel/></div>
        <div className="hero-side-note">CURATED SPACES. CONFIDENT MOVES.</div>
      </section>
      <section className="intro-strip page-width"><div><strong>Make your next move a good one.</strong><span>Local insight. Thoughtful service. A home that feels right.</span></div><button className="text-link" onClick={() => goTo('About')}>Discover Monarch <ArrowUpRight size={17}/></button></section>
      <section className="section page-width" id="properties">
        <div className="section-heading"><div><span className="eyebrow">HANDPICKED FOR YOU</span><h2>Explore exceptional<br/><em>properties.</em></h2></div><button className="text-link" onClick={() => goTo('Buy')}>View all properties <ArrowRight size={17}/></button></div>
        <div className="property-grid">{properties.slice(0,3).map(p => <PropertyCard key={p.id} property={p}/>)}</div>
      </section>
      <section className="locations-section"><div className="page-width"><div className="section-heading"><div><span className="eyebrow">FIND YOUR NEIGHBOURHOOD</span><h2>Places with a sense<br/>of <em>possibility.</em></h2></div><p>From vibrant city living to quieter corners, explore some of Lagos' most sought-after neighbourhoods.</p></div><div className="location-grid"><button onClick={() => {setLocation('Ikoyi');goTo('Buy')}} className="location-card loc-one"><img src="https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=900&q=85"/><span>01 / LAGOS</span><strong>Ikoyi</strong><ArrowUpRight/></button><button onClick={() => {setLocation('Lekki');goTo('Buy')}} className="location-card loc-two"><img src="https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=900&q=85"/><span>02 / LAGOS</span><strong>Lekki</strong><ArrowUpRight/></button><button onClick={() => {setLocation('Victoria Island');goTo('Buy')}} className="location-card loc-three"><img src="https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=900&q=85"/><span>03 / LAGOS</span><strong>Victoria Island</strong><ArrowUpRight/></button></div></div></section>
      <section className="services-band page-width"><div className="services-copy"><span className="eyebrow">MORE THAN A PROPERTY SEARCH</span><h2>Good advice.<br/><em>Better decisions.</em></h2><p>Whether you're buying your first home, finding the right tenant or managing an investment, our team makes every step feel simpler.</p><button className="primary-btn" onClick={() => goTo('Services')}>Explore our services <ArrowRight size={17}/></button></div><div className="service-cards"><div><span className="service-icon"><KeyRound/></span><h3>Buy & rent</h3><p>Find a space that fits the way you want to live.</p></div><div><span className="service-icon"><Building2/></span><h3>Sell with confidence</h3><p>Reach the right people with thoughtful guidance.</p></div><div><span className="service-icon"><ShieldCheck/></span><h3>Property care</h3><p>Protect your investment with trusted support.</p></div><div><span className="service-icon"><Calculator/></span><h3>Valuation advice</h3><p>Make informed decisions with a clearer picture.</p></div></div></section>
      <section className="cta-section"><div className="page-width cta-inner"><div><span className="eyebrow">YOUR PROPERTY JOURNEY STARTS HERE</span><h2>Have a property<br/>to <em>share?</em></h2><p>Put your property in front of people ready to make their next move.</p></div><button className="white-btn" onClick={() => goTo('Sell')}>List your property <ArrowUpRight size={18}/></button></div></section>
    </>
  );

  const ListingsPage = () => (
    <main className="inner-page page-width">
      <div className="page-topline"><span className="eyebrow">MONARCH HOMES / {activeTab.toUpperCase()}</span><span>Thoughtful spaces, carefully found.</span></div>
      <div className="listing-title-row"><div><h1>{activeTab === 'Rent' ? 'Find a place to' : 'Find your next'} <em>{activeTab === 'Rent' ? 'call home.' : 'belong.'}</em></h1><p>Explore our collection of properties across Lagos and beyond.</p></div><button className="outline-btn" onClick={() => setShowFilters(!showFilters)}><SlidersHorizontal size={17}/> Filters</button></div>
      <div className="listing-search"><Search size={18}/><input placeholder="Search by property, location or keyword" value={search} onChange={e => setSearch(e.target.value)}/><button onClick={resetFilters}>Clear</button></div>
      {showFilters && <div className="filter-panel"><label>Property type<select value={type} onChange={e=>setType(e.target.value)}><option>Any property</option><option>House</option><option>Apartment</option><option>Land</option><option>Commercial</option></select></label><label>Maximum price<select value={maxPrice} onChange={e=>setMaxPrice(e.target.value)}><option>Any price</option><option value="50000000">₦50 million</option><option value="100000000">₦100 million</option><option value="250000000">₦250 million</option><option value="500000000">₦500 million</option></select></label><label>Bedrooms<select value={bedrooms} onChange={e=>setBedrooms(e.target.value)}><option>Any</option><option value="1">1+</option><option value="2">2+</option><option value="3">3+</option><option value="4">4+</option></select></label></div>}
      <div className="results-toolbar"><span><strong>{filtered.length}</strong> properties found</span><label>Sort by <select value={sort} onChange={e=>setSort(e.target.value)}><option>Recommended</option><option>Price: low to high</option><option>Price: high to low</option></select></label></div>
      {filtered.length ? <div className="property-grid listing-grid">{filtered.map(p => <PropertyCard key={p.id} property={p}/>)}</div> : <div className="empty-state"><Search size={30}/><h3>No properties found</h3><p>Try adjusting your search or clearing your filters.</p><button className="primary-btn" onClick={resetFilters}>Clear all filters</button></div>}
    </main>
  );

  const SellPage = () => (
    <main className="inner-page page-width sell-page"><span className="eyebrow">SELL WITH MONARCH</span><h1>Your property deserves<br/>the <em>right attention.</em></h1><p className="lead">A considered approach to presenting, pricing and selling your property. Tell us a little about it and our team will be in touch.</p><div className="sell-layout"><div className="sell-benefits"><div><span className="service-icon"><BadgeCheck/></span><h3>Thoughtful valuation</h3><p>Get a clearer view of your property's position in the market.</p></div><div><span className="service-icon"><Users/></span><h3>Qualified enquiries</h3><p>Connect with people whose needs align with your property.</p></div><div><span className="service-icon"><ShieldCheck/></span><h3>Guidance throughout</h3><p>Our team helps you navigate each stage with confidence.</p></div></div><form className="form-card" onSubmit={e=>{e.preventDefault();setFormSent(true)}}><h2>Tell us about your property</h2><p>We'll get back to you to discuss the next steps.</p><div className="form-grid"><label>Your name<input required placeholder="Full name"/></label><label>Email address<input required type="email" placeholder="you@example.com"/></label><label>Phone number<input required placeholder="+234"/></label><label>Property location<input required placeholder="e.g. Lekki Phase 1"/></label><label>Property type<select><option>House</option><option>Apartment</option><option>Land</option><option>Commercial</option></select></label><label>Expected price<input placeholder="e.g. ₦150,000,000"/></label></div><label className="full-label">Anything else we should know?<textarea rows="3" placeholder="Tell us a little about your property..."/></label><button className="primary-btn full-btn" type="submit">Request a valuation <ArrowRight size={17}/></button>{formSent&&<p className="success-note"><Check size={16}/> Thanks. Your enquiry has been recorded in this demo.</p>}</form></div></main>
  );

  const AgentsPage = () => {
    const agents = [{name:'Amara Okafor',role:'Senior Property Consultant',initials:'AO',area:'Ikoyi & Victoria Island'},{name:'Tunde Adebayo',role:'Residential Property Advisor',initials:'TA',area:'Lekki & Ajah'},{name:'Zainab Bello',role:'Investment & Land Specialist',initials:'ZB',area:'Lagos & Abuja'}];
    return <main className="inner-page page-width"><span className="eyebrow">PEOPLE MAKE THE DIFFERENCE</span><h1>Meet your property<br/><em>people.</em></h1><p className="lead">Local knowledge, considered advice and a real person to guide your next move.</p><div className="agent-grid">{agents.map((a,i)=><div className="agent-card" key={a.name}><div className={`agent-avatar avatar-${i}`}>{a.initials}</div><span className="eyebrow">MONARCH PROPERTY PARTNER</span><h3>{a.name}</h3><p>{a.role}</p><small><MapPin size={14}/>{a.area}</small><button className="text-link" onClick={()=>goTo('Contact')}>Contact agent <ArrowUpRight size={16}/></button></div>)}</div></main>;
  };

  const MortgagePage = () => <main className="inner-page page-width mortgage-page"><span className="eyebrow">PLAN YOUR NEXT MOVE</span><h1>Make the numbers<br/><em>feel clearer.</em></h1><p className="lead">Use our simple mortgage calculator to estimate your monthly repayments. This is an illustration, not a loan offer.</p><div className="mortgage-layout"><div className="form-card mortgage-form"><h2>Mortgage calculator</h2><label>Property price (₦)<input type="number" value={mortgagePrice} onChange={e=>setMortgagePrice(e.target.value)}/></label><label>Deposit (₦)<input type="number" value={deposit} onChange={e=>setDeposit(e.target.value)}/></label><label>Annual interest rate (%)<input type="number" min="0" step="0.1" value={rate} onChange={e=>setRate(e.target.value)}/></label><label>Mortgage term<select value={years} onChange={e=>setYears(e.target.value)}><option value="5">5 years</option><option value="10">10 years</option><option value="15">15 years</option><option value="20">20 years</option><option value="25">25 years</option><option value="30">30 years</option></select></label></div><div className="payment-card"><span className="eyebrow">ESTIMATED MONTHLY REPAYMENT</span><strong>{money(Math.round(monthlyPayment))}</strong><p>Based on a {years}-year term at {rate}% annual interest.</p><div className="payment-divider"></div><div><span>Loan amount</span><b>{money(Math.max(0,Number(mortgagePrice||0)-Number(deposit||0)))}</b></div><div><span>Deposit</span><b>{money(Number(deposit||0))}</b></div><small>Actual rates, fees and eligibility vary by lender. Speak with a qualified mortgage adviser before making a decision.</small><button className="white-btn" onClick={()=>goTo('Contact')}>Talk to our team <ArrowRight size={17}/></button></div></div></main>;

  const ServicesPage = () => <main className="inner-page page-width"><span className="eyebrow">HERE FOR EVERY STEP</span><h1>Property support,<br/><em>thoughtfully done.</em></h1><p className="lead">Practical expertise and personal support for every part of your property journey.</p><div className="service-list">{[{icon:<Building2/>,title:'Property management',desc:'Reliable day-to-day care, tenant coordination and clear communication for your investment.'},{icon:<Calculator/>,title:'Property valuation',desc:'Understand your property position with informed guidance and local market context.'},{icon:<ShieldCheck/>,title:'Legal support',desc:'Get connected with professional support to help navigate property documentation and due diligence.'},{icon:<KeyRound/>,title:'Relocation assistance',desc:'Make your move smoother with practical guidance on finding and settling into a new place.'}].map((s,i)=><div className="service-row" key={s.title}><span className="service-icon">{s.icon}</span><div><span className="eyebrow">0{i+1} / MONARCH SERVICES</span><h3>{s.title}</h3><p>{s.desc}</p></div><button className="round-arrow" onClick={()=>goTo('Contact')}><ArrowUpRight/></button></div>)}</div></main>;

  const AboutPage = () => <main className="inner-page page-width about-page"><span className="eyebrow">A MORE CONSIDERED PROPERTY EXPERIENCE</span><h1>Every move begins<br/>with a <em>feeling.</em></h1><div className="about-layout"><img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85"/><div><h2>We believe finding a property should feel as good as finding home.</h2><p>Monarch Homes brings people and places together through thoughtful guidance, carefully presented listings and a commitment to making property decisions feel clearer.</p><p>From the first search to the final handover, we're here to help you move with confidence.</p><button className="primary-btn" onClick={()=>goTo('Contact')}>Get to know us <ArrowRight size={17}/></button></div></div></main>;

  const ContactPage = () => <main className="inner-page page-width"><span className="eyebrow">LET'S START A CONVERSATION</span><h1>We're here to<br/><em>help you move.</em></h1><div className="contact-layout"><div className="contact-details"><h3>Talk to a real person.</h3><p>Whether you have a question, need advice or want to arrange a viewing, we'd love to hear from you.</p><p><Phone/> +234 800 000 0000</p><p><Mail/> hello@monarchhomes.ng</p><p><MapPin/> Lagos, Nigeria</p></div><form className="form-card" onSubmit={e=>{e.preventDefault();setFormSent(true)}}><h2>Send us a message</h2><label>Your name<input required placeholder="Full name"/></label><label>Email address<input required type="email" placeholder="you@example.com"/></label><label>I'm interested in<select><option>Buying a property</option><option>Renting a property</option><option>Selling a property</option><option>Property services</option><option>Something else</option></select></label><label>Message<textarea rows="4" required placeholder="How can we help?"/></label><button className="primary-btn full-btn">Send message <Send size={16}/></button>{formSent&&<p className="success-note"><Check size={16}/> Thank you. Your message has been recorded in this demo.</p>}</form></div></main>;

  const DashboardPage = () => <main className="inner-page page-width"><span className="eyebrow">YOUR MONARCH SPACE</span><h1>Your property<br/><em>shortlist.</em></h1><div className="dashboard-welcome"><div><h2>Welcome back</h2><p>Your saved homes are all in one place.</p></div><button className="primary-btn" onClick={()=>goTo('Buy')}>Explore properties <ArrowRight size={17}/></button></div><div className="dashboard-stats"><div><Bookmark/><strong>{favorites.length}</strong><span>Saved properties</span></div><div><Bell/><strong>0</strong><span>New alerts</span></div><div><MessageCircle/><strong>0</strong><span>Enquiries</span></div></div><h2 className="dashboard-heading">Saved properties</h2>{properties.filter(p=>favorites.includes(p.id)).length ? <div className="property-grid">{properties.filter(p=>favorites.includes(p.id)).map(p=><PropertyCard key={p.id} property={p}/>)}</div> : <div className="empty-state"><Heart size={30}/><h3>Your shortlist is waiting</h3><p>Save properties you love and come back to them here.</p><button className="primary-btn" onClick={()=>goTo('Buy')}>Browse properties</button></div>}</main>;

  const renderPage = () => {
    if (page === 'Home') return <HomePage/>;
    if (page === 'Buy' || page === 'Rent') return <ListingsPage/>;
    if (page === 'Sell') return <SellPage/>;
    if (page === 'Agents') return <AgentsPage/>;
    if (page === 'Services') return <ServicesPage/>;
    if (page === 'About') return <AboutPage/>;
    if (page === 'Mortgage') return <MortgagePage/>;
    if (page === 'Contact') return <ContactPage/>;
    if (page === 'Dashboard' || page === 'Saved') return <DashboardPage/>;
    return <HomePage/>;
  };

  return (
    <div className="app-shell">
      <Header/>
      {renderPage()}
      <Footer/>
      <nav className="mobile-bottom-nav"><button onClick={()=>goTo('Home')} className={page==='Home'?'selected':''}><Home/><span>Home</span></button><button onClick={()=>goTo('Buy')}><Search/><span>Search</span></button><button onClick={()=>goTo('Saved')}><Heart/><span>Saved</span></button><button onClick={()=>goTo('Contact')}><MessageCircle/><span>Messages</span></button><button onClick={()=>goTo('Dashboard')}><UserRound/><span>Profile</span></button></nav>
      {selected && <PropertyModal/>}
      {accountOpen && <div className="modal-backdrop" onClick={()=>setAccountOpen(false)}><div className="account-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setAccountOpen(false)}><X/></button><span className="eyebrow">WELCOME TO MONARCH</span><h2>Your next move starts here.</h2><p>Sign-in is a front-end demo. Account authentication can be connected when you add a backend.</p><label>Email address<input type="email" placeholder="you@example.com"/></label><label>Password<input type="password" placeholder="Enter your password"/></label><button className="primary-btn full-btn" onClick={()=>{setAccountOpen(false);goTo('Dashboard');}}>Continue to demo dashboard <ArrowRight size={17}/></button><small>Need an account? Registration can be enabled with an authentication provider.</small></div></div>}
      {toast && <div className="toast"><Check size={16}/>{toast}</div>}
    </div>
  );
}

export default App;
