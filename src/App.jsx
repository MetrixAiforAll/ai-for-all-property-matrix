import { useMemo, useState } from 'react';
import {
  ArrowDownUp, ArrowRight, Bell, Bookmark, Check, ChevronDown, ChevronLeft,
  ChevronRight, CircleHelp, Clock3, Command, Filter, LayoutGrid, List,
  MapPin, Menu, MoreHorizontal, Search, SlidersHorizontal, Sparkles, Target,
  TrendingUp, X,
} from 'lucide-react';

const listings = [
  { id: 'LA-2048', address: '1842 W 74th Street', neighborhood: 'Hyde Park, Los Angeles', price: 489000, estimate: 645000, beds: 3, baths: 2, sqft: 1480, status: 'Pre-foreclosure', score: 94, days: 12, initials: 'HP', image: 'home-a' },
  { id: 'LA-1973', address: '912 E 53rd Street', neighborhood: 'South Park, Los Angeles', price: 365000, estimate: 498000, beds: 2, baths: 1, sqft: 1020, status: 'Tax lien', score: 88, days: 8, initials: 'SP', image: 'home-b' },
  { id: 'LA-2181', address: '406 N Avenue 59', neighborhood: 'Highland Park, Los Angeles', price: 725000, estimate: 890000, beds: 4, baths: 2, sqft: 1860, status: 'Probate', score: 82, days: 21, initials: 'HP', image: 'home-c' },
  { id: 'LA-1836', address: '2715 S Hobart Boulevard', neighborhood: 'Jefferson Park, Los Angeles', price: 559000, estimate: 720000, beds: 3, baths: 2, sqft: 1535, status: 'Pre-foreclosure', score: 79, days: 16, initials: 'JP', image: 'home-d' },
  { id: 'LA-2210', address: '623 W 88th Place', neighborhood: 'Westmont, Los Angeles', price: 429000, estimate: 585000, beds: 3, baths: 1, sqft: 1260, status: 'Auction', score: 75, days: 5, initials: 'WM', image: 'home-e' },
  { id: 'LA-1752', address: '1336 N Bonnie Brae Street', neighborhood: 'Westlake, Los Angeles', price: 615000, estimate: 780000, beds: 4, baths: 3, sqft: 2010, status: 'Vacant', score: 71, days: 29, initials: 'WL', image: 'home-f' },
];

const money = (value) => `$${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)}`;
const statuses = ['All statuses', 'Pre-foreclosure', 'Tax lien', 'Probate', 'Auction', 'Vacant'];

