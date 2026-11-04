import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowDownUp, ArrowRight, Bell, Bookmark, Check, ChevronDown, ChevronLeft,
  ChevronRight, CircleHelp, Clock3, LayoutGrid, List, Map as MapIcon, MapPin,
  Menu, Moon, RefreshCw, Search, SlidersHorizontal, Sparkles, Sun, Target,
  TrendingUp, X,
} from 'lucide-react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DEMO_PROPERTIES, getProperties } from './lib/properties.js';

const money = (value) => `$${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)}`;
const statuses = ['All statuses', 'Pre-foreclosure', 'Tax lien', 'Probate', 'Auction', 'Vacant'];
const weeklyTrend = [42, 48, 45, 59, 54, 68, 61, 72, 67, 83, 78, 94];
const markerIcon = divIcon({ className: 'map-marker-wrapper', html: '<span class="map-marker"><i></i></span>', iconSize: [27, 35], iconAnchor: [13, 30], popupAnchor: [0, -28] });

function TrendChart({ properties }) {
  const points = weeklyTrend.map((value, index) => `${index * 100 / (weeklyTrend.length - 1)},${100 - value}`).join(' ');
  const statusCounts = ['Pre-foreclosure', 'Tax lien', 'Probate', 'Auction', 'Vacant'].map((name) => ({ name, count: properties.filter((item) => item.status === name).length }));
  const max = Math.max(1, ...statusCounts.map((item) => item.count));
  return <section className="analytics-grid" aria-label="Market analytics">
    <article className="analytics-card trend-card">
      <div className="analytics-heading"><div><span className="eyebrow-small">MARKET ACTIVITY</span><h2>Opportunity pulse</h2><p>New distressed listings · last 12 weeks</p></div><span className="chart-period">12 weeks <ChevronDown size={13} /></span></div>
      <div className="chart-summary"><b>+18.6%</b><span><TrendingUp size={13} /> vs. previous period</span></div>
      <div className="line-chart"><div className="chart-y-labels"><span>100</span><span>75</span><span>50</span><span>25</span></div><svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Listing activity trend rising over twelve weeks"><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--chart-fill)" stopOpacity=".3"/><stop offset="100%" stopColor="var(--chart-fill)" stopOpacity="0"/></linearGradient></defs><path className="chart-area" d={`M ${points.replaceAll(' ', ' L ')} L 100 100 L 0 100 Z`} /><polyline className="chart-line" points={points} /></svg><div className="chart-x-labels"><span>Aug 12</span><span>Sep 2</span><span>Sep 23</span><span>Oct 14</span><span>Nov 4</span></div></div>
    </article>
    <article className="analytics-card status-card"><div className="analytics-heading"><div><span className="eyebrow-small">DISTRESSED INVENTORY</span><h2>By property status</h2><p>Current filtered opportunities</p></div><span className="status-total">{properties.length} <small>listings</small></span></div><div className="status-bars">{statusCounts.map((item) => <div className="status-bar-row" key={item.name}><span>{item.name}</span><div className="bar-track"><i style={{ width: `${Math.max(4, item.count / max * 100)}%` }} /></div><b>{item.count}</b></div>)}</div><div className="status-insight"><Sparkles size={14} /><span>Pre-foreclosures are the most common opportunity in this view.</span></div></article>
  </section>;
}

function PropertyCard({ property, saved, onToggleSave }) {
  const upside = property.estimate > 0 ? Math.round(((property.estimate - property.price) / property.price) * 100) : 0;
  return <article className="property-card">
    <div className={`property-image ${property.image || 'home-a'}`}><div className="image-overlay" /><div className="image-top"><span className="status-pill"><i />{property.status}</span><button className={`save-button ${saved ? 'is-saved' : ''}`} aria-label={saved ? 'Remove saved property' : 'Save property'} onClick={() => onToggleSave(property.id)}>{saved ? <Check size={16} /> : <Bookmark size={16} />}</button></div><span className="property-code">{property.id}</span></div>
    <div className="property-info"><div className="property-title-row"><div><h3>{property.address}</h3><p><MapPin size={13} /> {property.neighborhood}</p></div><div className="score-badge"><span>{property.score}</span><small>SCORE</small></div></div>
      <div className="property-meta"><span>{property.beds} beds</span><i /><span>{property.baths} baths</span><i /><span>{property.sqft.toLocaleString()} sqft</span></div>
      <div className="property-prices"><div><small>Asking price</small><b>{money(property.price)}</b></div><div className="estimate"><small>Est. market value</small><b>{money(property.estimate)}</b></div></div>
      <div className="property-footer"><span className="upside"><TrendingUp size={13} /> {upside}% est. upside</span><span className="added">{property.days}d ago</span></div>
    </div>
  </article>;
}

