const fs = require('fs');
const path = require('path');

// 200 distinct new stocks (Brazil + US)
const newStocks = [
  // Brazilian Stocks
  { symbol: 'ABEV3', name: 'Ambev S.A.' },
  { symbol: 'AERI3', name: 'Aeris Indústria e Comércio de Equipamentos S.A.' },
  { symbol: 'AESB3', name: 'AES Brasil Energia S.A.' },
  { symbol: 'AGXY3', name: 'AgroGalaxy Participações S.A.' },
  { symbol: 'ALUP3', name: 'Alupar Investimento S.A. - Ordinárias' },
  { symbol: 'ALUP4', name: 'Alupar Investimento S.A. - Preferenciais' },
  { symbol: 'AMAR3', name: 'Lojas Marisa S.A.' },
  { symbol: 'ANIM3', name: 'Anima Holding S.A.' },
  { symbol: 'APER3', name: 'Alper Consultoria em Seguros S.A.' },
  { symbol: 'ARML3', name: 'Armac Locação S.A.' },
  { symbol: 'ATOM3', name: 'Atom Empreendimentos S.A.' },
  { symbol: 'AURA33', name: 'Aura Minerals Inc. - BDR' },
  { symbol: 'AZEV4', name: 'Azevedo & Travassos S.A. - Preferenciais' },
  { symbol: 'AZEV3', name: 'Azevedo & Travassos S.A. - Ordinárias' },
  { symbol: 'BAHI3', name: 'Bahema S.A.' },
  { symbol: 'BAZA3', name: 'Banco da Amazônia S.A.' },
  { symbol: 'BBTG12', name: 'BTG Pactual Participations - Units' },
  { symbol: 'BIOM3', name: 'Biomm S.A.' },
  { symbol: 'BMEB4', name: 'Banco Mercantil do Brasil S.A. - Preferenciais' },
  { symbol: 'BMOB3', name: 'Bemobi Mobile S.A.' },
  { symbol: 'BOAS3', name: 'Boa Vista Serviços S.A.' },
  { symbol: 'BPAR3', name: 'Banco do Estado do Pará S.A.' },
  { symbol: 'BRAP3', name: 'Bradespar S.A. - Ordinárias' },
  { symbol: 'BRAP4', name: 'Bradespar S.A. - Preferenciais' },
  { symbol: 'BRIT3', name: 'Brisanet Telecomunicações S.A.' },
  { symbol: 'BRQB3', name: 'BRQ Soluções em Informática S.A.' },
  { symbol: 'BSTT3', name: 'Bailorgan S.A.' },
  { symbol: 'CARD3', name: 'CSU Digital S.A.' },
  { symbol: 'CASH3', name: 'Méliuz S.A.' },
  { symbol: 'CASN3', name: 'Casas Pernambucanas S.A.' },
  { symbol: 'CATH3', name: 'Catho Online S.A.' },
  { symbol: 'CBEE3', name: 'Companhia de Eletricidade do Estado da Bahia' },
  { symbol: 'CEGR3', name: 'Companhia Distribuidora de Gás do Rio de Janeiro' },
  { symbol: 'CESP6', name: 'Companhia Energética de São Paulo - Preferenciais' },
  { symbol: 'CGAS5', name: 'Companhia de Gás de São Paulo (Comgás) - Preferenciais Class A' },
  { symbol: 'CLSA3', name: 'Clear Sale S.A.' },
  { symbol: 'COCE5', name: 'Companhia Energética do Ceará (Coelce) - Preferenciais Class A' },
  { symbol: 'CRIV4', name: 'Alfa Financeira S.A. - Preferenciais' },
  { symbol: 'CSAB4', name: 'Companhia Industrial Fiação e Tecelagem Stella S.A. - Preferenciais' },
  { symbol: 'CSRN3', name: 'Companhia Energética do Rio Grande do Norte (Cosern)' },
  { symbol: 'CTKA4', name: 'Karsten S.A. - Preferenciais' },
  { symbol: 'CTNM4', name: 'Companhia de Tecidos Norte de Minas - Preferenciais' },
  { symbol: 'CTSA4', name: 'Companhia de Tecidos Santanense - Preferenciais' },
  { symbol: 'DASA3', name: 'Diagnósticos da América S.A. (DASA)' },
  { symbol: 'DEXP3', name: 'Dex Puzzles S.A. - Ordinárias' },
  { symbol: 'DEXP4', name: 'Dex Puzzles S.A. - Preferenciais' },
  { symbol: 'DMMO3', name: 'Dommo Energia S.A.' },
  { symbol: 'DMVF3', name: 'D1000 Varejo Farma S.A.' },
  { symbol: 'DTCY3', name: 'Dtcom Direct to Consumer S.A.' },
  { symbol: 'EALT4', name: 'Electro Aço Altona S.A. - Preferenciais' },
  { symbol: 'ECPR3', name: 'Encorpar S.A.' },
  { symbol: 'EEEL3', name: 'CEEE S.A. - Ordinárias' },
  { symbol: 'EKTR4', name: 'Elektro Redes S.A. - Preferenciais' },
  { symbol: 'EMAE4', name: 'EMAE - Empresa Metropolitana de Águas e Energia S.A. - Preferenciais' },
  { symbol: 'ENGI3', name: 'Energisa S.A. - Ordinárias' },
  { symbol: 'ENGI4', name: 'Energisa S.A. - Preferenciais' },
  { symbol: 'ENMT4', name: 'Energisa Mato Grosso - Preferenciais' },
  { symbol: 'ENRY3', name: 'Enry Energy S.A.' },
  { symbol: 'EPAR3', name: 'Embpar Participações S.A.' },
  { symbol: 'EQPA3', name: 'Equatorial Pará S.A. - Ordinárias' },
  { symbol: 'EQMA3', name: 'Equatorial Maranhão S.A.' },
  { symbol: 'ETER3', name: 'Eternit S.A.' },
  { symbol: 'EUCA4', name: 'Eucatex S.A. - Preferenciais' },
  { symbol: 'FHER3', name: 'Ferramentas Hercules S.A.' },
  { symbol: 'FJTA4', name: 'Forjas Taurus S.A. - Preferenciais' },
  { symbol: 'FNCN3', name: 'Finansinus S.A.' },
  { symbol: 'FRTA3', name: 'Frutaria S.A.' },
  { symbol: 'GEPA4', name: 'Rio Paranapanema Energia S.A. - Preferenciais' },
  { symbol: 'GPCP3', name: 'GPC Química S.A.' },
  { symbol: 'GSHP3', name: 'General Shopping e Outlets do Brasil S.A.' },
  { symbol: 'HAGA4', name: 'Haga S.A. - Preferenciais' },
  { symbol: 'HBTS5', name: 'Habitasul S.A. - Preferenciais' },
  { symbol: 'HETA4', name: 'Hercules S.A. - Preferenciais' },
  { symbol: 'HOOT4', name: 'Hoteis Othon S.A. - Preferenciais' },
  { symbol: 'IGBR3', name: 'Igua S.A.' },
  { symbol: 'INEP4', name: 'Inepar S.A. - Preferenciais' },
  { symbol: 'JFEN3', name: 'João Fortes Engenharia S.A.' },
  { symbol: 'JOPA4', name: 'J. Macedo S.A. - Preferenciais' },
  { symbol: 'LAND3', name: 'Terra Santa Agro S.A.' },
  { symbol: 'LIGT3', name: 'Light S.A.' },
  { symbol: 'LIPR3', name: 'Lillo S.A.' },
  { symbol: 'LOGN3', name: 'Log-In Logística Intermodal S.A.' },
  { symbol: 'LPSB3', name: 'Lopes Consultoria de Imóveis S.A.' },
  { symbol: 'LUXM4', name: 'Lojas Americanas S.A. - Preferenciais' },
  { symbol: 'MERC4', name: 'Mercantil do Brasil S.A. - Preferenciais' },
  { symbol: 'MGEL4', name: 'Mangels Industrial S.A. - Preferenciais' },
  { symbol: 'MNDL3', name: 'Mundial S.A.' },
  { symbol: 'MNPR3', name: 'Minupar Participações S.A.' },
  { symbol: 'MSAN4', name: 'Metisa Metalúrgica S.A. - Preferenciais' },
  { symbol: 'MWET4', name: 'Wetzel S.A. - Preferenciais' },
  { symbol: 'ODER4', name: 'Oderich S.A. - Preferenciais' },
  { symbol: 'OSXB3', name: 'OSX Brasil S.A.' },
  { symbol: 'PABR4', name: 'Panatlântica S.A. - Preferenciais' },
  { symbol: 'PATI4', name: 'Paticap S.A. - Preferenciais' },
  { symbol: 'PEAB4', name: 'Companhia Participações Aliança - Preferenciais' },
  { symbol: 'PFRY3', name: 'Pomifrutas S.A.' },
  { symbol: 'PINE4', name: 'Banco Pine S.A. - Preferenciais' },
  { symbol: 'PLAS3', name: 'Plascar Participações Industriais S.A.' },
  { symbol: 'PMAM3', name: 'Paranapanema S.A. - Ordinárias' },
  { symbol: 'PRBC4', name: 'Paraná Banco S.A. - Preferenciais' },
  { symbol: 'PTNT4', name: 'Pettenati S.A. - Preferenciais' },
  { symbol: 'RNEW4', name: 'Renova Energia S.A. - Preferenciais' },
  { symbol: 'RSID3', name: 'Rossi Residencial S.A.' },
  { symbol: 'SANB3', name: 'Banco Santander Brasil S.A. - Ordinárias' },
  { symbol: 'SANB4', name: 'Banco Santander Brasil S.A. - Preferenciais' },
  { symbol: 'SCAR3', name: 'Santa Catarina S.A.' },
  { symbol: 'SGPS3', name: 'Springs Global Participações S.A.' },
  { symbol: 'SHOW3', name: 'Time For Fun (T4F) S.A.' },
  { symbol: 'SLED4', name: 'Saraiva Livreiros S.A. - Preferenciais' },
  { symbol: 'SNSY5`', name: 'Sansuy S.A. - Preferenciais Class A' },
  { symbol: 'SOND6', name: 'Sondotécnica Engenharia de Recursos S.A. - Preferenciais' },
  { symbol: 'TEKA4', name: 'Teka - Tecelagem Kuehnrich S.A. - Preferenciais' },
  { symbol: 'TELB4', name: 'Telebras S.A. - Preferenciais' },
  { symbol: 'TENU3', name: 'Tenenge S.A.' },
  { symbol: 'TOYB4', name: 'Toyobo do Brasil S.A. - Preferenciais' },
  { symbol: 'TPIS3', name: 'Triunfo Participações e Investimentos S.A.' },
  { symbol: 'TXRX4', name: 'Teka S.A. - Preferenciais Class B' },
  { symbol: 'UCAS3', name: 'Unicasa Indústria de Móveis S.A.' },
  { symbol: 'WHRL4', name: 'Whirlpool S.A. - Preferenciais' },
  { symbol: 'WSON33', name: 'Wilson Sons S.A. - BDR' },
  { symbol: 'OPCT3', name: 'Oceanpact Serviços Marítimos S.A.' },
  { symbol: 'LVTC3', name: 'Wdc Networks S.A.' },
  { symbol: 'VTRU3', name: 'Vitru Education S.A.' },
  { symbol: 'NUTR3', name: 'Nutriplant S.A.' },
  
  // American Stocks (US Market)
  { symbol: 'ZM', name: 'Zoom Video Communications, Inc.' },
  { symbol: 'DOCU', name: 'DocuSign, Inc.' },
  { symbol: 'OKTA', name: 'Okta, Inc.' },
  { symbol: 'ESTC', name: 'Elastic N.V.' },
  { symbol: 'HUBS', name: 'HubSpot, Inc.' },
  { symbol: 'FIVN', name: 'Five9, Inc.' },
  { symbol: 'RNG', name: 'RingCentral, Inc.' },
  { symbol: 'FSLY', name: 'Fastly, Inc.' },
  { symbol: 'PINS', name: 'Pinterest, Inc.' },
  { symbol: 'SNAP', name: 'Snap Inc.' },
  { symbol: 'TWLO', name: 'Twilio Inc.' },
  { symbol: 'MTCH', name: 'Match Group, Inc.' },
  { symbol: 'MELI', name: 'MercadoLibre, Inc.' },
  { symbol: 'DKNG', name: 'DraftKings Inc.' },
  { symbol: 'WYNN', name: 'Wynn Resorts, Limited' },
  { symbol: 'LVS', name: 'Las Vegas Sands Corp.' },
  { symbol: 'MGM', name: 'MGM Resorts International' },
  { symbol: 'RCL', name: 'Royal Caribbean Cruises Ltd' },
  { symbol: 'CCL', name: 'Carnival Corporation' },
  { symbol: 'NCLH', name: 'Norwegian Cruise Line Holdings' },
  { symbol: 'DAL', name: 'Delta Air Lines, Inc.' },
  { symbol: 'UAL', name: 'United Airlines Holdings, Inc.' },
  { symbol: 'AAL', name: 'American Airlines Group Inc.' },
  { symbol: 'LUV', name: 'Southwest Airlines Co.' },
  { symbol: 'ALK', name: 'Alaska Air Group, Inc.' },
  { symbol: 'JBLU', name: 'JetBlue Airways Corporation' },
  { symbol: 'SAVE', name: 'Spirit Airlines, Inc.' },
  { symbol: 'EXPE', name: 'Expedia Group, Inc.' },
  { symbol: 'TRIP', name: 'TripAdvisor, Inc.' },
  { symbol: 'TCOM', name: 'Trip.com Group Limited' },
  { symbol: 'H', name: 'Hyatt Hotels Corporation' },
  { symbol: 'WH', name: 'Wyndham Hotels & Resorts, Inc.' },
  { symbol: 'CHH', name: 'Choice Hotels International' },
  { symbol: 'MDB', name: 'MongoDB, Inc.' },
  { symbol: 'TEAM', name: 'Atlassian Corporation Plc' },
  { symbol: 'WDAY', name: 'Workday, Inc.' },
  { symbol: 'NOW', name: 'ServiceNow, Inc.' },
  { symbol: 'ZS', name: 'Zscaler, Inc.' },
  { symbol: 'SOFI', name: 'SoFi Technologies, Inc.' },
  { symbol: 'AFRM', name: 'Affirm Holdings, Inc.' },
  { symbol: 'UPST', name: 'Upstart Holdings, Inc.' },
  { symbol: 'LC', name: 'LendingClub Corporation' },
  { symbol: 'PATH', name: 'UiPath Inc.' },
  { symbol: 'U', name: 'Unity Software Inc.' },
  { symbol: 'RBLX', name: 'Roblox Corporation' },
  { symbol: 'PLTR', name: 'Palantir Technologies Inc.' },
  { symbol: 'SNOW', name: 'Snowflake Inc.' },
  { symbol: 'SPLK', name: 'Splunk Inc.' },
  { symbol: 'NET', name: 'Cloudflare, Inc.' },
  { symbol: 'DDOG', name: 'Datadog, Inc.' },
  { symbol: 'GDDY', name: 'GoDaddy Inc.' },
  { symbol: 'WIX', name: 'Wix.com Ltd.' },
  { symbol: 'SQ', name: 'Block, Inc.' },
  { symbol: 'PYPL', name: 'PayPal Holdings, Inc.' },
  { symbol: 'COIN', name: 'Coinbase Global, Inc.' },
  { symbol: 'HOOD', name: 'Robinhood Markets, Inc.' },
  { symbol: 'SPOT', name: 'Spotify Technology S.A.' },
  { symbol: 'BABA', name: 'Alibaba Group Holding Limited' },
  { symbol: 'PDD', name: 'PDD Holdings Inc.' },
  { symbol: 'JD', name: 'JD.com, Inc.' },
  { symbol: 'BIDU', name: 'Baidu, Inc.' },
  { symbol: 'NTES', name: 'NetEase, Inc.' },
  { symbol: 'LI', name: 'Li Auto Inc.' },
  { symbol: 'NIO', name: 'NIO Inc.' },
  { symbol: 'XPEV', name: 'XPeng Inc.' },
  { symbol: 'TIGR', name: 'UP Fintech Holding Limited' },
  { symbol: 'FUTU', name: 'Futu Holdings Limited' },
  { symbol: 'SHOP', name: 'Shopify Inc.' },
  { symbol: 'ABNB', name: 'Airbnb, Inc.' },
  { symbol: 'SE', name: 'Sea Limited' },
  { symbol: 'TOST', name: 'Toast, Inc.' },
  { symbol: 'DUOL', name: 'Duolingo, Inc.' },
  { symbol: 'GTLB', name: 'GitLab Inc.' },
  { symbol: 'BILL', name: 'Bill.com Holdings, Inc.' },
  { symbol: 'CONE', name: 'CyrusOne Inc.' },
  { symbol: 'COR', name: 'Coresite Realty Corporation' },
  { symbol: 'UNIT', name: 'Uniti Group Inc.' },
  { symbol: 'CSGP', name: 'CoStar Group, Inc.' },
  { symbol: 'ZG', name: 'Zillow Group, Inc.' },
  { symbol: 'RDFN', name: 'Redfin Corporation' },
  { symbol: 'OPEN', name: 'Opendoor Technologies Inc.' }
];