function App() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All statuses');
  const [maxPrice, setMaxPrice] = useState(900000);
  const [minBeds, setMinBeds] = useState(0);
  const [minScore, setMinScore] = useState(0);
  const [sortBy, setSortBy] = useState('score');
  const [saved, setSaved] = useState([]);
  const [view, setView] = useState('grid');
  const [mobileFilters, setMobileFilters] = useState(false);
  const [notice, setNotice] = useState('');

  const filtered = useMemo(() => listings
    .filter((item) => `${item.address} ${item.neighborhood} ${item.status}`.toLowerCase().includes(query.toLowerCase()))
    .filter((item) => status === 'All statuses' || item.status === status)
    .filter((item) => item.price <= maxPrice && item.beds >= minBeds && item.score >= minScore)
    .sort((a, b) => sortBy === 'price' ? a.price - b.price : sortBy === 'newest' ? a.days - b.days : b.score - a.score),
  [query, status, maxPrice, minBeds, minScore, sortBy]);

  const toggleSaved = (id) => setSaved((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  const showNotice = (message) => { setNotice(message); window.setTimeout(() => setNotice(''), 2600); };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileFilters ? 'sidebar-open' : ''}`}>
        <a className="brand" href="#dashboard" aria-label="MatrixClaimed home">
          <span className="brand-mark"><span /><span /><span /><span /></span>
          <span>matrix<span className="brand-light">claimed</span></span>
        </a>
        <div className="workspace-label">WORKSPACE</div>
        <button className="workspace-select"><span className="workspace-avatar">LA</span><span className="workspace-text"><b>Los Angeles</b><small>Property market</small></span><ChevronDown size={16} /></button>
        <div className="nav-label">OVERVIEW</div>
        <nav className="nav-menu">
          <a className="nav-link active" href="#dashboard"><LayoutGrid size={18} /> Dashboard</a>
          <a className="nav-link" href="#listings"><MapPin size={18} /> Property matrix <span className="nav-count">24</span></a>
          <button className="nav-link" onClick={() => showNotice(`${saved.length} saved properties`)}><Bookmark size={18} /> Saved properties <span className="nav-count">{saved.length}</span></button>
        </nav>
        <div className="nav-label tools-label">YOUR TOOLS</div>
        <nav className="nav-menu">
          <button className="nav-link" onClick={() => showNotice('Your alerts are up to date')}><Bell size={18} /> Market alerts <span className="nav-dot" /></button>
          <button className="nav-link" onClick={() => showNotice('Opportunity score ranks demo listings by estimated upside')}><Target size={18} /> Opportunity score</button>
        </nav>
        <div className="sidebar-bottom">
          <div className="plan-card"><div className="plan-icon"><Sparkles size={16} /></div><b>Find your next opportunity</b><p>Get a clearer view of off-market properties across LA.</p><button onClick={() => showNotice('You’re viewing the demo workspace')}>Explore insights <ArrowRight size={14} /></button></div>
          <button className="profile"><span className="profile-avatar">JD</span><span className="profile-copy"><b>Jordan Davis</b><small>Free workspace</small></span><MoreHorizontal size={18} /></button>
        </div>
      </aside>

      <main className="main-area" id="dashboard">
        <header className="topbar">
          <button className="mobile-menu" aria-label="Open filters" onClick={() => setMobileFilters(!mobileFilters)}><Menu size={20} /></button>
          <div className="breadcrumbs">Workspace <ChevronRight size={14} /> <b>Dashboard</b></div>
          <div className="top-actions"><span className="live-indicator"><i /> Demo data</span><button className="icon-button" aria-label="Notifications" onClick={() => showNotice('You’re all caught up')}><Bell size={18} /><i className="notification-dot" /></button><button className="help-button" onClick={() => showNotice('All properties shown are illustrative demo data.')}><CircleHelp size={17} /> Help</button></div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div><div className="eyebrow"><span className="eyebrow-line" /> PROPERTY INTELLIGENCE <span className="eyebrow-location"><MapPin size={12} /> LOS ANGELES, CA</span></div><h1>Find your next <span>opportunity.</span></h1><p className="intro">A clearer view of distressed properties across Los Angeles.</p></div>
            <button className="date-button"><Clock3 size={15} /> Updated today <ChevronDown size={14} /></button>
          </section>

          <section className="stats-grid" aria-label="Market summary">
            <article className="stat-card"><div className="stat-top"><span>Properties tracked</span><span className="stat-icon blue"><LayoutGrid size={16} /></span></div><div className="stat-value">1,284</div><div className="stat-foot"><span className="positive"><TrendingUp size={13} /> 8.2%</span> <span>vs. last month</span></div><div className="sparkline spark-blue"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></article>
            <article className="stat-card"><div className="stat-top"><span>New this week</span><span className="stat-icon mint"><Sparkles size={16} /></span></div><div className="stat-value">46</div><div className="stat-foot"><span className="positive"><TrendingUp size={13} /> 12.5%</span> <span>vs. last week</span></div><div className="sparkline spark-mint"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></article>
            <article className="stat-card"><div className="stat-top"><span>Avg. opportunity score</span><span className="stat-icon amber"><Target size={16} /></span></div><div className="stat-value">76<span className="stat-unit">/100</span></div><div className="stat-foot"><span className="neutral">Strong</span> <span>market potential</span></div><div className="score-meter"><i /></div></article>
            <article className="stat-card"><div className="stat-top"><span>Median discount</span><span className="stat-icon violet"><ArrowDownUp size={16} /></span></div><div className="stat-value">18.4<span className="stat-unit">%</span></div><div className="stat-foot"><span className="positive">Below market</span> <span>estimated</span></div><div className="discount-visual"><span /><span /><span /><span /><span /><span /><span /><span /></div></article>
          </section>

          <section className="listing-section" id="listings">
            <div className="section-heading"><div><h2>Property matrix</h2><p>Explore opportunities matching your criteria.</p></div><button className="outline-button export-button" onClick={() => showNotice('Your demo report is ready to explore')}><ArrowDownUp size={15} /> Export <ChevronDown size={14} /></button></div>
            <div className="filter-bar">
              <label className="search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search address, area..." /><kbd><Command size={11} /> K</kbd></label>
              <label className="select-wrap"><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value)}>{statuses.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></label>
              <label className="select-wrap beds-select"><span>Beds</span><select value={minBeds} onChange={(event) => setMinBeds(Number(event.target.value))}><option value={0}>Any</option><option value={1}>1+</option><option value={2}>2+</option><option value={3}>3+</option><option value={4}>4+</option></select><ChevronDown size={14} /></label>
              <label className="select-wrap price-select"><span>Max price</span><select value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))}><option value={500000}>$500k</option><option value={650000}>$650k</option><option value={750000}>$750k</option><option value={900000}>$900k</option><option value={1200000}>Any price</option></select><ChevronDown size={14} /></label>
              <label className="select-wrap score-select"><span>Min score</span><select value={minScore} onChange={(event) => setMinScore(Number(event.target.value))}><option value={0}>Any score</option><option value={70}>70+</option><option value={80}>80+</option><option value={90}>90+</option></select><ChevronDown size={14} /></label>
              <button className="filter-icon-button" aria-label="More filters" onClick={() => showNotice('All available filters are shown')}><SlidersHorizontal size={17} /></button>
            </div>
            <div className="results-row"><span><b>{filtered.length} properties</b> <span className="muted">matching your criteria</span></span><div className="results-actions"><label className="sort-select"><ArrowDownUp size={14} /><select value={sortBy} onChange={(event) => setSortBy(event.target.value)}><option value="score">Best match</option><option value="price">Price: low to high</option><option value="newest">Recently added</option></select><ChevronDown size={13} /></label><div className="view-toggle"><button className={view === 'grid' ? 'selected' : ''} aria-label="Grid view" onClick={() => setView('grid')}><LayoutGrid size={16} /></button><button className={view === 'list' ? 'selected' : ''} aria-label="List view" onClick={() => setView('list')}><List size={17} /></button></div></div></div>

            {filtered.length ? <div className={`property-grid ${view === 'list' ? 'list-view' : ''}`}>
              {filtered.map((property) => {
                const isSaved = saved.includes(property.id);
                const upside = Math.round(((property.estimate - property.price) / property.price) * 100);
                return <article className="property-card" key={property.id}>
                  <div className={`property-image ${property.image}`}><div className="image-overlay" /><div className="image-top"><span className="status-pill"><i />{property.status}</span><button className={`save-button ${isSaved ? 'is-saved' : ''}`} aria-label={isSaved ? 'Remove saved property' : 'Save property'} onClick={() => toggleSaved(property.id)}>{isSaved ? <Check size={16} /> : <Bookmark size={16} />}</button></div><span className="property-code">{property.id}</span></div>
                  <div className="property-info"><div className="property-title-row"><div><h3>{property.address}</h3><p><MapPin size={13} /> {property.neighborhood}</p></div><div className="score-badge"><span>{property.score}</span><small>SCORE</small></div></div>
                    <div className="property-meta"><span>{property.beds} beds</span><i /><span>{property.baths} baths</span><i /><span>{property.sqft.toLocaleString()} sqft</span></div>
                    <div className="property-prices"><div><small>Asking price</small><b>{money(property.price)}</b></div><div className="estimate"><small>Est. market value</small><b>{money(property.estimate)}</b></div></div>
                    <div className="property-footer"><span className="upside"><TrendingUp size={13} /> {upside}% est. upside</span><span className="added">{property.days}d ago</span></div>
                  </div>
                </article>;
              })}
            </div> : <div className="empty-state"><span><Search size={20} /></span><h3>No matching properties</h3><p>Try adjusting your filters or search terms.</p><button onClick={() => { setQuery(''); setStatus('All statuses'); setMaxPrice(900000); setMinBeds(0); setMinScore(0); }}>Clear filters</button></div>}

            <div className="pagination"><span>Showing <b>{filtered.length ? 1 : 0}–{filtered.length}</b> of <b>{filtered.length}</b> properties</span><div><button disabled aria-label="Previous page"><ChevronLeft size={16} /></button><button className="page-current">1</button><button disabled aria-label="Next page"><ChevronRight size={16} /></button></div></div>
          </section>
          <footer className="disclaimer"><Sparkles size={13} /><span>Demo workspace · All property information and figures are fictional examples for illustrative purposes only.</span><a href="#dashboard">Learn about scores <ArrowRight size={12} /></a></footer>
        </div>
      </main>
      {mobileFilters && <button className="sidebar-backdrop" aria-label="Close menu" onClick={() => setMobileFilters(false)} />}
      {notice && <div className="toast"><Check size={16} />{notice}<button onClick={() => setNotice('')} aria-label="Dismiss"><X size={15} /></button></div>}
    </div>
  );
}

export default App;