function App() {
  const [properties, setProperties] = useState(DEMO_PROPERTIES);
  const [dataSource, setDataSource] = useState('demo');
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All statuses');
  const [maxPrice, setMaxPrice] = useState(900000);
  const [minBeds, setMinBeds] = useState(0);
  const [minScore, setMinScore] = useState(0);
  const [sortBy, setSortBy] = useState('score');
  const [saved, setSaved] = useState(() => { try { return JSON.parse(localStorage.getItem('matrixclaimed-saved') || '[]'); } catch { return []; } });
  const [view, setView] = useState('grid');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('matrixclaimed-theme') === 'dark');
  const [notice, setNotice] = useState('');

  const refreshProperties = useCallback(async () => {
    setLoading(true); setApiError('');
    try {
      const result = await getProperties();
      setProperties(result.properties); setDataSource(result.source);
      if (result.source === 'demo') setApiError(result.message || '');
    } catch (error) {
      setProperties(DEMO_PROPERTIES); setDataSource('demo'); setApiError(error.message || 'Could not load property data. Showing demo listings.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { refreshProperties(); }, [refreshProperties]);
  useEffect(() => { document.documentElement.dataset.theme = darkMode ? 'dark' : 'light'; localStorage.setItem('matrixclaimed-theme', darkMode ? 'dark' : 'light'); }, [darkMode]);
  useEffect(() => { localStorage.setItem('matrixclaimed-saved', JSON.stringify(saved)); }, [saved]);
  useEffect(() => { if (!notice) return undefined; const timer = window.setTimeout(() => setNotice(''), 2800); return () => window.clearTimeout(timer); }, [notice]);

  const filtered = useMemo(() => properties
    .filter((item) => `${item.address} ${item.neighborhood} ${item.status}`.toLowerCase().includes(query.toLowerCase()))
    .filter((item) => status === 'All statuses' || item.status === status)
    .filter((item) => item.price <= maxPrice && item.beds >= minBeds && item.score >= minScore)
    .sort((a, b) => sortBy === 'price' ? a.price - b.price : sortBy === 'newest' ? a.days - b.days : b.score - a.score),
  [properties, query, status, maxPrice, minBeds, minScore, sortBy]);
  const toggleSaved = (id) => setSaved((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  const clearFilters = () => { setQuery(''); setStatus('All statuses'); setMaxPrice(900000); setMinBeds(0); setMinScore(0); };

  return <div className="app-shell" id="dashboard">
    <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
      <a className="brand" href="#dashboard" aria-label="MatrixClaimed home"><span className="brand-mark"><span/><span/><span/><span/></span><span>matrix<span className="brand-light">claimed</span></span></a>
      <div className="workspace-label">WORKSPACE</div><button className="workspace-select"><span className="workspace-avatar">LA</span><span className="workspace-text"><b>Los Angeles</b><small>Property market</small></span><ChevronDown size={16}/></button>
      <div className="nav-label">OVERVIEW</div><nav className="nav-menu"><a className="nav-link active" href="#dashboard"><LayoutGrid size={18}/> Dashboard</a><a className="nav-link" href="#listings"><MapPin size={18}/> Property matrix <span className="nav-count">{properties.length}</span></a><button className="nav-link" onClick={() => setNotice(`${saved.length} saved properties`)}><Bookmark size={18}/> Saved properties <span className="nav-count">{saved.length}</span></button></nav>
      <div className="nav-label tools-label">YOUR TOOLS</div><nav className="nav-menu"><button className="nav-link" onClick={() => setNotice('You’re all caught up')}><Bell size={18}/> Market alerts <span className="nav-dot"/></button><a className="nav-link" href="#analytics"><Target size={18}/> Market analytics</a></nav>
      <div className="sidebar-bottom"><div className="plan-card"><div className="plan-icon"><Sparkles size={16}/></div><b>Find your next opportunity</b><p>Get a clearer view of off-market properties across LA.</p><a href="#analytics">Explore insights <ArrowRight size={14}/></a></div><button className="profile"><span className="profile-avatar">JD</span><span className="profile-copy"><b>Jordan Davis</b><small>Demo workspace</small></span></button></div>
    </aside>

    <main className="main-area"><header className="topbar"><button className="mobile-menu" aria-label="Open navigation" onClick={() => setMobileMenu(!mobileMenu)}><Menu size={20}/></button><div className="breadcrumbs">Workspace <ChevronRight size={14}/> <b>Dashboard</b></div><div className="top-actions"><span className={`live-indicator ${dataSource === 'api' ? 'api-live' : ''}`}><i/>{dataSource === 'api' ? 'Live data' : 'Demo data'}</span><button className="icon-button" aria-label="Toggle dark mode" onClick={() => setDarkMode(!darkMode)}>{darkMode ? <Sun size={18}/> : <Moon size={18}/>}</button><button className="icon-button notification-button" aria-label="Notifications" onClick={() => setNotice('You’re all caught up')}><Bell size={18}/><i className="notification-dot"/></button><button className="help-button" onClick={() => setNotice('Market figures are estimates. Verify details with the relevant public record and a qualified professional.')}><CircleHelp size={17}/> Help</button></div></header>
      <div className="page-content"><section className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-line"/> PROPERTY INTELLIGENCE <span className="eyebrow-location"><MapPin size={12}/> LOS ANGELES, CA</span></div><h1>Find your next <span>opportunity.</span></h1><p className="intro">A clearer view of distressed properties across Los Angeles.</p></div><button className="date-button" onClick={refreshProperties}><RefreshCw size={14} className={loading ? 'spin' : ''}/> {loading ? 'Refreshing…' : 'Refresh data'} <ChevronDown size={14}/></button></section>

        <section className="stats-grid" aria-label="Market summary"><article className="stat-card"><div className="stat-top"><span>Properties tracked</span><span className="stat-icon blue"><LayoutGrid size={16}/></span></div><div className="stat-value">{dataSource === 'demo' ? '1,284' : properties.length.toLocaleString()}</div><div className="stat-foot"><span className="positive"><TrendingUp size={13}/> 8.2%</span> <span>vs. last month</span></div><div className="sparkline spark-blue">{weeklyTrend.map((v, i) => <i key={i} style={{ height: `${6 + v * .22}px` }}/>)}</div></article><article className="stat-card"><div className="stat-top"><span>New this week</span><span className="stat-icon mint"><Sparkles size={16}/></span></div><div className="stat-value">{dataSource === 'demo' ? '46' : properties.filter((item) => item.days <= 7).length}</div><div className="stat-foot"><span className="positive"><TrendingUp size={13}/> 12.5%</span> <span>vs. last week</span></div><div className="sparkline spark-mint">{weeklyTrend.slice().reverse().map((v, i) => <i key={i} style={{ height: `${6 + v * .22}px` }}/>)}</div></article><article className="stat-card"><div className="stat-top"><span>Avg. opportunity score</span><span className="stat-icon amber"><Target size={16}/></span></div><div className="stat-value">{properties.length ? Math.round(properties.reduce((sum, item) => sum + item.score, 0) / properties.length) : 0}<span className="stat-unit">/100</span></div><div className="stat-foot"><span className="neutral">{properties.length ? 'Strong' : 'No results'}</span> <span>market potential</span></div><div className="score-meter"><i style={{ width: `${properties.length ? properties.reduce((sum, item) => sum + item.score, 0) / properties.length : 0}%` }}/></div></article><article className="stat-card"><div className="stat-top"><span>Median discount</span><span className="stat-icon violet"><ArrowDownUp size={16}/></span></div><div className="stat-value">{dataSource === 'demo' ? '18.4' : properties.length ? (properties.reduce((sum, item) => sum + Math.max(0, (item.estimate - item.price) / item.estimate * 100), 0) / properties.length).toFixed(1) : '0.0'}<span className="stat-unit">%</span></div><div className="stat-foot"><span className="positive">Below market</span> <span>estimated</span></div><div className="discount-visual">{weeklyTrend.slice(0, 8).map((v, i) => <span key={i} style={{ height: `${8 + v * .16}px` }}/>)}</div></article></section>

        <div id="analytics"><TrendChart properties={filtered}/></div>
        <section className="listing-section" id="listings"><div className="section-heading"><div><h2>Property matrix</h2><p>Explore opportunities matching your criteria.</p></div><button className="outline-button export-button" onClick={() => setNotice('Your filtered demo report is ready to explore')}><ArrowDownUp size={15}/> Export <ChevronDown size={14}/></button></div>
          {apiError && <div className="api-banner"><CircleHelp size={15}/><span>{apiError}</span><button onClick={() => setApiError('')} aria-label="Dismiss"><X size={14}/></button></div>}
          <div className="filter-bar"><label className="search-box"><Search size={17}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search address, area..."/><kbd>⌘ K</kbd></label><label className="select-wrap"><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value)}>{statuses.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14}/></label><label className="select-wrap beds-select"><span>Beds</span><select value={minBeds} onChange={(event) => setMinBeds(Number(event.target.value))}><option value={0}>Any</option><option value={1}>1+</option><option value={2}>2+</option><option value={3}>3+</option><option value={4}>4+</option></select><ChevronDown size={14}/></label><label className="select-wrap price-select"><span>Max price</span><select value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))}><option value={500000}>$500k</option><option value={650000}>$650k</option><option value={750000}>$750k</option><option value={900000}>$900k</option><option value={1200000}>Any price</option></select><ChevronDown size={14}/></label><label className="select-wrap score-select"><span>Min score</span><select value={minScore} onChange={(event) => setMinScore(Number(event.target.value))}><option value={0}>Any score</option><option value={70}>70+</option><option value={80}>80+</option><option value={90}>90+</option></select><ChevronDown size={14}/></label><button className="filter-icon-button" aria-label="Reset filters" onClick={clearFilters}><SlidersHorizontal size={17}/></button></div>
          <div className="results-row"><span><b>{filtered.length} properties</b> <span className="muted">matching your criteria</span></span><div className="results-actions"><label className="sort-select"><ArrowDownUp size={14}/><select value={sortBy} onChange={(event) => setSortBy(event.target.value)}><option value="score">Best match</option><option value="price">Price: low to high</option><option value="newest">Recently added</option></select><ChevronDown size={13}/></label><div className="view-toggle"><button className={view === 'grid' ? 'selected' : ''} aria-label="Grid view" onClick={() => setView('grid')}><LayoutGrid size={16}/></button><button className={view === 'list' ? 'selected' : ''} aria-label="List view" onClick={() => setView('list')}><List size={17}/></button><button className={view === 'map' ? 'selected' : ''} aria-label="Map view" onClick={() => setView('map')}><MapIcon size={16}/></button></div></div></div>
          {loading && <div className="loading-strip"><span/> Updating property data…</div>}
          {filtered.length ? view === 'map' ? <div className="map-view"><MapContainer center={[34.0522, -118.286]} zoom={10} scrollWheelZoom={false} className="property-map"><TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/><MapCenterOnProperties properties={filtered}/>{filtered.map((property) => <Marker key={property.id} position={[property.lat, property.lng]} icon={markerIcon}><Popup><div className="map-popup"><b>{property.address}</b><span>{property.neighborhood}</span><strong>{money(property.price)}</strong><small>{property.score} opportunity score · {property.status}</small></div></Popup></Marker>)}</MapContainer><div className="map-legend"><MapPin size={14}/> {filtered.length} opportunities <span>·</span> Los Angeles County</div></div> : <div className={`property-grid ${view === 'list' ? 'list-view' : ''}`}>{filtered.map((property) => <PropertyCard key={property.id} property={property} saved={saved.includes(property.id)} onToggleSave={toggleSaved}/>)}</div> : <div className="empty-state"><span><Search size={20}/></span><h3>No matching properties</h3><p>Try adjusting your filters or search terms.</p><button onClick={clearFilters}>Clear filters</button></div>}
          <div className="pagination"><span>Showing <b>{filtered.length ? 1 : 0}–{filtered.length}</b> of <b>{filtered.length}</b> properties</span><div><button disabled aria-label="Previous page"><ChevronLeft size={16}/></button><button className="page-current">1</button><button disabled aria-label="Next page"><ChevronRight size={16}/></button></div></div>
        </section><footer className="disclaimer"><Sparkles size={13}/><span>{dataSource === 'api' ? 'Live API data · Estimates and public-record status should be independently verified.' : 'Demo workspace · All property information and figures are fictional examples for illustrative purposes only.'}</span><a href="#analytics">Learn about scores <ArrowRight size={12}/></a></footer>
      </div>
    </main>
    {mobileMenu && <button className="sidebar-backdrop" aria-label="Close menu" onClick={() => setMobileMenu(false)}/>}{notice && <div className="toast"><Check size={16}/>{notice}<button onClick={() => setNotice('')} aria-label="Dismiss"><X size={15}/></button></div>}
  </div>;
}

function MapCenterOnProperties({ properties }) {
  // Fit the active listings into view when filters change; LA remains the fallback for a single point.
  const map = requireMapHook();
  useEffect(() => { if (properties.length > 1) map.fitBounds(properties.map((item) => [item.lat, item.lng]), { padding: [36, 36], maxZoom: 12 }); else if (properties.length === 1) map.setView([properties[0].lat, properties[0].lng], 12); }, [map, properties]);
  return null;
}

function requireMapHook() {
  // Defined separately so the map hook is only used under MapContainer.
  return useMapHook();
}

import { useMap as useMapHook } from 'react-leaflet';

export default App;