// 200 distinct new ETFs (US + Brazil)
const newEtfs = [
  // US Listed ETFs
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust' },
  { symbol: 'IVV', name: 'iShares Core S&P 500 ETF' },
  { symbol: 'VOO', name: 'Vanguard S&P 500 ETF' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust' },
  { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF' },
  { symbol: 'IWM', name: 'iShares Russell 2000 ETF' },
  { symbol: 'VXUS', name: 'Vanguard Total International Stock ETF' },
  { symbol: 'VEA', name: 'Vanguard FTSE Developed Markets ETF' },
  { symbol: 'VWO', name: 'Vanguard FTSE Emerging Markets ETF' },
  { symbol: 'AGG', name: 'iShares Core U.S. Aggregate Bond ETF' },
  { symbol: 'BND', name: 'Vanguard Total Bond Market ETF' },
  { symbol: 'GLD', name: 'SPDR Gold Shares' },
  { symbol: 'SLV', name: 'iShares Silver Trust' },
  { symbol: 'USO', name: 'United States Oil Fund LP' },
  { symbol: 'UNG', name: 'United States Natural Gas Fund LP' },
  { symbol: 'TLT', name: 'iShares 20+ Year Treasury Bond ETF' },
  { symbol: 'IEF', name: 'iShares 7-10 Year Treasury Bond ETF' },
  { symbol: 'SHY', name: 'iShares 1-3 Year Treasury Bond ETF' },
  { symbol: 'LQD', name: 'iShares iBoxx $ Investment Grade Corporate Bond ETF' },
  { symbol: 'HYG', name: 'iShares iBoxx $ High Yield Corporate Bond ETF' },
  { symbol: 'EEM', name: 'iShares MSCI Emerging Markets ETF' },
  { symbol: 'EFA', name: 'iShares MSCI EAFE ETF' },
  { symbol: 'VUG', name: 'Vanguard Growth ETF' },
  { symbol: 'VTV', name: 'Vanguard Value ETF' },
  { symbol: 'VYM', name: 'Vanguard High Dividend Yield ETF' },
  { symbol: 'SDY', name: 'SPDR S&P Dividend ETF' },
  { symbol: 'DVY', name: 'iShares Select Dividend ETF' },
  { symbol: 'XLK', name: 'Technology Select Sector SPDR Fund' },
  { symbol: 'XLF', name: 'Financial Select Sector SPDR Fund' },
  { symbol: 'XLV', name: 'Health Care Select Sector SPDR Fund' },
  { symbol: 'XLY', name: 'Consumer Discretionary Select Sector SPDR Fund' },
  { symbol: 'XLP', name: 'Consumer Staples Select Sector SPDR Fund' },
  { symbol: 'XLI', name: 'Industrial Select Sector SPDR Fund' },
  { symbol: 'XLE', name: 'Energy Select Sector SPDR Fund' },
  { symbol: 'XLB', name: 'Materials Select Sector SPDR Fund' },
  { symbol: 'XLU', name: 'Utilities Select Sector SPDR Fund' },
  { symbol: 'XLRE', name: 'Real Estate Select Sector SPDR Fund' },
  { symbol: 'GDX', name: 'VanEck Gold Miners ETF' },
  { symbol: 'GDXJ', name: 'VanEck Junior Gold Miners ETF' },
  { symbol: 'KRE', name: 'SPDR S&P Regional Banking ETF' },
  { symbol: 'IBB', name: 'iShares Biotechnology ETF' },
  { symbol: 'XBI', name: 'SPDR S&P Biotech ETF' },
  { symbol: 'SMH', name: 'VanEck Semiconductor ETF' },
  { symbol: 'SOXX', name: 'iShares Semiconductor ETF' },
  { symbol: 'ARKK', name: 'ARK Innovation ETF' },
  { symbol: 'ARKG', name: 'ARK Genomic Revolution ETF' },
  { symbol: 'ARKW', name: 'ARK Next Generation Internet ETF' },
  { symbol: 'KWEB', name: 'KraneShares CSI China Internet ETF' },
  { symbol: 'ASHR', name: 'Xtrackers Harvest CSI 300 China A-Shares ETF' },
  { symbol: 'FXI', name: 'iShares China Large-Cap ETF' },
  { symbol: 'EWJ', name: 'iShares MSCI Japan ETF' },
  { symbol: 'EWG', name: 'iShares MSCI Germany ETF' },
  { symbol: 'EWU', name: 'iShares MSCI United Kingdom ETF' },
  { symbol: 'EWY', name: 'iShares MSCI South Korea ETF' },
  { symbol: 'EWT', name: 'iShares MSCI Taiwan ETF' },
  { symbol: 'EWA', name: 'iShares MSCI Australia ETF' },
  { symbol: 'EWC', name: 'iShares MSCI Canada ETF' },
  { symbol: 'EWW', name: 'iShares MSCI Mexico ETF' },
  { symbol: 'EWZ', name: 'iShares MSCI Brazil ETF' },
  { symbol: 'INDA', name: 'iShares MSCI India ETF' },
  { symbol: 'MCHI', name: 'iShares MSCI China ETF' },
  { symbol: 'VNQ', name: 'Vanguard Real Estate ETF' },
  { symbol: 'SCHD', name: 'Schwab U.S. Dividend Equity ETF' },
  { symbol: 'JEPI', name: 'JPMorgan Equity Premium Income ETF' },
  { symbol: 'JEPQ', name: 'JPMorgan Nasdaq Equity Premium Income ETF' },
  { symbol: 'VT', name: 'Vanguard Total World Stock ETF' },
  { symbol: 'DIA', name: 'SPDR Dow Jones Industrial Average ETF' },
  { symbol: 'IWF', name: 'iShares Russell 1000 Growth ETF' },
  { symbol: 'IWD', name: 'iShares Russell 1000 Value ETF' },
  { symbol: 'IWP', name: 'iShares Russell Mid-Cap Growth ETF' },
  { symbol: 'IWS', name: 'iShares Russell Mid-Cap Value ETF' },
  { symbol: 'IWN', name: 'iShares Russell 2000 Value ETF' },
  { symbol: 'IWO', name: 'iShares Russell 2000 Growth ETF' },
  { symbol: 'USMV', name: 'iShares MSCI USA Min Vol Factor ETF' },
  { symbol: 'MTUM', name: 'iShares MSCI USA Momentum Factor ETF' },
  { symbol: 'QUAL', name: 'iShares MSCI USA Quality Factor ETF' },
  { symbol: 'VLUE', name: 'iShares MSCI USA Value Factor ETF' },
  { symbol: 'IJH', name: 'iShares Core S&P Mid-Cap ETF' },
  { symbol: 'IJR', name: 'iShares Core S&P Small-Cap ETF' },
  { symbol: 'MDY', name: 'SPDR S&P MidCap 400 ETF Trust' },
  { symbol: 'SCHF', name: 'Schwab International Equity ETF' },
  { symbol: 'SCHE', name: 'Schwab Emerging Markets Equity ETF' },
  { symbol: 'ACWI', name: 'iShares MSCI ACWI ETF' },
  { symbol: 'ACWX', name: 'iShares MSCI ACWI ex U.S. ETF' },
  { symbol: 'VSS', name: 'Vanguard FTSE All-World ex-US Small-Cap ETF' },
  { symbol: 'VGK', name: 'Vanguard FTSE Europe ETF' },
  { symbol: 'VPL', name: 'Vanguard FTSE Pacific ETF' },
  { symbol: 'EMB', name: 'iShares J.P. Morgan USD Emerging Markets Bond ETF' },
  { symbol: 'VWOB', name: 'Vanguard Emerging Markets Government Bond ETF' },
  { symbol: 'BNDX', name: 'Vanguard Total International Bond ETF' },
  { symbol: 'SHV', name: 'iShares Short Treasury Bond ETF' },
  { symbol: 'BIL', name: 'SPDR Bloomberg 1-3 Month T-Bill ETF' },
  { symbol: 'MINT', name: 'PIMCO Enhanced Short Maturity Active ETF' },
  { symbol: 'FLOT', name: 'iShares Floating Rate Bond ETF' },
  { symbol: 'VCIT', name: 'Vanguard Intermediate-Term Corporate Bond ETF' },
  { symbol: 'VCSH', name: 'Vanguard Short-Term Corporate Bond ETF' },
  { symbol: 'VCLT', name: 'Vanguard Long-Term Corporate Bond ETF' },
  { symbol: 'IIGB', name: 'iShares Investment Grade Systematic Bond ETF' },
  { symbol: 'SIVR', name: 'Aberdeen Standard Physical Silver Shares ETF' },
  { symbol: 'SGOL', name: 'Aberdeen Standard Physical Gold Shares ETF' },
  { symbol: 'PALL', name: 'Aberdeen Standard Physical Palladium Shares ETF' },
  { symbol: 'PLTM', name: 'GraniteShares Platinum Trust' },
  { symbol: 'DBA', name: 'Invesco DB Agriculture Fund' },
  { symbol: 'DBC', name: 'Invesco DB Commodity Index Tracking Fund' },
  { symbol: 'PDBC', name: 'Invesco Optimum Yield Diversified Commodity Strategy No K-1 ETF' },
  { symbol: 'GSG', name: 'iShares S&P GSCI Commodity-Indexed Trust' },
  { symbol: 'REM', name: 'iShares Mortgage Real Estate ETF' },
  { symbol: 'REET', name: 'iShares Global Real Estate ETF' },
  { symbol: 'IYR', name: 'iShares U.S. Real Estate ETF' },
  { symbol: 'SCHH', name: 'Schwab U.S. REIT ETF' },
  { symbol: 'ICLN', name: 'iShares Global Clean Energy ETF' },
  { symbol: 'TAN', name: 'Invesco Solar ETF' },
  { symbol: 'FAN', name: 'First Trust Global Wind Energy ETF' },
  { symbol: 'LIT', name: 'Global X Lithium & Battery Tech ETF' },
  { symbol: 'URA', name: 'Global X Uranium ETF' },
  { symbol: 'COPX', name: 'Global X Copper Miners ETF' },
  { symbol: 'REMX', name: 'VanEck Rare Earth/Strategic Metals ETF' },
  { symbol: 'BOTZ', name: 'Global X Robotics & Artificial Intelligence ETF' },
  { symbol: 'ROBO', name: 'ROBO Global Robotics and Automation Index ETF' },
  { symbol: 'HACK', name: 'Prime Cyber Security ETF' },
  { symbol: 'CIBR', name: 'First Trust NASDAQ Cybersecurity ETF' },
  { symbol: 'IPAY', name: 'ETFMG Prime Mobile Payments ETF' },
  { symbol: 'NERD', name: 'Roundhill BITKRAFT Esports & Digital Entertainment ETF' },
  { symbol: 'GAMR', name: 'Wedbush ETFMG Video Game Tech ETF' },
  { symbol: 'BETZ', name: 'Roundhill Sports Betting & iGaming ETF' },
  { symbol: 'PEJ', name: 'Invesco Dynamic Leisure and Entertainment ETF' },
  { symbol: 'JETS', name: 'U.S. Global Jets ETF' },
  { symbol: 'FTXG', name: 'First Trust Nasdaq Food & Beverage ETF' },
  { symbol: 'KIE', name: 'SPDR S&P Insurance ETF' },
  { symbol: 'IAI', name: 'iShares U.S. Broker-Dealers & Securities Exchanges ETF' },
  { symbol: 'KBE', name: 'SPDR S&P Bank ETF' },
  { symbol: 'ITA', name: 'iShares U.S. Aerospace & Defense ETF' },
  { symbol: 'PPA', name: 'Invesco Aerospace & Defense ETF' },
  { symbol: 'XAR', name: 'SPDR S&P Aerospace & Defense ETF' },
  { symbol: 'MOO', name: 'VanEck Agribusiness ETF' },
  { symbol: 'KOPN', name: 'Kopen S&P ETF' },

  // Brazilian Listed ETFs (B3)
  { symbol: 'BOVB11', name: 'Itnow Ibovespa Index ETF' },
  { symbol: 'PIBB11', name: 'Itnow PIBB IBrX-50 Index ETF' },
  { symbol: 'FIND11', name: 'Itnow IFNC Financial Index ETF' },
  { symbol: 'GOVE11', name: 'Itnow IGCT Governance Index ETF' },
  { symbol: 'MATB11', name: 'Itnow IMAT Materials Index ETF' },
  { symbol: 'ISUS11', name: 'Itnow ISE Sustainability Index ETF' },
  { symbol: 'ECOO11', name: 'Itnow ICO2 Carbon Efficient Index ETF' },
  { symbol: 'B5P211', name: 'Itnow IMA-B 5 P2 ETF' },
  { symbol: 'IBOB11', name: 'BTG Pactual Ibovespa ETF' },
  { symbol: 'IBXX11', name: 'Itnow IBrX-100 Index ETF' },
  { symbol: 'ACWI11', name: 'XP MSCI ACWI Index ETF BDR' },
  { symbol: 'ASIA11', name: 'XP MSCI Asia ex-Japan ETF BDR' },
  { symbol: 'META11', name: 'XP Metaverse ETF BDR' },
  { symbol: 'GENB11', name: 'XP Biotech ETF BDR' },
  { symbol: 'TECB11', name: 'Itnow TECB Technology Index ETF' },
  { symbol: 'UTEC11', name: 'Investo U.S. Tech ETF' },
  { symbol: 'YALL11', name: 'Investo High Yield Dividend ETF' },
  { symbol: 'QDTE11', name: 'Investo Nasdaq-100 Covered Call ETF' },
  { symbol: 'ALUG11', name: 'Investo U.S. Real Estate Rent ETF' },
  { symbol: 'USTK11', name: 'Investo U.S. Tech Index ETF' },
  { symbol: 'BDIV11', name: 'Investo Brazilian Dividend Yield ETF' },
  { symbol: 'BIEM11', name: 'Investo Emerging Markets ETF' },
  { symbol: 'BXTC11', name: 'Investo Global Technology ETF' },
  { symbol: 'BGOV11', name: 'Investo Treasury Bond ETF' },
  { symbol: 'SMAC11', name: 'Trend Small Cap Index ETF' },
  { symbol: 'SPXB11', name: 'Trend S&P 500 Index ETF' },
  { symbol: 'H2OP11', name: 'Trend Água e Saneamento ETF' },
  { symbol: 'SACA11', name: 'Trend Agronegócio Brasil ETF' },
  { symbol: 'SVAL11', name: 'Trend Ibovespa Value Index ETF' },
  { symbol: 'XBOV11', name: 'Caixa Ibovespa Index ETF' },
  { symbol: 'SMAB11', name: 'Caixa Small Cap Index ETF' },
  { symbol: 'REIT11', name: 'Investo Global Real Estate REIT ETF' },
  { symbol: 'JGPX11', name: 'JGP Global ESG Index ETF' },
  { symbol: 'GENG11', name: 'Trend ESG Global Index ETF BDR' },
  { symbol: 'DNAI11', name: 'Trend Genômica Index ETF BDR' },
  { symbol: 'MILK11', name: 'Trend Laticínios Agro ETF' },
  { symbol: 'SOMA11', name: 'Trend Small Cap Growth ETF' },
  { symbol: 'SMTY11', name: 'Trend Smart Beta ETF' },
  { symbol: 'WEGE11', name: 'Trend WEG e Eletrificação ETF' },
  { symbol: 'AUTO11', name: 'Investo Global Auto & Electric Vehicle ETF' },
  { symbol: 'COIN11', name: 'Hashdex Nasdaq Crypto Index BDR ETF' },
  { symbol: 'DEFI11', name: 'Hashdex DeFi Index ETF' },
  { symbol: 'WEB311', name: 'Hashdex Web3 Smart Contracts ETF' },
  { symbol: 'NFTS11', name: 'Investo NFT & Digital Art ETF' },
  { symbol: 'CRPT11', name: 'Hashdex Crypto Top 20 ETF' },
  { symbol: 'META11', name: 'XP Metaverse BDR ETF' },
  { symbol: 'XMTB11', name: 'Trend Metaverso BDR ETF' },
  { symbol: 'BDIA11', name: 'Bradesco IBrX-50 Index ETF' },
  { symbol: 'BBOV11', name: 'Bradesco Ibovespa Index ETF' },
  { symbol: 'BIMB11', name: 'Bradesco IMA-B Index ETF' },
  { symbol: 'BBIM11', name: 'Banco do Brasil IMA-B Index ETF' },
  { symbol: 'BBOB11', name: 'Banco do Brasil Ibovespa Index ETF' },
  { symbol: 'LFTS11', name: 'Investo Selic Simples ETF' },
  { symbol: 'BNDX11', name: 'Investo Global Bond ETF' },
  { symbol: 'BBOV11', name: 'Banco do Brasil Ibovespa ETF' }
];

const filePath = path.join(__dirname, '../src/services/api.ts');
let code = fs.readFileSync(filePath, 'utf8');

// Find declaration: export const ALL_B3_TICKERS: B3Ticker[] = [
const startMarker = 'export const ALL_B3_TICKERS: B3Ticker[] = [';
const startIndex = code.indexOf(startMarker);

if (startIndex === -1) {
  console.error("Could not find start of ALL_B3_TICKERS array!");
  process.exit(1);
}

// Find close bracket of this array
let index = startIndex + startMarker.length;
let bracketCount = 1;
let endIndex = -1;

while (index < code.length) {
  const char = code[index];
  if (char === '[') {
    bracketCount++;
  } else if (char === ']') {
    bracketCount--;
    if (bracketCount === 0) {
      endIndex = index;
      break;
    }
  }
  index++;
}

if (endIndex === -1) {
  console.error("Could not find end of ALL_B3_TICKERS array!");
  process.exit(1);
}

// Parse existing array items
const arrayContent = code.slice(startIndex + startMarker.length, endIndex);

// We will construct the new array elements while avoiding duplicates
const existingSymbols = new Set();
const arrayLines = arrayContent.split('\n');
const symbolRegex = /symbol:\s*'([^']+)'/;

for (const line of arrayLines) {
  const match = line.match(symbolRegex);
  if (match) {
    existingSymbols.add(match[1].toUpperCase().trim());
  }
}

console.log('Existing tickers count:', existingSymbols.size);

// Merge new items
const mergedItems = [];

// Helper to push items avoiding duplicates
function addTicker(item, categoryName) {
  const sym = item.symbol.toUpperCase().trim();
  if (!existingSymbols.has(sym)) {
    existingSymbols.add(sym);
    mergedItems.push(item);
  }
}

// Add the 200 stocks and 200 ETFs
newStocks.forEach(item => addTicker(item, 'Stocks'));
newEtfs.forEach(item => addTicker(item, 'ETFs'));

console.log('New tickers added count:', mergedItems.size || mergedItems.length);

// Generate insertion string
let newContentStr = '\n';
mergedItems.forEach(item => {
  newContentStr += `  { symbol: '${item.symbol}', name: '${item.name.replace(/'/g, "\\'")}' },\n`;
});

// We insert it at the very end of the array, just before the closing bracket
const updatedArrayContent = arrayContent + newContentStr;
const updatedCode = code.slice(0, startIndex + startMarker.length) + updatedArrayContent + code.slice(endIndex);

fs.writeFileSync(filePath, updatedCode, 'utf8');
console.log('Successfully updated api.ts with enriched tickers list!');
